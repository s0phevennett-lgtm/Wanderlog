import { useEffect, useState } from 'react'
import styles from './WeatherWidget.module.css'

const WMO = {
  0:  { icon: '☀️', text: 'Clear sky' },
  1:  { icon: '🌤️', text: 'Mainly clear' },
  2:  { icon: '⛅', text: 'Partly cloudy' },
  3:  { icon: '☁️', text: 'Overcast' },
  45: { icon: '🌫️', text: 'Foggy' },
  48: { icon: '🌫️', text: 'Icy fog' },
  51: { icon: '🌦️', text: 'Light drizzle' },
  53: { icon: '🌦️', text: 'Drizzle' },
  55: { icon: '🌧️', text: 'Heavy drizzle' },
  61: { icon: '🌧️', text: 'Light rain' },
  63: { icon: '🌧️', text: 'Rain' },
  65: { icon: '🌧️', text: 'Heavy rain' },
  71: { icon: '🌨️', text: 'Light snow' },
  73: { icon: '❄️', text: 'Snowfall' },
  75: { icon: '❄️', text: 'Heavy snow' },
  80: { icon: '🌦️', text: 'Light showers' },
  81: { icon: '🌧️', text: 'Showers' },
  82: { icon: '⛈️', text: 'Heavy showers' },
  95: { icon: '⛈️', text: 'Thunderstorm' },
  96: { icon: '⛈️', text: 'Thunderstorm' },
  99: { icon: '⛈️', text: 'Thunderstorm' },
}

function getWeather(code) {
  return WMO[code] || WMO[Math.floor(code / 10) * 10] || { icon: '🌡️', text: 'Unknown' }
}

export default function WeatherWidget({ lat, lng, city }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lat || !lng) return
    setLoading(true)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`)
      .then(r => r.json())
      .then(d => {
        const cur = d.current
        setWeather({ temp: Math.round(cur.temperature_2m), ...getWeather(cur.weather_code) })
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [lat, lng])

  if (loading) return (
    <div className={styles.card}>
      <div className={styles.label}>Weather in {city}</div>
      <div className={styles.loading}>Checking forecast…</div>
    </div>
  )

  if (!weather) return null

  return (
    <div className={styles.card}>
      <div className={styles.label}>Weather in {city}</div>
      <div className={styles.main}>
        <span className={styles.icon}>{weather.icon}</span>
        <span className={styles.temp}>{weather.temp}°C</span>
      </div>
      <div className={styles.condition}>{weather.text}</div>
    </div>
  )
}
