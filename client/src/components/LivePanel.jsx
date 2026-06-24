import { useEffect, useState } from 'react'
import { getHighlights } from '../api'
import { MOOD_ICONS, timeAgo } from './buildingIcons'
import styles from './LivePanel.module.css'

export default function LivePanel({ tripId, trip, stops, liveLocation, currentStop }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (tripId) getHighlights(tripId).then(d => setStats(d?.stats)).catch(() => {})
  }, [tripId])

  const countries = [...new Set(stops.map(s => s.name.split(',').slice(-1)[0].trim()))]

  return (
    <div className={styles.panel}>
      {/* Live journey status */}
      {liveLocation && currentStop ? (
        <div className={styles.liveCard}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveLabel}>Live Journey</span>
            <span className={styles.liveSuffix}>● Live</span>
          </div>
          <div className={styles.liveWho}>
            {trip.traveller_name ? `${trip.traveller_name} is in` : 'Currently in'}
          </div>
          <div className={styles.liveWhere}>{currentStop.name.split(',')[0]}!</div>
          {liveLocation.message && (
            <p className={styles.liveMsg}>"{liveLocation.message}"</p>
          )}
          <div className={styles.liveMeta}>Last updated {timeAgo(liveLocation.updated_at)}</div>
          {liveLocation.mood && (
            <span className={styles.liveMood}>
              {MOOD_ICONS[liveLocation.mood] || '😊'} {liveLocation.mood.charAt(0).toUpperCase() + liveLocation.mood.slice(1)}
            </span>
          )}
          {liveLocation.journal_entry && (
            <div className={styles.journalEntry}>
              <div className={styles.journalLabel}>✨ Travel Journal</div>
              <p className={styles.journalText}>{liveLocation.journal_entry}</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.liveCard}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDotIdle} />
            <span className={styles.liveLabel}>Journey Tracker</span>
          </div>
          <div className={styles.noLive}>No check-in yet</div>
          <div className={styles.liveMeta}>{stops.length} destination{stops.length !== 1 ? 's' : ''} planned</div>
        </div>
      )}

      {/* Trip path legend */}
      <div className={styles.legendCard}>
        <div className={styles.legendTitle}>Trip Path</div>
        <div className={styles.legendRow}>
          <span className={styles.legendLine} style={{ background: '#C1694F' }} />
          <span>Completed</span>
        </div>
        <div className={styles.legendRow}>
          <span className={`${styles.legendLine} ${styles.legendDash}`} />
          <span>Upcoming</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendPin}>📍</span>
          <span>Current Location</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className={styles.statsCard}>
        <div className={styles.legendTitle}>Quick Stats</div>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📍</span>
            <div className={styles.statInfo}>
              <span className={styles.statVal}>{stops.length}</span>
              <span className={styles.statLbl}>Destinations</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>🌍</span>
            <div className={styles.statInfo}>
              <span className={styles.statVal}>{countries.length}</span>
              <span className={styles.statLbl}>Countries</span>
            </div>
          </div>
          {stats && (
            <>
              <div className={styles.stat}>
                <span className={styles.statIcon}>📷</span>
                <div className={styles.statInfo}>
                  <span className={styles.statVal}>{stats.photos_uploaded ?? 0}</span>
                  <span className={styles.statLbl}>Photos</span>
                </div>
              </div>
              <div className={styles.stat}>
                <span className={styles.statIcon}>💬</span>
                <div className={styles.statInfo}>
                  <span className={styles.statVal}>{stats.comments_received ?? 0}</span>
                  <span className={styles.statLbl}>Comments</span>
                </div>
              </div>
              <div className={styles.stat}>
                <span className={styles.statIcon}>❤️</span>
                <div className={styles.statInfo}>
                  <span className={styles.statVal}>{stats.reactions_received ?? 0}</span>
                  <span className={styles.statLbl}>Reactions</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
