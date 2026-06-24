import { useState } from 'react'
import styles from './ProgressTimeline.module.css'

function nightsBetween(a, b) {
  if (!a || !b) return null
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function fmt(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function ProgressTimeline({ stops, liveLocation, onSelectStop }) {
  const [open, setOpen] = useState(true)
  const currentIdx = liveLocation ? stops.findIndex(s => s.id === liveLocation.stop_id) : -1

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen(v => !v)}>
        {open ? '▼' : '▲'} Trip Progress
      </button>
      {open && (
        <div className={styles.timeline}>
          {stops.map((stop, i) => {
            const isVisited = currentIdx >= 0 && i <= currentIdx
            const isCurrent = liveLocation?.stop_id === stop.id
            const nights = nightsBetween(stop.arrival_date, stop.departure_date)
            return (
              <div
                key={stop.id}
                className={`${styles.stop} ${isVisited ? styles.visited : ''} ${isCurrent ? styles.current : ''}`}
                onClick={() => onSelectStop(stop)}
              >
                <div className={styles.markerCol}>
                  <div className={styles.dot}>{isCurrent ? '📍' : isVisited ? '✓' : i + 1}</div>
                  {i < stops.length - 1 && <div className={`${styles.line} ${isVisited ? styles.lineVisited : ''}`} />}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{stop.name}</div>
                  <div className={styles.meta}>
                    {fmt(stop.arrival_date)}{stop.departure_date ? ` – ${fmt(stop.departure_date)}` : ''}
                    {nights ? ` · ${nights} night${nights !== 1 ? 's' : ''}` : ''}
                  </div>
                  {isCurrent && <span className={styles.badge}>Here now</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
