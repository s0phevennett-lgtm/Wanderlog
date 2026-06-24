import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip, importPdf, seedDemo } from '../api'
import styles from './CreateTrip.module.css'

// ── Decorative illustrated map ────────────────────────────────────
function MapIllustration() {
  return (
    <svg
      viewBox="0 0 480 540"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.mapSvg}
      role="img"
      aria-label="Decorative illustrated travel map"
    >
      <defs>
        <filter id="roughen" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.022" numOctaves="3" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="dropshadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="5" floodColor="#00000022"/>
        </filter>
        <filter id="softshadow" x="-5%" y="-5%" width="115%" height="125%">
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#0000001A"/>
        </filter>
        <clipPath id="mapBounds">
          <rect width="480" height="540" rx="24"/>
        </clipPath>
      </defs>

      <g clipPath="url(#mapBounds)">
        {/* Parchment background */}
        <rect width="480" height="540" fill="#EDE5D0"/>

        {/* Graticule / grid lines */}
        {[90,180,270,360,450].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#C8B898" strokeWidth="0.5" opacity="0.4"/>
        ))}
        {[96,192,288,384].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="540" stroke="#C8B898" strokeWidth="0.5" opacity="0.4"/>
        ))}

        {/* Sea colour wash */}
        <rect width="480" height="540" fill="#B8D4E0" opacity="0.22"/>

        {/* ── LAND MASSES ── */}
        {/* Italian peninsula — simplified boot silhouette */}
        <path
          d="M145,65 C175,52 220,60 248,82 C268,98 274,130 275,165
             C276,200 270,235 265,268 C260,298 252,320 242,342
             C235,358 228,370 218,365 C208,360 205,348 208,334
             C214,318 225,308 228,292 C232,275 228,255 222,238
             C214,218 200,205 188,192 C172,176 155,168 145,180
             C132,194 128,215 130,235 C132,255 140,272 138,290
             C135,308 125,318 115,325 C102,332 90,325 88,312
             C85,298 92,285 102,275 C115,262 128,250 132,232
             C136,212 128,192 118,175 C108,158 105,138 110,118
             C118,95 132,78 145,65Z"
          fill="#BACF96"
          stroke="#9EBA78"
          strokeWidth="1.2"
          filter="url(#roughen)"
        />
        {/* Interior highlight */}
        <ellipse cx="188" cy="205" rx="52" ry="90" fill="#C8D8A8" opacity="0.38" filter="url(#roughen)"/>

        {/* Sicily */}
        <ellipse cx="150" cy="415" rx="44" ry="26" fill="#BACF96" stroke="#9EBA78" strokeWidth="1" filter="url(#roughen)"/>

        {/* Sardinia */}
        <ellipse cx="88" cy="282" rx="20" ry="32" fill="#BACF96" stroke="#9EBA78" strokeWidth="0.8" filter="url(#roughen)"/>

        {/* Greek / Aegean islands */}
        <ellipse cx="390" cy="452" rx="40" ry="23" fill="#BACF96" stroke="#9EBA78" strokeWidth="1" filter="url(#roughen)"/>
        <ellipse cx="360" cy="472" rx="18" ry="12" fill="#BACF96" opacity="0.82" filter="url(#roughen)"/>
        <ellipse cx="424" cy="440" rx="14" ry="10" fill="#BACF96" opacity="0.68" filter="url(#roughen)"/>

        {/* Scattered small islands */}
        <ellipse cx="310" cy="432" rx="16" ry="10" fill="#BACF96" opacity="0.6" filter="url(#roughen)"/>
        <ellipse cx="344" cy="470" rx="10" ry="7" fill="#BACF96" opacity="0.52" filter="url(#roughen)"/>
        <ellipse cx="230" cy="402" rx="14" ry="9" fill="#BACF96" opacity="0.5" filter="url(#roughen)"/>

        {/* Sea wave lines */}
        <path d="M22,352 Q62,346 102,352 Q142,358 182,352" fill="none" stroke="#8BB8CC" strokeWidth="1" opacity="0.48" strokeLinecap="round"/>
        <path d="M22,366 Q66,360 112,366 Q158,372 200,366" fill="none" stroke="#8BB8CC" strokeWidth="0.8" opacity="0.38" strokeLinecap="round"/>
        <path d="M262,402 Q302,395 342,402 Q382,409 422,402" fill="none" stroke="#8BB8CC" strokeWidth="1" opacity="0.48" strokeLinecap="round"/>
        <path d="M268,416 Q310,409 352,416 Q394,423 436,416" fill="none" stroke="#8BB8CC" strokeWidth="0.8" opacity="0.38" strokeLinecap="round"/>

        {/* ── ROUTE PATH ── */}
        <path
          d="M196,132 L177,222 L213,316 Q282,378 384,450"
          fill="none"
          stroke="#C4964A"
          strokeWidth="2.2"
          strokeDasharray="7,6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* ── ROME (196, 132) ── */}
        {/* Colosseum */}
        <g transform="translate(196,94)">
          <ellipse cx="0" cy="8" rx="15" ry="9" fill="#D4B07A" stroke="#C4964A" strokeWidth="1"/>
          <ellipse cx="0" cy="5" rx="15" ry="9" fill="#E2C48A" stroke="#C4964A" strokeWidth="1"/>
          <rect x="-15" y="5" width="30" height="10" fill="#D4B07A"/>
          <path d="M-9,5 A3,4 0 0,0 -3,5" fill="#7A5430" opacity="0.5"/>
          <path d="M0,5 A3,4 0 0,0 6,5" fill="#7A5430" opacity="0.5"/>
          <path d="M9,5 A3,4 0 0,0 15,5" fill="#7A5430" opacity="0.5"/>
        </g>
        {/* Pin */}
        <circle cx="196" cy="132" r="7" fill="#2E7D50" stroke="white" strokeWidth="2.5"/>
        <circle cx="196" cy="132" r="3" fill="white"/>
        {/* Label (right) */}
        <g filter="url(#softshadow)">
          <rect x="207" y="118" width="94" height="36" rx="8" fill="white" opacity="0.96"/>
        </g>
        <text x="215" y="133" fontSize="11.5" fontWeight="700" fill="#1A3C5E" fontFamily="Georgia, serif">Rome</text>
        <text x="215" y="148" fontSize="9" fill="#7A8AA0" fontFamily="system-ui,sans-serif">May 10 – 13</text>

        {/* ── FLORENCE (177, 222) ── */}
        {/* Duomo */}
        <g transform="translate(177,184)">
          <rect x="-13" y="10" width="26" height="12" fill="#E8C870" stroke="#C4964A" strokeWidth="0.8"/>
          <ellipse cx="0" cy="10" rx="10" ry="9" fill="#C1694F"/>
          <ellipse cx="0" cy="7" rx="5" ry="5" fill="#A04A35"/>
          <rect x="-1.5" y="0" width="3" height="7" fill="#8B3A28"/>
          <rect x="-6" y="10" width="5" height="12" fill="#D4A868"/>
          <rect x="1" y="10" width="5" height="12" fill="#D4A868"/>
        </g>
        {/* Pin */}
        <circle cx="177" cy="222" r="7" fill="#2E7D50" stroke="white" strokeWidth="2.5"/>
        <circle cx="177" cy="222" r="3" fill="white"/>
        {/* Label (left) */}
        <g filter="url(#softshadow)">
          <rect x="80" y="208" width="89" height="36" rx="8" fill="white" opacity="0.96"/>
        </g>
        <text x="88" y="223" fontSize="11.5" fontWeight="700" fill="#1A3C5E" fontFamily="Georgia, serif">Florence</text>
        <text x="88" y="238" fontSize="9" fill="#7A8AA0" fontFamily="system-ui,sans-serif">May 14 – 17</text>

        {/* ── VENICE (213, 316) ── */}
        {/* Rialto bridge */}
        <g transform="translate(213,277)">
          <path d="M-16,10 Q0,-1 16,10" fill="none" stroke="#D4B07A" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="-16" y="10" width="32" height="8" fill="#E8C870" stroke="#C4964A" strokeWidth="0.8"/>
          <rect x="-4" y="10" width="8" height="9" fill="#D4A868"/>
          <rect x="-16" y="18" width="32" height="5" fill="#5898BC" opacity="0.42"/>
        </g>
        {/* Pin */}
        <circle cx="213" cy="316" r="7" fill="#2E7D50" stroke="white" strokeWidth="2.5"/>
        <circle cx="213" cy="316" r="3" fill="white"/>
        {/* Label (right) */}
        <g filter="url(#softshadow)">
          <rect x="223" y="302" width="90" height="36" rx="8" fill="white" opacity="0.96"/>
        </g>
        <text x="231" y="317" fontSize="11.5" fontWeight="700" fill="#1A3C5E" fontFamily="Georgia, serif">Venice</text>
        <text x="231" y="332" fontSize="9" fill="#7A8AA0" fontFamily="system-ui,sans-serif">May 18 – 21</text>

        {/* ── SANTORINI (384, 450) ── */}
        {/* Blue dome church */}
        <g transform="translate(384,412)">
          <rect x="-12" y="10" width="24" height="14" fill="#F0EDE8" stroke="#C8BEA8" strokeWidth="0.8"/>
          <ellipse cx="0" cy="10" rx="11" ry="8" fill="#3D7FD6"/>
          <ellipse cx="-5" cy="13" rx="5" ry="4" fill="#5A9FEE" opacity="0.55"/>
          <line x1="0" y1="0" x2="0" y2="4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="-2.2" y1="2" x2="2.2" y2="2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        </g>
        {/* Pin */}
        <circle cx="384" cy="450" r="7" fill="#2E7D50" stroke="white" strokeWidth="2.5"/>
        <circle cx="384" cy="450" r="3" fill="white"/>
        {/* Label (left) */}
        <g filter="url(#softshadow)">
          <rect x="284" y="436" width="92" height="36" rx="8" fill="white" opacity="0.96"/>
        </g>
        <text x="292" y="451" fontSize="11.5" fontWeight="700" fill="#1A3C5E" fontFamily="Georgia, serif">Santorini</text>
        <text x="292" y="466" fontSize="9" fill="#7A8AA0" fontFamily="system-ui,sans-serif">May 22 – 25</text>

        {/* ── AIRPLANE (between Florence and Venice) ── */}
        <g transform="translate(204,272) rotate(-52)">
          <path d="M0,-9 C2,-9 9,-6 9,0 C9,6 2,9 0,9 C-2,9 -2,4 -7,4 L-9,9 L-11,9 L-9,4 L-16,4 L-18,7 L-20,7 L-18,0 L-20,-7 L-18,-7 L-16,-4 L-9,-4 L-11,-9 L-9,-9 L-7,-4 C-2,-4 -2,-9 0,-9Z"
            fill="#C4964A" opacity="0.9"/>
        </g>

        {/* ── POLAROID CARD (lower-left corner) ── */}
        <g transform="translate(20,368) rotate(-8)">
          <rect x="0" y="0" width="90" height="98" rx="4" fill="white" filter="url(#dropshadow)"/>
          {/* Photo area */}
          <rect x="7" y="7" width="76" height="64" fill="#B8D5E0"/>
          {/* Sky */}
          <rect x="7" y="7" width="76" height="36" fill="#87C0D8"/>
          {/* Hills */}
          <ellipse cx="36" cy="71" rx="33" ry="21" fill="#7AB884"/>
          <ellipse cx="70" cy="71" rx="26" ry="17" fill="#92CC98"/>
          {/* Sun */}
          <circle cx="64" cy="21" r="9" fill="#F5D654" opacity="0.88"/>
          {/* Caption */}
          <text x="45" y="86" textAnchor="middle" fontSize="7.5" fill="#9AA8B8" fontFamily="Georgia,serif" fontStyle="italic">adventure awaits</text>
        </g>

        {/* ── COMPASS ROSE (top-right) ── */}
        <g transform="translate(422,72)">
          <circle cx="0" cy="0" r="30" fill="white" opacity="0.9" stroke="#D4B07A" strokeWidth="1.5"/>
          {/* Cardinal ticks */}
          <line x1="0" y1="-30" x2="0" y2="-24" stroke="#D4B07A" strokeWidth="1"/>
          <line x1="30" y1="0" x2="24" y2="0" stroke="#D4B07A" strokeWidth="1"/>
          <line x1="0" y1="30" x2="0" y2="24" stroke="#D4B07A" strokeWidth="1"/>
          <line x1="-30" y1="0" x2="-24" y2="0" stroke="#D4B07A" strokeWidth="1"/>
          {/* North (amber) */}
          <polygon points="0,-24 -4,-10 4,-10" fill="#C4964A"/>
          {/* S/E/W (tan) */}
          <polygon points="0,24 -3,10 3,10" fill="#D4C0A0"/>
          <polygon points="24,0 10,-3 10,3" fill="#D4C0A0"/>
          <polygon points="-24,0 -10,-3 -10,3" fill="#D4C0A0"/>
          {/* Centre */}
          <circle cx="0" cy="0" r="4" fill="#C4964A"/>
          <circle cx="0" cy="0" r="2" fill="white"/>
          <text x="0" y="-27" textAnchor="middle" fontSize="8" fill="#4A3010" fontWeight="700" fontFamily="system-ui">N</text>
        </g>

        {/* ── LIVE BADGE (mid-right) ── */}
        <g transform="translate(296,145)">
          <rect x="0" y="0" width="136" height="38" rx="19" fill="white" filter="url(#softshadow)"/>
          <circle cx="19" cy="19" r="7" fill="#22C55E"/>
          <circle cx="19" cy="19" r="3.5" fill="white"/>
          <text x="34" y="16" fontSize="9.5" fill="#1A3C5E" fontWeight="700" fontFamily="system-ui,sans-serif">Live updates</text>
          <text x="34" y="29" fontSize="8.5" fill="#8A9AAA" fontFamily="system-ui,sans-serif">sharing in real time</text>
        </g>
      </g>
    </svg>
  )
}

// ── Example trip data ──────────────────────────────────────────────
const EXAMPLE_TRIP = {
  trip_name: 'Spain & Portugal Summer 2025',
  start_date: '2025-07-01',
  end_date:   '2025-07-28',
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

// ── Component ─────────────────────────────────────────────────────
export default function CreateTrip() {
  const [mode,       setMode]       = useState('pdf')
  const [json,       setJson]       = useState('')
  const [parsed,     setParsed]     = useState(null)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result,     setResult]     = useState(null)
  const fileRef  = useRef()
  const navigate = useNavigate()

  async function handleLoadExample() {
    setError('')
    setLoading(true)
    try {
      setLoadingMsg('Creating example trip…')
      const data = await createTrip(EXAMPLE_TRIP)
      setLoadingMsg('Adding photos & comments…')
      await seedDemo(data.trip.id, data.admin_token)
      setResult(data)
    } catch {
      setError('Could not load example trip.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

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
    } catch {
      setError('Could not parse PDF. Try the JSON option, or use a clearer itinerary document.')
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

  // ── Success view ───────────────────────────────────────────────
  if (result) {
    const shareUrl = `${window.location.origin}/view/${result.trip.id}`
    const adminUrl = `${window.location.origin}/admin/${result.trip.id}?token=${result.admin_token}`
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successBadge}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className={styles.successTitle}>Trip created!</h1>
          <p className={styles.successSub}>{result.trip.name}</p>

          <div className={styles.linkBox}>
            <label className={styles.linkLabel}>Share with friends &amp; family</label>
            <div className={styles.linkRow}>
              <input readOnly value={shareUrl} className={styles.linkInput}/>
              <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
            </div>
          </div>

          <div className={styles.linkBox}>
            <label className={styles.linkLabel}>
              Your admin link <span className={styles.private}>(keep this private)</span>
            </label>
            <div className={styles.linkRow}>
              <input readOnly value={adminUrl} className={styles.linkInput}/>
              <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(adminUrl)}>Copy</button>
            </div>
          </div>

          <div className={styles.successActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate(`/admin/${result.trip.id}?token=${result.admin_token}`)}
            >
              Go to Admin →
            </button>
            <button className={styles.ghostBtn} onClick={() => navigate(`/trip/${result.trip.id}`)}>
              View as Visitor
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main layout ────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.main}>

        {/* LEFT — form */}
        <div className={styles.leftContent}>
          {/* Logo */}
          <div className={styles.logoWrap}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#2E7D50" fillOpacity="0.12"/>
              <path d="M24 10C17.373 10 12 15.373 12 22C12 30.5 24 40 24 40C24 40 36 30.5 36 22C36 15.373 30.627 10 24 10Z" fill="#2E7D50"/>
              <circle cx="24" cy="22" r="5" fill="white"/>
            </svg>
            <span className={styles.logoText}>Wanderlog</span>
          </div>

          <h1 className={styles.headline}>
            Your journey.<br/>
            <span className={styles.headlineAccent}>Shared beautifully.</span>
          </h1>

          <p className={styles.supportText}>
            Create a live trip page, invite your people, and share every moment as it happens — photos, locations, and updates in real time.
          </p>

          {/* Primary CTA */}
          <button
            className={styles.exampleBtn}
            onClick={handleLoadExample}
            disabled={loading}
          >
            {loading && loadingMsg ? (
              <><span className={styles.spinner}/> {loadingMsg}</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                View example trip
              </>
            )}
          </button>

          {error && !parsed && <p className={styles.error}>{error}</p>}

          <div className={styles.divider}><span>or create your own</span></div>

          {/* Mode tabs */}
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

          {/* PDF upload */}
          {mode === 'pdf' && (
            <div className={styles.pdfSection}>
              <p className={styles.pdfHint}>
                Upload your travel itinerary PDF — booking confirmation, hotel voucher, or any travel doc — and AI will extract your stops automatically.
              </p>
              <div className={styles.dropzone} onClick={() => fileRef.current.click()}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  style={{ display: 'none' }}
                />
                {loading ? (
                  <div className={styles.dropzoneLoading}>
                    <span className={styles.spinnerDark}/>
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
                  <button
                    className={styles.primaryBtn}
                    onClick={handleCreate}
                    disabled={loading}
                    style={{ width: '100%', marginTop: 12 }}
                  >
                    {loading ? loadingMsg : 'Create Trip →'}
                  </button>
                </div>
              )}
              {error && !parsed && <p className={styles.error}>{error}</p>}
            </div>
          )}

          {/* JSON paste */}
          {mode === 'json' && (
            <div className={styles.form}>
              <label className={styles.formLabel}>Paste your trip itinerary JSON</label>
              <textarea
                className={styles.textarea}
                value={json}
                onChange={e => setJson(e.target.value)}
                placeholder={`{\n  "trip_name": "My Trip",\n  "stops": [...]\n}`}
                rows={12}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button
                className={styles.primaryBtn}
                onClick={handleCreate}
                disabled={loading || !json.trim()}
              >
                {loading ? loadingMsg : 'Create Trip'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — illustrated map */}
        <div className={styles.rightContent}>
          <div className={styles.mapWrap}>
            <MapIllustration/>
            {/* Viewer bubble */}
            <div className={styles.viewerBubble}>
              <div className={styles.avatars}>
                <span className={styles.avatar} style={{ background: '#E8C870', color: '#4A3010' }}>S</span>
                <span className={styles.avatar} style={{ background: '#C1694F', color: 'white' }}>M</span>
                <span className={styles.avatar} style={{ background: '#2E7D50', color: 'white' }}>J</span>
                <span className={styles.avatar} style={{ background: '#1A3C5E', color: 'white' }}>+4</span>
              </div>
              <span className={styles.viewerText}>following this trip</span>
            </div>
          </div>
        </div>

      </div>

      {/* Feature strip */}
      <div className={styles.featureStrip}>
        <div className={styles.feature}>
          <div className={styles.featureIcon} style={{ background: 'rgba(46,125,80,0.1)', color: '#2E7D50' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureTitle}>Real-time updates</div>
            <div className={styles.featureSub}>Never miss a moment</div>
          </div>
        </div>

        <div className={styles.featureDivider}/>

        <div className={styles.feature}>
          <div className={styles.featureIcon} style={{ background: 'rgba(26,60,94,0.1)', color: '#1A3C5E' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureTitle}>Everyone included</div>
            <div className={styles.featureSub}>No app required for viewers</div>
          </div>
        </div>

        <div className={styles.featureDivider}/>

        <div className={styles.feature}>
          <div className={styles.featureIcon} style={{ background: 'rgba(193,105,79,0.1)', color: '#C1694F' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureTitle}>Private &amp; secure</div>
            <div className={styles.featureSub}>You control who has access</div>
          </div>
        </div>
      </div>
    </div>
  )
}
