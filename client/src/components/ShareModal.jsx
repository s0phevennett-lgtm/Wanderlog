import styles from './ShareModal.module.css'

export default function ShareModal({ tripId, tripName, onClose }) {
  const shareUrl = `${window.location.origin}/view/${tripId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`

  function copy() {
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Link copied!'))
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: tripName, text: `Follow my trip: ${tripName}`, url: shareUrl })
      } catch {}
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Follow my trip "${tripName}" here: ${shareUrl}`)}`
  const email = `mailto:?subject=${encodeURIComponent(`Follow my trip: ${tripName}`)}&body=${encodeURIComponent(`Hi!\n\nI'm sharing my trip with you. Follow along here:\n${shareUrl}`)}`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <h2 className={styles.title}>Share Trip</h2>
        <p className={styles.sub}>Viewers can see your map, photos, check-ins and join polls.</p>

        <div className={styles.qrWrap}>
          <img src={qrUrl} alt="QR code" className={styles.qr} />
          <span className={styles.qrLabel}>Scan to open on any device</span>
        </div>

        <div className={styles.linkRow}>
          <input className={styles.linkInput} readOnly value={shareUrl} />
          <button className={styles.copyBtn} onClick={copy}>Copy</button>
        </div>

        <div className={styles.quickShare}>
          <a className={styles.shareBtn} href={whatsapp} target="_blank" rel="noreferrer">💬 WhatsApp</a>
          <a className={styles.shareBtn} href={email}>✉️ Email</a>
          {navigator.share && (
            <button className={styles.shareBtn} onClick={nativeShare}>📤 Share</button>
          )}
        </div>

        <p className={styles.hint}>
          Anyone with this link can view your trip — they cannot edit or upload photos.
        </p>
      </div>
    </div>
  )
}
