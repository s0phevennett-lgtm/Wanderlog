import styles from './TripSidebar.module.css'

function Icon({ type }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round', width: 18, height: 18 }
  switch (type) {
    case 'overview':  return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    case 'timeline':  return <svg {...p}><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
    case 'map':       return <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
    case 'photos':    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    case 'updates':   return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'polls':     return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    case 'requests':  return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    case 'highlights': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'settings':  return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'share':     return <svg {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
    default: return null
  }
}

const NAV = [
  { key: 'overview',  label: 'Trip Overview' },
  { key: 'timeline',  label: 'Timeline' },
  { key: 'map',       label: 'Map' },
  { key: 'photos',    label: 'Photos' },
  { key: 'updates',   label: 'Updates' },
  { key: 'polls',     label: 'Polls' },
  { key: 'requests',  label: 'Requests' },
  { key: 'highlights',label: 'Highlights' },
]

export default function TripSidebar({ trip, stops, liveLocation, active, onNav, onShare, isAdmin, onCheckIn }) {
  const initial = (trip?.traveller_name || trip?.name || '?')[0].toUpperCase()
  const curIdx  = liveLocation ? stops.findIndex(s => s.id === liveLocation.stop_id) : -1
  const visited = curIdx >= 0 ? curIdx + 1 : 0

  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>Wander</span>
      </div>

      <nav className={styles.nav}>
        {isAdmin && (
          <button className={styles.checkinBtn} onClick={onCheckIn}>
            <span className={styles.checkinDot} />
            Check In
          </button>
        )}
        {NAV.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.navItem} ${active === key ? styles.navActive : ''}`}
            onClick={() => onNav(key)}
          >
            <span className={styles.navIcon}><Icon type={key} /></span>
            <span className={styles.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.navBottom}>
        <button className={`${styles.navItem} ${active === 'settings' ? styles.navActive : ''}`} onClick={() => onNav('settings')}>
          <span className={styles.navIcon}><Icon type="settings" /></span>
          <span className={styles.navLabel}>Settings</span>
        </button>
      </div>

      <div className={styles.userCard}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{trip?.name}</span>
          <span className={styles.userMeta}>
            {fmt(trip?.start_date)}{trip?.end_date ? ` – ${fmt(trip?.end_date)}` : ''}
          </span>
          {visited > 0 && (
            <span className={styles.userProgress}>{visited} of {stops.length} stops</span>
          )}
        </div>
      </div>

      <button className={styles.shareBtn} onClick={onShare}>
        <Icon type="share" />
        Share Trip
      </button>
    </aside>
  )
}
