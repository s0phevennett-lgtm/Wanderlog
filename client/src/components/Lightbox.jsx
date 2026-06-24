import { useState } from 'react'
import { addComment, getPhotoUrl } from '../api'
import styles from './Lightbox.module.css'

const EMOJIS = ['❤️', '😂', '😍', '🔥', '👏']

export default function Lightbox({ photo, onClose, onReact, onCommented }) {
  const [commentName, setCommentName] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reactionCounts = EMOJIS.reduce((acc, e) => {
    acc[e] = photo.reactions.filter(r => r.emoji === e).length
    return acc
  }, {})

  async function handleComment(e) {
    e.preventDefault()
    if (!commentName.trim() || !commentBody.trim()) return
    setSubmitting(true)
    try {
      await addComment(photo.id, commentName, commentBody)
      setCommentName('')
      setCommentBody('')
      onCommented()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <img src={getPhotoUrl(photo.storage_path)} alt={photo.caption || ''} className={styles.image} />

        <div className={styles.sidebar}>
          {photo.caption && <p className={styles.caption}>{photo.caption}</p>}

          <div className={styles.reactions}>
            {EMOJIS.map(e => (
              <button key={e} className={styles.emojiBtn} onClick={() => onReact(photo.id, e)}>
                {e} {reactionCounts[e] > 0 && <span>{reactionCounts[e]}</span>}
              </button>
            ))}
          </div>

          <div className={styles.comments}>
            <h4>Comments</h4>
            {photo.comments.length === 0 && <p className={styles.noComments}>No comments yet. Be the first!</p>}
            {photo.comments.map(c => (
              <div key={c.id} className={styles.comment}>
                <strong>{c.author_name}</strong>
                <span>{c.body}</span>
              </div>
            ))}
          </div>

          <form className={styles.commentForm} onSubmit={handleComment}>
            <input placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} required />
            <textarea placeholder="Leave a comment…" value={commentBody} onChange={e => setCommentBody(e.target.value)} rows={3} required />
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
