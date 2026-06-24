import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, getLiveLocation, recordView } from '../api'
import IllustratedMap from '../components/IllustratedMap'
import TripSidebar from '../components/TripSidebar'
import BottomTimeline from '../components/BottomTimeline'
import LivePanel from '../components/LivePanel'
import LocationCard from '../components/LocationCard'
import StopPanel from '../components/StopPanel'
import PhotoFeed from '../components/PhotoFeed'
import ShareModal from '../components/ShareModal'
import styles from './TripView.module.css'


export default function TripView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [liveLocation, setLiveLocation] = useState(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [showFeed, setShowFeed] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [stopTab, setStopTab] = useState('Photos')
  const [timelineFlash, setTimelineFlash] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const data = await getTrip(id)
      setTrip(data.trip); setStops(data.stops); setLiveLocation(data.live_location)
    } catch { setError('Trip not found.') }
  }, [id])

  useEffect(() => {
    loadData()
    recordView(id)
    const iv = setInterval(async () => { const loc = await getLiveLocation(id); setLiveLocation(loc) }, 10000)
    return () => clearInterval(iv)
  }, [id, loadData])

  function handleNav(key) {
    setActiveView(key)
    const TAB_MAP = { polls: 'Polls', requests: 'Requests', updates: 'Discuss' }
    switch (key) {
      case 'photos':
        setShowFeed(true); break
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

  if (error) return <div className={styles.error}>{error}</div>
  if (!trip)  return <div className={styles.loading}><div className={styles.spinner} />Loading trip…</div>

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
        isAdmin={false}
      />

      <div className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.tripTitle}>
            <h1 className={styles.tripName}>{trip.name}</h1>
            {locationTag && <span className={styles.locationTag}>📍 {locationTag}</span>}
          </div>
          <div className={styles.topActions}>
            {liveLocation && currentStop && (
              <span className={styles.checkedInPill}>
                <span className={styles.checkedInDot} />
                {trip.traveller_name ? `${trip.traveller_name} is in ${currentStop.name.split(',')[0]}` : `Live · ${currentStop.name.split(',')[0]}`}
              </span>
            )}
            <button className={styles.actionBtn} onClick={() => setShowFeed(v => !v)}>📷 Photos</button>
            <button className={styles.actionBtn} onClick={() => setShowShare(true)}>🔗 Share</button>
            <button className={styles.actionBtn} onClick={() => navigate(`/trip/${id}/story`)}>📖 Story</button>
            <button className={styles.highlightsBtn} onClick={() => navigate(`/trip/${id}/highlights`)}>✨ Highlights</button>
          </div>
        </div>

        {/* Map area with floating cards */}
        <div className={styles.mapArea}>
          <IllustratedMap
            stops={stops} liveLocation={liveLocation}
            selectedStop={selectedStop} onSelectStop={setSelectedStop}
          />

          {/* Decorative foliage — pointer-events:none so map stays clickable */}

          {/* Left floating: location + progress */}
          {liveLocation && currentStop && (
            <div className={styles.leftCards}>
              <LocationCard liveLocation={liveLocation} currentStop={currentStop} stops={stops} />
            </div>
          )}

          {/* Right floating: live journey + stats */}
          <div className={styles.rightPanel}>
            <LivePanel tripId={id} trip={trip} stops={stops} liveLocation={liveLocation} currentStop={currentStop} />
          </div>
        </div>

        {/* Bottom timeline strip */}
        <div className={`${styles.bottomStrip} ${timelineFlash ? styles.timelineFlash : ''}`}>
          <BottomTimeline stops={stops} liveLocation={liveLocation} selectedStop={selectedStop} onSelectStop={setSelectedStop} />
        </div>
      </div>

      {selectedStop && (
        <StopPanel stop={selectedStop} tripId={id} isAdmin={false} adminToken={null}
          initialTab={stopTab} onClose={() => { setSelectedStop(null); setStopTab('Photos') }} />
      )}
      {showFeed  && <PhotoFeed tripId={id} onClose={() => setShowFeed(false)} />}
      {showShare && <ShareModal tripId={id} tripName={trip.name} onClose={() => setShowShare(false)} />}
    </div>
  )
}
