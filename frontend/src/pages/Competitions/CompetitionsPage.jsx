import React, { useState, useEffect } from 'react';
import {
  getCompetitions,
  getCompetitionDetail,
  submitCompetitionEntry,
  voteOnSubmission,
} from '../../api/competitionApi';
import useCountdown from '../../hooks/useCountdown';
import './CompetitionsPage.css';

/* ------------------------------------------------------------------ */
/* Helper: pad digits                                                   */
/* ------------------------------------------------------------------ */
const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Sub-component: Countdown                                             */
/* ------------------------------------------------------------------ */
function CountdownDisplay({ deadline }) {
  const t = useCountdown(deadline);
  if (!deadline || !t) return null;

  const isExpired = t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0;
  if (isExpired) return <p style={{ color: '#f87171', fontWeight: 700, textAlign: 'center', padding: '1rem' }}>⏰ Submission window closed</p>;

  return (
    <div className="comp-countdown-row">
      <div className="countdown-unit">
        <span className="countdown-digit">{pad(t.days)}</span>
        <span className="countdown-lbl">Days</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-digit">{pad(t.hours)}</span>
        <span className="countdown-lbl">Hours</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-digit">{pad(t.minutes)}</span>
        <span className="countdown-lbl">Min</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-digit">{pad(t.seconds)}</span>
        <span className="countdown-lbl">Sec</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: Leaderboard tab                                        */
/* ------------------------------------------------------------------ */
function LeaderboardTab({ leaderboard, userVotedIds, onVote, isResultsRevealed, winners }) {
  if (isResultsRevealed && winners && winners.length > 0) {
    return (
      <div className="winners-section">
        <div className="results-reveal-banner">🎊 Competition Concluded — Final Results Revealed!</div>
        <p className="winners-title">🏆 Winners' Podium</p>
        <div className="winners-podium">
          {winners.map((w) => {
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={w.id} className={`winner-card winner-card--${w.rank}`}>
                <span className="winner-medal">{medals[w.rank - 1] || '🎖️'}</span>
                <p className="winner-card-title">{w.title}</p>
                <p className="winner-card-author">by @{w.authorUsername}</p>
                <p className="winner-score">{w.totalScore?.toFixed(1)}</p>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)', textAlign: 'center', marginBottom: '1.5rem' }}>
          Full Leaderboard
        </p>
        <LeaderboardList entries={leaderboard} userVotedIds={userVotedIds} onVote={onVote} votingDisabled />
      </div>
    );
  }

  return (
    <LeaderboardList entries={leaderboard} userVotedIds={userVotedIds} onVote={onVote} votingDisabled={isResultsRevealed} />
  );
}

function LeaderboardList({ entries, userVotedIds, onVote, votingDisabled }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="leaderboard-empty">
        <span className="empty-icon">📜</span>
        <p>No submissions yet — be the first to enter!</p>
      </div>
    );
  }

  return (
    <ul className="leaderboard-list">
      {entries.map((entry, idx) => {
        const hasVoted = userVotedIds?.includes(entry.id);
        const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-n';
        return (
          <li key={entry.id} className="lb-entry">
            <span className={`lb-rank ${rankClass}`}>{idx + 1}</span>
            <div className="lb-body">
              <p className="lb-title">{entry.title}</p>
              <p className="lb-author">by @{entry.authorUsername}</p>
              {entry.content && (
                <p className="lb-content-preview">"{entry.content}"</p>
              )}
            </div>
            <div className="lb-meta">
              <span className="lb-score">{entry.totalScore?.toFixed(1)}</span>
              <span className="lb-score-label">score</span>
              {!votingDisabled && (
                <button
                  type="button"
                  className={`vote-btn ${hasVoted ? 'vote-btn--voted' : ''}`}
                  onClick={() => onVote(entry.id)}
                >
                  {hasVoted ? '❤️' : '🤍'} {entry.votesCount ?? 0}
                </button>
              )}
              {votingDisabled && (
                <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>
                  ❤️ {entry.votesCount ?? 0}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: Submit Entry tab                                       */
/* ------------------------------------------------------------------ */
function SubmitEntryTab({ competitionId, userSubmission, isOpen, onSubmitSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) {
    return (
      <div className="submission-closed-notice">
        <span className="notice-icon">🔒</span>
        <h3 style={{ color: 'rgba(255,255,255,.5)', margin: '0 0 .4rem' }}>Submissions Closed</h3>
        <p>The submission window for this competition is not open. Check the leaderboard tab to see entries.</p>
      </div>
    );
  }

  if (userSubmission) {
    return (
      <div className="already-submitted-card">
        <h4>✅ Entry Submitted</h4>
        <p>
          You have already submitted "<strong>{userSubmission.title}</strong>" to this competition.
          Vote on others' entries in the Leaderboard tab!
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both the title and your poem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitCompetitionEntry({ competitionId, title: title.trim(), content: content.trim() });
      setSuccess(true);
      onSubmitSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="submit-success">
        🎉 Your poem has been submitted! Head to the Leaderboard to vote on other entries.
      </div>
    );
  }

  return (
    <form className="submit-form" onSubmit={handleSubmit}>
      {error && <div className="submit-error">{error}</div>}

      <div className="submit-form-group">
        <label className="submit-form-label" htmlFor="entry-title">Poem Title</label>
        <input
          id="entry-title"
          className="submit-form-input"
          type="text"
          placeholder="Give your poem a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="submit-form-group">
        <label className="submit-form-label" htmlFor="entry-content">Your Poem</label>
        <textarea
          id="entry-content"
          className="submit-form-textarea"
          placeholder="Write your poem here... Let every word carry weight."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : '✍️ Submit My Entry'}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: Competition Detail Modal                               */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: 'leaderboard', label: '🏆 Leaderboard' },
  { id: 'submit',      label: '✍️ Submit Entry' },
];

function CompetitionDetailModal({ competitionId, onClose }) {
  const [detail, setDetail]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [votedIds, setVotedIds] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCompetitionDetail(competitionId);
      setDetail(data);
      setVotedIds(data.userVotedSubmissionIds || []);
    } catch (err) {
      console.error('Failed to load competition detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [competitionId]);

  const handleVote = async (submissionId) => {
    try {
      await voteOnSubmission(submissionId);
      // optimistic toggle then refresh
      setVotedIds((prev) =>
        prev.includes(submissionId)
          ? prev.filter((id) => id !== submissionId)
          : [...prev, submissionId]
      );
      // refresh full state after brief delay
      setTimeout(load, 400);
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  const statusClass = (s) => {
    if (s === 'ACTIVE') return 'badge-active';
    if (s === 'CLOSED') return 'badge-closed';
    return 'badge-upcoming';
  };

  return (
    <div className="comp-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="comp-detail-panel" role="dialog" aria-modal="true">

        {loading ? (
          <div className="comp-detail-loading">
            <span style={{ fontSize: '2rem' }}>⏳</span>
            <p>Loading competition details…</p>
          </div>
        ) : !detail ? (
          <div className="comp-detail-loading">
            <p>Could not load competition. Please try again.</p>
            <button onClick={onClose} style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="comp-detail-header">
              <button className="comp-detail-close" onClick={onClose} aria-label="Close">✕</button>

              <div className="comp-detail-header-badges">
                <span className={`comp-status-badge ${statusClass(detail.competition.status)}`}>
                  {detail.competition.status}
                </span>
                {detail.competition.theme && (
                  <span className="comp-theme-tag">#{detail.competition.theme}</span>
                )}
              </div>

              <h2 className="comp-detail-title">{detail.competition.title}</h2>
              <p className="comp-detail-desc">{detail.competition.description}</p>
            </div>

            {/* Stats */}
            <div className="comp-stats-row">
              <div className="comp-stat-box">
                <span className="comp-stat-value">{detail.leaderboard?.length ?? 0}</span>
                <span className="comp-stat-label">Entries</span>
              </div>
              <div className="comp-stat-box">
                <span className="comp-stat-value">{detail.competition.participantCount ?? 0}</span>
                <span className="comp-stat-label">Participants</span>
              </div>
              {detail.competition.deadline && (
                <div className="comp-stat-box">
                  <span className="comp-stat-value" style={{ fontSize: '.85rem' }}>
                    {new Date(detail.competition.deadline).toLocaleDateString()}
                  </span>
                  <span className="comp-stat-label">Deadline</span>
                </div>
              )}
              {detail.competition.prizeDescription && (
                <div className="comp-stat-box" style={{ flex: 2, alignItems: 'flex-start' }}>
                  <span className="comp-stat-value" style={{ fontSize: '.85rem', color: '#fde68a' }}>
                    🏅 {detail.competition.prizeDescription}
                  </span>
                  <span className="comp-stat-label">Prize</span>
                </div>
              )}
            </div>

            {/* Live countdown */}
            {detail.isSubmissionOpen && (
              <CountdownDisplay deadline={detail.competition.deadline} />
            )}

            {/* Tabs */}
            <div className="comp-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`comp-tab ${activeTab === t.id ? 'comp-tab--active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="comp-tab-content">
              {activeTab === 'leaderboard' && (
                <LeaderboardTab
                  leaderboard={detail.leaderboard}
                  userVotedIds={votedIds}
                  onVote={handleVote}
                  isResultsRevealed={detail.isResultsRevealed}
                  winners={detail.winners}
                />
              )}
              {activeTab === 'submit' && (
                <SubmitEntryTab
                  competitionId={competitionId}
                  userSubmission={detail.userSubmission}
                  isOpen={detail.isSubmissionOpen}
                  onSubmitSuccess={() => { load(); setActiveTab('leaderboard'); }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: Competition Card                                       */
/* ------------------------------------------------------------------ */
function CompetitionCard({ comp, onClick }) {
  const deadline = comp.deadline ? new Date(comp.deadline) : null;
  const statusClass = comp.status === 'ACTIVE' ? 'comp-card--active'
                    : comp.status === 'CLOSED'  ? 'comp-card--closed'
                    : 'comp-card--upcoming';
  const badgeClass  = comp.status === 'ACTIVE' ? 'badge-active'
                    : comp.status === 'CLOSED'  ? 'badge-closed'
                    : 'badge-upcoming';

  return (
    <article
      className={`comp-card ${statusClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Open competition: ${comp.title}`}
    >
      <div className="comp-card-top">
        <span className={`comp-status-badge ${badgeClass}`}>
          {comp.status === 'ACTIVE' ? '🟢 Active' : comp.status === 'CLOSED' ? '🔴 Concluded' : '🟡 Upcoming'}
        </span>
        {comp.theme && <span className="comp-theme-tag">#{comp.theme}</span>}
      </div>

      <h3 className="comp-card-title">{comp.title}</h3>
      <p className="comp-card-desc">{comp.description}</p>

      <div className="comp-card-meta">
        <span className="comp-meta-item">
          <span className="comp-meta-icon">👥</span>
          {comp.participantCount ?? 0} participants
        </span>
        {deadline && (
          <span className="comp-meta-item">
            <span className="comp-meta-icon">📅</span>
            {deadline.toLocaleDateString()}
          </span>
        )}
      </div>

      {comp.prizeDescription && (
        <div className="comp-card-prize">
          🏅 {comp.prizeDescription}
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                             */
/* ------------------------------------------------------------------ */
const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCompetitions();
        setCompetitions(data);
      } catch (err) {
        console.error('Failed to load competitions', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active   = competitions.filter((c) => c.status === 'ACTIVE');
  const upcoming = competitions.filter((c) => c.status === 'UPCOMING');
  const closed   = competitions.filter((c) => c.status === 'CLOSED');

  return (
    <div className="competitions-page">
      {/* Hero Banner */}
      <header className="competitions-hero">
        <div className="hero-eyebrow">⚔️ KavyaKosh Competitions</div>
        <h1>
          Prove Your <span>Poetic Mastery</span>
        </h1>
        <p>
          Enter themed competitions, vote for your favourite verses, and claim your place on the leaderboard.
          Results are scored by jury acclaim and community votes.
        </p>
      </header>

      <main className="competitions-container">
        {loading ? (
          <div className="leaderboard-empty">
            <span className="empty-icon">⏳</span>
            <p>Loading competitions…</p>
          </div>
        ) : (
          <>
            {/* Active */}
            {active.length > 0 && (
              <section aria-label="Active competitions">
                <h2 className="competitions-section-title">🔥 Open Now</h2>
                <div className="competitions-grid">
                  {active.map((c) => (
                    <CompetitionCard key={c.id} comp={c} onClick={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section aria-label="Upcoming competitions" style={{ marginTop: '2.5rem' }}>
                <h2 className="competitions-section-title">🗓️ Coming Soon</h2>
                <div className="competitions-grid">
                  {upcoming.map((c) => (
                    <CompetitionCard key={c.id} comp={c} onClick={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Closed */}
            {closed.length > 0 && (
              <section aria-label="Concluded competitions" style={{ marginTop: '2.5rem' }}>
                <h2 className="competitions-section-title">📜 Past Competitions</h2>
                <div className="competitions-grid">
                  {closed.map((c) => (
                    <CompetitionCard key={c.id} comp={c} onClick={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {competitions.length === 0 && (
              <div className="leaderboard-empty">
                <span className="empty-icon">🏆</span>
                <h3 style={{ color: 'rgba(255,255,255,.5)', margin: '0 0 .4rem' }}>No Competitions Yet</h3>
                <p>Check back soon — the arena is being prepared.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedId && (
        <CompetitionDetailModal
          competitionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default CompetitionsPage;
