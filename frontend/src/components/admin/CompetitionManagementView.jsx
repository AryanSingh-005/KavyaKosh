import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';

export function CompetitionManagementView({ executeAction }) {
  const [competitionsList, setCompetitionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [formModal, setFormModal] = useState(null); // { mode: 'CREATE' | 'EDIT', item?: obj }
  const [countdownModal, setCountdownModal] = useState(null); // competition object
  const [leaderboardModal, setLeaderboardModal] = useState(null); // competition object
  const [finalizeModal, setFinalizeModal] = useState(null); // competition object
  const [deleteModal, setDeleteModal] = useState(null); // competition object

  // Fetch competitions
  const loadCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.competitions();
      setCompetitionsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load competitions list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  // Handle Save (Create / Edit)
  const handleSaveCompetition = async (formData, id) => {
    await executeAction(async () => {
      await adminApi.saveCompetition(formData, id);
      await loadCompetitions();
    });
    setFormModal(null);
  };

  // Handle Close
  const handleCloseCompetition = async (id) => {
    await executeAction(async () => {
      await adminApi.closeCompetition(id);
      await loadCompetitions();
    });
  };

  // Handle Reopen
  const handleReopenCompetition = async (id) => {
    await executeAction(async () => {
      await adminApi.reopenCompetition(id);
      await loadCompetitions();
    });
  };

  // Handle Adjust Countdown
  const handleAdjustCountdown = async (id, newDeadline) => {
    await executeAction(async () => {
      await adminApi.adjustCountdown(id, newDeadline);
      await loadCompetitions();
    });
    setCountdownModal(null);
  };

  // Handle Delete
  const handleDeleteCompetition = async (id) => {
    await executeAction(async () => {
      await adminApi.deleteCompetition(id);
      await loadCompetitions();
    });
    setDeleteModal(null);
  };

  // Handle Finalize & Publish Winners
  const handleFinalizeWinners = async (id, data) => {
    await executeAction(async () => {
      await adminApi.finalizeCompetition(id, data);
      await loadCompetitions();
    });
    setFinalizeModal(null);
    if (leaderboardModal && leaderboardModal.id === id) {
      // Refresh leaderboard data if currently open
      setLeaderboardModal({ ...leaderboardModal, status: 'CLOSED' });
    }
  };

  // Computed summary stats
  const totalCompetitions = competitionsList.length;
  const activeCount = competitionsList.filter(c => c.status === 'ACTIVE').length;
  const closedCount = competitionsList.filter(c => c.status === 'CLOSED').length;
  const totalParticipants = competitionsList.reduce((acc, c) => acc + (c.participantCount || 0), 0);

  // Helper to format remaining time / countdown
  const getCountdownBadge = (deadlineStr, status) => {
    if (status === 'CLOSED') {
      return <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>⌛ Ended & Closed</span>;
    }
    if (!deadlineStr) {
      return <span className="badge" style={{ background: '#f8fafc', color: '#94a3b8' }}>No Deadline Set</span>;
    }
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>⚠️ Deadline Passed</span>;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days > 0) {
      return (
        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
          ⏳ {days}d {hours}h remaining
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 700 }}>
        ⏳ {hours}h remaining (Ending Soon)
      </span>
    );
  };

  // Filtered competitions
  const filteredCompetitions = competitionsList.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchTheme = c.theme?.toLowerCase().includes(q);
      const matchPrize = c.prizeDescription?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchId = String(c.id).includes(q);
      return matchTitle || matchTheme || matchPrize || matchDesc || matchId;
    }
    return true;
  });

  return (
    <div className="moderation-container">
      {/* ── Summary Statistics KPI Strip ── */}
      <div className="user-management-stats">
        <div className="user-stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
          <small>Active Competitions</small>
          <strong style={{ color: '#16a34a' }}>{activeCount}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
          <small>Total Contests Hosted</small>
          <strong style={{ color: '#0284c7' }}>{totalCompetitions}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #6366f1' }}>
          <small>Total Contest Submissions</small>
          <strong style={{ color: '#6366f1' }}>{totalParticipants}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #64748b' }}>
          <small>Closed / Finalized</small>
          <strong style={{ color: '#64748b' }}>{closedCount}</strong>
        </div>
      </div>

      {/* ── Top Filter Bar & Actions ── */}
      <div className="mod-tabs-header">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Contests</option>
            <option value="ACTIVE">🟢 Active Only</option>
            <option value="UPCOMING">🔵 Upcoming</option>
            <option value="CLOSED">⚪ Closed / Finalized</option>
          </select>
        </div>

        <div className="filter-group search" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search contests by title, theme, prize, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="admin-input"
          />
        </div>

        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setFormModal({ mode: 'CREATE' })}
        >
          <span>➕</span> Create Competition
        </button>
      </div>

      {error && (
        <div className="admin-alert error" style={{ margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Competitions Table ── */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title & Theme</th>
              <th>Prize & Reward</th>
              <th>Countdown & Deadline</th>
              <th>Submissions</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', minWidth: '340px' }}>Competition Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="6" className="empty-cell">Loading competitions list...</td></tr>
            )}
            {!loading && filteredCompetitions.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No competitions match the filter criteria. Click <strong>"Create Competition"</strong> to start one.
                </td>
              </tr>
            )}
            {!loading && filteredCompetitions.map(comp => {
              const isClosed = comp.status === 'CLOSED';
              return (
                <tr key={comp.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                        {comp.title}
                        <span className="user-id-badge">#{comp.id}</span>
                      </strong>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                        <span className="mod-author-tag">
                          Theme: <strong>{comp.theme || 'Open Topic'}</strong>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px' }}>🏆</span>
                      <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                        {comp.prizeDescription || 'Certificate of Excellence'}
                      </strong>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getCountdownBadge(comp.deadline, comp.status)}
                      <small style={{ color: '#64748b' }}>
                        {comp.deadline ? new Date(comp.deadline).toLocaleString() : 'Open deadline'}
                      </small>
                    </div>
                  </td>

                  <td>
                    <span className="badge" style={{ background: '#eef2ff', color: '#4338ca', fontWeight: 700 }}>
                      📝 {comp.participantCount ?? 0} entries
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${
                      comp.status === 'ACTIVE' ? 'status-ACTIVE' :
                      comp.status === 'UPCOMING' ? 'role-REVIEWER' : 'status-SUSPENDED'
                    }`}>
                      {comp.status}
                    </span>
                  </td>

                  <td>
                    <div className="mod-actions-cluster">
                      {/* Leaderboard View & Score Editor */}
                      <button
                        className="btn-secondary btn-xs"
                        title="View and edit contest leaderboard"
                        onClick={() => setLeaderboardModal(comp)}
                      >
                        📊 Leaderboard
                      </button>

                      {/* Adjust Countdown Window */}
                      <button
                        className="btn-secondary btn-xs"
                        title="Extend or adjust countdown deadline"
                        onClick={() => setCountdownModal(comp)}
                      >
                        ⏳ Countdown
                      </button>

                      {/* Edit Competition */}
                      <button
                        className="btn-secondary btn-xs"
                        title="Edit competition details"
                        onClick={() => setFormModal({ mode: 'EDIT', item: comp })}
                      >
                        ✏️ Edit
                      </button>

                      {/* Finalize / Publish Winners */}
                      <button
                        className="btn-primary btn-xs"
                        title="Assign winners and publish results publicly"
                        onClick={() => setFinalizeModal(comp)}
                      >
                        🏆 Finalize Winners
                      </button>

                      {/* Close or Reopen */}
                      {!isClosed ? (
                        <button
                          className="btn-warning btn-xs"
                          title="Close contest and stop accepting entries"
                          onClick={() => handleCloseCompetition(comp.id)}
                        >
                          🔒 Close
                        </button>
                      ) : (
                        <button
                          className="btn-success btn-xs"
                          title="Reopen contest to ACTIVE"
                          onClick={() => handleReopenCompetition(comp.id)}
                        >
                          🔓 Reopen
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        className="btn-danger btn-xs"
                        title="Delete contest record"
                        onClick={() => setDeleteModal(comp)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── MODALS ── */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* Create / Edit Competition Modal */}
      {formModal && (
        <CompetitionFormModal
          mode={formModal.mode}
          item={formModal.item}
          onClose={() => setFormModal(null)}
          onSave={handleSaveCompetition}
        />
      )}

      {/* Adjust Countdown Window Modal */}
      {countdownModal && (
        <AdjustCountdownModal
          competition={countdownModal}
          onClose={() => setCountdownModal(null)}
          onAdjust={handleAdjustCountdown}
        />
      )}

      {/* Interactive Leaderboard & Submissions Oversight Modal */}
      {leaderboardModal && (
        <LeaderboardOversightModal
          competition={leaderboardModal}
          onClose={() => setLeaderboardModal(null)}
          executeAction={executeAction}
          onOpenFinalize={() => {
            const c = leaderboardModal;
            setFinalizeModal(c);
          }}
        />
      )}

      {/* Finalize & Publish Winners Modal */}
      {finalizeModal && (
        <FinalizeWinnersModal
          competition={finalizeModal}
          onClose={() => setFinalizeModal(null)}
          onFinalize={handleFinalizeWinners}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteCompetitionModal
          competition={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDelete={() => handleDeleteCompetition(deleteModal.id)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Create or Edit Competition
// ──────────────────────────────────────────────────────────────────
function CompetitionFormModal({ mode = 'CREATE', item, onClose, onSave }) {
  const isEdit = mode === 'EDIT';
  const [title, setTitle] = useState(item?.title || '');
  const [theme, setTheme] = useState(item?.theme || '');
  const [prizeDescription, setPrizeDescription] = useState(item?.prizeDescription || '');
  const [status, setStatus] = useState(item?.status || 'ACTIVE');
  const [deadline, setDeadline] = useState(
    item?.deadline ? item.deadline.substring(0, 16) : ''
  );
  const [description, setDescription] = useState(item?.description || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        theme: theme.trim(),
        prizeDescription: prizeDescription.trim(),
        status,
        deadline: deadline || null,
        description: description.trim()
      };
      await onSave(payload, item?.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <header className="modal-header">
          <h3>{isEdit ? `✏️ Edit Competition: ${item?.title}` : '➕ Create New Competition'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <label>
              Contest Title *
              <input
                required
                type="text"
                placeholder="e.g. Monsoon Verse Fest 2026"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="admin-input"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                Theme / Topic
                <input
                  type="text"
                  placeholder="e.g. Rain & Nostalgia, Nature, Freedom"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label>
                Prize & Reward
                <input
                  type="text"
                  placeholder="e.g. ₹10,000 + Anthology Feature"
                  value={prizeDescription}
                  onChange={e => setPrizeDescription(e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                Countdown Deadline (Date & Time)
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="ACTIVE">🟢 ACTIVE (Submissions Open)</option>
                  <option value="UPCOMING">🔵 UPCOMING (Preview Mode)</option>
                  <option value="CLOSED">⚪ CLOSED (Results Announced)</option>
                </select>
              </label>
            </div>

            <label>
              Contest Guidelines & Description *
              <textarea
                required
                rows={5}
                placeholder="Specify poetry guidelines, line limits, judging criteria, and submission rules..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="admin-input"
                style={{ resize: 'vertical' }}
              />
            </label>

            <div className="audit-notice">
              🔒 Changes will be permanently logged to the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? '💾 Update Competition' : '✨ Publish Competition')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Adjust Countdown Window
// ──────────────────────────────────────────────────────────────────
function AdjustCountdownModal({ competition, onClose, onAdjust }) {
  const currentDeadline = competition?.deadline ? competition.deadline.substring(0, 16) : '';
  const [deadline, setDeadline] = useState(currentDeadline);
  const [submitting, setSubmitting] = useState(false);

  // Quick preset adder
  const addHours = (hours) => {
    const base = deadline ? new Date(deadline) : new Date();
    base.setTime(base.getTime() + (hours * 60 * 60 * 1000));
    setDeadline(base.toISOString().substring(0, 16));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deadline) return;

    setSubmitting(true);
    try {
      await onAdjust(competition.id, deadline);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <header className="modal-header">
          <h3>⏳ Adjust Countdown Window</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px' }}>
              <div><strong>Competition:</strong> {competition.title}</div>
              <div style={{ marginTop: '3px' }}><strong>Status:</strong> {competition.status}</div>
              <div style={{ marginTop: '3px' }}>
                <strong>Current Deadline:</strong> {competition.deadline ? new Date(competition.deadline).toLocaleString() : 'None'}
              </div>
            </div>

            <label>
              New Deadline (Date & Time) *
              <input
                required
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="admin-input"
              />
            </label>

            {/* Quick Extension Presets */}
            <div style={{ marginTop: '12px' }}>
              <small style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                QUICK EXTENSION PRESETS:
              </small>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary btn-xs" onClick={() => addHours(24)}>
                  +24 Hours
                </button>
                <button type="button" className="btn-secondary btn-xs" onClick={() => addHours(72)}>
                  +3 Days
                </button>
                <button type="button" className="btn-secondary btn-xs" onClick={() => addHours(168)}>
                  +7 Days
                </button>
                <button type="button" className="btn-secondary btn-xs" onClick={() => addHours(336)}>
                  +14 Days
                </button>
              </div>
            </div>

            <div className="audit-notice" style={{ marginTop: '14px' }}>
              🔒 Window adjustment will be logged with your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : '💾 Apply New Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Interactive Leaderboard & Submissions Oversight
// ──────────────────────────────────────────────────────────────────
function LeaderboardOversightModal({ competition, onClose, executeAction, onOpenFinalize }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingScoreSub, setEditingScoreSub] = useState(null); // submission object
  const [inspectPoemSub, setInspectPoemSub] = useState(null); // submission object

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.leaderboard(competition.id);
      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [competition.id]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleRankAssign = async (subId, rank) => {
    await executeAction(async () => {
      await adminApi.publishWinner(subId, rank);
      await loadLeaderboard();
    });
  };

  const handleSaveScore = async (subId, juryScore, votesCount) => {
    await executeAction(async () => {
      await adminApi.editSubmissionScore(subId, juryScore, votesCount);
      await loadLeaderboard();
    });
    setEditingScoreSub(null);
  };

  const rankBadges = {
    1: <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800 }}>🥇 Winner #1 (Gold)</span>,
    2: <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontWeight: 800 }}>🥈 Runner-Up #2 (Silver)</span>,
    3: <span className="badge" style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 800 }}>🥉 3rd Place #3 (Bronze)</span>
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        <header className="modal-header">
          <h3>📊 Leaderboard & Entries: {competition.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Header Summary Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div>
              <span className="user-id-badge">ID: #{competition.id}</span>
              <span className="mod-author-tag" style={{ marginLeft: '8px' }}>
                Theme: <strong>{competition.theme || 'Open Topic'}</strong>
              </span>
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>
                Prize: <strong>{competition.prizeDescription || 'N/A'}</strong>
              </span>
            </div>

            <button
              className="btn-primary btn-xs"
              style={{ fontWeight: 700 }}
              onClick={onOpenFinalize}
            >
              🏆 Finalize & Publish Winners
            </button>
          </div>

          {/* Submissions Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Poem Title & Poet</th>
                  <th>Jury Score</th>
                  <th>Community Votes</th>
                  <th>Total Score</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Oversight Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Calculating and loading leaderboard...</td></tr>
                )}
                {!loading && submissions.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No poem submissions recorded for this competition yet.</td></tr>
                )}
                {!loading && submissions.map((sub, idx) => (
                  <tr key={sub.id} style={sub.rank ? { background: '#fefce8' } : {}}>
                    <td>
                      {sub.rank ? (
                        rankBadges[sub.rank] || <span className="badge">Rank #{sub.rank}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>#{idx + 1}</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                          {sub.title || 'Untitled Submission'}
                        </strong>
                        <span className="mod-author-tag">by @{sub.authorUsername}</span>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: '#475569' }}>
                        {sub.juryScore ?? 0.0} <small>/ 10</small>
                      </strong>
                    </td>

                    <td>
                      <strong style={{ color: '#475569' }}>
                        ❤️ {sub.votesCount ?? 0}
                      </strong>
                    </td>

                    <td>
                      <strong style={{ fontSize: '15px', color: '#0284c7' }}>
                        {sub.totalScore ?? 0.0}
                      </strong>
                    </td>

                    <td>
                      <div className="mod-actions-cluster">
                        {/* Read Poem */}
                        <button
                          className="btn-secondary btn-xs"
                          title="Read full poem submission"
                          onClick={() => setInspectPoemSub(sub)}
                        >
                          👁️ Read
                        </button>

                        {/* Edit Score */}
                        <button
                          className="btn-secondary btn-xs"
                          title="Edit jury score or votes"
                          onClick={() => setEditingScoreSub(sub)}
                        >
                          ✏️ Score
                        </button>

                        {/* Assign Winner Ranks */}
                        <button
                          className="btn-success btn-xs"
                          title="Assign Winner #1 (Gold)"
                          onClick={() => handleRankAssign(sub.id, 1)}
                        >
                          🥇 #1
                        </button>
                        <button
                          className="btn-secondary btn-xs"
                          title="Assign Runner-Up #2 (Silver)"
                          onClick={() => handleRankAssign(sub.id, 2)}
                        >
                          🥈 #2
                        </button>
                        <button
                          className="btn-secondary btn-xs"
                          title="Assign 3rd Place #3 (Bronze)"
                          onClick={() => handleRankAssign(sub.id, 3)}
                        >
                          🥉 #3
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Score Editor Modal */}
        {editingScoreSub && (
          <EditScoreModal
            submission={editingScoreSub}
            onClose={() => setEditingScoreSub(null)}
            onSave={handleSaveScore}
          />
        )}

        {/* Inspect Poem Modal */}
        {inspectPoemSub && (
          <InspectSubmissionPoemModal
            submission={inspectPoemSub}
            onClose={() => setInspectPoemSub(null)}
          />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Finalize Competition & Publish Winners
// ──────────────────────────────────────────────────────────────────
function FinalizeWinnersModal({ competition, onClose, onFinalize }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onFinalize(competition.id, {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <header className="modal-header">
          <h3>🏆 Finalize & Publish Winners</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ color: '#0f172a', fontSize: '14px', marginTop: 0 }}>
            You are about to finalize contest <strong>"{competition.title}"</strong> and reveal the winners publicly on the platform.
          </p>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '14px' }}>
            <div><strong>What this action does:</strong></div>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', lineHeight: '1.5', color: '#475569' }}>
              <li>Transitions contest status to <strong>CLOSED</strong>.</li>
              <li>Reveals final leaderboard and winners to platform visitors.</li>
              <li>Auto-assigns 🥇 Winner #1, 🥈 Runner-Up #2, and 🥉 3rd Place to top scoring submissions if not already assigned.</li>
            </ul>
          </div>

          <div className="audit-notice">
            🔒 This finalization action will be permanently recorded in the system audit log.
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : '🏆 Confirm Finalize & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Edit Submission Score
// ──────────────────────────────────────────────────────────────────
function EditScoreModal({ submission, onClose, onSave }) {
  const [juryScore, setJuryScore] = useState(submission.juryScore ?? 0.0);
  const [votesCount, setVotesCount] = useState(submission.votesCount ?? 0);
  const [submitting, setSubmitting] = useState(false);

  // Live total preview: (votes * 1.0) + (jury * 2.0)
  const previewTotal = Math.round(((Number(votesCount) * 1.0) + (Number(juryScore) * 2.0)) * 10.0) / 10.0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(submission.id, Number(juryScore), Number(votesCount));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <header className="modal-header">
          <h3>✏️ Edit Submission Score</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px' }}>
              <div><strong>Poem:</strong> {submission.title}</div>
              <div style={{ marginTop: '2px' }}><strong>Poet:</strong> @{submission.authorUsername}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                Jury Score (0.0 to 10.0)
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={juryScore}
                  onChange={e => setJuryScore(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label>
                Community Votes Count
                <input
                  required
                  type="number"
                  min="0"
                  value={votesCount}
                  onChange={e => setVotesCount(e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>

            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '10px 14px', borderRadius: '6px', marginTop: '14px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Recalculated Total Score:</span>
              <strong style={{ fontSize: '16px' }}>{previewTotal}</strong>
            </div>

            <div className="audit-notice" style={{ marginTop: '12px' }}>
              🔒 Action will be permanently logged in the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : '💾 Save Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Inspect Full Submission Poem
// ──────────────────────────────────────────────────────────────────
function InspectSubmissionPoemModal({ submission, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <header className="modal-header">
          <h3>📜 Submission: {submission.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
            Poet: <strong>@{submission.authorUsername}</strong> &nbsp;|&nbsp;
            Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
          </div>

          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'Georgia, serif', fontSize: '14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '18px 20px', color: '#1e293b' }}>
            {submission.content || 'No poem body content recorded.'}
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Delete Competition Confirmation
// ──────────────────────────────────────────────────────────────────
function DeleteCompetitionModal({ competition, onClose, onDelete }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onDelete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <header className="modal-header">
          <h3>🗑️ Delete Competition</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ color: '#b91c1c', fontSize: '13.5px', marginTop: 0 }}>
            ⚠️ Are you sure you want to permanently delete contest <strong>"{competition?.title}"</strong>?
          </p>

          <div className="audit-notice">
            🔒 This action will be permanently logged in the audit log under your admin identity.
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : '🗑️ Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
