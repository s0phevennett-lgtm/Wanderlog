import { MOOD_ICONS, timeAgo } from './buildingIcons'
import WeatherWidget from './WeatherWidget'
import styles from './LocationCard.module.css'

export default function LocationCard({ liveLocation, currentStop, stops }) {
  if (!liveLocation || !currentStop) return null

  const curIdx   = stops.findIndex(s => s.id === liveLocation.stop_id)
  const visited  = curIdx + 1
  const pct      = Math.round((visited / stops.length) * 100)
  const nextStop = curIdx < stops.length - 1 ? stops[curIdx + 1] : null

  let countdown = null
  if (nextStop?.arrival_date) {
    const days = Math.ceil((new Date(nextStop.arrival_date) - new Date()) / 86400000)
    if (days > 1)      countdown = `in ${days} days`
    else if (days === 1) countdown = 'tomorrow!'
    else if (days === 0) countdown = 'today!'
    else                 countdown = 'now'
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.label}>Current Location</div>
        <div className={styles.location}>{currentStop.name.split(',')[0]}</div>
        <div className={styles.meta}>Last updated {timeAgo(liveLocation.updated_at)}</div>
        {liveLocation.mood && (
          <span className={styles.mood}>
            {MOOD_ICONS[liveLocation.mood] || '😊'}&nbsp;{liveLocation.mood}
          </span>
        )}
      </div>

      <WeatherWidget
        lat={currentStop.lat}
        lng={currentStop.lng}
        city={currentStop.name.split(',')[0]}
      />

      <div className={styles.progressCard}>
        <div className={styles.progressLabel}>Trip Progress</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.progressText}>
          {visited} of {stops.length} stop{stops.length !== 1 ? 's' : ''} completed
        </div>
        {nextStop && (
          <div className={styles.nextStop}>
            <span className={styles.nextIcon}>→</span>
            Next: <strong>{nextStop.name.split(',')[0]}</strong>
            {countdown && <span className={styles.countdown}>{countdown}</span>}
          </div>
        )}
      </div>
    </>
  )
}
