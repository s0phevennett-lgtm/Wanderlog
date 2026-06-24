import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrip, getTripFeed, getPhotoUrl } from '../api'
import { BUILDINGS, ICON_ORDER, fmtDate } from '../components/buildingIcons'
import styles from './TripStory.module.css'

function AnimatedCount({ to, duration = 1200 }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const start = performance.now()
    function tick(now) {
      const pct = Math.min((now - start) / duration, 1)
      setVal(Math.round(pct * to))
      if (pct < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [to, duration])
  return <>{val}</>
}

export default function TripStory() {
  const { id } = useParams()
  const [trip, setTrip]   = useState(null)
  const [stops, setStops] = useState([])
  const [photos, setPhotos] = useState([])
  const [copied, setCopied] = useState(false)
  const [liveLocation, setLiveLocation] = useState(null)

  useEffect(() => {
    getTrip(id).then(d => {
      setTrip(d.trip)
      setStops(d.stops || [])
      setLiveLocation(d.live_location)
    }).catch(console.error)
    getTripFeed(id).then(setPhotos).catch(() => {})
  }, [id])

  if (!trip) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <span>Loading your story…</span>
    </div>
  )

  const countries = [...new Set(stops.map(s => s.name.split(',').slice(-1)[0].trim()))]
  const startDate = trip.start_date ? new Date(trip.start_date) : null
  const endDate   = trip.end_date   ? new Date(trip.end_date)   : null
  const days = startDate && endDate ? Math.round((endDate - startDate) / 86400000) + 1 : null

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>✈️ Trip Story</div>
          <h1 className={styles.heroTitle}>{trip.name}</h1>
          {trip.traveller_name && (
            <div className={styles.heroBy}>A journey by <strong>{trip.traveller_name}</strong></div>
          )}
          {startDate && (
            <div className={styles.heroDates}>
              {fmtDate(trip.start_date)} — {fmtDate(trip.end_date)}
            </div>
          )}
          <div className={styles.heroRoute}>
            {stops.map((s, i) => (
              <span key={s.id} className={styles.heroStop}>
                {i > 0 && <span className={styles.heroArrow}>→</span>}
                {s.name.split(',')[0]}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animated stats ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {days && (
            <div className={styles.statCard}>
              <div className={styles.statNum}><AnimatedCount to={days} /></div>
              <div className={styles.statLbl}>Days</div>
            </div>
          )}
          <div className={styles.statCard}>
            <div className={styles.statNum}><AnimatedCount to={stops.length} /></div>
            <div className={styles.statLbl}>Destinations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}><AnimatedCount to={countries.length} /></div>
            <div className={styles.statLbl}>Countries</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}><AnimatedCount to={photos.length} /></div>
            <div className={styles.statLbl}>Photos</div>
          </div>
        </div>
      </section>

      {/* ── Photo highlights ── */}
      {photos.length > 0 && (
        <section className={styles.photosSection}>
          <h2 className={styles.sectionTitle}>Photo Highlights</h2>
          <div className={styles.photoGrid}>
            {photos.slice(0, 12).map((photo, i) => (
              <div
                key={photo.id}
                className={`${styles.photoCard} ${i === 0 ? styles.photoLarge : ''}`}
              >
                <img
                  src={getPhotoUrl(photo.storage_path)}
                  alt={photo.caption || 'Travel photo'}
                  className={styles.photoImg}
                  loading="lazy"
                />
                {photo.caption && <div className={styles.photoCaption}>{photo.caption}</div>}
                {photo.stop_name && <div className={styles.photoStop}>{photo.stop_name.split(',')[0]}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Destinations timeline ── */}
      <section className={styles.stopsSection}>
        <h2 className={styles.sectionTitle}>The Journey</h2>
        <div className={styles.stopsTimeline}>
          {stops.map((stop, i) => {
            const type = ICON_ORDER[i % ICON_ORDER.length]
            const svg  = BUILDINGS[type]
            const isLive = liveLocation?.stop_id === stop.id
            return (
              <div key={stop.id} className={styles.stopItem}>
                <div className={styles.stopLeft}>
                  <div className={`${styles.stopDot} ${isLive ? styles.stopDotLive : ''}`} />
                  {i < stops.length - 1 && <div className={styles.stopLine} />}
                </div>
                <div className={styles.stopBody}>
                  <div className={styles.stopBuilding}>
                    <svg viewBox="0 0 44 36" width="52" height="42" xmlns="http://www.w3.org/2000/svg"
                      dangerouslySetInnerHTML={{ __html: svg }} />
                  </div>
                  <div className={styles.stopInfo}>
                    <div className={styles.stopNum}>{i + 1}</div>
                    <div className={styles.stopName}>{stop.name.split(',')[0]}</div>
                    <div className={styles.stopCountry}>{stop.name.split(',').slice(1).join(',').trim()}</div>
                    {(stop.arrival_date || stop.departure_date) && (
                      <div className={styles.stopDates}>
                        {fmtDate(stop.arrival_date)}{stop.departure_date ? ` – ${fmtDate(stop.departure_date)}` : ''}
                      </div>
                    )}
                    {stop.notes && <div className={styles.stopNotes}>{stop.notes}</div>}
                  </div>
                  {isLive && liveLocation?.journal_entry && (
                    <div className={styles.stopJournal}>
                      <div className={styles.stopJournalLabel}>✨ Journal</div>
                      <p className={styles.stopJournalText}>{liveLocation.journal_entry}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Share footer ── */}
      <section className={styles.shareSection}>
        <div className={styles.shareCard}>
          <div className={styles.shareTitle}>Share this story</div>
          <div className={styles.shareSubtitle}>Let friends and family follow the adventure</div>
          <div className={styles.shareRow}>
            <input
              className={styles.shareInput}
              value={window.location.href}
              readOnly
              onClick={e => e.target.select()}
            />
            <button className={styles.copyBtn} onClick={copyLink}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <Link to={`/trip/${id}`} className={styles.backLink}>← View live trip</Link>
        </div>
      </section>

    </div>
  )
}
