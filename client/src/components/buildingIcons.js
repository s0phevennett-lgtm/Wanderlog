// City-specific illustrated building SVGs — 44×36 viewBox
// Each icon designed to immediately evoke the location

export const CITY_ICONS = {

  // Barcelona → Sagrada Família: three organic stone spires
  barcelona: `
    <rect x="8" y="22" width="28" height="14" fill="#D4B483"/>
    <rect x="4" y="18" width="8" height="18" fill="#C4A25A"/>
    <rect x="32" y="18" width="8" height="18" fill="#C4A25A"/>
    <polygon points="8,18 5,7 11,7" fill="#B8874A"/>
    <polygon points="36,18 33,7 39,7" fill="#B8874A"/>
    <polygon points="22,22 19,3 25,3" fill="#C4964A"/>
    <rect x="12" y="20" width="20" height="16" fill="#E8C98A"/>
    <circle cx="22" cy="27" r="3" fill="none" stroke="#7A5A20" stroke-width="0.8"/>
    <circle cx="22" cy="27" r="1.2" fill="#7A5A20" opacity="0.4"/>
    <path d="M20,36 L20,31 A2,2 0 0,1 24,31 L24,36" fill="#5A3A10"/>
    <line x1="8"  y1="4"  x2="8"  y2="7"  stroke="#C4964A" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="6.5" y1="5.5" x2="9.5" y2="5.5" stroke="#C4964A" stroke-width="1" stroke-linecap="round"/>
    <line x1="36" y1="4"  x2="36" y2="7"  stroke="#C4964A" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="34.5" y1="5.5" x2="37.5" y2="5.5" stroke="#C4964A" stroke-width="1" stroke-linecap="round"/>
    <line x1="22" y1="0"  x2="22" y2="3"  stroke="#B8874A" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="20.5" y1="1.5" x2="23.5" y2="1.5" stroke="#B8874A" stroke-width="1" stroke-linecap="round"/>
  `,

  // Ibiza → whitewashed Mediterranean villa, blue doors, bougainvillea
  ibiza: `
    <rect x="4" y="18" width="36" height="18" fill="#F5F2EC"/>
    <rect x="2" y="15" width="40" height="4" fill="#E8E0D0"/>
    <rect x="10" y="9" width="24" height="10" fill="#F0EDE6"/>
    <rect x="8" y="7" width="28" height="3.5" fill="#E0D8C8"/>
    <path d="M18,36 L18,27 A4,4 0 0,1 26,27 L26,36" fill="#1E5FA0"/>
    <rect x="6" y="20" width="7" height="6" fill="#2B6CB0" rx="0.5"/>
    <rect x="31" y="20" width="7" height="6" fill="#2B6CB0" rx="0.5"/>
    <rect x="13" y="10" width="5" height="4" fill="#2B6CB0" rx="0.5"/>
    <rect x="26" y="10" width="5" height="4" fill="#2B6CB0" rx="0.5"/>
    <rect x="28" y="2" width="4" height="7" fill="#E0D8C8"/>
    <rect x="27" y="1" width="6" height="2" fill="#D0C8B8"/>
    <circle cx="5"  cy="15" r="2"   fill="#E05A8A" opacity="0.75"/>
    <circle cx="7"  cy="13" r="1.5" fill="#E05A8A" opacity="0.65"/>
    <circle cx="3"  cy="13" r="1.5" fill="#C04070" opacity="0.65"/>
    <circle cx="5"  cy="11" r="1.2" fill="#E05A8A" opacity="0.5"/>
  `,

  // Mallorca → La Seu Gothic Cathedral: twin towers, rose window, buttresses
  mallorca: `
    <rect x="6" y="18" width="32" height="18" fill="#D4B873"/>
    <polygon points="22,6 42,18 2,18" fill="#B8974A"/>
    <rect x="2" y="8"  width="8" height="28" fill="#C4A250"/>
    <rect x="34" y="10" width="8" height="26" fill="#C4A250"/>
    <polygon points="2,8 6,2 10,8"  fill="#A88830"/>
    <polygon points="34,10 38,4 42,10" fill="#A88830"/>
    <line x1="2"  y1="20" x2="10" y2="24" stroke="#B89040" stroke-width="2"/>
    <line x1="2"  y1="26" x2="10" y2="28" stroke="#B89040" stroke-width="2"/>
    <line x1="42" y1="20" x2="34" y2="24" stroke="#B89040" stroke-width="2"/>
    <line x1="42" y1="26" x2="34" y2="28" stroke="#B89040" stroke-width="2"/>
    <circle cx="22" cy="21" r="4.5" fill="none" stroke="#6A4820" stroke-width="1.2"/>
    <circle cx="22" cy="21" r="2"   fill="#1A60A0" opacity="0.45"/>
    <line x1="22" y1="16.5" x2="22" y2="25.5" stroke="#6A4820" stroke-width="0.5"/>
    <line x1="17.5" y1="21" x2="26.5" y2="21" stroke="#6A4820" stroke-width="0.5"/>
    <rect x="14" y="22" width="3" height="8" fill="#1A60A0" opacity="0.5" rx="1.5"/>
    <rect x="27" y="22" width="3" height="8" fill="#1A60A0" opacity="0.5" rx="1.5"/>
    <path d="M19,36 L19,28 A3,3 0 0,1 25,28 L25,36" fill="#3A2008"/>
  `,

  // Seville → Giralda tower: tall terracotta minaret + golden belfry
  seville: `
    <rect x="2" y="28" width="40" height="8" fill="#D4B483"/>
    <rect x="14" y="8" width="16" height="28" fill="#C1694F"/>
    <rect x="14" y="12" width="16" height="1.2" fill="#A04A35"/>
    <rect x="14" y="18" width="16" height="1.2" fill="#A04A35"/>
    <rect x="14" y="24" width="16" height="1.2" fill="#A04A35"/>
    <path d="M17,14 L17,10.5 Q20,8.5 23,10.5 L23,14" fill="#1A3C5E" opacity="0.65"/>
    <path d="M21,14 L21,10.5 Q24,8.5 27,10.5 L27,14" fill="#1A3C5E" opacity="0.65"/>
    <rect x="11" y="4" width="22" height="6" fill="#E8C870"/>
    <rect x="10" y="2" width="24" height="3" fill="#D4B060"/>
    <path d="M15,5.5 Q19,3.5 23,5.5" fill="none" stroke="#7A5010" stroke-width="0.8"/>
    <path d="M21,5.5 Q25,3.5 29,5.5" fill="none" stroke="#7A5010" stroke-width="0.8"/>
    <line x1="22" y1="0" x2="22" y2="2" stroke="#C4964A" stroke-width="1.5" stroke-linecap="round"/>
    <polygon points="22,0 24.5,1 22,2" fill="#E8C870"/>
    <path d="M18,36 L18,29 A4,4 0 0,1 26,29 L26,36" fill="#5A3A10"/>
    <circle cx="7"  cy="31" r="3" fill="#2E7D50" opacity="0.75"/>
    <circle cx="37" cy="31" r="3" fill="#2E7D50" opacity="0.75"/>
    <circle cx="7"  cy="34" r="1" fill="#E87010" opacity="0.9"/>
    <circle cx="37" cy="34" r="1" fill="#E87010" opacity="0.9"/>
  `,

  // Lagos → Ponta da Piedade: golden limestone arch over turquoise sea
  lagos: `
    <rect x="0" y="22" width="44" height="14" fill="#3A9CC4" opacity="0.85"/>
    <polygon points="0,36 0,8 18,16 10,36"  fill="#E8C870"/>
    <polygon points="44,36 44,6 26,14 34,36" fill="#D4B050"/>
    <rect x="0"  y="8" width="18" height="10" fill="#D4A840"/>
    <rect x="26" y="6" width="18" height="10" fill="#D4A840"/>
    <path d="M10,36 L10,22 Q22,13 34,22 L34,36" fill="#C8B060"/>
    <path d="M14,36 L14,24 Q22,17 30,24 L30,36" fill="#3A9CC4" opacity="0.9"/>
    <rect x="1"  y="4" width="4" height="6" fill="white"/>
    <rect x="0.5" y="3" width="5" height="1.8" fill="#CC3333"/>
    <circle cx="3" cy="2.5" r="1.2" fill="#FFE040"/>
    <path d="M0,29 Q6,27 12,29 Q18,31 24,29 Q30,27 36,29 Q42,31 44,29"
          fill="none" stroke="white" stroke-width="0.7" opacity="0.5"/>
  `,

  // Lisbon → Yellow tram climbing Alfama with pastel tile buildings
  lisbon: `
    <rect x="0"  y="10" width="13" height="26" fill="#F5D98A"/>
    <rect x="13" y="6"  width="18" height="30" fill="#E8B070"/>
    <rect x="31" y="12" width="13" height="24" fill="#D4E8B0"/>
    <rect x="2"  y="14" width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="7"  y="14" width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="15" y="9"  width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="23" y="9"  width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="33" y="15" width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="39" y="15" width="4"  height="5"  fill="#4A7FB5" rx="0.3"/>
    <rect x="8"  y="21" width="28" height="12" fill="#F5C800" rx="1.5"/>
    <rect x="8"  y="21" width="28" height="4"  fill="#D4A800" rx="1.5"/>
    <rect x="11" y="22" width="5"  height="3"  fill="#A8D8F0" rx="0.5"/>
    <rect x="18" y="22" width="5"  height="3"  fill="#A8D8F0" rx="0.5"/>
    <rect x="25" y="22" width="5"  height="3"  fill="#A8D8F0" rx="0.5"/>
    <rect x="9"  y="32" width="26" height="4"  fill="#B89A00"/>
    <circle cx="14" cy="33" r="2.5" fill="#444"/>
    <circle cx="14" cy="33" r="1"   fill="#888"/>
    <circle cx="30" cy="33" r="2.5" fill="#444"/>
    <circle cx="30" cy="33" r="1"   fill="#888"/>
    <line x1="5" y1="36" x2="39" y2="36" stroke="#888" stroke-width="1"/>
  `,

  // Porto → Dom Luís Bridge arch + colourful Ribeira waterfront
  porto: `
    <rect x="0"  y="20" width="7"  height="16" fill="#E05030"/>
    <rect x="7"  y="22" width="6"  height="14" fill="#F5C840"/>
    <rect x="13" y="18" width="6"  height="18" fill="#D0607A"/>
    <rect x="19" y="21" width="6"  height="15" fill="#E8A030"/>
    <rect x="25" y="19" width="7"  height="17" fill="#6090C8"/>
    <rect x="32" y="22" width="6"  height="14" fill="#60A840"/>
    <rect x="38" y="20" width="6"  height="16" fill="#D08840"/>
    <rect x="1"  y="23" width="2"  height="3"  fill="#1A3C5E" opacity="0.6"/>
    <rect x="4"  y="23" width="2"  height="3"  fill="#1A3C5E" opacity="0.6"/>
    <rect x="14" y="21" width="2"  height="3"  fill="#1A3C5E" opacity="0.6"/>
    <rect x="20" y="24" width="2"  height="3"  fill="#1A3C5E" opacity="0.6"/>
    <rect x="33" y="25" width="2"  height="3"  fill="#1A3C5E" opacity="0.6"/>
    <rect x="0"  y="28" width="44" height="8"  fill="#4A7BAF" opacity="0.7"/>
    <path d="M2,20 Q22,2 42,20" fill="none" stroke="#3A4450" stroke-width="2.5"/>
    <line x1="2"  y1="20" x2="42" y2="20" stroke="#4A5460" stroke-width="1.5"/>
    <line x1="10" y1="20" x2="14" y2="12" stroke="#3A4450" stroke-width="1" opacity="0.7"/>
    <line x1="22" y1="20" x2="22" y2="5"  stroke="#3A4450" stroke-width="1" opacity="0.7"/>
    <line x1="34" y1="20" x2="30" y2="12" stroke="#3A4450" stroke-width="1" opacity="0.7"/>
    <path d="M16,30 Q22,27 28,30 L27,32 L17,32 Z" fill="#3A2008"/>
    <rect x="21" y="27" width="1.5" height="5" fill="#2A1408"/>
  `,
}

// Fallback icons for non-demo trips (generic building types)
export const BUILDINGS = {
  cathedral: `
    <rect x="3"  y="22" width="38" height="14" fill="#D4B483"/>
    <rect x="11" y="18" width="22" height="16" fill="#E8C98A"/>
    <polygon points="22,8 34,18 10,18" fill="#C4964A"/>
    <rect x="3"  y="16" width="8"  height="20" fill="#C4A55A"/>
    <rect x="33" y="16" width="8"  height="20" fill="#C4A55A"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1A3C5E"/>
    <line x1="22" y1="4" x2="22" y2="8" stroke="#8B6010" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="20.5" y1="6" x2="23.5" y2="6" stroke="#8B6010" stroke-width="1.5" stroke-linecap="round"/>
  `,
  gothic: `
    <rect x="4"  y="14" width="9"  height="22" fill="#B84444"/>
    <rect x="31" y="14" width="9"  height="22" fill="#B84444"/>
    <polygon points="8.5,6  4,14 13,14" fill="#8B2E2E"/>
    <polygon points="35.5,6 31,14 40,14" fill="#8B2E2E"/>
    <rect x="11" y="19" width="22" height="17" fill="#CC5555"/>
    <circle cx="22" cy="23" r="5" fill="#E8C870" stroke="#8B2E2E" stroke-width="0.75"/>
    <circle cx="22" cy="23" r="2" fill="#8B2E2E"/>
    <rect x="18" y="27" width="8"  height="9"  fill="#1A3C5E" rx="2"/>
  `,
  dome: `
    <rect x="4"  y="22" width="36" height="14" fill="#D4B080"/>
    <ellipse cx="22" cy="16" rx="12" ry="9" fill="#C1694F"/>
    <ellipse cx="22" cy="13" rx="6"  ry="5"  fill="#A04A35"/>
    <rect x="3"  y="14" width="8"  height="22" fill="#D4B080"/>
    <rect x="33" y="14" width="8"  height="22" fill="#D4B080"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1A3C5E"/>
  `,
  castle: `
    <rect x="5"  y="20" width="34" height="16" fill="#7A8C8A"/>
    <rect x="3"  y="14" width="9"  height="22" fill="#6B7C7A"/>
    <rect x="32" y="14" width="9"  height="22" fill="#6B7C7A"/>
    <rect x="3"  y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="7"  y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="32" y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="36" y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="18" y="25" width="8"  height="11" fill="#1A3C5E" rx="1"/>
  `,
  townhouse: `
    <rect x="3"  y="21" width="11" height="15" fill="#B84030"/>
    <polygon points="3,21 8.5,13 14,21" fill="#8B2E22"/>
    <rect x="16" y="17" width="12" height="19" fill="#CC5030"/>
    <polygon points="16,17 22,9 28,17" fill="#A03C24"/>
    <rect x="30" y="21" width="11" height="15" fill="#B84030"/>
    <polygon points="30,21 35.5,13 41,21" fill="#8B2E22"/>
    <rect x="19" y="29" width="6"  height="7"  fill="#6B2E18"/>
  `,
  palace: `
    <rect x="4"  y="18" width="36" height="18" fill="#2D7A4F"/>
    <polygon points="4,18 22,9 40,18" fill="#1E5C3A"/>
    <rect x="2"  y="22" width="8"  height="14" fill="#2D7A4F"/>
    <rect x="34" y="22" width="8"  height="14" fill="#2D7A4F"/>
    <rect x="8"  y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="32" y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1E5C3A"/>
  `,
  lighthouse: `
    <rect x="18" y="10" width="8" height="22" fill="white" stroke="#E0D8C8" stroke-width="0.5"/>
    <rect x="16" y="8"  width="12" height="4" fill="#CC3333"/>
    <circle cx="22" cy="7" r="3" fill="#FFEE40"/>
    <rect x="16" y="7"  width="12" height="1.5" fill="white"/>
    <polygon points="14,32 30,32 32,36 12,36" fill="#C4A250"/>
    <rect x="0"  y="26" width="44" height="10" fill="#3A9CC4" opacity="0.7"/>
    <path d="M0,30 Q8,28 16,30 Q22,32 28,30 Q36,28 44,30" fill="none" stroke="white" stroke-width="0.7" opacity="0.5"/>
  `,
}

export const ICON_ORDER = ['cathedral', 'gothic', 'dome', 'castle', 'townhouse', 'palace', 'lighthouse']

// Map stop name → city-specific icon key, then fall back to generic rotation
export function getIconForStop(stopName, idx) {
  const city = (stopName || '').split(',')[0].toLowerCase().trim()
  const cityMap = {
    'barcelona': 'barcelona',
    'ibiza':     'ibiza',
    'mallorca':  'mallorca',
    'seville':   'seville',
    'sevilla':   'seville',
    'lagos':     'lagos',
    'lisbon':    'lisbon',
    'lisboa':    'lisbon',
    'porto':     'porto',
    'oporto':    'porto',
  }
  const key = Object.keys(cityMap).find(k => city.includes(k))
  if (key) return { svg: CITY_ICONS[cityMap[key]], isCity: true }
  const fallbackKey = ICON_ORDER[idx % ICON_ORDER.length]
  return { svg: BUILDINGS[fallbackKey], isCity: false }
}

export const STATUS_COLOR = {
  current:  '#1A3C5E',
  visited:  '#2E7D50',
  upcoming: '#8AA8B0',
}

export const BADGE_COLOR = {
  current:  '#1A3C5E',
  visited:  '#2E7D50',
  upcoming: '#8AA8B0',
}

export function getStopStatus(stop, idx, liveLocation, stops) {
  if (liveLocation?.stop_id === stop.id) return 'current'
  const curIdx = liveLocation ? stops.findIndex(s => s.id === liveLocation.stop_id) : -1
  return curIdx >= 0 && idx < curIdx ? 'visited' : 'upcoming'
}

export const MOOD_ICONS = {
  exploring:  '🧭',
  relaxing:   '☀️',
  travelling: '✈️',
  hiking:     '🥾',
  eating:     '🍽️',
  shopping:   '🛍️',
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}
