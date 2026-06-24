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

    const BASE_URL = process.env.CLIENT_URL || 'https://wanderlog-cyan.vercel.app'
    const seed = [
      {
        idx: 0, // Barcelona
        photos: [
          { url: `${BASE_URL}/demo/barcelona/1.jpg`, caption: 'Casa Batlló at golden hour — Gaudí was not human 🤯' },
          { url: `${BASE_URL}/demo/barcelona/2.jpg`, caption: 'Park Güell at sunrise — Sagrada Família in the distance, came here before the crowds 🌅' },
          { url: `${BASE_URL}/demo/barcelona/3.jpg`, caption: 'Found this incredible mosaic mural wandering through the Gothic Quarter' },
          { url: `${BASE_URL}/demo/barcelona/4.jpg`, caption: 'Sunday morning wandering the Gothic Quarter 📷' },
          { url: `${BASE_URL}/demo/barcelona/5.jpg`, caption: 'The Barcelona Cathedral peaking through the streets ✨' },
          { url: `${BASE_URL}/demo/barcelona/6.jpg`, caption: 'Best night out ❤️' },
          { url: `${BASE_URL}/demo/barcelona/7.jpg`, caption: 'Inside Sagrada Família — the light through those windows 😭' },
          { url: `${BASE_URL}/demo/barcelona/8.jpg`, caption: 'Bunkers del Carmel at night — the whole city sparkling below 🌃' },
          { url: `${BASE_URL}/demo/barcelona/9.jpg`, caption: 'The detail on Sagrada Família\'s facade, still under construction after 140 years' },
        ],
        reactions: [['❤️','Mum'],['😍','Jake'],['🔥','Olivia'],['😭','Dad']],
        photoComment: 'Casa Batlló is UNREAL!! Gaudí was actually a genius',
        stopComments: [
          { author_name: 'Mum',    body: 'Oh my goodness it looks incredible!! So jealous living vicariously through you 😭' },
          { author_name: 'Jake',   body: 'Did you make it to Park Güell?? The views from up there are unreal' },
          { author_name: 'Sophie', body: 'Yes!! We went at sunrise to beat the crowds — absolutely magical' },
          { author_name: 'Olivia', body: 'What\'s the food like?? Tell me everything' },
          { author_name: 'Sophie', body: 'Olivia I have eaten so much jamón I might turn into it 😂' },
        ],
      },
      {
        idx: 1, // Ibiza
        photos: [
          { url: `${BASE_URL}/demo/ibiza/1.jpg`, caption: 'Boat day around the island — the cliffs are insane 🚤' },
          { url: `${BASE_URL}/demo/ibiza/2.jpg`, caption: 'Night one at a beach club — absolutely incredible energy 🎶' },
          { url: `${BASE_URL}/demo/ibiza/3.jpg`, caption: 'Lunch at Yondal — the vibe here is unmatched 🌿' },
          { url: `${BASE_URL}/demo/ibiza/4.jpg`, caption: 'Those sea rocks in the background... the water is actually this colour 💙' },
          { url: `${BASE_URL}/demo/ibiza/5.jpg`, caption: 'Rosé all day at a beach club 🥂' },
          { url: `${BASE_URL}/demo/ibiza/6.jpg`, caption: 'Dancing on the beach as the sun went down 🌙' },
          { url: `${BASE_URL}/demo/ibiza/7.jpg`, caption: 'Ushuaïa open air club — best night of my life, no competition 🔥' },
          { url: `${BASE_URL}/demo/ibiza/8.jpg`, caption: 'Amnesia closing party — bubbles everywhere 🫧' },
          { url: `${BASE_URL}/demo/ibiza/9.jpg`, caption: 'Shoulders up for the drop 🎵' },
          { url: `${BASE_URL}/demo/ibiza/10.jpg`, caption: 'DC10 at 6am — we do not stop 🙌' },
          { url: `${BASE_URL}/demo/ibiza/11.jpg`, caption: 'Last night on the island and it absolutely did not disappoint 🌙' },
        ],
        reactions: [['🔥','Jake'],['😍','Olivia'],['❤️','Mum'],['🤩','Tom']],
        photoComment: 'The water is actually that colour in real life — not edited at all!!',
        stopComments: [
          { author_name: 'Tom',    body: 'Okay I am officially booking flights right now, this looks incredible' },
          { author_name: 'Sophie', body: 'DO IT. Best decision I\'ve ever made 🙌' },
          { author_name: 'Mum',    body: 'That water colour doesn\'t look real!! Is it edited??' },
          { author_name: 'Sophie', body: 'Mum I promise it\'s totally real 😂 Mediterranean magic' },
        ],
      },
      {
        idx: 2, // Mallorca
        photos: [
          { url: `${BASE_URL}/demo/mallorca/1.jpg`, caption: 'Found a secret cala — sitting on the rocks watching the swimmers 🩵' },
          { url: `${BASE_URL}/demo/mallorca/2.jpg`, caption: 'The vintage tram through Sóller — probably the most charming village in Mallorca 🚃' },
          { url: `${BASE_URL}/demo/mallorca/3.jpg`, caption: 'Boat day to the sea caves, the water colour is not real 😭' },
          { url: `${BASE_URL}/demo/mallorca/4.jpg`, caption: 'Found the most perfect little restaurant right on the water 🤍' },
          { url: `${BASE_URL}/demo/mallorca/5.jpg`, caption: 'Hiking down to the cala through the pine trees 🌿' },
          { url: `${BASE_URL}/demo/mallorca/6.jpg`, caption: 'The old fishermen\'s boathouses at the cala — so peaceful here 🌊' },
          { url: `${BASE_URL}/demo/mallorca/7.jpg`, caption: 'Wandering the golden streets of Valldemossa 🌿' },
          { url: `${BASE_URL}/demo/mallorca/10.png`, caption: 'Rosé on a paddleboard in a secret cala — life is good 🥂' },
        ],
        reactions: [['❤️','Mum'],['😍','Jake'],['✨','Olivia'],['😮','Dad']],
        photoComment: 'That turquoise water!! Mallorca you have won me over completely',
        stopComments: [
          { author_name: 'Dad',    body: 'Stay safe on those cliff paths sweetheart! Looks absolutely gorgeous' },
          { author_name: 'Sophie', body: 'Dad it\'s so beautiful here, most stunning water I\'ve ever seen' },
          { author_name: 'Jake',   body: 'Did you hire a car? The north of the island is so worth exploring' },
          { author_name: 'Sophie', body: 'Yes!! Drove all the way to Cap de Formentor, absolutely mind-blowing' },
        ],
      },
      {
        idx: 3, // Seville
        photos: [
          { url: `${BASE_URL}/demo/seville/1.jpg`, caption: 'Plaza de España — genuinely the most beautiful place I\'ve ever stood 😭' },
          { url: `${BASE_URL}/demo/seville/2.jpg`, caption: 'Sitting on the azulejo tiles at Plaza de España — honestly could stay here forever' },
          { url: `${BASE_URL}/demo/seville/3.jpg`, caption: 'Orange trees in the courtyard of Seville Cathedral 🍊' },
          { url: `${BASE_URL}/demo/seville/4.jpg`, caption: 'Las Setas at golden hour — the architecture in this city is something else' },
          { url: `${BASE_URL}/demo/seville/5.jpg`, caption: 'Night out in the old town — these streets go forever 🌙' },
          { url: `${BASE_URL}/demo/seville/6.jpg`, caption: 'White dinner by the water — best group photo of the whole trip 🥂' },
          { url: `${BASE_URL}/demo/seville/7.jpg`, caption: 'A flamenco dancer on the streets near the Giralda — this is Seville 💃' },
        ],
        reactions: [['❤️','Mum'],['😍','Olivia'],['🔥','Tom'],['❤️','Jake']],
        photoComment: 'Plaza de España looks like something from a movie set!!',
        stopComments: [
          { author_name: 'Olivia', body: 'SEVILLE!! My favourite city in the whole world, you\'re going to love it' },
          { author_name: 'Sophie', body: 'Olivia you were SO right. I am absolutely obsessed with this place' },
          { author_name: 'Tom',    body: 'Make sure you go up the Giralda at sunset, the views are something else' },
          { author_name: 'Sophie', body: 'Did it last night — 100% the best sunset of the whole trip so far!' },
        ],
      },
      {
        idx: 4, // Lagos
        photos: [
          { url: `${BASE_URL}/demo/lagos/1.jpg`, caption: 'Ponta da Piedade — walking down to this view I actually gasped 🤯' },
          { url: `${BASE_URL}/demo/lagos/2.jpg`, caption: 'Looking down into Benagil from above — the colours are not real 🌊' },
          { url: `${BASE_URL}/demo/lagos/3.jpg`, caption: 'Beach day at Praia do Camilo, waves crashing through the arch 🌊' },
          { url: `${BASE_URL}/demo/lagos/4.jpg`, caption: 'Sitting on the clifftop looking through the twin arches at Praia da Marinha 🩵' },
          { url: `${BASE_URL}/demo/lagos/5.jpg`, caption: 'Kayaking to the sea caves — she stood up and somehow didn\'t fall 😂' },
          { url: `${BASE_URL}/demo/lagos/6.jpg`, caption: 'Inside Benagil Cave — kayaked here at sunrise, worth every stroke 🚣' },
          { url: `${BASE_URL}/demo/lagos/7.jpg`, caption: 'Paddling through the arches at Praia da Marinha — this coastline is extraordinary 🌊' },
        ],
        reactions: [['😍','Mum'],['❤️','Jake'],['🤩','Olivia'],['🔥','Tom'],['😭','Dad']],
        photoComment: 'Portugal is stealing my heart honestly 😭',
        stopComments: [
          { author_name: 'Mum',    body: 'Sophie those cliffs!! I actually gasped looking at this photo' },
          { author_name: 'Sophie', body: 'Mum they are even MORE dramatic in person. I nearly cried 😂' },
          { author_name: 'Jake',   body: 'Which has been your favourite stop so far??' },
          { author_name: 'Sophie', body: 'Honestly impossible to choose but Lagos might be it... the nature here is unreal' },
          { author_name: 'Olivia', body: 'I knew Portugal would steal your heart 🥹' },
        ],
      },
      {
        idx: 5, // Lisbon
        photos: [
          { url: `${BASE_URL}/demo/lisbon/1.jpg`, caption: 'Caught the famous yellow tram in Alfama 🚃 iconic' },
          { url: `${BASE_URL}/demo/lisbon/2.jpg`, caption: 'Tram 28 climbing through Alfama — bougainvillea everywhere 🌸' },
          { url: `${BASE_URL}/demo/lisbon/3.jpg`, caption: 'Sunset over the rooftops and the Tagus river from the miradouro 🌇' },
          { url: `${BASE_URL}/demo/lisbon/4.jpg`, caption: 'Pastéis de nata and azulejo tiles — this is Lisbon in one photo 🧡' },
          { url: `${BASE_URL}/demo/lisbon/5.jpg`, caption: 'Found the cutest little arched doorway in Alfama — Lisbon is a dream 🏡' },
          { url: `${BASE_URL}/demo/lisbon/6.jpg`, caption: 'Fresh pastéis de nata from Pastéis de Belém — mandatory 🥐' },
        ],
        reactions: [['❤️','Mum'],['😍','Dad'],['🥹','Olivia'],['🔥','Jake']],
        photoComment: 'Lisbon is the most charming city in Europe, change my mind',
        stopComments: [
          { author_name: 'Dad',    body: 'Your grandmother would have loved Lisbon, she always wanted to go' },
          { author_name: 'Sophie', body: 'Dad that made me tear up a little 🥹 I\'m thinking of her' },
          { author_name: 'Tom',    body: 'Have you been to LX Factory?? The weekend market is incredible' },
          { author_name: 'Sophie', body: 'Going tomorrow!! Thanks for the tip 🙌' },
        ],
      },
      {
        idx: 6, // Porto
        photos: [
          { url: `${BASE_URL}/demo/porto/1.jpg`, caption: 'Dom Luís Bridge at golden hour — Ribeira glowing below 🌅' },
          { url: `${BASE_URL}/demo/porto/2.jpg`, caption: 'Ribeira framed by Dom Luís Bridge at sunset — Porto you beauty 🧡' },
          { url: `${BASE_URL}/demo/porto/3.jpg`, caption: 'The azulejo tiles at Porto Cathedral — stood here for way too long 💙' },
          { url: `${BASE_URL}/demo/porto/4.jpg`, caption: 'Pastéis de nata warm from the bakery — mandatory stop every morning 🥐' },
          { url: `${BASE_URL}/demo/porto/5.jpg`, caption: 'Porto vintage prints by the Douro — bought four, no regrets 🖼️' },
          { url: `${BASE_URL}/demo/porto/6.jpg`, caption: 'Walking down to the Douro through Ribeira — every staircase leads somewhere beautiful 🌊' },
        ],
        reactions: [['❤️','Mum'],['😍','Jake'],['🍷','Tom'],['✨','Olivia']],
        photoComment: 'Porto is giving me serious "I need to move here" feelings',
        stopComments: [
          { author_name: 'Olivia', body: 'Porto is the BEST final stop, ending on a high note 🥂' },
          { author_name: 'Sophie', body: 'It really is perfect. Also I may have bought 6 bottles of port wine to bring home...' },
          { author_name: 'Jake',   body: 'Only 6?? 😂' },
          { author_name: 'Mum',    body: 'Come home soon we miss you!! Save some port for us 🥹' },
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

    // Check in at Porto (last stop)
    const liveStop = stops[stops.length - 1]
    const existing = await supabase.from('live_locations').select().eq('trip_id', req.params.id).maybeSingle()
    const payload = {
      trip_id: req.params.id, stop_id: liveStop.id,
      lat: liveStop.lat, lng: liveStop.lng,
      message: 'Last stop — Porto is the most perfect ending to this trip 🍷',
      status: 'Exploring',
      journal_entry: 'The Douro glitters below as the sun sets behind the port wine cellars. I\'ve been travelling for four weeks and somehow Porto feels like the most alive I\'ve been. I\'m not ready to go home.',
      updated_at: new Date().toISOString(),
    }
    if (existing.data) {
      await supabase.from('live_locations').update(payload).eq('id', existing.data.id)
    } else {
      await supabase.from('live_locations').insert(payload)
    }

    // Poll
    const { data: poll } = await supabase.from('polls').insert({ trip_id: req.params.id, question: 'Which was my best stop?', stop_id: null }).select().single()
    if (poll) {
      const opts = ['Barcelona 🇪🇸','Ibiza 🏝️','Seville 💃','Lagos 🌊','Porto 🍷'].map((label, i) => ({ poll_id: poll.id, label, position: i }))
      const { data: pollOptions } = await supabase.from('poll_options').insert(opts).select()
      if (pollOptions?.length >= 5) {
        await supabase.from('poll_votes').insert([
          { poll_option_id: pollOptions[0].id, voter_name: 'Mum',    voter_token: uuidv4() },
          { poll_option_id: pollOptions[3].id, voter_name: 'Jake',   voter_token: uuidv4() },
          { poll_option_id: pollOptions[3].id, voter_name: 'Olivia', voter_token: uuidv4() },
          { poll_option_id: pollOptions[4].id, voter_name: 'Tom',    voter_token: uuidv4() },
          { poll_option_id: pollOptions[4].id, voter_name: 'Dad',    voter_token: uuidv4() },
          { poll_option_id: pollOptions[1].id, voter_name: 'Ella',   voter_token: uuidv4() },
          { poll_option_id: pollOptions[2].id, voter_name: 'Marco',  voter_token: uuidv4() },
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
