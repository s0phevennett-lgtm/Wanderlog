import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './illustrated-map.css'
import { BUILDINGS, ICON_ORDER, BADGE_COLOR, getStopStatus, fmtDate } from './buildingIcons'

function buildIcon(stop, idx, status, isSelected) {
  const badgeColor = BADGE_COLOR[status]
  const type       = ICON_ORDER[idx % ICON_ORDER.length]
  const svg        = BUILDINGS[type]
  const rot        = ([-1.5, 0, 1.5])[idx % 3]
  const city       = stop.name.split(',')[0].trim()
  const arrival    = fmtDate(stop.arrival_date)
  const departure  = fmtDate(stop.departure_date)
  const dateStr    = arrival && departure ? `${arrival} – ${departure}` : arrival || ''

  const badge = status === 'current'
    ? `<span class="ilm-pulse"></span>`
    : status === 'visited'
    ? `<span class="ilm-check">✓</span>`
    : ''

  return L.divIcon({
    html: `
      <div class="ilm-wrap ilm-${status}${isSelected ? ' ilm-sel' : ''}"
           style="transform:rotate(${rot}deg)">
        <div class="ilm-card">
          ${badge}
          <svg viewBox="0 0 44 36" class="ilm-svg" xmlns="http://www.w3.org/2000/svg">${svg}</svg>
          <span class="ilm-num" style="background:${badgeColor}">${idx + 1}</span>
        </div>
        <div class="ilm-label">
          <span class="ilm-city">${city}</span>
          ${dateStr ? `<span class="ilm-date">${dateStr}</span>` : ''}
        </div>
        <div class="ilm-stem" style="background:${badgeColor}"></div>
      </div>
    `,
    className: '',
    iconSize:   [96, 96],
    iconAnchor: [48, 96],
  })
}

function FitBounds({ stops, liveLocation }) {
  const map = useMap()
  useEffect(() => {
    if (!stops.length) return
    const cur = liveLocation ? stops.find(s => s.id === liveLocation.stop_id) : null
    if (cur)                 map.setView([cur.lat, cur.lng], 8)
    else if (stops.length === 1) map.setView([stops[0].lat, stops[0].lng], 10)
    else map.fitBounds(L.latLngBounds(stops.map(s => [s.lat, s.lng])), { padding: [100, 100] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length, liveLocation?.stop_id])
  return null
}

function FlyTo({ stop }) {
  const map  = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (stop) map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 9), { animate: true, duration: 0.75 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop?.id])
  return null
}

export default function IllustratedMap({ stops, liveLocation, selectedStop, onSelectStop, children }) {
  return (
    <MapContainer
      center={[20, 15]} zoom={3}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      className="ilm-container"
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
        attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, CC BY 3.0 — Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds stops={stops} liveLocation={liveLocation} />
      <FlyTo stop={selectedStop} />

      {/* Route lines — white outline + green line */}
      {stops.length > 1 && stops.flatMap((stop, i) => {
        if (i === stops.length - 1) return []
        const next   = stops[i + 1]
        const curIdx = liveLocation ? stops.findIndex(s => s.id === liveLocation.stop_id) : -1
        const done   = curIdx >= 0 && i < curIdx
        const isCur  = curIdx === i
        const pos    = [[stop.lat, stop.lng], [next.lat, next.lng]]
        return [
          // White halo behind route line
          <Polyline key={`bg-${i}`} positions={pos}
            pathOptions={{ color: '#ffffff', weight: done || isCur ? 9 : 7, opacity: 0.7 }} />,
          // Main route
          <Polyline key={`leg-${i}`} positions={pos}
            pathOptions={{
              color:     done || isCur ? '#2E7D50' : '#8EB89E',
              weight:    done || isCur ? 3.5 : 2.5,
              dashArray: done || isCur ? null : '10 8',
              opacity:   1,
              lineCap:   'round',
            }} />,
        ]
      })}

      {/* Illustrated destination markers */}
      {stops.map((stop, i) => {
        const status     = getStopStatus(stop, i, liveLocation, stops)
        const isSelected = selectedStop?.id === stop.id
        return (
          <Marker key={stop.id} position={[stop.lat, stop.lng]}
            icon={buildIcon(stop, i, status, isSelected)}
            zIndexOffset={isSelected ? 1000 : status === 'current' ? 500 : 0}
            eventHandlers={{ click: (e) => { e.originalEvent?.stopPropagation(); onSelectStop(stop) } }}
          />
        )
      })}

      {children}
    </MapContainer>
  )
}
