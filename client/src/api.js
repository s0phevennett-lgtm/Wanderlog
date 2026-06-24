const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function getVoterToken() {
  let t = localStorage.getItem('wanderlog_voter')
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('wanderlog_voter', t) }
  return t
}

export async function importPdf(file) {
  const form = new FormData()
  form.append('pdf', file)
  const res = await fetch(`${BASE}/api/trips/import-pdf`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createTrip(itinerary) {
  const res = await fetch(`${BASE}/api/trips`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itinerary) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getTrip(id) {
  const res = await fetch(`${BASE}/api/trips/${id}`)
  if (!res.ok) throw new Error('Trip not found')
  return res.json()
}

export async function updateTrip(id, token, fields) {
  const res = await fetch(`${BASE}/api/trips/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...fields }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function recordView(id) {
  await fetch(`${BASE}/api/trips/${id}/view`, { method: 'POST' }).catch(() => {})
}

export async function verifyAdmin(id, token) {
  const res = await fetch(`${BASE}/api/trips/${id}/admin?token=${token}`)
  if (!res.ok) return false
  return true
}

export async function getStop(id) {
  const res = await fetch(`${BASE}/api/stops/${id}`)
  if (!res.ok) throw new Error('Stop not found')
  return res.json()
}

export async function uploadPhoto(stopId, token, file, caption) {
  const form = new FormData()
  form.append('photo', file)
  form.append('token', token)
  form.append('caption', caption)
  const res = await fetch(`${BASE}/api/stops/${stopId}/photos`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function addReaction(photoId, emoji, reactor_name) {
  const res = await fetch(`${BASE}/api/photos/${photoId}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji, reactor_name }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function addComment(photoId, author_name, body) {
  const res = await fetch(`${BASE}/api/photos/${photoId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author_name, body }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getStopComments(stopId) {
  const res = await fetch(`${BASE}/api/stops/${stopId}/comments`)
  if (!res.ok) return []
  return res.json()
}

export async function addStopComment(stopId, author_name, body, parent_id) {
  const res = await fetch(`${BASE}/api/stops/${stopId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author_name, body, parent_id }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function likeStopComment(commentId) {
  const res = await fetch(`${BASE}/api/stop-comments/${commentId}/like`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function checkIn(tripId, token, stopId, lat, lng, message, status, journal_entry) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/checkin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, stop_id: stopId, lat, lng, message, status, journal_entry }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function generateJournal(tripId, stopName, mood, message) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/generate-journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stop_name: stopName, mood, message }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getLiveLocation(tripId) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/live`)
  if (!res.ok) return null
  return res.json()
}

export async function getTripFeed(tripId) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/feed`)
  if (!res.ok) return []
  return res.json()
}

export async function getPolls(tripId) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/polls`)
  if (!res.ok) return []
  return res.json()
}

export async function createPoll(tripId, token, question, options, stop_id) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/polls`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, question, options, stop_id }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function votePoll(pollId, option_id, voter_name, voter_token) {
  const res = await fetch(`${BASE}/api/polls/${pollId}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ option_id, voter_name, voter_token }) })
  if (res.status === 409) return { already_voted: true }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function closePoll(pollId, token) {
  const res = await fetch(`${BASE}/api/polls/${pollId}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getRequests(tripId) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/requests`)
  if (!res.ok) return []
  return res.json()
}

export async function createRequest(tripId, requester_name, description, stop_id) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requester_name, description, stop_id }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateRequest(requestId, token, status) {
  const res = await fetch(`${BASE}/api/requests/${requestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, status }) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getHighlights(tripId) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/highlights`)
  if (!res.ok) throw new Error('Failed to load highlights')
  return res.json()
}

export function getPhotoUrl(storagePath) {
  if (storagePath.startsWith('http')) return storagePath
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`
}

export async function seedDemo(tripId, token) {
  const res = await fetch(`${BASE}/api/trips/${tripId}/seed-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
