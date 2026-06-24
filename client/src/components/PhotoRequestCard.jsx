import { useState, useEffect } from 'react'
import { getRequests, createRequest, updateRequest } from '../api'
import styles from './PhotoRequestCard.module.css'

const STATUS_LABEL = { pending: '⏳ Pending', planned: '📋 Planned', completed: '✅ Done', not_possible: '❌ Not possible' }
const STATUS_COLORS = { pending: '#8a7a6a', planned: '#1A3C5E', completed: '#2d7a4f', not_possible: '#c0392b' }

export default function PhotoRequestCard({ tripId, stopId, isAdmin, adminToken }) {
  const [requests, setRequests] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const data = await getRequests(tripId)
    const filtered = stopId ? data.filter(r => r.stop_id === stopId || !r.stop_id) : data
    setRequests(filtered)
  }

  useEffect(() => { load() }, [tripId, stopId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !desc.trim()) return
    setSubmitting(true)
    try {
      await createRequest(tripId, name.trim(), desc.trim(), stopId || null)
      setName(''); setDesc('')
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatus(id, status) {
    await updateRequest(id, adminToken, status)
    load()
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.formLabel}>Request a photo from the traveller</p>
        <input className={styles.input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea className={styles.textarea} placeholder="What would you like a photo of? e.g. Show us the hotel view!" value={desc} onChange={e => setDesc(e.target.value)} rows={2} required />
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? 'Sending…' : '📸 Send Request'}
        </button>
      </form>

      {requests.length > 0 && (
        <div className={styles.list}>
          <p className={styles.listLabel}>Photo requests</p>
          {requests.map(r => (
            <div key={r.id} className={styles.item}>
              <div className={styles.itemTop}>
                <span className={styles.requester}>{r.requester_name}</span>
                <span className={styles.status} style={{ color: STATUS_COLORS[r.status] }}>{STATUS_LABEL[r.status]}</span>
              </div>
              <p className={styles.desc}>{r.description}</p>
              {isAdmin && r.status !== 'completed' && (
                <div className={styles.adminBtns}>
                  {r.status !== 'planned' && <button onClick={() => handleStatus(r.id, 'planned')}>Mark Planned</button>}
                  <button onClick={() => handleStatus(r.id, 'completed')}>Mark Done</button>
                  {r.status !== 'not_possible' && <button onClick={() => handleStatus(r.id, 'not_possible')}>Not Possible</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
