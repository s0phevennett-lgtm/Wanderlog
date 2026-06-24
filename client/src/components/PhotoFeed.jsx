import { useState, useEffect } from 'react'
import { getTripFeed, addReaction, addComment, getPhotoUrl } from '../api'
import styles from './PhotoFeed.module.css'

const EMOJIS = ['❤️', '😂', '😍', '🔥', '👏']

export default function PhotoFeed({ tripId, onClose }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await getTripFeed(tripId)
    setPhotos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [tripId])

  async function handleReaction(photoId, emoji, name) {
    await addReaction(photoId, emoji, name)
    load()
  }

  async function handleComment(photoId, author_name, body) {
    await addComment(photoId, author_name, body)
    load()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>All Photos</h2>
        <button className={styles.close} onClick={onClose}>✕</button>
      </div>

      {loading && <p className={styles.empty}>Loading…</p>}
      {!loading && photos.length === 0 && <p className={styles.empty}>No photos uploaded yet.</p>}

      <div className={styles.feed}>
        {photos.map(photo => (
          <FeedCard key={photo.id} photo={photo} onReact={handleReaction} onComment={handleComment} />
        ))}
      </div>
    </div>
  )
}

function FeedCard({ photo, onReact, onComment }) {
  const [name, setName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [pendingEmoji, setPendingEmoji] = useState(null)
  const [commentName, setCommentName] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [expanded, setExpanded] = useState(false)

  const reactionCounts = EMOJIS.reduce((acc, e) => {
    acc[e] = photo.reactions.filter(r => r.emoji === e)
    return acc
  }, {})

  function handleEmojiClick(emoji) {
    setPendingEmoji(emoji)
    setShowNamePrompt(true)
  }

  async function confirmReaction() {
    if (!name.trim()) return
    await onReact(photo.id, pendingEmoji, name.trim())
    setShowNamePrompt(false)
    setPendingEmoji(null)
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentName.trim() || !commentBody.trim()) return
    await onComment(photo.id, commentName, commentBody)
    setCommentName('')
    setCommentBody('')
  }

  return (
    <div className={styles.card}>
      <div className={styles.stopLabel}>{photo.stop_name}</div>
      <img
        src={getPhotoUrl(photo.storage_path)}
        alt={photo.caption || ''}
        className={styles.image}
        style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover', background: '#F5ECD7' }}
        onError={e => { e.target.style.background = '#eee' }}
      />
      {photo.caption && <p className={styles.caption}>{photo.caption}</p>}

      <div className={styles.reactions}>
        {EMOJIS.map(e => {
          const reactors = reactionCounts[e]
          return (
            <button key={e} className={styles.emojiBtn} onClick={() => handleEmojiClick(e)}>
              {e}
              {reactors.length > 0 && (
                <span className={styles.reactionMeta}>
                  {reactors.length}
                  <span className={styles.reactorNames}>{reactors.map(r => r.reactor_name).filter(Boolean).join(', ')}</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {showNamePrompt && (
        <div className={styles.namePrompt}>
          <span>Reacting {pendingEmoji} as:</span>
          <input
            autoFocus
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmReaction()}
          />
          <button onClick={confirmReaction}>Send</button>
          <button onClick={() => setShowNamePrompt(false)}>Cancel</button>
        </div>
      )}

      <button className={styles.toggleComments} onClick={() => setExpanded(v => !v)}>
        {photo.comments.length > 0 ? `${photo.comments.length} comment${photo.comments.length > 1 ? 's' : ''}` : 'Add a comment'} {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div className={styles.comments}>
          {photo.comments.map(c => (
            <div key={c.id} className={styles.comment}>
              <strong>{c.author_name}</strong> {c.body}
            </div>
          ))}
          <form className={styles.commentForm} onSubmit={handleComment}>
            <input placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} required />
            <input placeholder="Write a comment…" value={commentBody} onChange={e => setCommentBody(e.target.value)} required />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  )
}
