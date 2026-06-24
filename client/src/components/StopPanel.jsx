import { useEffect, useState, useRef } from 'react'
import { getStop, uploadPhoto, addReaction, addComment, getPhotoUrl, getPolls, createPoll } from '../api'
import { BUILDINGS, ICON_ORDER } from './buildingIcons'
import Lightbox from './Lightbox'
import StopDiscussion from './StopDiscussion'
import PollCard from './PollCard'
import PhotoRequestCard from './PhotoRequestCard'
import styles from './StopPanel.module.css'

const EMOJIS = ['❤️', '😂', '😍', '🔥', '👏']
const TABS = ['Photos', 'Discuss', 'Polls', 'Requests']

export default function StopPanel({ stop, tripId, isAdmin, adminToken, onClose, onPhotoUploaded, initialTab = 'Photos' }) {
  const [tab, setTab]               = useState(initialTab)
  const [data, setData]             = useState(null)
  const [polls, setPolls]           = useState([])
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [caption, setCaption]       = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [preview, setPreview]       = useState(null)
  const [showPollForm, setShowPollForm] = useState(false)
  const [pollQ, setPollQ]           = useState('')
  const [pollOpts, setPollOpts]     = useState(['', ''])
  const fileRef = useRef()

  async function loadStop() {
    const d = await getStop(stop.id)
    setData(d)
  }

  async function loadPolls() {
    if (!tripId) return
    const all = await getPolls(tripId)
    setPolls(all.filter(p => !p.stop_id || p.stop_id === stop.id))
  }

  useEffect(() => { loadStop(); loadPolls() }, [stop.id])

  function handleFileChange(file) {
    if (!file) return
    fileRef.current._file = file
    setPreview(URL.createObjectURL(file))
  }

  function onInputChange(e) { handleFileChange(e.target.files[0]) }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    handleFileChange(e.dataTransfer.files[0])
  }

  async function handleUpload(e) {
    e.preventDefault()
    const file = fileRef.current?._file
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(stop.id, adminToken, file, caption)
      setCaption(''); setPreview(null); fileRef.current._file = null; fileRef.current.value = ''
      await loadStop(); onPhotoUploaded?.()
    } catch (err) { alert('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  async function handleReaction(photoId, emoji) {
    await addReaction(photoId, emoji)
    await loadStop()
  }

  async function handleCreatePoll(e) {
    e.preventDefault()
    const opts = pollOpts.filter(o => o.trim())
    if (!pollQ.trim() || opts.length < 2) return
    await createPoll(tripId, adminToken, pollQ.trim(), opts, stop.id)
    setPollQ(''); setPollOpts(['', '']); setShowPollForm(false)
    loadPolls()
  }

  const stopIdx = 0
  const nights = stop.arrival_date && stop.departure_date
    ? Math.round((new Date(stop.departure_date) - new Date(stop.arrival_date)) / 86400000)
    : null

  const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerCity}>{stop.name.split(',')[0]}</div>
          <div className={styles.headerCountry}>{stop.name.split(',').slice(1).join(',').trim()}</div>
          <div className={styles.headerMeta}>
            {fmtDate(stop.arrival_date)}{stop.departure_date ? ` → ${fmtDate(stop.departure_date)}` : ''}
            {nights ? ` · ${nights} night${nights !== 1 ? 's' : ''}` : ''}
          </div>
          {stop.notes && <p className={styles.notes}>{stop.notes}</p>}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className={styles.tabContent}>

          {/* ── Photos ── */}
          {tab === 'Photos' && (
            <>
              {isAdmin && (
                <form className={styles.uploadForm} onSubmit={handleUpload}>
                  <input
                    type="file" accept="image/*" ref={fileRef}
                    style={{ display: 'none' }}
                    onChange={onInputChange}
                  />
                  {preview ? (
                    <div className={styles.previewWrap}>
                      <img src={preview} className={styles.previewImg} alt="preview" />
                      <button type="button" className={styles.clearPreview} onClick={() => { setPreview(null); fileRef.current._file = null; fileRef.current.value = '' }}>✕ Change photo</button>
                    </div>
                  ) : (
                    <div
                      className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                    >
                      <span className={styles.dropIcon}>📷</span>
                      <span className={styles.dropText}>Click or drag a photo here</span>
                      <span className={styles.dropHint}>JPG, PNG, HEIC up to 20 MB</span>
                    </div>
                  )}
                  <input
                    className={styles.captionInput}
                    type="text"
                    placeholder="Add a caption… (optional)"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                  />
                  <button type="submit" className={styles.uploadBtn} disabled={uploading || !preview}>
                    {uploading ? 'Uploading…' : '📤 Upload Photo'}
                  </button>
                </form>
              )}

              <div className={styles.gallery}>
                {!data && <p className={styles.empty}>Loading…</p>}
                {data?.photos.length === 0 && (
                  <div className={styles.emptyPhotos}>
                    <span className={styles.emptyIcon}>🌍</span>
                    <p>No photos yet{isAdmin ? ' — upload the first one above!' : '.'}</p>
                  </div>
                )}
                {data?.photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} onOpenLightbox={() => setLightboxPhoto(photo)} onReact={handleReaction} onCommented={loadStop} />
                ))}
              </div>
            </>
          )}

          {tab === 'Discuss' && <StopDiscussion stopId={stop.id} />}

          {tab === 'Polls' && (
            <div className={styles.pollsWrap}>
              {isAdmin && (
                <div>
                  {!showPollForm ? (
                    <button className={styles.createPollBtn} onClick={() => setShowPollForm(true)}>+ Create Poll</button>
                  ) : (
                    <form className={styles.pollForm} onSubmit={handleCreatePoll}>
                      <input className={styles.pollInput} placeholder="Poll question…" value={pollQ} onChange={e => setPollQ(e.target.value)} required />
                      {pollOpts.map((o, i) => (
                        <input key={i} className={styles.pollInput} placeholder={`Option ${i + 1}`} value={o} onChange={e => { const a = [...pollOpts]; a[i] = e.target.value; setPollOpts(a) }} />
                      ))}
                      <div className={styles.pollFormBtns}>
                        <button type="button" className={styles.addOptBtn} onClick={() => setPollOpts(v => [...v, ''])}>+ Add option</button>
                        <button type="submit" className="btn-primary">Create</button>
                        <button type="button" onClick={() => setShowPollForm(false)} className={styles.cancelBtn}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {polls.length === 0 && <p className={styles.empty}>No polls yet.{isAdmin ? ' Create one above!' : ''}</p>}
              {polls.map(poll => (
                <PollCard key={poll.id} poll={poll} isAdmin={isAdmin} adminToken={adminToken} onRefresh={loadPolls} />
              ))}
            </div>
          )}

          {tab === 'Requests' && (
            <PhotoRequestCard tripId={tripId} stopId={stop.id} isAdmin={isAdmin} adminToken={adminToken} />
          )}
        </div>
      </div>

      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} onReact={handleReaction} onCommented={loadStop} />
      )}
    </div>
  )
}

function PhotoCard({ photo, onOpenLightbox, onReact, onCommented }) {
  const [commentName, setCommentName]   = useState('')
  const [commentBody, setCommentBody]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [showComments, setShowComments] = useState(false)
  const reactionCounts = EMOJIS.reduce((acc, e) => { acc[e] = photo.reactions.filter(r => r.emoji === e).length; return acc }, {})

  async function handleComment(e) {
    e.preventDefault()
    if (!commentName.trim() || !commentBody.trim()) return
    setSubmitting(true)
    try {
      await addComment(photo.id, commentName, commentBody)
      setCommentName(''); setCommentBody(''); onCommented()
    } finally { setSubmitting(false) }
  }

  return (
    <div className={styles.photoCard}>
      <div className={styles.photoImgWrap} onClick={onOpenLightbox}>
        <img src={getPhotoUrl(photo.storage_path)} alt={photo.caption || 'Photo'} className={styles.thumbnail} />
        <div className={styles.photoOverlay}>
          <span className={styles.expandIcon}>⤢</span>
        </div>
      </div>

      {photo.caption && <p className={styles.caption}>{photo.caption}</p>}

      <div className={styles.reactions}>
        {EMOJIS.map(e => (
          <button key={e} className={`${styles.emojiBtn} ${reactionCounts[e] > 0 ? styles.emojiBtnActive : ''}`} onClick={() => onReact(photo.id, e)}>
            {e}{reactionCounts[e] > 0 && <span className={styles.emojiCount}>{reactionCounts[e]}</span>}
          </button>
        ))}
        <button className={styles.commentToggle} onClick={() => setShowComments(v => !v)}>
          💬 {photo.comments.length > 0 ? photo.comments.length : ''}
        </button>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          {photo.comments.map(c => (
            <div key={c.id} className={styles.comment}>
              <span className={styles.commentAuthor}>{c.author_name}</span>
              <span className={styles.commentBody}>{c.body}</span>
            </div>
          ))}
          <form className={styles.commentForm} onSubmit={handleComment}>
            <input className={styles.commentInput} placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} />
            <input className={styles.commentInput} placeholder="Write a comment…" value={commentBody} onChange={e => setCommentBody(e.target.value)} />
            <button type="submit" className={styles.commentBtn} disabled={submitting}>Post</button>
          </form>
        </div>
      )}
    </div>
  )
}
