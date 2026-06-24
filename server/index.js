require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()
const PORT = 3001

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

function normalizeItinerary(body) {
  if (body.trip_name && body.stops) return body
  if (body.trip && body.cities) {
    const trip = body.trip
    let currentDate = new Date(trip.start_date || trip.arrival_date)
    const stops = body.cities.map((city) => {
      const arrival = currentDate.toISOString().split('T')[0]
      const nights = city.nights || 1
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + nights)
      const departure = currentDate.toISOString().split('T')[0]
      return {
        name: `${city.name}, ${city.country}`,
        lat: city.lat, lng: city.lng,
        arrival_date: arrival, departure_date: departure,
        notes: city.accommodation ? `Stay: ${city.accommodation.name} (${city.accommodation.area})` : '',
      }
    })
    return { trip_name: trip.title || trip.name, start_date: trip.start_date || trip.arrival_date, end_date: trip.end_date, stops }
  }
  return body
}

// --- PDF Import ---

app.post('/api/trips/import-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const pdfBase64 = req.file.buffer.toString('base64')
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: `Extract the travel itinerary from this PDF and return JSON in exactly this format:
{"trip_name":"Name","start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","stops":[{"name":"City, Country","lat":0.0,"lng":0.0,"arrival_date":"YYYY-MM-DD","departure_date":"YYYY-MM-DD","notes":"Hotel and activities"}]}
Rules: accurate GPS coordinates, YYYY-MM-DD dates, extract hotel names into notes. Return ONLY valid JSON.` }
        ],
      }],
    })
    const text = message.content[0].text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    res.json(JSON.parse(text))
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse PDF: ' + err.message })
  }
})

// --- Trips ---

app.post('/api/trips', async (req, res) => {
  try {
    const { trip_name, start_date, end_date, stops, traveller_name, description } = normalizeItinerary(req.body)
    if (!trip_name || !stops?.length) return res.status(400).json({ error: 'trip_name and stops required' })
    const adminToken = uuidv4()
    const { data: trip, error: tripErr } = await supabase.from('trips')
      .insert({ name: trip_name, start_date, end_date, admin_token: adminToken, traveller_name: traveller_name || null, description: description || null })
      .select().single()
    if (tripErr) throw tripErr
    const stopRows = stops.map((s, i) => ({ trip_id: trip.id, name: s.name, lat: s.lat, lng: s.lng, arrival_date: s.arrival_date, departure_date: s.departure_date, notes: s.notes || '', position: i }))
    const { data: dbStops, error: stopsErr } = await supabase.from('stops').insert(stopRows).select()
    if (stopsErr) throw stopsErr
    res.json({ trip, stops: dbStops, admin_token: adminToken })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/trips/:id', async (req, res) => {
  try {
    const { data: trip, error } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'Not found' })
    const { data: stops } = await supabase.from('stops').select().eq('trip_id', req.params.id).order('position')
    const { data: live } = await supabase.from('live_locations').select().eq('trip_id', req.params.id).maybeSingle()
    res.json({ trip, stops: stops || [], live_location: live || null })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/trips/:id/admin', async (req, res) => {
  try {
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (!trip) return res.status(404).json({ error: 'Not found' })
    if (trip.admin_token !== req.query.token) return res.status(403).json({ error: 'Forbidden' })
    res.json({ ok: true, trip })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/api/trips/:id', async (req, res) => {
  try {
    const { token, traveller_name, description } = req.body
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })
    const { data } = await supabase.from('trips').update({ traveller_name, description }).eq('id', req.params.id).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/trips/:id/view', async (req, res) => {
  try {
    const { data: trip } = await supabase.from('trips').select('view_count').eq('id', req.params.id).single()
    await supabase.from('trips').update({ view_count: (trip?.view_count || 0) + 1 }).eq('id', req.params.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Stops ---

app.get('/api/stops/:id', async (req, res) => {
  try {
    const { data: stop } = await supabase.from('stops').select().eq('id', req.params.id).single()
    if (!stop) return res.status(404).json({ error: 'Not found' })
    const { data: photos } = await supabase.from('photos').select().eq('stop_id', req.params.id)
    const photosWithData = await Promise.all((photos || []).map(async photo => {
      const { data: reactions } = await supabase.from('reactions').select().eq('photo_id', photo.id)
      const { data: comments } = await supabase.from('comments').select().eq('photo_id', photo.id).order('created_at')
      return { ...photo, reactions: reactions || [], comments: comments || [] }
    }))
    res.json({ stop, photos: photosWithData })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Photos ---

app.post('/api/stops/:id/photos', upload.single('photo'), async (req, res) => {
  try {
    const { data: stop } = await supabase.from('stops').select().eq('id', req.params.id).single()
    if (!stop) return res.status(404).json({ error: 'Stop not found' })
    const { data: trip } = await supabase.from('trips').select().eq('id', stop.trip_id).single()
    if (trip.admin_token !== req.body.token) return res.status(403).json({ error: 'Forbidden' })
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase()
    const filename = `${uuidv4()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('photos').upload(filename, req.file.buffer, { contentType: req.file.mimetype })
    if (uploadErr) throw uploadErr
    const { data: photo } = await supabase.from('photos').insert({ stop_id: req.params.id, storage_path: filename, caption: req.body.caption || '' }).select().single()
    res.json(photo)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { data: photo } = await supabase.from('photos').select().eq('id', req.params.id).single()
    if (!photo) return res.status(404).json({ error: 'Not found' })
    await supabase.storage.from('photos').remove([photo.storage_path])
    await supabase.from('photos').delete().eq('id', req.params.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Reactions & Comments (photo-level) ---

app.post('/api/photos/:id/reactions', async (req, res) => {
  try {
    const { emoji, reactor_name } = req.body
    if (!emoji) return res.status(400).json({ error: 'emoji required' })
    const { data } = await supabase.from('reactions').insert({ photo_id: req.params.id, emoji, reactor_name: reactor_name || null }).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/photos/:id/comments', async (req, res) => {
  try {
    const { author_name, body } = req.body
    if (!author_name || !body) return res.status(400).json({ error: 'author_name and body required' })
    const { data } = await supabase.from('comments').insert({ photo_id: req.params.id, author_name, body }).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Stop Comments (location discussion) ---

app.get('/api/stops/:id/comments', async (req, res) => {
  try {
    const { data } = await supabase.from('stop_comments').select().eq('stop_id', req.params.id).order('created_at')
    res.json(data || [])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/stops/:id/comments', async (req, res) => {
  try {
    const { author_name, body, parent_id } = req.body
    if (!author_name || !body) return res.status(400).json({ error: 'author_name and body required' })
    const { data } = await supabase.from('stop_comments').insert({ stop_id: req.params.id, author_name, body, parent_id: parent_id || null }).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/stop-comments/:id/like', async (req, res) => {
  try {
    const { data: c } = await supabase.from('stop_comments').select('likes').eq('id', req.params.id).single()
    const { data } = await supabase.from('stop_comments').update({ likes: (c.likes || 0) + 1 }).eq('id', req.params.id).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Feed ---

app.get('/api/trips/:id/feed', async (req, res) => {
  try {
    const { data: stops } = await supabase.from('stops').select().eq('trip_id', req.params.id)
    const stopIds = (stops || []).map(s => s.id)
    if (!stopIds.length) return res.json([])
    const { data: photos } = await supabase.from('photos').select().in('stop_id', stopIds).order('uploaded_at', { ascending: false })
    const enriched = await Promise.all((photos || []).map(async photo => {
      const stop = stops.find(s => s.id === photo.stop_id)
      const { data: reactions } = await supabase.from('reactions').select().eq('photo_id', photo.id)
      const { data: comments } = await supabase.from('comments').select().eq('photo_id', photo.id).order('created_at')
      return { ...photo, stop_name: stop?.name, reactions: reactions || [], comments: comments || [] }
    }))
    res.json(enriched)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Live Location / Check-in ---

app.post('/api/trips/:id/checkin', async (req, res) => {
  try {
    const { token, stop_id, lat, lng, message, status, journal_entry } = req.body
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (!trip) return res.status(404).json({ error: 'Not found' })
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })
    const { data: existing } = await supabase.from('live_locations').select().eq('trip_id', req.params.id).maybeSingle()
    const payload = { stop_id, lat, lng, message: message || null, status: status || 'Exploring', updated_at: new Date().toISOString(), journal_entry: journal_entry || null }
    let loc
    if (existing) {
      const { data } = await supabase.from('live_locations').update(payload).eq('id', existing.id).select().single()
      loc = data
    } else {
      const { data } = await supabase.from('live_locations').insert({ trip_id: req.params.id, ...payload }).select().single()
      loc = data
    }
    res.json(loc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/trips/:id/generate-journal', async (req, res) => {
  try {
    const { stop_name, mood, message } = req.body
    const prompt = `Write a short, atmospheric travel journal entry (2-3 sentences) for a traveller who has just arrived in ${stop_name}. Their mood: ${mood || 'exploring'}. Their note: "${message || 'Just arrived!'}". Write in first person, vivid and evocative like a published travel memoir. No hashtags or emojis.`
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      messages: [{ role: 'user', content: prompt }],
    })
    res.json({ entry: response.content[0].text.trim() })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/trips/:id/live', async (req, res) => {
  try {
    const { data } = await supabase.from('live_locations').select().eq('trip_id', req.params.id).maybeSingle()
    res.json(data || null)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Polls ---

app.get('/api/trips/:id/polls', async (req, res) => {
  try {
    const { data: polls } = await supabase.from('polls').select().eq('trip_id', req.params.id).order('created_at', { ascending: false })
    const enriched = await Promise.all((polls || []).map(async poll => {
      const { data: options } = await supabase.from('poll_options').select().eq('poll_id', poll.id).order('position')
      const optionsWithVotes = await Promise.all((options || []).map(async opt => {
        const { count } = await supabase.from('poll_votes').select('*', { count: 'exact', head: true }).eq('poll_option_id', opt.id)
        return { ...opt, vote_count: count || 0 }
      }))
      return { ...poll, options: optionsWithVotes }
    }))
    res.json(enriched)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/trips/:id/polls', async (req, res) => {
  try {
    const { token, question, options, stop_id } = req.body
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })
    const { data: poll } = await supabase.from('polls').insert({ trip_id: req.params.id, stop_id: stop_id || null, question }).select().single()
    const optionRows = options.map((label, i) => ({ poll_id: poll.id, label, position: i }))
    const { data: pollOptions } = await supabase.from('poll_options').insert(optionRows).select()
    res.json({ ...poll, options: (pollOptions || []).map(o => ({ ...o, vote_count: 0 })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const { option_id, voter_name, voter_token } = req.body
    if (!voter_token || !option_id) return res.status(400).json({ error: 'option_id and voter_token required' })
    const { data: opt } = await supabase.from('poll_options').select('poll_id').eq('id', option_id).single()
    const { data: allOpts } = await supabase.from('poll_options').select('id').eq('poll_id', opt.poll_id)
    const optIds = (allOpts || []).map(o => o.id)
    const { data: existing } = await supabase.from('poll_votes').select().in('poll_option_id', optIds).eq('voter_token', voter_token)
    if (existing?.length) return res.status(409).json({ error: 'Already voted' })
    const { data } = await supabase.from('poll_votes').insert({ poll_option_id: option_id, voter_name: voter_name || null, voter_token }).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/polls/:id/close', async (req, res) => {
  try {
    const { token } = req.body
    const { data: poll } = await supabase.from('polls').select('trip_id').eq('id', req.params.id).single()
    const { data: trip } = await supabase.from('trips').select('admin_token').eq('id', poll.trip_id).single()
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })
    const { data } = await supabase.from('polls').update({ closed: true }).eq('id', req.params.id).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Photo Requests ---

app.get('/api/trips/:id/requests', async (req, res) => {
  try {
    const { data } = await supabase.from('photo_requests').select().eq('trip_id', req.params.id).order('created_at', { ascending: false })
    res.json(data || [])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/trips/:id/requests', async (req, res) => {
  try {
    const { requester_name, description, stop_id } = req.body
    if (!requester_name || !description) return res.status(400).json({ error: 'requester_name and description required' })
    const { data } = await supabase.from('photo_requests').insert({ trip_id: req.params.id, stop_id: stop_id || null, requester_name, description }).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { token, status } = req.body
    const { data: req2 } = await supabase.from('photo_requests').select('trip_id').eq('id', req.params.id).single()
    const { data: trip } = await supabase.from('trips').select('admin_token').eq('id', req2.trip_id).single()
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })
    const { data } = await supabase.from('photo_requests').update({ status }).eq('id', req.params.id).select().single()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Demo Seed ---

app.post('/api/trips/:id/seed-demo', async (req, res) => {
  try {
    const { token } = req.body
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    if (!trip) return res.status(404).json({ error: 'Not found' })
    if (trip.admin_token !== token) return res.status(403).json({ error: 'Forbidden' })

    const { data: stops } = await supabase.from('stops').select().eq('trip_id', req.params.id).order('position')
    if (!stops?.length) return res.status(400).json({ error: 'No stops' })

    const seed = [
      {
        idx: 0, // Paris
        photos: [
          { url: 'https://picsum.photos/id/338/900/600',  caption: 'Golden hour at the Eiffel Tower — worth every step ✨' },
          { url: 'https://picsum.photos/id/1060/900/600', caption: 'Morning croissants near Montmartre ☕' },
        ],
        reactions: [['❤️','Mum'],['😍','Jake'],['🔥','Olivia'],['😭','Dad']],
        photoComment: 'This is STUNNING!! So jealous right now 😭',
        stopComments: [
          { author_name: 'Mum',    body: 'Oh my goodness it looks absolutely incredible!! Living vicariously through you 😭' },
          { author_name: 'Jake',   body: 'Have you been to Sainte-Chapelle yet? It\'s a must — the stained glass is unreal' },
          { author_name: 'Sophie', body: 'Adding it to the list right now! So many things to see' },
          { author_name: 'Olivia', body: 'What\'s the food like?? Tell me everything' },
        ],
      },
      {
        idx: 1, // Barcelona
        photos: [
          { url: 'https://picsum.photos/id/1019/900/600', caption: 'Sagrada Família — even more mind-blowing in person 🙏' },
        ],
        reactions: [['❤️','Mum'],['😍','Tom'],['✨','Olivia']],
        photoComment: 'Gaudí was a genius honestly',
        stopComments: [
          { author_name: 'Dad',    body: 'Stay safe sweetheart! Are you eating properly?' },
          { author_name: 'Sophie', body: 'Dad the tapas are literally INCREDIBLE. Having the best time 😂' },
          { author_name: 'Tom',    body: 'Did you make it to the Gothic Quarter? Favourite neighbourhood in all of Europe' },
        ],
      },
      {
        idx: 2, // Rome
        photos: [
          { url: 'https://picsum.photos/id/493/900/600',  caption: 'The Colosseum — hard to believe it\'s actually real' },
          { url: 'https://picsum.photos/id/1040/900/600', caption: 'Sunset over the Roman Forum 🌅' },
        ],
        reactions: [['❤️','Mum'],['😍','Jake'],['🔥','Tom'],['❤️','Olivia'],['😮','Dad']],
        photoComment: 'Two thousand years of history just staring back at you 🤯',
        stopComments: [
          { author_name: 'Olivia', body: 'I am SO envious!! Please eat some gelato for me' },
          { author_name: 'Sophie', body: 'I\'ve had gelato literally every single day 😂 no regrets' },
          { author_name: 'Jake',   body: 'Which has been your favourite city so far??' },
          { author_name: 'Sophie', body: 'Impossible question honestly... Rome might be edging it' },
        ],
      },
    ]

    for (const d of seed) {
      const stop = stops[d.idx]
      if (!stop) continue
      for (const c of d.stopComments) {
        await supabase.from('stop_comments').insert({ stop_id: stop.id, author_name: c.author_name, body: c.body })
      }
      for (const p of d.photos) {
        const { data: photo } = await supabase.from('photos').insert({ stop_id: stop.id, storage_path: p.url, caption: p.caption }).select().single()
        if (photo) {
          const reactionRows = d.reactions.map(([emoji, reactor_name]) => ({ photo_id: photo.id, emoji, reactor_name }))
          await supabase.from('reactions').insert(reactionRows)
          await supabase.from('comments').insert({ photo_id: photo.id, author_name: 'Mum', body: d.photoComment })
        }
      }
    }

    // Check in at Rome (stop index 2)
    const liveStop = stops[2] || stops[0]
    const existing = await supabase.from('live_locations').select().eq('trip_id', req.params.id).maybeSingle()
    const payload = {
      trip_id: req.params.id, stop_id: liveStop.id,
      lat: liveStop.lat, lng: liveStop.lng,
      message: 'Exploring the ancient ruins of Rome — this city is absolutely unreal!',
      status: 'Sightseeing',
      journal_entry: 'Standing in the shadow of the Colosseum, it\'s impossible not to feel the weight of two thousand years pressing down on you. Every weathered stone holds a story.',
      updated_at: new Date().toISOString(),
    }
    if (existing.data) {
      await supabase.from('live_locations').update(payload).eq('id', existing.data.id)
    } else {
      await supabase.from('live_locations').insert(payload)
    }

    // Poll
    const { data: poll } = await supabase.from('polls').insert({ trip_id: req.params.id, question: 'Which city should I spend an extra day in?', stop_id: null }).select().single()
    if (poll) {
      const opts = ['Paris','Barcelona','Rome','Santorini'].map((label, i) => ({ poll_id: poll.id, label, position: i }))
      const { data: pollOptions } = await supabase.from('poll_options').insert(opts).select()
      // Add a couple of votes
      if (pollOptions?.length >= 3) {
        await supabase.from('poll_votes').insert([
          { poll_option_id: pollOptions[0].id, voter_name: 'Mum',    voter_token: uuidv4() },
          { poll_option_id: pollOptions[2].id, voter_name: 'Jake',   voter_token: uuidv4() },
          { poll_option_id: pollOptions[2].id, voter_name: 'Olivia', voter_token: uuidv4() },
          { poll_option_id: pollOptions[3].id, voter_name: 'Tom',    voter_token: uuidv4() },
          { poll_option_id: pollOptions[3].id, voter_name: 'Dad',    voter_token: uuidv4() },
        ])
      }
    }

    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- Highlights ---

app.get('/api/trips/:id/highlights', async (req, res) => {
  try {
    const { data: trip } = await supabase.from('trips').select().eq('id', req.params.id).single()
    const { data: stops } = await supabase.from('stops').select().eq('trip_id', req.params.id)
    const stopIds = (stops || []).map(s => s.id)
    const { data: photos } = stopIds.length ? await supabase.from('photos').select().in('stop_id', stopIds) : { data: [] }
    const photoIds = (photos || []).map(p => p.id)
    const { data: reactions } = photoIds.length ? await supabase.from('reactions').select().in('photo_id', photoIds) : { data: [] }
    const { data: photoComments } = photoIds.length ? await supabase.from('comments').select().in('photo_id', photoIds) : { data: [] }
    const { data: stopComments } = stopIds.length ? await supabase.from('stop_comments').select().in('stop_id', stopIds) : { data: [] }

    const photosBest = (photos || []).map(p => ({
      ...p, reaction_count: (reactions || []).filter(r => r.photo_id === p.id).length,
      stop_name: (stops || []).find(s => s.id === p.stop_id)?.name,
    })).sort((a, b) => b.reaction_count - a.reaction_count)

    const stopsBest = (stops || []).map(s => ({
      ...s,
      comment_count: (stopComments || []).filter(c => c.stop_id === s.id).length +
        (photos || []).filter(p => p.stop_id === s.id).reduce((acc, p) => acc + (photoComments || []).filter(c => c.photo_id === p.id).length, 0)
    })).sort((a, b) => b.comment_count - a.comment_count)

    const countries = [...new Set((stops || []).map(s => s.name.split(', ').slice(-1)[0]))]

    res.json({
      trip,
      stats: {
        countries_visited: countries.length,
        cities_visited: (stops || []).length,
        photos_uploaded: (photos || []).length,
        reactions_received: (reactions || []).length,
        comments_received: (photoComments || []).length + (stopComments || []).length,
        countries,
      },
      most_liked_photo: photosBest[0] || null,
      most_commented_stop: stopsBest[0] || null,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.listen(PORT, () => console.log(`Wanderlog server running on http://localhost:${PORT}`))
