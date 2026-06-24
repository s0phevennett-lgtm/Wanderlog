import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getHighlights, getPhotoUrl } from '../api'
import styles from './Highlights.module.css'

export default function Highlights() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getHighlights(id).then(setData).catch(() => setError('Could not load highlights.'))
  }, [id])

  if (error) return <div className={styles.error}>{error}</div>
  if (!data) return <div className={styles.loading}><div className={styles.spinner} /></div>

  const { trip, stats, most_liked_photo, most_commented_stop } = data

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(`/trip/${id}`)}>← Back to map</button>
        <h1 className={styles.title}>{trip.name}</h1>
        <p className={styles.sub}>Trip Highlights</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="🌍" value={stats.countries_visited} label="Countries" />
        <StatCard icon="📍" value={stats.cities_visited} label="Destinations" />
        <StatCard icon="📷" value={stats.photos_uploaded} label="Photos" />
        <StatCard icon="❤️" value={stats.reactions_received} label="Reactions" />
        <StatCard icon="💬" value={stats.comments_received} label="Comments" />
        {trip.view_count > 0 && <StatCard icon="👀" value={trip.view_count} label="Views" />}
      </div>

      {stats.countries.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Countries visited</h2>
          <div className={styles.tags}>
            {stats.countries.map(c => <span key={c} className={styles.tag}>{c}</span>)}
          </div>
        </div>
      )}

      {most_liked_photo && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Most loved photo</h2>
          <div className={styles.highlightCard}>
            <img src={getPhotoUrl(most_liked_photo.storage_path)} alt="Most liked" className={styles.featuredPhoto} />
            <div className={styles.photoMeta}>
              <span className={styles.photoStop}>{most_liked_photo.stop_name}</span>
              {most_liked_photo.caption && <p className={styles.photoCaption}>{most_liked_photo.caption}</p>}
              <span className={styles.photoReactions}>❤️ {most_liked_photo.reaction_count} reaction{most_liked_photo.reaction_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {most_commented_stop && most_commented_stop.comment_count > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Most discussed destination</h2>
          <div className={styles.stopHighlight}>
            <div className={styles.stopPin}>📍</div>
            <div>
              <strong className={styles.stopName}>{most_commented_stop.name}</strong>
              <span className={styles.stopComments}>{most_commented_stop.comment_count} comment{most_commented_stop.comment_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <button className={styles.viewBtn} onClick={() => navigate(`/trip/${id}`)}>Back to trip map</button>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
