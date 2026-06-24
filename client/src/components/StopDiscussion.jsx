import { useState, useEffect } from 'react'
import { getStopComments, addStopComment, likeStopComment } from '../api'
import styles from './StopDiscussion.module.css'

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function CommentItem({ comment, allComments, stopId, onRefresh }) {
  const [replying, setReplying] = useState(false)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const replies = allComments.filter(c => c.parent_id === comment.id)

  async function submitReply(e) {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    await addStopComment(stopId, name.trim(), body.trim(), comment.id)
    setName(''); setBody(''); setReplying(false)
    onRefresh()
  }

  async function like() {
    await likeStopComment(comment.id)
    onRefresh()
  }

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <strong className={styles.author}>{comment.author_name}</strong>
        <span className={styles.time}>{timeAgo(comment.created_at)}</span>
      </div>
      <p className={styles.body}>{comment.body}</p>
      <div className={styles.commentActions}>
        <button className={styles.likeBtn} onClick={like}>
          ❤️ {comment.likes > 0 && <span>{comment.likes}</span>}
        </button>
        <button className={styles.replyBtn} onClick={() => setReplying(v => !v)}>Reply</button>
      </div>

      {replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map(r => (
            <div key={r.id} className={styles.reply}>
              <strong className={styles.author}>{r.author_name}</strong>
              <span className={styles.time}>{timeAgo(r.created_at)}</span>
              <p className={styles.body}>{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {replying && (
        <form className={styles.replyForm} onSubmit={submitReply}>
          <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Write a reply…" value={body} onChange={e => setBody(e.target.value)} required />
          <div className={styles.replyBtns}>
            <button type="submit" className={styles.postBtn}>Post</button>
            <button type="button" onClick={() => setReplying(false)} className={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function StopDiscussion({ stopId }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await getStopComments(stopId)
    setComments(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [stopId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    await addStopComment(stopId, name.trim(), body.trim(), null)
    setName(''); setBody('')
    load()
  }

  const topLevel = comments.filter(c => !c.parent_id)

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input className={styles.input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea className={styles.textarea} placeholder="Share your thoughts about this destination…" value={body} onChange={e => setBody(e.target.value)} rows={3} required />
        <button type="submit" className={styles.postBtn}>Post</button>
      </form>

      {loading && <p className={styles.empty}>Loading…</p>}
      {!loading && topLevel.length === 0 && <p className={styles.empty}>No comments yet. Be the first!</p>}

      <div className={styles.list}>
        {topLevel.map(c => (
          <CommentItem key={c.id} comment={c} allComments={comments} stopId={stopId} onRefresh={load} />
        ))}
      </div>
    </div>
  )
}
