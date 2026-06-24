import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip, importPdf, seedDemo } from '../api'
import styles from './CreateTrip.module.css'

export default function CreateTrip() {
  const [mode, setMode] = useState('pdf')
  const [json, setJson] = useState('')
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result, setResult] = useState(null)
  const fileRef = useRef()
  const navigate = useNavigate()
  const blobRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const EXAMPLE_TRIP = {
    trip_name: 'Spain & Portugal Summer 2025',
    start_date: '2025-07-01',
    end_date: '2025-07-28',
    stops: [
      { name: 'Barcelona, Spain',  lat: 41.3851, lng:  2.1734, arrival_date: '2025-07-01', departure_date: '2025-07-05', notes: 'Gaudí, beach bars, and the best patatas bravas of my life.' },
      { name: 'Ibiza, Spain',      lat: 38.9067, lng:  1.4206, arrival_date: '2025-07-05', departure_date: '2025-07-09', notes: 'Island hopping, hidden coves, and incredible sunsets at Café del Mar.' },
      { name: 'Mallorca, Spain',   lat: 39.6953, lng:  3.0176, arrival_date: '2025-07-09', departure_date: '2025-07-13', notes: 'Crystal clear water, mountain villages, and fresh ensaïmada every morning.' },
      { name: 'Seville, Spain',    lat: 37.3891, lng: -5.9845, arrival_date: '2025-07-13', departure_date: '2025-07-17', notes: 'Flamenco, the Alcázar, and orange trees lining every street.' },
      { name: 'Lagos, Portugal',   lat: 37.1021, lng: -8.6754, arrival_date: '2025-07-17', departure_date: '2025-07-21', notes: 'Sea caves, golden cliffs, and the most beautiful beaches in Europe.' },
      { name: 'Lisbon, Portugal',  lat: 38.7169, lng: -9.1395, arrival_date: '2025-07-21', departure_date: '2025-07-25', notes: 'Trams, fado music, pastéis de nata, and views from every miradouro.' },
      { name: 'Porto, Portugal',   lat: 41.1579, lng: -8.6291, arrival_date: '2025-07-25', departure_date: '2025-07-28', notes: 'Port wine cellars, colourful azulejos, and the Douro at sunset.' },
    ]
  }

  async function handleLoadExample() {
    setError('')
    setLoading(true)
    try {
      setLoadingMsg('Creating example trip…')
      const data = await createTrip(EXAMPLE_TRIP)
      setLoadingMsg('Adding photos & comments…')
      await seedDemo(data.trip.id, data.admin_token)
      setResult(data)
    } catch (err) {
      setError('Could not load example trip.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  useEffect(() => {
    const targets = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }))
    const current = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }))
    const strength = [55, -40, 35, -65, 48, -30]
    let rafId

    const onMove = (e) => {
      const cx = (e.clientX / window.innerWidth  - 0.5)
      const cy = (e.clientY / window.innerHeight - 0.5)
      strength.forEach((s, i) => {
        targets[i].x = cx * s
        targets[i].y = cy * s
      })
    }

    const tick = () => {
      let dirty = false
      current.forEach((c, i) => {
        const dx = targets[i].x - c.x
        const dy = targets[i].y - c.y
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
          c.x += dx * 0.04
          c.y += dy * 0.04
          dirty = true
        }
        if (blobRefs[i].current) {
          blobRefs[i].current.style.transform = `translate(${c.x}px, ${c.y}px)`
        }
      })
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  async function handlePdfChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setParsed(null)
    setLoading(true)
    setLoadingMsg('Reading your PDF with AI…')
    try {
      const itinerary = await importPdf(file)
      setParsed(itinerary)
    } catch (err) {
      setError('Could not parse PDF. Try the JSON option below, or use a clearer itinerary document.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  async function handleCreate() {
    setError('')
    setLoading(true)
    setLoadingMsg('Creating your trip…')
    try {
      const itinerary = mode === 'pdf' ? parsed : JSON.parse(json)
      const data = await createTrip(itinerary)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to create trip')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  if (result) {
    const shareUrl = `${window.location.origin}/view/${result.trip.id}`
    const adminUrl = `${window.location.origin}/admin/${result.trip.id}?token=${result.admin_token}`
    return (
      <div className={styles.page}>
        <div className={styles.blobs} aria-hidden="true">
          <div ref={blobRefs[0]} className={`${styles.blob} ${styles.blob1}`}/>
          <div ref={blobRefs[1]} className={`${styles.blob} ${styles.blob2}`}/>
          <div ref={blobRefs[2]} className={`${styles.blob} ${styles.blob3}`}/>
          <div ref={blobRefs[3]} className={`${styles.blob} ${styles.blob4}`}/>
          <div ref={blobRefs[4]} className={`${styles.blob} ${styles.blob5}`}/>
          <div ref={blobRefs[5]} className={`${styles.blob} ${styles.blob6}`}/>
        </div>
        <div className={styles.card}>
          <div className={styles.successIcon}>✈️</div>
          <h1 className={styles.title}>Trip Created!</h1>
          <p className={styles.subtitle}>{result.trip.name}</p>

          <div className={styles.linkBox}>
            <label>Share with friends & family</label>
            <div className={styles.linkRow}>
              <input readOnly value={shareUrl} />
              <button className="btn-primary" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
            </div>
          </div>

          <div className={styles.linkBox}>
            <label>Your admin link (keep this private!)</label>
            <div className={styles.linkRow}>
              <input readOnly value={adminUrl} />
              <button className="btn-primary" onClick={() => navigator.clipboard.writeText(adminUrl)}>Copy</button>
            </div>
          </div>

          <div className={styles.actions}>
            <button className="btn-primary" onClick={() => navigate(`/admin/${result.trip.id}?token=${result.admin_token}`)}>
              Go to Admin →
            </button>
            <button className="btn-secondary" onClick={() => navigate(`/trip/${result.trip.id}`)}>
              View as Visitor
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <div ref={blobRefs[0]} className={`${styles.blob} ${styles.blob1}`}/>
        <div ref={blobRefs[1]} className={`${styles.blob} ${styles.blob2}`}/>
        <div ref={blobRefs[2]} className={`${styles.blob} ${styles.blob3}`}/>
        <div ref={blobRefs[3]} className={`${styles.blob} ${styles.blob4}`}/>
        <div ref={blobRefs[4]} className={`${styles.blob} ${styles.blob5}`}/>
        <div ref={blobRefs[5]} className={`${styles.blob} ${styles.blob6}`}/>
      </div>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#2E7D50" fillOpacity="0.12"/>
            <path d="M24 10C17.373 10 12 15.373 12 22C12 30.5 24 40 24 40C24 40 36 30.5 36 22C36 15.373 30.627 10 24 10Z" fill="#2E7D50" fillOpacity="0.85"/>
            <circle cx="24" cy="22" r="5" fill="white"/>
          </svg>
          <span className={styles.logoText}>Wanderlog</span>
        </div>
        <p className={styles.subtitle}>Share your journey in real time</p>

        <button
          className={styles.exampleBtn}
          onClick={handleLoadExample}
          disabled={loading}
        >
          ✈️ &nbsp;View example trip
        </button>

        <div className={styles.divider}><span>or create your own</span></div>

        <div className={styles.tabs}>
          <button
            className={mode === 'pdf' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('pdf'); setError(''); setParsed(null) }}
          >
            Upload PDF
          </button>
          <button
            className={mode === 'json' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('json'); setError(''); setParsed(null) }}
          >
            Paste JSON
          </button>
        </div>

        {mode === 'pdf' && (
          <div className={styles.pdfSection}>
            <p className={styles.pdfHint}>
              Upload your travel itinerary PDF — airline confirmation, hotel booking, or any travel document — and AI will extract your stops automatically.
            </p>

            <div
              className={styles.dropzone}
              onClick={() => fileRef.current.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                style={{ display: 'none' }}
              />
              {loading ? (
                <div className={styles.dropzoneLoading}>
                  <div className={styles.spinner} />
                  <span>{loadingMsg}</span>
                </div>
              ) : parsed ? (
                <div className={styles.dropzoneDone}>
                  <span className={styles.checkmark}>✓</span>
                  <span>PDF parsed — click to re-upload</span>
                </div>
              ) : (
                <>
                  <span className={styles.dropzoneIcon}>📄</span>
                  <span className={styles.dropzoneLabel}>Click to upload PDF</span>
                  <span className={styles.dropzoneSub}>Booking confirmations, travel docs, itineraries</span>
                </>
              )}
            </div>

            {parsed && (
              <div className={styles.preview}>
                <h3 className={styles.previewTitle}>{parsed.trip_name}</h3>
                <p className={styles.previewDates}>{parsed.start_date} → {parsed.end_date}</p>
                <ul className={styles.stopList}>
                  {parsed.stops?.map((s, i) => (
                    <li key={i} className={styles.stopItem}>
                      <span className={styles.stopNum}>{i + 1}</span>
                      <div>
                        <strong>{s.name}</strong>
                        <span className={styles.stopDates}> {s.arrival_date} – {s.departure_date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {error && <p className={styles.error}>{error}</p>}
                <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ width: '100%', marginTop: 12 }}>
                  {loading ? loadingMsg : 'Create Trip →'}
                </button>
              </div>
            )}

            {error && !parsed && <p className={styles.error}>{error}</p>}
          </div>
        )}

        {mode === 'json' && (
          <div className={styles.form}>
            <div className={styles.textareaHeader}>
              <label>Paste your trip itinerary JSON</label>
            </div>
            <textarea
              value={json}
              onChange={e => setJson(e.target.value)}
              placeholder={`{\n  "trip_name": "My Trip",\n  "stops": [...]\n}`}
              rows={14}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button className="btn-primary" onClick={handleCreate} disabled={loading || !json.trim()}>
              {loading ? loadingMsg : 'Create Trip'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
