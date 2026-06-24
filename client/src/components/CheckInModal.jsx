import { useState } from 'react'
import { checkIn, generateJournal } from '../api'
import styles from './CheckInModal.module.css'

const MOODS = [
  { label: 'Exploring', icon: '🗺️' },
  { label: 'Relaxing', icon: '😴' },
  { label: 'Travelling', icon: '✈️' },
  { label: 'Hiking', icon: '🥾' },
  { label: 'Eating', icon: '🍽️' },
  { label: 'Shopping', icon: '🛍️' },
]

export default function CheckInModal({ tripId, token, stops, currentStopId, onClose, onCheckIn }) {
  const [stopId, setStopId]                 = useState(currentStopId || stops[0]?.id || '')
  const [mood, setMood]                     = useState('Exploring')
  const [message, setMessage]               = useState('')
  const [loading, setLoading]               = useState(false)
  const [journalOpen, setJournalOpen]       = useState(false)
  const [journalLoading, setJournalLoading] = useState(false)
  const [journalEntry, setJournalEntry]     = useState('')

  async function handleGenerateJournal() {
    const stop = stops.find(s => s.id === stopId)
    if (!stop) return
    setJournalOpen(true)
    setJournalLoading(true)
    setJournalEntry('')
    try {
      const result = await generateJournal(tripId, stop.name.split(',')[0], mood, message)
      setJournalEntry(result.entry)
    } catch {
      setJournalEntry('Could not generate entry — check your Anthropic API key.')
    } finally {
      setJournalLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const stop = stops.find(s => s.id === stopId)
    if (!stop) return
    setLoading(true)
    try {
      const loc = await checkIn(
        tripId, token, stop.id, stop.lat, stop.lng,
        message.trim() || null, mood,
        journalEntry.trim() || null
      )
      onCheckIn(loc)
    } catch (err) {
      alert('Check-in failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <h2 className={styles.title}>Check In</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Where are you?</label>
          <select className={styles.select} value={stopId} onChange={e => setStopId(e.target.value)}>
            {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label className={styles.label}>What are you up to?</label>
          <div className={styles.moods}>
            {MOODS.map(m => (
              <button
                key={m.label}
                type="button"
                className={`${styles.moodBtn} ${mood === m.label ? styles.moodActive : ''}`}
                onClick={() => setMood(m.label)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <label className={styles.label}>Send a message (optional)</label>
          <textarea
            className={styles.textarea}
            placeholder="Tell your viewers what you're up to…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
          />

          {/* AI Journal */}
          <div className={styles.journalSection}>
            {!journalOpen ? (
              <button type="button" className={styles.journalBtn} onClick={handleGenerateJournal}>
                ✨ Generate AI Journal Entry
              </button>
            ) : (
              <div className={styles.journalBox}>
                <div className={styles.journalHeader}>
                  <span className={styles.journalTitle}>✨ AI Journal Entry</span>
                  <button
                    type="button"
                    className={styles.regenBtn}
                    onClick={handleGenerateJournal}
                    disabled={journalLoading}
                  >
                    ↻ Regenerate
                  </button>
                </div>
                {journalLoading ? (
                  <div className={styles.journalLoading}>Writing your travel story…</div>
                ) : (
                  <textarea
                    className={`${styles.textarea} ${styles.journalTextarea}`}
                    value={journalEntry}
                    onChange={e => setJournalEntry(e.target.value)}
                    rows={4}
                    placeholder="Your AI journal entry will appear here…"
                  />
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Checking in…' : '📍 Check In'}
          </button>
        </form>
      </div>
    </div>
  )
}
