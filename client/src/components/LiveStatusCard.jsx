import styles from './LiveStatusCard.module.css'

const MOOD_ICONS = {
  Exploring: '🗺️', Relaxing: '😴', Travelling: '✈️',
  Hiking: '🥾', Eating: '🍽️', Shopping: '🛍️',
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function LiveStatusCard({ live, stopName, traveller }) {
  if (!live) return null
  const icon = MOOD_ICONS[live.status] || '📍'
  return (
    <div className={styles.card}>
      <div className={styles.dot} />
      <div className={styles.content}>
        <div className={styles.location}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.status}>{live.status || 'Exploring'}</span>
          <span className={styles.sep}>·</span>
          <strong>{stopName}</strong>
        </div>
        {live.message && <p className={styles.message}>"{live.message}"</p>}
        <span className={styles.time}>{timeAgo(live.updated_at)}</span>
      </div>
    </div>
  )
}
