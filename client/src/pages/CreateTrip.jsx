import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip, importPdf } from '../api'
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
      <div className={styles.card}>
        <div className={styles.logo}>🗺️</div>
        <h1 className={styles.title}>Wanderlog</h1>
        <p className={styles.subtitle}>Share your journey in real time</p>

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
