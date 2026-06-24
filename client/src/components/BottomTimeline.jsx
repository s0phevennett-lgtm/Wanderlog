import { useRef } from 'react'
import { BUILDINGS, ICON_ORDER, getStopStatus, fmtDate } from './buildingIcons'
import styles from './BottomTimeline.module.css'

export default function BottomTimeline({ stops, liveLocation, selectedStop, onSelectStop }) {
  const scrollRef = useRef()

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  return (
    <div className={styles.strip}>
      <button className={styles.arrow} onClick={() => scroll(-1)}>‹</button>

      <div className={styles.scroll} ref={scrollRef}>
        {stops.map((stop, i) => {
          const status     = getStopStatus(stop, i, liveLocation, stops)
          const isSelected = selectedStop?.id === stop.id
          const type       = ICON_ORDER[i % ICON_ORDER.length]
          const svg        = BUILDINGS[type]
          const city       = stop.name.split(',')[0].trim()
          const arrival    = fmtDate(stop.arrival_date)
          const departure  = fmtDate(stop.departure_date)
          const dateStr    = arrival && departure ? `${arrival} – ${departure}` : arrival || ''

          return [
            <button
              key={stop.id}
              className={[
                styles.stopCard,
                isSelected ? styles.active : '',
                styles[status],
              ].join(' ')}
              onClick={() => onSelectStop(stop)}
            >
              {/* Status dot at top-right */}
              <span className={`${styles.statusDot} ${styles[`dot_${status}`]}`} />

              {/* Building illustration */}
              <div className={styles.iconWrap}>
                <svg
                  viewBox="0 0 44 36"
                  className={styles.buildingSvg}
                  xmlns="http://www.w3.org/2000/svg"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <span
                  className={styles.numBadge}
                  style={{ background: status === 'visited' ? '#2E7D50' : status === 'current' ? '#1A3C5E' : '#8AA8B0' }}
                >{i + 1}</span>
              </div>

              {/* Labels */}
              <span className={styles.city}>{city}</span>
              {dateStr && <span className={styles.dates}>{dateStr}</span>}
            </button>,

            /* Connector arrow between stops */
            i < stops.length - 1 && (
              <div key={`conn-${i}`} className={`${styles.connector} ${status !== 'upcoming' ? styles.connDone : ''}`}>
                <svg viewBox="0 0 40 12" className={styles.connSvg} xmlns="http://www.w3.org/2000/svg">
                  <line x1="2" y1="6" x2="34" y2="6"
                    stroke={status !== 'upcoming' ? '#2E7D50' : '#B0C8C0'}
                    strokeWidth="2"
                    strokeDasharray={status !== 'upcoming' ? 'none' : '6 5'}
                    strokeLinecap="round"/>
                  <polyline points="29,2 35,6 29,10"
                    fill="none"
                    stroke={status !== 'upcoming' ? '#2E7D50' : '#B0C8C0'}
                    strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ),
          ]
        })}
      </div>

      <button className={styles.arrow} onClick={() => scroll(1)}>›</button>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.ldotGreen} /> Checked in
        </div>
        <div className={styles.legendItem}>
          <span className={styles.ldotBlue} /> Current
        </div>
        <div className={styles.legendItem}>
          <span className={styles.ldotGrey} /> Upcoming
        </div>
      </div>
    </div>
  )
}
