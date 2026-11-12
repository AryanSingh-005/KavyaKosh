import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';

export function ReviewerManagementView({ executeAction }) {
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'reviews'
  const [reviewersList, setReviewersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reviewers Search
  const [reviewerSearch, setReviewerSearch] = useState('');

  // Reviews Filter
  const [reviewQuery, setReviewQuery] = useState('');
  const [selectedReviewerFilter, setSelectedReviewerFilter] = useState('ALL');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');

  // Modals
  const [promoteModal, setPromoteModal] = useState(false);
  const [demoteModalUser, setDemoteModalUser] = useState(null); // user object
  const [overrideModal, setOverrideModal] = useState(null); // review object
  const [deleteModal, setDeleteModal] = useState(null); // review object
  const [inspectModal, setInspectModal] = useState(null); // review object
  const [selectedReviewerHistory, setSelectedReviewerHistory] = useState(null); // reviewer object for history inspection

  // Fetch Reviewers Roster
  const loadReviewers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.reviewers();
      setReviewersList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviewers roster.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Reviews History
  const loadReviews = useCallback(async (q = reviewQuery, rev = selectedReviewerFilter, status = reviewStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.reviews({ q, reviewer: rev, status });
      setReviewsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load review records.');
    } finally {
      setLoading(false);
    }
  }, [reviewQuery, selectedReviewerFilter, reviewStatusFilter]);

  useEffect(() => {
    if (activeTab === 'roster') {
      loadReviewers();
    } else {
      loadReviews();
    }
  }, [activeTab, loadReviewers, loadReviews]);

  // Promote action
  const handlePromote = async (userId) => {
    await executeAction(async () => {
      await adminApi.promoteReviewer(userId);
      await loadReviewers();
    });
    setPromoteModal(false);
  };

  // Demote action
  const handleDemote = async (userId) => {
    await executeAction(async () => {
      await adminApi.demoteReviewer(userId);
      await loadReviewers();
    });
    setDemoteModalUser(null);
  };

  // Score override action
  const handleScoreOverride = async (id, newScore, reason) => {
    await executeAction(async () => {
      await adminApi.reviewScore(id, newScore, reason);
      if (activeTab === 'reviews') await loadReviews();
      if (selectedReviewerHistory) await loadReviewers();
    });
    setOverrideModal(null);
    setInspectModal(null);
  };

  // Review delete action
  const handleDeleteReview = async (id, reason) => {
    await executeAction(async () => {
      await adminApi.deleteReview(id, reason);
      if (activeTab === 'reviews') await loadReviews();
      if (selectedReviewerHistory) await loadReviewers();
    });
    setDeleteModal(null);
    setInspectModal(null);
  };

  // Computed summary statistics
  const totalReviewers = reviewersList.length;
  const totalCompletedReviews = reviewersList.reduce((acc, r) => acc + (r.completedReviews || 0), 0);
  const totalPendingReviews = reviewersList.reduce((acc, r) => acc + (r.pendingReviews || 0), 0);
  const globalAvgScore = totalReviewers > 0
    ? (reviewersList.filter(r => r.avgScore > 0).reduce((acc, r) => acc + r.avgScore, 0) / (reviewersList.filter(r => r.avgScore > 0).length || 1)).toFixed(1)
    : '0.0';

  // Filtered reviewers
  const filteredReviewers = reviewersList.filter(r => {
    if (!reviewerSearch.trim()) return true;
    const q = reviewerSearch.toLowerCase();
    return (
      r.username?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      String(r.id).includes(q)
    );
  });

  return (
    <div className="moderation-container">
      {/* ── Summary Statistics KPI Strip ── */}
      <div className="user-management-stats">
        <div className="user-stat-box" style={{ borderLeft: '4px solid #6366f1' }}>
          <small>Active Reviewers</small>
          <strong style={{ color: '#6366f1' }}>{totalReviewers}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
          <small>Completed Reviews</small>
          <strong style={{ color: '#16a34a' }}>{totalCompletedReviews}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #f59e0b' }}>
          <small>Pending / In-Review</small>
          <strong style={{ color: '#f59e0b' }}>{totalPendingReviews}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
          <small>Average Rating Given</small>
          <strong style={{ color: '#0284c7' }}>{globalAvgScore} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>/ 10</span></strong>
        </div>
      </div>

      {/* ── Tabs Navigation & Top Actions ── */}
      <div className="mod-tabs-header">
        <div className="mod-tab-buttons">
          <button
            className={`mod-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            👥 Reviewer Roster ({totalReviewers})
          </button>
          <button
            className={`mod-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            📋 All Reviews & Score Oversight
          </button>
        </div>

        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setPromoteModal(true)}
        >
          <span>✍️</span> Promote User to Reviewer
        </button>
      </div>

      {error && (
        <div className="admin-alert error" style={{ margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: REVIEWER ROSTER ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div className="mod-section">
          {/* Search bar */}
          <div className="mod-filter-bar">
            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search reviewer by username, email, ID..."
                value={reviewerSearch}
                onChange={e => setReviewerSearch(e.target.value)}
                className="admin-input"
              />
            </div>
            <button className="btn-secondary" onClick={loadReviewers} title="Refresh roster">
              🔄 Refresh
            </button>
          </div>

          {/* Reviewers Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reviewer Profile</th>
                  <th>Reviews Completed</th>
                  <th>Pending Queue</th>
                  <th>Average Score Given</th>
                  <th>Last Reviewed</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Oversight Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Loading reviewer roster...</td></tr>
                )}
                {!loading && filteredReviewers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No reviewers found. Click <strong>"Promote User to Reviewer"</strong> to assign reviewers.
                    </td>
                  </tr>
                )}
                {!loading && filteredReviewers.map(rev => (
                  <tr key={rev.id}>
                    <td>
                      <div className="user-cell">
                        {rev.avatarUrl ? (
                          <img src={rev.avatarUrl} alt={rev.username} className="user-avatar" />
                        ) : (
                          <div className="user-avatar" style={{ background: '#6366f1' }}>
                            {(rev.username || rev.email || 'R')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                            {rev.username || 'Reviewer'}
                            <span className="user-id-badge">#{rev.id}</span>
                          </strong>
                          <small style={{ color: '#64748b', display: 'block' }}>{rev.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: 700 }}>
                        {rev.completedReviews ?? 0} finished
                      </span>
                    </td>

                    <td>
                      <span className="badge" style={{ background: '#fffbeb', color: '#d97706', fontWeight: 700 }}>
                        {rev.pendingReviews ?? 0} pending
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '14px', color: rev.avgScore > 0 ? '#0284c7' : '#94a3b8' }}>
                        {rev.avgScore > 0 ? `${rev.avgScore} / 10` : 'No score data'}
                      </strong>
                    </td>

                    <td>
                      <small style={{ color: '#64748b' }}>
                        {rev.lastReviewedAt ? new Date(rev.lastReviewedAt).toLocaleDateString() : 'Never'}
                      </small>
                    </td>

                    <td>
                      <div className="mod-actions-cluster">
                        <button
                          className="btn-secondary btn-xs"
                          title="View all reviews by this reviewer"
                          onClick={() => setSelectedReviewerHistory(rev)}
                        >
                          📜 Review History ({rev.totalAssigned ?? 0})
                        </button>
                        <button
                          className="btn-warning btn-xs"
                          title="Demote to standard user role"
                          onClick={() => setDemoteModalUser(rev)}
                        >
                          ⬇️ Demote to User
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: ALL REVIEWS & SCORE OVERSIGHT ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="mod-section">
          {/* Reviews Filter Bar */}
          <form
            className="mod-filter-bar"
            onSubmit={e => { e.preventDefault(); loadReviews(reviewQuery, selectedReviewerFilter, reviewStatusFilter); }}
          >
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={reviewStatusFilter}
                onChange={e => {
                  setReviewStatusFilter(e.target.value);
                  loadReviews(reviewQuery, selectedReviewerFilter, e.target.value);
                }}
                className="admin-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">🟢 Completed</option>
                <option value="IN_REVIEW">🔵 In Review</option>
                <option value="PENDING">🟡 Pending Assignment</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Reviewer:</label>
              <select
                value={selectedReviewerFilter}
                onChange={e => {
                  setSelectedReviewerFilter(e.target.value);
                  loadReviews(reviewQuery, e.target.value, reviewStatusFilter);
                }}
                className="admin-select"
              >
                <option value="ALL">All Reviewers</option>
                {reviewersList.map(r => (
                  <option key={r.id} value={r.username}>
                    @{r.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search by poem title, poet, reviewer, feedback, poem ID..."
                value={reviewQuery}
                onChange={e => setReviewQuery(e.target.value)}
                className="admin-input"
              />
            </div>

            <button type="submit" className="btn-primary">
              🔍 Search
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setReviewQuery('');
                setSelectedReviewerFilter('ALL');
                setReviewStatusFilter('ALL');
                loadReviews('', 'ALL', 'ALL');
              }}
            >
              Reset
            </button>
          </form>

          {/* Reviews Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poem & Author</th>
                  <th>Assigned Reviewer</th>
                  <th>Overall Score</th>
                  <th>Feedback Excerpt</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="7" className="empty-cell">Searching and loading reviews...</td></tr>
                )}
                {!loading && reviewsList.length === 0 && (
                  <tr><td colSpan="7" className="empty-cell">No reviews found matching search criteria.</td></tr>
                )}
                {!loading && reviewsList.map(rev => {
                  const isCompleted = rev.status === 'COMPLETED';
                  return (
                    <tr key={rev.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                            {rev.poemTitle || 'Untitled Poem'}
                          </strong>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span className="user-id-badge">Poem #{rev.poemId || 'N/A'}</span>
                            <span className="mod-author-tag">by @{rev.authorUsername || 'Anonymous'}</span>
                            {rev.isPriority && <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>⚡ VIP Priority</span>}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>✍️</span>
                          <strong style={{ color: '#334155' }}>
                            {rev.reviewerUsername ? `@${rev.reviewerUsername}` : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {rev.overallScore != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '15px', color: '#0284c7' }}>
                              {rev.overallScore}
                            </strong>
                            <small style={{ color: '#64748b' }}>/ 10</small>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px' }}>Not scored</span>
                        )}
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        <p className="mod-preview-excerpt">
                          {rev.reviewerFeedback || rev.aiSummary || <span style={{ color: '#94a3b8' }}>No feedback provided yet.</span>}
                        </p>
                      </td>

                      <td>
                        <span className={`badge ${
                          isCompleted ? 'status-ACTIVE' :
                          rev.status === 'IN_REVIEW' ? 'role-REVIEWER' : 'status-SUSPENDED'
                        }`}>
                          {rev.status || 'PENDING'}
                        </span>
                      </td>

                      <td>
                        <small style={{ color: '#64748b' }}>
                          {rev.reviewedAt ? new Date(rev.reviewedAt).toLocaleDateString() : (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A')}
                        </small>
                      </td>

                      <td>
                        <div className="mod-actions-cluster">
                          <button
                            className="btn-secondary btn-xs"
                            title="Inspect full review and feedback details"
                            onClick={() => setInspectModal(rev)}
                          >
                            👁️ View
                          </button>

                          <button
                            className="btn-primary btn-xs"
                            title="Override or calibrate overall score"
                            onClick={() => setOverrideModal(rev)}
                          >
                            ✏️ Override Score
                          </button>

                          <button
                            className="btn-danger btn-xs"
                            title="Delete this review record"
                            onClick={() => setDeleteModal(rev)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── MODALS ── */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* Promote User to Reviewer Modal */}
      {promoteModal && (
        <PromoteReviewerModal
          onClose={() => setPromoteModal(false)}
          onPromote={handlePromote}
        />
      )}

      {/* Demote Reviewer Confirmation Modal */}
      {demoteModalUser && (
        <DemoteReviewerModal
          user={demoteModalUser}
          onClose={() => setDemoteModalUser(null)}
          onDemote={() => handleDemote(demoteModalUser.id)}
        />
      )}

      {/* Override Score Modal */}
      {overrideModal && (
        <OverrideScoreModal
          review={overrideModal}
          onClose={() => setOverrideModal(null)}
          onSave={handleScoreOverride}
        />
      )}

      {/* Delete Review Confirmation Modal */}
      {deleteModal && (
        <DeleteReviewModal
          review={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDelete={handleDeleteReview}
        />
      )}

      {/* Inspect Review Details Modal */}
      {inspectModal && (
        <ReviewInspectorModal
          review={inspectModal}
          onClose={() => setInspectModal(null)}
          onOpenOverride={() => {
            const r = inspectModal;
            setInspectModal(null);
            setOverrideModal(r);
          }}
          onOpenDelete={() => {
            const r = inspectModal;
            setInspectModal(null);
            setDeleteModal(r);
          }}
        />
      )}

      {/* Reviewer Specific History Modal */}
      {selectedReviewerHistory && (
        <ReviewerHistoryModal
          reviewer={selectedReviewerHistory}
          onClose={() => setSelectedReviewerHistory(null)}
          onOpenInspect={(rev) => setInspectModal(rev)}
          onOpenOverride={(rev) => setOverrideModal(rev)}
          onOpenDelete={(rev) => setDeleteModal(rev)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Search and Promote User to Reviewer
// ──────────────────────────────────────────────────────────────────
function PromoteReviewerModal({ onClose, onPromote }) {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState(null);

  const searchCandidates = async (q) => {
    setLoading(true);
    try {
      const res = await adminApi.reviewerCandidates({ q });
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCandidates('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchCandidates(query);
  };

  const handlePromoteClick = async (userId) => {
    setPromotingId(userId);
    try {
      await onPromote(userId);
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <header className="modal-header">
          <h3>✍️ Promote User to Reviewer</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: 0 }}>
            Search active poets or users to grant the <strong>REVIEWER</strong> role. Reviewers can accept, score, and evaluate poetry submissions.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search user by username, email, or user ID..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="admin-input"
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              🔍 Find User
            </button>
          </form>

          <div className="admin-table-wrap" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="4" className="empty-cell">Searching eligible users...</td></tr>
                )}
                {!loading && candidates.length === 0 && (
                  <tr><td colSpan="4" className="empty-cell">No non-reviewer users match query.</td></tr>
                )}
                {!loading && candidates.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {(u.username || u.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{u.username || 'Anonymous'}</strong>
                          <small style={{ color: '#64748b', display: 'block' }}>{u.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge role-${u.role || 'USER'}`}>
                        {u.role || 'USER'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge status-${u.status || 'ACTIVE'}`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-success btn-xs"
                        disabled={promotingId === u.id}
                        onClick={() => handlePromoteClick(u.id)}
                      >
                        {promotingId === u.id ? 'Promoting...' : '✨ Promote to Reviewer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="audit-notice" style={{ marginTop: '14px' }}>
            🔒 Promotion will be logged permanently in the system audit log.
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
// Modal: Demote Reviewer Confirmation
// ──────────────────────────────────────────────────────────────────
function DemoteReviewerModal({ user, onClose, onDemote }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onDemote();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <header className="modal-header">
          <h3>⬇️ Demote Reviewer: {user?.username}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ color: '#334155', fontSize: '13.5px', marginTop: 0 }}>
            Are you sure you want to demote <strong>@{user?.username}</strong> ({user?.email}) back to a standard <strong>USER</strong> role?
          </p>

          <p style={{ fontSize: '12.5px', color: '#64748b' }}>
            This will immediately revoke their access to the reviewer evaluation queue. Their past completed reviews will remain intact.
          </p>

          <div className="audit-notice">
            🔒 This action will be logged in the system audit log with your administrator ID.
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
            {submitting ? 'Demoting...' : '⬇️ Confirm Demotion'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Override Review Score
// ──────────────────────────────────────────────────────────────────
function OverrideScoreModal({ review, onClose, onSave }) {
  const [score, setScore] = useState(review?.overallScore != null ? review.overallScore : 8.0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(review.id, Number(score), reason.trim() || 'Score adjusted by administrator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <header className="modal-header">
          <h3>✏️ Override Review Score</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px' }}>
              <div><strong>Poem:</strong> {review?.poemTitle || 'Poem #' + review?.poemId}</div>
              <div style={{ marginTop: '3px' }}><strong>Author:</strong> @{review?.authorUsername || 'Unknown'}</div>
              <div style={{ marginTop: '3px' }}><strong>Reviewer:</strong> @{review?.reviewerUsername || 'Unassigned'}</div>
              <div style={{ marginTop: '3px' }}><strong>Current Score:</strong> {review?.overallScore != null ? `${review.overallScore} / 10` : 'Not set'}</div>
            </div>

            <label>
              New Overall Score (1.0 to 10.0)
              <input
                required
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={score}
                onChange={e => setScore(e.target.value)}
                className="admin-input"
              />
            </label>

            <label>
              Administrative Reason for Override
              <textarea
                required
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Recalibrated per editorial guidelines, resolved scoring dispute..."
                className="admin-input"
              />
            </label>

            <div className="audit-notice" style={{ marginTop: '8px' }}>
              🔒 Action will be permanently logged in the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : '💾 Save Score Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Delete Review Confirmation
// ──────────────────────────────────────────────────────────────────
function DeleteReviewModal({ review, onClose, onDelete }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onDelete(review.id, reason.trim() || 'Review deleted by administrator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <header className="modal-header">
          <h3>🗑️ Delete Submitted Review</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: '#b91c1c', fontSize: '13.5px', marginTop: 0 }}>
              ⚠️ Are you sure you want to permanently delete this review record? This action cannot be undone.
            </p>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px', marginBottom: '14px' }}>
              <div><strong>Review ID:</strong> {review?.id}</div>
              <div style={{ marginTop: '2px' }}><strong>Poem:</strong> {review?.poemTitle}</div>
              <div style={{ marginTop: '2px' }}><strong>Reviewer:</strong> @{review?.reviewerUsername}</div>
              <div style={{ marginTop: '2px' }}><strong>Score:</strong> {review?.overallScore ?? 'N/A'}</div>
            </div>

            <label>
              Reason for Deletion
              <textarea
                required
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Specify reason (e.g. Inappropriate feedback, spam, duplicate)..."
                className="admin-input"
              />
            </label>

            <div className="audit-notice" style={{ marginTop: '8px' }}>
              🔒 Action will be permanently logged in the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-danger" disabled={submitting}>
              {submitting ? 'Deleting...' : '🗑️ Confirm Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Review Inspector (Full Feedback & Criteria Breakdown)
// ──────────────────────────────────────────────────────────────────
function ReviewInspectorModal({ review, onClose, onOpenOverride, onOpenDelete }) {
  if (!review) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <header className="modal-header">
          <h3>📋 Review Inspector: {review.poemTitle || 'Poem Review'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Header Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span className="user-id-badge">ID: {review.id}</span>
              <span className="mod-author-tag" style={{ marginLeft: '8px' }}>
                Poem #{review.poemId} by @{review.authorUsername}
              </span>
            </div>
            <span className={`badge ${review.status === 'COMPLETED' ? 'status-ACTIVE' : 'status-SUSPENDED'}`}>
              {review.status}
            </span>
          </div>

          {/* Scores Breakdown Grid */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Overall Score</span>
              <strong style={{ fontSize: '20px', color: '#0284c7' }}>
                {review.overallScore != null ? `${review.overallScore} / 10` : 'Not Scored'}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>EMOTION</small>
                <strong>{review.emotionScore ?? '-'}</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>CREATIVITY</small>
                <strong>{review.creativityScore ?? '-'}</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>RHYTHM</small>
                <strong>{review.rhythmScore ?? '-'}</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>IMAGERY</small>
                <strong>{review.imageryScore ?? '-'}</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>SYMBOLISM</small>
                <strong>{review.symbolismScore ?? '-'}</strong>
              </div>
            </div>
          </div>

          {/* Reviewer Feedback Section */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#334155' }}>
              ✍️ Reviewer Feedback (@{review.reviewerUsername || 'Unassigned'})
            </h4>
            <div style={{ background: '#fff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '13.5px', color: '#1e293b' }}>
              {review.reviewerFeedback || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No written feedback recorded.</span>}
            </div>
          </div>

          {/* Line Suggestions if available */}
          {review.lineSuggestions && review.lineSuggestions.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#334155' }}>
                ✏️ Line-by-Line Suggestions ({review.lineSuggestions.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {review.lineSuggestions.map((s, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <div><span style={{ color: '#dc2626' }}>- {s.originalLine}</span></div>
                    <div><span style={{ color: '#16a34a' }}>+ {s.suggestedLine}</span></div>
                    {s.comment && <div style={{ color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>Note: {s.comment}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Pre-Analysis if present */}
          {review.aiSummary && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#6366f1' }}>
                🤖 AI First-Pass Summary
              </h4>
              <div style={{ background: '#f5f3ff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd6fe', fontSize: '12.5px', color: '#4338ca' }}>
                {review.aiSummary}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-danger" onClick={onOpenDelete}>
            🗑️ Delete Review
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={onOpenOverride}>
              ✏️ Override Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Reviewer Specific History
// ──────────────────────────────────────────────────────────────────
function ReviewerHistoryModal({ reviewer, onClose, onOpenInspect, onOpenOverride, onOpenDelete }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reviewer?.username) {
      setLoading(true);
      adminApi.reviewerReviews(reviewer.username)
        .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [reviewer]);

  const completed = history.filter(r => r.status === 'COMPLETED').length;
  const avg = history.filter(r => r.overallScore != null).length > 0
    ? (history.filter(r => r.overallScore != null).reduce((a, b) => a + b.overallScore, 0) / history.filter(r => r.overallScore != null).length).toFixed(1)
    : '0.0';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <header className="modal-header">
          <h3>📜 Review History: @{reviewer?.username}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div>
              <small style={{ color: '#64748b' }}>TOTAL ASSIGNED</small>
              <strong style={{ display: 'block', fontSize: '18px', color: '#0f172a' }}>{history.length}</strong>
            </div>
            <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '14px' }}>
              <small style={{ color: '#64748b' }}>COMPLETED</small>
              <strong style={{ display: 'block', fontSize: '18px', color: '#16a34a' }}>{completed}</strong>
            </div>
            <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '14px' }}>
              <small style={{ color: '#64748b' }}>AVERAGE SCORE</small>
              <strong style={{ display: 'block', fontSize: '18px', color: '#0284c7' }}>{avg} / 10</strong>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poem</th>
                  <th>Author</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Loading reviewer history...</td></tr>
                )}
                {!loading && history.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No reviews submitted by @{reviewer?.username} yet.</td></tr>
                )}
                {!loading && history.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.poemTitle || 'Poem #' + r.poemId}</strong></td>
                    <td>@{r.authorUsername}</td>
                    <td>
                      <strong style={{ color: '#0284c7' }}>
                        {r.overallScore != null ? r.overallScore : '-'}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'COMPLETED' ? 'status-ACTIVE' : 'status-SUSPENDED'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td><small>{r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : 'N/A'}</small></td>
                    <td>
                      <div className="mod-actions-cluster">
                        <button className="btn-secondary btn-xs" onClick={() => onOpenInspect(r)}>
                          👁️ View
                        </button>
                        <button className="btn-primary btn-xs" onClick={() => onOpenOverride(r)}>
                          ✏️ Override
                        </button>
                        <button className="btn-danger btn-xs" onClick={() => onOpenDelete(r)}>
                          🗑️
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
      </div>
    </div>
  );
}
