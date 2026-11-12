import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';

export function ContentModerationView({ executeAction, setModal }) {
  const [subTab, setSubTab] = useState('flags'); // 'flags' | 'poems' | 'comments'
  const [flagsList, setFlagsList] = useState([]);
  const [poemsList, setPoemsList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters for Flags tab
  const [flagStatusFilter, setFlagStatusFilter] = useState('ALL');
  const [flagTypeFilter, setFlagTypeFilter] = useState('ALL');
  const [flagSearch, setFlagSearch] = useState('');

  // Filters for Poems tab
  const [poemQuery, setPoemQuery] = useState('');
  const [poemStatusFilter, setPoemStatusFilter] = useState('ALL');

  // Filters for Comments tab
  const [commentQuery, setCommentQuery] = useState('');
  const [commentStatusFilter, setCommentStatusFilter] = useState('ALL');

  // Local modals
  const [previewModal, setPreviewModal] = useState(null); // { type: 'POEM' | 'COMMENT', data: obj }
  const [manualFlagModal, setManualFlagModal] = useState(null); // { type: 'POEM' | 'COMMENT', id: '' }
  const [resolveModal, setResolveModal] = useState(null); // { flag: obj, mode: 'RESOLVE' | 'DISMISS' }
  const [confirmModerateModal, setConfirmModerateModal] = useState(null); // { type, id, restore: bool, title?: string }

  // Load Flags
  const loadFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.flags();
      setFlagsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load flagged moderation queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Site-wide Poems
  const loadPoems = useCallback(async (q = poemQuery, status = poemStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.allPoems({ q, status });
      setPoemsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load site-wide poems.');
    } finally {
      setLoading(false);
    }
  }, [poemQuery, poemStatusFilter]);

  // Load Site-wide Comments
  const loadComments = useCallback(async (q = commentQuery, status = commentStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.allComments({ q, status });
      setCommentsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load site-wide comments.');
    } finally {
      setLoading(false);
    }
  }, [commentQuery, commentStatusFilter]);

  // Effect to load on tab change
  useEffect(() => {
    if (subTab === 'flags') {
      loadFlags();
    } else if (subTab === 'poems') {
      loadPoems();
    } else if (subTab === 'comments') {
      loadComments();
    }
  }, [subTab, loadFlags, loadPoems, loadComments]);

  // Trigger moderate action and reload
  const handleModerate = async (type, id, restore) => {
    await executeAction(async () => {
      await adminApi.moderate(type, id, restore);
      if (subTab === 'flags') await loadFlags();
      if (subTab === 'poems') await loadPoems();
      if (subTab === 'comments') await loadComments();
    });
    setConfirmModerateModal(null);
    setPreviewModal(null);
  };

  // Trigger resolve/dismiss action and reload
  const handleResolveFlag = async (id, resolution) => {
    await executeAction(async () => {
      await adminApi.resolveFlag(id, resolution);
      await loadFlags();
    });
    setResolveModal(null);
  };

  const handleDismissFlag = async (id, reason) => {
    await executeAction(async () => {
      await adminApi.dismissFlag(id, reason);
      await loadFlags();
    });
    setResolveModal(null);
  };

  const handleCreateFlag = async (targetType, targetId, reason) => {
    await executeAction(async () => {
      await adminApi.flag({ targetType, targetId, reason });
      await loadFlags();
      if (subTab === 'poems') await loadPoems();
      if (subTab === 'comments') await loadComments();
    });
    setManualFlagModal(null);
  };

  // Computed stats from flags
  const totalFlags = flagsList.length;
  const openFlags = flagsList.filter(f => f.status === 'OPEN').length;
  const resolvedFlags = flagsList.filter(f => f.status === 'RESOLVED').length;
  const dismissedFlags = flagsList.filter(f => f.status === 'DISMISSED').length;

  // Filtered flags list
  const filteredFlags = flagsList.filter(f => {
    if (flagStatusFilter !== 'ALL' && f.status !== flagStatusFilter) return false;
    if (flagTypeFilter !== 'ALL' && f.targetType !== flagTypeFilter) return false;
    if (flagSearch.trim()) {
      const q = flagSearch.toLowerCase();
      const matchReason = f.reason?.toLowerCase().includes(q);
      const matchReporter = f.flaggedBy?.toLowerCase().includes(q);
      const matchId = f.targetId?.toLowerCase().includes(q);
      const matchTitle = f.title?.toLowerCase().includes(q);
      const matchAuthor = f.author?.toLowerCase().includes(q);
      const matchContent = f.content?.toLowerCase().includes(q);
      return matchReason || matchReporter || matchId || matchTitle || matchAuthor || matchContent;
    }
    return true;
  });

  return (
    <div className="moderation-container">
      {/* ── Overview Statistics Strip ── */}
      <div className="user-management-stats">
        <div className="user-stat-box" style={{ borderLeft: '4px solid #ef4444' }}>
          <small>Open Reports</small>
          <strong style={{ color: '#ef4444' }}>{openFlags}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
          <small>Total Flags Recorded</small>
          <strong style={{ color: '#0284c7' }}>{totalFlags}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
          <small>Resolved Flags</small>
          <strong style={{ color: '#16a34a' }}>{resolvedFlags}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #64748b' }}>
          <small>Dismissed Flags</small>
          <strong style={{ color: '#64748b' }}>{dismissedFlags}</strong>
        </div>
      </div>

      {/* ── Sub Navigation Tabs & Top Actions ── */}
      <div className="mod-tabs-header">
        <div className="mod-tab-buttons">
          <button
            className={`mod-tab-btn ${subTab === 'flags' ? 'active' : ''}`}
            onClick={() => setSubTab('flags')}
          >
            🚩 Flagged Queue {openFlags > 0 && <span className="mod-tab-badge">{openFlags}</span>}
          </button>
          <button
            className={`mod-tab-btn ${subTab === 'poems' ? 'active' : ''}`}
            onClick={() => setSubTab('poems')}
          >
            📜 Site-Wide Poems Moderation
          </button>
          <button
            className={`mod-tab-btn ${subTab === 'comments' ? 'active' : ''}`}
            onClick={() => setSubTab('comments')}
          >
            💬 Site-Wide Comments Moderation
          </button>
        </div>

        <button
          className="btn-danger"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setManualFlagModal({ type: 'POEM', id: '' })}
        >
          <span>🚩</span> Flag Content Manually
        </button>
      </div>

      {error && (
        <div className="admin-alert error" style={{ margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: FLAGGED CONTENT QUEUE ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'flags' && (
        <div className="mod-section">
          {/* Controls Bar */}
          <div className="mod-filter-bar">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={flagStatusFilter}
                onChange={e => setFlagStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">🔴 Open Only</option>
                <option value="RESOLVED">🟢 Resolved</option>
                <option value="DISMISSED">⚪ Dismissed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Target:</label>
              <select
                value={flagTypeFilter}
                onChange={e => setFlagTypeFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Types</option>
                <option value="POEM">📜 Poems</option>
                <option value="COMMENT">💬 Comments</option>
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search reason, reporter, content snippet, ID..."
                value={flagSearch}
                onChange={e => setFlagSearch(e.target.value)}
                className="admin-input"
              />
            </div>

            <button className="btn-secondary" onClick={loadFlags} title="Refresh flags">
              🔄 Refresh
            </button>
          </div>

          {/* Flags Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Target</th>
                  <th>Content Preview & Context</th>
                  <th>Flag Reason</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Loading moderation flags...
                    </td>
                  </tr>
                )}
                {!loading && filteredFlags.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No flagged items match the current filter criteria.
                    </td>
                  </tr>
                )}
                {!loading && filteredFlags.map(flag => {
                  const isPoem = flag.targetType === 'POEM';
                  const isRemoved = isPoem ? (flag.isPublished === false) : (flag.isRemoved === true);

                  return (
                    <tr key={flag.id} className={flag.status === 'OPEN' ? 'row-highlight-open' : ''}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge ${isPoem ? 'role-REVIEWER' : 'role-USER'}`}>
                            {isPoem ? '📜 POEM' : '💬 COMMENT'}
                          </span>
                          <span className="user-id-badge" title={flag.targetId}>
                            #{flag.targetId ? (flag.targetId.length > 8 ? flag.targetId.substring(0, 8) + '...' : flag.targetId) : 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="mod-preview-cell">
                          {isPoem ? (
                            <>
                              <div className="mod-preview-title">
                                <strong>{flag.title || 'Untitled Poem'}</strong>
                                <span className="mod-author-tag">by @{flag.author || 'Unknown'}</span>
                              </div>
                              <p className="mod-preview-excerpt">
                                {flag.excerpt || (flag.content ? flag.content.substring(0, 120) + '...' : 'No preview available')}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="mod-preview-title">
                                <span className="mod-author-tag">Comment by @{flag.author || 'Unknown'}</span>
                                {flag.poemId && <small style={{ color: '#64748b' }}>on poem #{flag.poemId}</small>}
                              </div>
                              <p className="mod-preview-excerpt">
                                {flag.content ? (flag.content.length > 130 ? flag.content.substring(0, 130) + '...' : flag.content) : 'No comment content'}
                              </p>
                            </>
                          )}

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                            <span className={`badge ${isRemoved ? 'status-BANNED' : 'status-ACTIVE'}`}>
                              {isRemoved ? '🚫 CURRENTLY REMOVED' : '🟢 CURRENTLY LIVE'}
                            </span>
                            <button
                              className="link-btn"
                              onClick={() => setPreviewModal({ type: flag.targetType, data: flag })}
                            >
                              🔍 View Full Text
                            </button>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="mod-reason-text">
                          {flag.reason}
                        </div>
                        <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                          {flag.createdAt ? new Date(flag.createdAt).toLocaleString() : ''}
                        </small>
                      </td>

                      <td>
                        <span className="mod-reporter-name">
                          👤 {flag.flaggedBy || 'System/User'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${
                          flag.status === 'OPEN' ? 'status-BANNED' :
                          flag.status === 'RESOLVED' ? 'status-ACTIVE' : 'status-SUSPENDED'
                        }`}>
                          {flag.status === 'OPEN' ? '🔴 OPEN' :
                           flag.status === 'RESOLVED' ? '🟢 RESOLVED' : '⚪ DISMISSED'}
                        </span>
                      </td>

                      <td>
                        <div className="mod-actions-cluster">
                          {/* Remove or Restore action */}
                          {isRemoved ? (
                            <button
                              className="btn-success btn-xs"
                              title="Restore content site-wide and resolve flags"
                              onClick={() => setConfirmModerateModal({
                                type: flag.targetType,
                                id: flag.targetId,
                                restore: true,
                                title: flag.title || flag.content
                              })}
                            >
                              ♻️ Restore
                            </button>
                          ) : (
                            <button
                              className="btn-danger btn-xs"
                              title="Take down content site-wide and mark flags resolved"
                              onClick={() => setConfirmModerateModal({
                                type: flag.targetType,
                                id: flag.targetId,
                                restore: false,
                                title: flag.title || flag.content
                              })}
                            >
                              🚫 Remove
                            </button>
                          )}

                          {/* Flag resolution actions if OPEN */}
                          {flag.status === 'OPEN' && (
                            <>
                              <button
                                className="btn-secondary btn-xs"
                                title="Resolve flag report with audit log"
                                onClick={() => setResolveModal({ flag, mode: 'RESOLVE' })}
                              >
                                ✅ Resolve
                              </button>
                              <button
                                className="btn-secondary btn-xs"
                                title="Dismiss flag report (false positive)"
                                onClick={() => setResolveModal({ flag, mode: 'DISMISS' })}
                              >
                                ✕ Dismiss
                              </button>
                            </>
                          )}
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
      {/* ── TAB 2: SITE-WIDE POEMS MODERATION ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'poems' && (
        <div className="mod-section">
          {/* Site-wide search/filter toolbar */}
          <form
            className="mod-filter-bar"
            onSubmit={e => { e.preventDefault(); loadPoems(poemQuery, poemStatusFilter); }}
          >
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={poemStatusFilter}
                onChange={e => {
                  setPoemStatusFilter(e.target.value);
                  loadPoems(poemQuery, e.target.value);
                }}
                className="admin-select"
              >
                <option value="ALL">All Poems</option>
                <option value="PUBLISHED">🟢 Published / Live</option>
                <option value="REMOVED">🚫 Removed / Unpublished</option>
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search poems by title, content, author, or ID..."
                value={poemQuery}
                onChange={e => setPoemQuery(e.target.value)}
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
                setPoemQuery('');
                setPoemStatusFilter('ALL');
                loadPoems('', 'ALL');
              }}
            >
              Reset
            </button>
          </form>

          {/* Poems Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poem</th>
                  <th>Excerpt Preview</th>
                  <th>Status</th>
                  <th>Likes / Reads</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right', minWidth: '240px' }}>Site-Wide Moderation</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Searching and loading poems...</td></tr>
                )}
                {!loading && poemsList.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No poems found matching search criteria.</td></tr>
                )}
                {!loading && poemsList.map(p => {
                  const isPublished = Boolean(p.published);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                            {p.title || 'Untitled'}
                          </strong>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span className="user-id-badge">ID: {p.id}</span>
                            <span className="mod-author-tag">
                              by @{p.author?.username || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ maxWidth: '300px' }}>
                        <p className="mod-preview-excerpt">
                          {p.excerpt || (p.content ? p.content.substring(0, 100) + '...' : 'No text')}
                        </p>
                      </td>

                      <td>
                        <span className={`badge ${isPublished ? 'status-ACTIVE' : 'status-BANNED'}`}>
                          {isPublished ? '🟢 LIVE' : '🚫 REMOVED'}
                        </span>
                      </td>

                      <td>
                        <small style={{ color: '#475569' }}>
                          ❤️ {p.likeCount ?? 0} &nbsp;|&nbsp; 👁️ {p.readCount ?? 0}
                        </small>
                      </td>

                      <td>
                        <small style={{ color: '#64748b' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                        </small>
                      </td>

                      <td>
                        <div className="mod-actions-cluster">
                          <button
                            className="btn-secondary btn-xs"
                            title="Inspect full poem content"
                            onClick={() => setPreviewModal({
                              type: 'POEM',
                              data: {
                                targetType: 'POEM',
                                targetId: p.id,
                                title: p.title,
                                content: p.content,
                                excerpt: p.excerpt,
                                author: p.author?.username,
                                isPublished: p.published,
                                createdAt: p.createdAt
                              }
                            })}
                          >
                            👁️ View
                          </button>

                          {isPublished ? (
                            <button
                              className="btn-danger btn-xs"
                              title="Take down poem site-wide"
                              onClick={() => setConfirmModerateModal({
                                type: 'POEM',
                                id: p.id,
                                restore: false,
                                title: p.title
                              })}
                            >
                              🚫 Remove
                            </button>
                          ) : (
                            <button
                              className="btn-success btn-xs"
                              title="Restore poem site-wide"
                              onClick={() => setConfirmModerateModal({
                                type: 'POEM',
                                id: p.id,
                                restore: true,
                                title: p.title
                              })}
                            >
                              ♻️ Restore
                            </button>
                          )}

                          <button
                            className="btn-warning btn-xs"
                            title="File an administrative flag"
                            onClick={() => setManualFlagModal({ type: 'POEM', id: p.id })}
                          >
                            🚩 Flag
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
      {/* ── TAB 3: SITE-WIDE COMMENTS MODERATION ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'comments' && (
        <div className="mod-section">
          {/* Site-wide search/filter toolbar */}
          <form
            className="mod-filter-bar"
            onSubmit={e => { e.preventDefault(); loadComments(commentQuery, commentStatusFilter); }}
          >
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={commentStatusFilter}
                onChange={e => {
                  setCommentStatusFilter(e.target.value);
                  loadComments(commentQuery, e.target.value);
                }}
                className="admin-select"
              >
                <option value="ALL">All Comments</option>
                <option value="ACTIVE">🟢 Active / Visible</option>
                <option value="REMOVED">🚫 Moderated / Removed</option>
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search comments by text, username, comment ID, or poem ID..."
                value={commentQuery}
                onChange={e => setCommentQuery(e.target.value)}
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
                setCommentQuery('');
                setCommentStatusFilter('ALL');
                loadComments('', 'ALL');
              }}
            >
              Reset
            </button>
          </form>

          {/* Comments Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Author</th>
                  <th>Comment Text</th>
                  <th>Poem Reference</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Site-Wide Moderation</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Searching and loading comments...</td></tr>
                )}
                {!loading && commentsList.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No comments found matching search criteria.</td></tr>
                )}
                {!loading && commentsList.map(c => {
                  const isRemoved = Boolean(c.removed);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#0f172a' }}>@{c.username || 'Anonymous'}</strong>
                          <span className="user-id-badge">ID: {c.id ? c.id.substring(0, 8) + '...' : 'N/A'}</span>
                        </div>
                      </td>

                      <td style={{ maxWidth: '350px' }}>
                        <p className="mod-preview-excerpt" style={{ color: isRemoved ? '#94a3b8' : '#1e293b' }}>
                          {c.content || 'Empty comment'}
                        </p>
                      </td>

                      <td>
                        <span className="user-id-badge" title={`Poem ID: ${c.poemId}`}>
                          Poem #{c.poemId ? (c.poemId.length > 8 ? c.poemId.substring(0, 8) + '...' : c.poemId) : 'N/A'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${!isRemoved ? 'status-ACTIVE' : 'status-BANNED'}`}>
                          {!isRemoved ? '🟢 ACTIVE' : '🚫 REMOVED'}
                        </span>
                      </td>

                      <td>
                        <small style={{ color: '#64748b' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </small>
                      </td>

                      <td>
                        <div className="mod-actions-cluster">
                          <button
                            className="btn-secondary btn-xs"
                            title="Inspect full comment text"
                            onClick={() => setPreviewModal({
                              type: 'COMMENT',
                              data: {
                                targetType: 'COMMENT',
                                targetId: c.id,
                                content: c.content,
                                author: c.username,
                                poemId: c.poemId,
                                isRemoved: c.removed,
                                createdAt: c.createdAt
                              }
                            })}
                          >
                            👁️ View
                          </button>

                          {!isRemoved ? (
                            <button
                              className="btn-danger btn-xs"
                              title="Remove comment site-wide"
                              onClick={() => setConfirmModerateModal({
                                type: 'COMMENT',
                                id: c.id,
                                restore: false,
                                title: c.content
                              })}
                            >
                              🚫 Remove
                            </button>
                          ) : (
                            <button
                              className="btn-success btn-xs"
                              title="Restore comment site-wide"
                              onClick={() => setConfirmModerateModal({
                                type: 'COMMENT',
                                id: c.id,
                                restore: true,
                                title: c.content
                              })}
                            >
                              ♻️ Restore
                            </button>
                          )}

                          <button
                            className="btn-warning btn-xs"
                            title="File an administrative flag"
                            onClick={() => setManualFlagModal({ type: 'COMMENT', id: c.id })}
                          >
                            🚩 Flag
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

      {/* Manual Flag Modal */}
      {manualFlagModal && (
        <ManualFlagModal
          initialType={manualFlagModal.type}
          initialTargetId={manualFlagModal.id}
          onClose={() => setManualFlagModal(null)}
          onSubmit={handleCreateFlag}
        />
      )}

      {/* Content Inspector / Preview Modal */}
      {previewModal && (
        <ContentPreviewModal
          item={previewModal.data}
          type={previewModal.type}
          onClose={() => setPreviewModal(null)}
          onModerate={handleModerate}
          onOpenFlag={(type, id) => {
            setPreviewModal(null);
            setManualFlagModal({ type, id });
          }}
        />
      )}

      {/* Resolve / Dismiss Flag Modal */}
      {resolveModal && (
        <ResolveFlagModal
          flag={resolveModal.flag}
          mode={resolveModal.mode}
          onClose={() => setResolveModal(null)}
          onResolve={handleResolveFlag}
          onDismiss={handleDismissFlag}
        />
      )}

      {/* Confirmation Modal for Remove / Restore */}
      {confirmModerateModal && (
        <ConfirmModerateModal
          type={confirmModerateModal.type}
          id={confirmModerateModal.id}
          restore={confirmModerateModal.restore}
          title={confirmModerateModal.title}
          onClose={() => setConfirmModerateModal(null)}
          onConfirm={() => handleModerate(confirmModerateModal.type, confirmModerateModal.id, confirmModerateModal.restore)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Flag Content Manually
// ──────────────────────────────────────────────────────────────────
function ManualFlagModal({ initialType = 'POEM', initialTargetId = '', onClose, onSubmit }) {
  const [targetType, setTargetType] = useState(initialType);
  const [targetId, setTargetId] = useState(initialTargetId);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId.trim() || !reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(targetType, targetId.trim(), reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <header className="modal-header">
          <h3>🚩 Flag Content Manually</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: 0 }}>
              Administrators can manually file a flag against any poem or comment site-wide for review or takedown.
            </p>

            <label>
              Content Type
              <select
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                className="admin-select"
                style={{ width: '100%' }}
              >
                <option value="POEM">📜 Poem</option>
                <option value="COMMENT">💬 Comment</option>
              </select>
            </label>

            <label>
              Target Record ID (MongoDB or SQL ID)
              <input
                required
                type="text"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="e.g. 64f1a2b3c4d5e6... or 101"
                className="admin-input"
              />
            </label>

            <label>
              Reason for Flagging
              <textarea
                required
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Specify policy violation (e.g. Hate speech, Copyright infringement, Harassment, Spam)..."
                className="admin-input"
                style={{ resize: 'vertical' }}
              />
            </label>

            <div className="audit-notice" style={{ marginTop: '8px' }}>
              🔒 Action will be permanently logged to the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-danger" disabled={submitting}>
              {submitting ? 'Submitting...' : '🚩 Submit Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Full Content Reader / Inspector
// ──────────────────────────────────────────────────────────────────
function ContentPreviewModal({ item, type, onClose, onModerate, onOpenFlag }) {
  if (!item) return null;
  const isPoem = type === 'POEM';
  const isRemoved = isPoem ? (item.isPublished === false) : (item.isRemoved === true);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <header className="modal-header">
          <h3>
            {isPoem ? '📜 Poem Content Inspector' : '💬 Comment Inspector'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span className={`badge ${isPoem ? 'role-REVIEWER' : 'role-USER'}`}>
                {isPoem ? 'POEM' : 'COMMENT'}
              </span>
              <span className="user-id-badge" style={{ marginLeft: '8px' }}>
                ID: {item.targetId || item.id}
              </span>
            </div>
            <span className={`badge ${isRemoved ? 'status-BANNED' : 'status-ACTIVE'}`}>
              {isRemoved ? '🚫 REMOVED FROM SITE' : '🟢 PUBLICLY VISIBLE'}
            </span>
          </div>

          {isPoem ? (
            <div>
              <h2 style={{ fontSize: '18px', margin: '0 0 6px 0', color: '#0f172a' }}>
                {item.title || 'Untitled Poem'}
              </h2>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                Author: <strong>@{item.author || 'Unknown'}</strong> &nbsp;|&nbsp;
                Published: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
              </div>

              {item.excerpt && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0284c7', marginBottom: '16px', fontSize: '13px' }}>
                  <strong>Excerpt:</strong> <em>{item.excerpt}</em>
                </div>
              )}

              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'Georgia, serif', fontSize: '14.5px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '18px 20px', color: '#1e293b' }}>
                {item.content || 'No poem body content found.'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                Comment by <strong>@{item.author || 'Unknown'}</strong> &nbsp;|&nbsp;
                {item.poemId && <span>Associated Poem: <strong>#{item.poemId}</strong> &nbsp;|&nbsp;</span>}
                Date: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
              </div>

              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px 18px', color: '#0f172a' }}>
                {item.content || 'No comment content found.'}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions-bar">
          <button
            type="button"
            className="btn-warning"
            onClick={() => onOpenFlag(type, item.targetId || item.id)}
          >
            🚩 File Flag
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {isRemoved ? (
              <button
                type="button"
                className="btn-success"
                onClick={() => onModerate(type, item.targetId || item.id, true)}
              >
                ♻️ Restore Content
              </button>
            ) : (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onModerate(type, item.targetId || item.id, false)}
              >
                🚫 Remove Content
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Resolve or Dismiss Flag
// ──────────────────────────────────────────────────────────────────
function ResolveFlagModal({ flag, mode, onClose, onResolve, onDismiss }) {
  const isResolve = mode === 'RESOLVE';
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isResolve) {
        await onResolve(flag.id, notes.trim() || 'Content evaluated and flag resolved by admin.');
      } else {
        await onDismiss(flag.id, notes.trim() || 'Report reviewed and dismissed as non-violating.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <header className="modal-header">
          <h3>
            {isResolve ? '✅ Resolve Content Flag' : '✕ Dismiss Content Flag'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px' }}>
              <div><strong>Target:</strong> {flag.targetType} #{flag.targetId}</div>
              <div style={{ marginTop: '4px' }}><strong>Original Report Reason:</strong> {flag.reason}</div>
              <div style={{ marginTop: '4px', color: '#64748b' }}>Reported by: {flag.flaggedBy || 'User'}</div>
            </div>

            <label>
              {isResolve ? 'Resolution Notes' : 'Dismissal Reason'}
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isResolve ? 'e.g. Content reviewed, policy violation handled...' : 'e.g. Does not violate platform guidelines...'}
                className="admin-input"
              />
            </label>

            <div className="audit-notice" style={{ marginTop: '8px' }}>
              🔒 Action will be permanently logged to the audit log under your admin identity.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={isResolve ? 'btn-primary' : 'btn-secondary'}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isResolve ? '✅ Mark Resolved' : '✕ Dismiss Flag')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Confirm Remove / Restore Content
// ──────────────────────────────────────────────────────────────────
function ConfirmModerateModal({ type, id, restore, title, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <header className="modal-header">
          <h3>
            {restore ? `♻️ Restore ${type}` : `🚫 Remove ${type}`}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ fontSize: '13.5px', color: '#334155', marginTop: 0 }}>
            {restore ? (
              <>Are you sure you want to <strong>restore</strong> this {type.toLowerCase()}? It will become publicly visible across the platform again, and any open flags will be marked resolved.</>
            ) : (
              <>Are you sure you want to <strong>remove / take down</strong> this {type.toLowerCase()}? It will be hidden from all public feeds and searches immediately, and any open flags will be marked resolved.</>
            )}
          </p>

          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px', marginBottom: '12px' }}>
            <div><strong>Type:</strong> {type}</div>
            <div style={{ marginTop: '3px' }}><strong>ID:</strong> {id}</div>
            {title && <div style={{ marginTop: '3px' }}><strong>Title/Preview:</strong> {title.substring(0, 60)}</div>}
          </div>

          <div className="audit-notice">
            🔒 This moderation action will be recorded in the system audit log.
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className={restore ? 'btn-success' : 'btn-danger'}
            onClick={handleAction}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : (restore ? '♻️ Confirm Restore' : '🚫 Confirm Remove')}
          </button>
        </div>
      </div>
    </div>
  );
}
