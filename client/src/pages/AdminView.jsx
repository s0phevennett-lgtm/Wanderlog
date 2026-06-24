import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTrip, verifyAdmin } from '../api'
import IllustratedMap from '../components/IllustratedMap'
import TripSidebar from '../components/TripSidebar'
import BottomTimeline from '../components/BottomTimeline'
import LivePanel from '../components/LivePanel'
import LocationCard from '../components/LocationCard'
import StopPanel from '../components/StopPanel'
import CheckInModal from '../components/CheckInModal'
import ShareModal from '../components/ShareModal'
import styles from './AdminView.module.css'


export default function AdminView() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [trip, setTrip]               = useState(null)
  const [stops, setStops]             = useState([])
  const [liveLocation, setLiveLocation] = useState(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [activeView, setActiveView]   = useState('overview')
  const [showCheckin, setShowCheckin] = useState(false)
  const [showShare, setShowShare]     = useState(false)
  const [stopTab, setStopTab]         = useState('Photos')
  const [timelineFlash, setTimelineFlash] = useState(false)
  const [error, setError]             = useState('')

  const loadData = useCallback(async () => {
    try {
      const ok = await verifyAdmin(id, token)
      if (!ok) { setError('Invalid admin token.'); return }
      const data = await getTrip(id)
      setTrip(data.trip); setStops(data.stops); setLiveLocation(data.live_location)
    } catch { setError('Could not load trip.') }
  }, [id, token])

  useEffect(() => { loadData() }, [loadData])

  function handleNav(key) {
    setActiveView(key)
    const TAB_MAP = { polls: 'Polls', requests: 'Requests', updates: 'Discuss' }
    switch (key) {
      case 'photos': {
        const target = currentStop || stops[0]
        if (target) { setStopTab('Photos'); setSelectedStop(target) }
        break
      }
      case 'highlights':
        navigate(`/trip/${id}/highlights`); break
      case 'polls':
      case 'requests':
      case 'updates': {
        const target = currentStop || stops[0]
        if (target) { setStopTab(TAB_MAP[key]); setSelectedStop(target) }
        break
      }
      case 'timeline':
        setTimelineFlash(true)
        setTimeout(() => setTimelineFlash(false), 1000)
        break
      case 'overview':
      case 'map':
        setSelectedStop(null); break
    }
  }

  function handleUploadPhoto() {
    const target = currentStop || stops[0]
    if (target) { setStopTab('Photos'); setSelectedStop(target) }
  }

  if (error) return <div className={styles.error}>{error}</div>
  if (!trip)  return <div className={styles.loading}><div className={styles.spinner} />Loading…</div>

  const currentStop = liveLocation ? stops.find(s => s.id === liveLocation.stop_id) : null

  const locationTag = (() => {
    const countries = [...new Set(stops.map(s => s.name.split(',').slice(-1)[0].trim()))]
    return countries.slice(0, 3).join(', ') || trip.traveller_name || ''
  })()

  return (
    <div className={styles.container}>
      <TripSidebar
        trip={trip} stops={stops} liveLocation={liveLocation}
        active={activeView} onNav={handleNav}
        onShare={() => setShowShare(true)}
        isAdmin={true}
        onCheckIn={() => setShowCheckin(true)}
      />

      <div className={styles.main}>
        {/* Admin top bar — dark navy to distinguish from viewer */}
        <div className={styles.topBar}>
          <div className={styles.tripTitle}>
            <span className={styles.adminBadge}>⚙ Admin</span>
            <h1 className={styles.tripName}>{trip.name}</h1>
            {currentStop && (
              <span className={styles.checkedIn}>
                <span className={styles.checkedInDot} />
                {currentStop.name.split(',')[0]}
              </span>
            )}
          </div>
          <div className={styles.topActions}>
            <button className={styles.uploadBtn} onClick={handleUploadPhoto}>📷 Upload Photo</button>
            <button className={styles.checkinBtn} onClick={() => setShowCheckin(true)}>📍 Check In</button>
            <button className={styles.actionBtn} onClick={() => navigate(`/trip/${id}/story`)}>📖 Story</button>
            <button className={styles.actionBtn} onClick={() => navigate(`/trip/${id}/highlights`)}>✨ Highlights</button>
            <button className={styles.actionBtn} onClick={() => setShowShare(true)}>🔗 Share</button>
            <button className={styles.viewerBtn} onClick={() => navigate(`/trip/${id}`)}>👁 Viewer</button>
          </div>
        </div>

        {/* Map area with floating cards */}
        <div className={styles.mapArea}>
          <IllustratedMap
            stops={stops} liveLocation={liveLocation}
            selectedStop={selectedStop} onSelectStop={setSelectedStop}
          />


          {liveLocation && currentStop && (
            <div className={styles.leftCards}>
              <LocationCard liveLocation={liveLocation} currentStop={currentStop} stops={stops} />
            </div>
          )}

          <div className={styles.rightPanel}>
            <LivePanel tripId={id} trip={trip} stops={stops} liveLocation={liveLocation} currentStop={currentStop} />
          </div>
        </div>

        {/* Bottom timeline */}
        <div className={`${styles.bottomStrip} ${timelineFlash ? styles.timelineFlash : ''}`}>
          <BottomTimeline stops={stops} liveLocation={liveLocation} selectedStop={selectedStop} onSelectStop={setSelectedStop} />
        </div>
      </div>

      {selectedStop && (
        <StopPanel stop={selectedStop} tripId={id} isAdmin={true} adminToken={token}
          initialTab={stopTab}
          onClose={() => { setSelectedStop(null); setStopTab('Photos') }}
          onPhotoUploaded={loadData} />
      )}

      {showCheckin && (
        <CheckInModal tripId={id} token={token} stops={stops} currentStopId={liveLocation?.stop_id}
          onClose={() => setShowCheckin(false)}
          onCheckIn={(loc) => { setLiveLocation(loc); setShowCheckin(false) }} />
      )}

      {showShare && <ShareModal tripId={id} tripName={trip.name} onClose={() => setShowShare(false)} />}
    </div>
  )
}
