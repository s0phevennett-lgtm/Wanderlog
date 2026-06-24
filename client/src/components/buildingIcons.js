// Multi-colour illustrated building SVGs — 44×36 viewBox, no background rect
// Buildings have hard-coded palette so they always look illustrated, not monochrome
// Status is shown via card opacity / badge colour, not building colour

export const BUILDINGS = {
  // Classical / Roman — warm golden stone, blue dome
  cathedral: `
    <rect x="3"  y="22" width="38" height="14" fill="#D4B483"/>
    <rect x="11" y="18" width="22" height="16" fill="#E8C98A"/>
    <polygon points="22,8 34,18 10,18" fill="#C4964A"/>
    <rect x="15" y="12" width="14" height="8"  fill="#C9922A"/>
    <ellipse cx="22" cy="12" rx="7"  ry="5.5" fill="#A67A1E"/>
    <ellipse cx="22" cy="9"  rx="3.5" ry="2.5" fill="#8B6010"/>
    <rect x="3"  y="16" width="8"  height="20" fill="#C4A55A"/>
    <rect x="33" y="16" width="8"  height="20" fill="#C4A55A"/>
    <rect x="5"  y="22" width="3"  height="6"  fill="#1A3C5E"/>
    <rect x="36" y="22" width="3"  height="6"  fill="#1A3C5E"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1A3C5E"/>
    <line x1="22" y1="4" x2="22" y2="7" stroke="#8B6010" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="20.5" y1="5.5" x2="23.5" y2="5.5" stroke="#8B6010" stroke-width="1.5" stroke-linecap="round"/>
  `,

  // Gothic / Venetian — rich red brick, pointed arches
  gothic: `
    <rect x="4"  y="14" width="9"  height="22" fill="#B84444"/>
    <rect x="31" y="14" width="9"  height="22" fill="#B84444"/>
    <polygon points="8.5,6  4,14 13,14" fill="#8B2E2E"/>
    <polygon points="35.5,6 31,14 40,14" fill="#8B2E2E"/>
    <rect x="11" y="19" width="22" height="17" fill="#CC5555"/>
    <circle cx="22" cy="23" r="5"  fill="#E8C870" stroke="#8B2E2E" stroke-width="0.75"/>
    <circle cx="22" cy="23" r="2"  fill="#8B2E2E"/>
    <rect x="6"  y="17" width="5"  height="8"  fill="#1A3C5E" rx="2"/>
    <rect x="33" y="17" width="5"  height="8"  fill="#1A3C5E" rx="2"/>
    <rect x="18" y="27" width="8"  height="9"  fill="#1A3C5E" rx="2"/>
    <line x1="11" y1="19" x2="33" y2="19" stroke="#8B2E2E" stroke-width="1"/>
  `,

  // Baroque dome / Florentine — terracotta and warm stone
  dome: `
    <rect x="4"  y="22" width="36" height="14" fill="#D4B080"/>
    <rect x="12" y="16" width="20" height="8"  fill="#E0C090"/>
    <ellipse cx="22" cy="16" rx="12" ry="9"   fill="#C1694F"/>
    <ellipse cx="22" cy="13" rx="6"  ry="5"   fill="#A04A35"/>
    <ellipse cx="22" cy="10" rx="3"  ry="2.5" fill="#8B3A28"/>
    <rect x="3"  y="14" width="8"  height="22" fill="#D4B080"/>
    <rect x="33" y="14" width="8"  height="22" fill="#D4B080"/>
    <polygon points="7,10  3,16  11,16" fill="#B8924A"/>
    <polygon points="37,10 33,16 41,16" fill="#B8924A"/>
    <rect x="15" y="17" width="3"  height="5"  fill="#1A3C5E"/>
    <rect x="26" y="17" width="3"  height="5"  fill="#1A3C5E"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1A3C5E"/>
    <circle cx="22" cy="6" r="1.5" fill="#8B3A28"/>
    <line x1="22" y1="3.5" x2="22" y2="6" stroke="#8B3A28" stroke-width="1.2"/>
  `,

  // Medieval castle — slate stone, battlements
  castle: `
    <rect x="5"  y="20" width="34" height="16" fill="#7A8C8A"/>
    <rect x="3"  y="14" width="9"  height="22" fill="#6B7C7A"/>
    <rect x="32" y="14" width="9"  height="22" fill="#6B7C7A"/>
    <rect x="5"  y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="11" y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="17" y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="23" y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="29" y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="35" y="16" width="4"  height="6"  fill="#7A8C8A"/>
    <rect x="3"  y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="7"  y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="32" y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="36" y="11" width="3"  height="5"  fill="#6B7C7A"/>
    <rect x="5"  y="22" width="5"  height="7"  fill="#1A3C5E"/>
    <rect x="34" y="22" width="5"  height="7"  fill="#1A3C5E"/>
    <rect x="18" y="25" width="8"  height="11" fill="#1A3C5E" rx="1"/>
    <rect x="14" y="23" width="3"  height="5"  fill="#4A5868"/>
    <rect x="27" y="23" width="3"  height="5"  fill="#4A5868"/>
  `,

  // Orthodox / Aegean — white walls, vivid blue dome
  orthodox: `
    <rect x="6"  y="21" width="32" height="15" fill="#F0EDE4"/>
    <rect x="14" y="15" width="16" height="8"  fill="#E8E4D8"/>
    <ellipse cx="22" cy="15" rx="9"  ry="7"   fill="#3B82F6"/>
    <ellipse cx="22" cy="11" rx="4.5" ry="3.5" fill="#1D63CC"/>
    <ellipse cx="10" cy="20" rx="4"  ry="3.5" fill="#60A5FA"/>
    <ellipse cx="34" cy="20" rx="4"  ry="3.5" fill="#60A5FA"/>
    <line x1="22" y1="4"   x2="22" y2="8"   stroke="#1A3C5E" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="20.5" y1="6" x2="23.5" y2="6" stroke="#1A3C5E" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="8"  y="23" width="5"  height="7"  fill="#1A3C5E" rx="1"/>
    <rect x="31" y="23" width="5"  height="7"  fill="#1A3C5E" rx="1"/>
    <rect x="19" y="25" width="6"  height="7"  fill="#1A3C5E" rx="1"/>
    <rect x="6"  y="21" width="32" height="2"  fill="#D8D0C0"/>
  `,

  // Dutch gabled townhouses — warm brick reds and ambers
  townhouse: `
    <rect x="3"  y="21" width="11" height="15" fill="#B84030"/>
    <polygon points="3,21 8.5,13 14,21" fill="#8B2E22"/>
    <rect x="16" y="17" width="12" height="19" fill="#CC5030"/>
    <polygon points="16,17 22,9  28,17" fill="#A03C24"/>
    <rect x="30" y="21" width="11" height="15" fill="#B84030"/>
    <polygon points="30,21 35.5,13 41,21" fill="#8B2E22"/>
    <rect x="5"  y="24" width="3"  height="4"  fill="#E8C870"/>
    <rect x="9"  y="24" width="3"  height="4"  fill="#E8C870"/>
    <rect x="18" y="20" width="3"  height="4"  fill="#E8C870"/>
    <rect x="23" y="20" width="3"  height="4"  fill="#E8C870"/>
    <rect x="32" y="24" width="3"  height="4"  fill="#E8C870"/>
    <rect x="36" y="24" width="3"  height="4"  fill="#E8C870"/>
    <rect x="19" y="29" width="6"  height="7"  fill="#6B2E18"/>
    <rect x="5"  y="29" width="4"  height="7"  fill="#6B2E18"/>
    <rect x="33" y="29" width="4"  height="7"  fill="#6B2E18"/>
  `,

  // Grand palace / Vienna — deep forest green, ornate
  palace: `
    <rect x="4"  y="18" width="36" height="18" fill="#2D7A4F"/>
    <polygon points="4,18 22,9  40,18" fill="#1E5C3A"/>
    <rect x="4"  y="16" width="36" height="4"  fill="#236040"/>
    <rect x="2"  y="22" width="8"  height="14" fill="#2D7A4F"/>
    <rect x="34" y="22" width="8"  height="14" fill="#2D7A4F"/>
    <rect x="8"  y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="15" y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="25" y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="32" y="19" width="4"  height="6"  fill="#A8D8A8"/>
    <rect x="5"  y="27" width="4"  height="5"  fill="#A8D8A8"/>
    <rect x="12" y="27" width="4"  height="5"  fill="#A8D8A8"/>
    <rect x="28" y="27" width="4"  height="5"  fill="#A8D8A8"/>
    <rect x="35" y="27" width="4"  height="5"  fill="#A8D8A8"/>
    <rect x="19" y="27" width="6"  height="9"  fill="#1E5C3A"/>
    <line x1="22" y1="5" x2="22" y2="9" stroke="#1E5C3A" stroke-width="1.5" stroke-linecap="round"/>
    <polygon points="22,5 26,7.5 22,10" fill="#2D7A4F"/>
  `,
}

export const ICON_ORDER = ['cathedral', 'gothic', 'dome', 'castle', 'orthodox', 'townhouse', 'palace']

// Green-first colour scheme matching reference image
export const STATUS_COLOR = {
  current:  '#1A3C5E',   // deep blue for current
  visited:  '#2E7D50',   // forest green for visited
  upcoming: '#8AA8B0',   // muted blue-grey for upcoming
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
