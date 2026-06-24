import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, recordView, getPhotoUrl } from '../api'
import styles from './TripLanding.module.css'

export default function TripLanding() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [cover, setCover] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrip(id)
        setTrip(data.trip)
        setStops(data.stops)
        recordView(id)
      } catch { setError('Trip not found.') }
    }
    load()
  }, [id])

  if (error) return <div className={styles.error}>{error}</div>
  if (!trip) return <div className={styles.loading}><div className={styles.spinner} /></div>

  const nights = trip.start_date && trip.end_date
    ? Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)
    : null

  const countries = [...new Set(stops.map(s => s.name.split(', ').slice(-1)[0]))]

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>Live Trip</div>
          <h1 className={styles.title}>{trip.name}</h1>
          {trip.traveller_name && <p className={styles.traveller}>by {trip.traveller_name}</p>}
          {trip.description && <p className={styles.desc}>{trip.description}</p>}

          <div className={styles.meta}>
            {trip.start_date && (
              <span className={styles.metaItem}>
                📅 {new Date(trip.start_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                {trip.end_date ? ` → ${new Date(trip.end_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
              </span>
            )}
            {nights && <span className={styles.metaItem}>🌙 {nights} nights</span>}
            {countries.length > 0 && <span className={styles.metaItem}>🌍 {countries.join(', ')}</span>}
            <span className={styles.metaItem}>📍 {stops.length} destination{stops.length !== 1 ? 's' : ''}</span>
          </div>

          <button className={styles.viewBtn} onClick={() => navigate(`/trip/${id}`)}>
            View Trip Map →
          </button>
        </div>
      </div>

      {stops.length > 0 && (
        <div className={styles.stopsSection}>
          <h2 className={styles.sectionTitle}>Itinerary</h2>
          <div className={styles.stopsList}>
            {stops.map((stop, i) => (
              <div key={stop.id} className={styles.stopItem}>
                <div className={styles.stopNum}>{i + 1}</div>
                <div className={styles.stopInfo}>
                  <strong>{stop.name}</strong>
                  {stop.arrival_date && (
                    <span className={styles.stopDates}>
                      {new Date(stop.arrival_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      {stop.departure_date ? ` – ${new Date(stop.departure_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.cta}>
        <button className={styles.viewBtn} onClick={() => navigate(`/trip/${id}`)}>
          Open Interactive Map →
        </button>
        <p className={styles.ctaHint}>View photos, comment on destinations, vote on polls and more</p>
      </div>
    </div>
  )
}
