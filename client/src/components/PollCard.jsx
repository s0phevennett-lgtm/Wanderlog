import { useState } from 'react'
import { votePoll, closePoll, getVoterToken } from '../api'
import styles from './PollCard.module.css'

export default function PollCard({ poll, isAdmin, adminToken, onRefresh }) {
  const [voterName, setVoterName] = useState('')
  const [voted, setVoted] = useState(false)
  const [voting, setVoting] = useState(false)

  const total = poll.options.reduce((s, o) => s + o.vote_count, 0)
  const winner = poll.closed ? poll.options.reduce((best, o) => o.vote_count > (best?.vote_count || -1) ? o : best, null) : null

  async function vote(optionId) {
    if (!voterName.trim()) { alert('Please enter your name first'); return }
    setVoting(true)
    try {
      const result = await votePoll(poll.id, optionId, voterName.trim(), getVoterToken())
      if (result.already_voted) { alert('You have already voted on this poll'); setVoted(true); return }
      setVoted(true)
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setVoting(false)
    }
  }

  async function handleClose() {
    if (!confirm('Close this poll?')) return
    await closePoll(poll.id, adminToken)
    onRefresh()
  }

  return (
    <div className={`${styles.card} ${poll.closed ? styles.closed : ''}`}>
      <div className={styles.header}>
        <p className={styles.question}>{poll.question}</p>
        {poll.closed && <span className={styles.badge}>Closed</span>}
      </div>

      {!poll.closed && !voted && (
        <div className={styles.nameRow}>
          <input
            className={styles.nameInput}
            placeholder="Your name to vote"
            value={voterName}
            onChange={e => setVoterName(e.target.value)}
          />
        </div>
      )}

      <div className={styles.options}>
        {poll.options.map(opt => {
          const pct = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
          const isWinner = winner?.id === opt.id
          return (
            <div key={opt.id} className={styles.option}>
              <div className={styles.optionTop}>
                <span className={styles.optionLabel}>{isWinner ? '🏆 ' : ''}{opt.label}</span>
                <span className={styles.optionPct}>{pct}% ({opt.vote_count})</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.fill} ${isWinner ? styles.winnerFill : ''}`} style={{ width: `${pct}%` }} />
              </div>
              {!poll.closed && !voted && (
                <button className={styles.voteBtn} onClick={() => vote(opt.id)} disabled={voting}>
                  Vote
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.total}>{total} vote{total !== 1 ? 's' : ''}</span>
        {isAdmin && !poll.closed && (
          <button className={styles.closeBtn} onClick={handleClose}>Close poll</button>
        )}
      </div>
    </div>
  )
}
