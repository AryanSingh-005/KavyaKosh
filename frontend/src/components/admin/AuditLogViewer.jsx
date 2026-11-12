import React, { useState, useMemo } from 'react';
import './AuditLogViewer.css';

const CATEGORIES = [
  { id: 'ALL', label: 'All Operations', icon: '📋' },
  { id: 'USER', label: 'User Governance', icon: '👥' },
  { id: 'FLAG', label: 'Content Moderation', icon: '🛡️' },
  { id: 'REVIEW', label: 'Reviewer Network', icon: '✍️' },
  { id: 'COMPETITION', label: 'Competitions', icon: '🏆' },
  { id: 'MARKETPLACE', label: 'Marketplace', icon: '🛍️' },
  { id: 'ORDER', label: 'Orders & Refunds', icon: '💳' },
  { id: 'SUBSCRIPTION', label: 'Subscriptions', icon: '⭐' },
  { id: 'SETTINGS', label: 'System Settings', icon: '⚙️' },
];

export default function AuditLogViewer({ logs = [], onRefresh, loading = false }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [inspectModalItem, setInspectModalItem] = useState(null);

  // Extract unique actions & admins for dropdowns
  const uniqueActions = useMemo(() => {
    const set = new Set();
    logs.forEach(l => { if (l.action) set.add(l.action); });
    return Array.from(set).sort();
  }, [logs]);

  const uniqueAdmins = useMemo(() => {
    const set = new Set();
    logs.forEach(l => { if (l.adminUsername) set.add(l.adminUsername); });
    return Array.from(set).sort();
  }, [logs]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recent24h = logs.filter(l => l.timestamp && new Date(l.timestamp) > twentyFourHoursAgo).length;

    const securityActions = logs.filter(l =>
      l.action && (l.action.includes('BAN') || l.action.includes('SUSPEND') || l.action.includes('FLAG') || l.action.includes('MODERATE'))
    ).length;

    const adminCounts = {};
    logs.forEach(l => {
      const a = l.adminUsername || 'SystemAdmin';
      adminCounts[a] = (adminCounts[a] || 0) + 1;
    });

    let topAdmin = 'SystemAdmin';
    let maxCount = 0;
    Object.entries(adminCounts).forEach(([admin, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topAdmin = admin;
      }
    });

    return { total, recent24h, securityActions, topAdmin };
  }, [logs]);

  // Filtered & Sorted logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      // Category Filter
      if (activeCategory !== 'ALL') {
        const t = (l.targetType || '').toUpperCase();
        if (activeCategory === 'FLAG') {
          if (t !== 'FLAG' && t !== 'POEM' && t !== 'COMMENT') return false;
        } else if (activeCategory === 'ORDER') {
          if (t !== 'ORDER' && !l.action?.includes('REFUND')) return false;
        } else if (activeCategory === 'USER') {
          if (t !== 'USER' && !l.action?.includes('USER')) return false;
        } else if (t !== activeCategory) {
          return false;
        }
      }

      // Action Filter
      if (selectedAction !== 'ALL' && l.action !== selectedAction) {
        return false;
      }

      // Admin Filter
      if (selectedAdmin !== 'ALL' && l.adminUsername !== selectedAdmin) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = l.action && l.action.toLowerCase().includes(q);
        const matchesAdmin = l.adminUsername && l.adminUsername.toLowerCase().includes(q);
        const matchesTargetType = l.targetType && l.targetType.toLowerCase().includes(q);
        const matchesTargetId = l.targetId && l.targetId.toLowerCase().includes(q);
        const matchesDetails = l.details && l.details.toLowerCase().includes(q);
        if (!matchesAction && !matchesAdmin && !matchesTargetType && !matchesTargetId && !matchesDetails) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
  }, [logs, activeCategory, selectedAction, selectedAdmin, searchQuery, sortOrder]);

  // Format relative time helper
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const date = new Date(timestamp);
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Action badge style selector
  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('BAN') || act.includes('SUSPEND') || act.includes('DELETE') || act.includes('DISMISS')) {
      return 'action-badge--danger';
    }
    if (act.includes('UNBAN') || act.includes('PROMOTE') || act.includes('RESOLVE') || act.includes('RESTORE')) {
      return 'action-badge--success';
    }
    if (act.includes('SETTING') || act.includes('ANNOUNCEMENT') || act.includes('OVERRIDE')) {
      return 'action-badge--purple';
    }
    if (act.includes('REFUND') || act.includes('WINNER') || act.includes('FINALIZE') || act.includes('COMPETITION')) {
      return 'action-badge--gold';
    }
    return 'action-badge--blue';
  };

  const getActionIcon = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('BAN') || act.includes('SUSPEND') || act.includes('DELETE')) return '🚫';
    if (act.includes('UNBAN') || act.includes('PROMOTE') || act.includes('RESOLVE')) return '✓';
    if (act.includes('SETTING') || act.includes('ANNOUNCEMENT') || act.includes('OVERRIDE')) return '⚙️';
    if (act.includes('REFUND')) return '💳';
    if (act.includes('WINNER') || act.includes('FINALIZE')) return '🏆';
    if (act.includes('SCORE')) return '⭐';
    return '📋';
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Admin Actor', 'Action', 'Target Type', 'Target ID', 'Details'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.adminUsername || 'SystemAdmin'}"`,
      `"${l.action || ''}"`,
      `"${l.targetType || ''}"`,
      `"${l.targetId || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kavyakosh_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audit-viewer">
      {/* 4 Executive Stat Metric Cards */}
      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--blue">📊</div>
          <div className="audit-stat-info">
            <span className="audit-stat-value">{stats.total}</span>
            <span className="audit-stat-label">Total Audit Events</span>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--emerald">⚡</div>
          <div className="audit-stat-info">
            <span className="audit-stat-value">{stats.recent24h}</span>
            <span className="audit-stat-label">Actions in Last 24h</span>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--amber">🛡️</div>
          <div className="audit-stat-info">
            <span className="audit-stat-value">{stats.securityActions}</span>
            <span className="audit-stat-label">Security & Moderation</span>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--purple">👤</div>
          <div className="audit-stat-info">
            <span className="audit-stat-value" style={{ fontSize: '16px', wordBreak: 'break-all' }}>
              {stats.topAdmin}
            </span>
            <span className="audit-stat-label">Lead Administrator</span>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="audit-panel">
        <div className="audit-panel__header">
          <div className="audit-panel__title-group">
            <h2 className="audit-panel__title">
              <span>📋</span> Immutable System Audit Trail
            </h2>
            <p className="audit-panel__subtitle">
              Comprehensive tamper-evident record of all administrative decisions, moderation actions, financial disbursements, and configuration changes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-solid btn-solid--ghost"
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              title="Download records as CSV"
            >
              📥 Export CSV ({filteredLogs.length})
            </button>
            <button
              type="button"
              className="btn-solid btn-solid--primary"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Trail'}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="audit-category-tabs" role="tablist">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`category-tab-btn ${activeCategory === cat.id ? 'category-tab-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span aria-hidden="true" style={{ marginRight: '6px' }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Toolbar */}
        <div className="audit-toolbar">
          <div className="audit-search-box">
            <span className="audit-search-icon">🔍</span>
            <input
              type="text"
              className="audit-search-input"
              placeholder="Search by action, admin username, target ID, or detail notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="audit-select"
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
          >
            <option value="ALL">All Actions ({uniqueActions.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            className="audit-select"
            value={selectedAdmin}
            onChange={e => setSelectedAdmin(e.target.value)}
          >
            <option value="ALL">All Admins ({uniqueAdmins.length})</option>
            {uniqueAdmins.map(adm => (
              <option key={adm} value={adm}>{adm}</option>
            ))}
          </select>

          <select
            className="audit-select"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="NEWEST">Newest First ↓</option>
            <option value="OLDEST">Oldest First ↑</option>
          </select>
        </div>

        {/* Audit Table */}
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Timestamp</th>
                <th style={{ width: '180px' }}>Administrator</th>
                <th style={{ width: '190px' }}>Action</th>
                <th style={{ width: '140px' }}>Target Entity</th>
                <th>Context & Event Details</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No audit events match your selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => (
                  <tr key={item.id || `${item.timestamp}_${item.action}_${Math.random()}`}>
                    <td className="audit-time-col">
                      <span className="audit-time-relative">{formatRelativeTime(item.timestamp)}</span>
                      <span className="audit-time-full">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </td>

                    <td>
                      <div className="admin-actor-cell">
                        <div className="admin-actor-avatar">
                          {item.adminUsername ? item.adminUsername[0].toUpperCase() : 'A'}
                        </div>
                        <span className="admin-actor-name" title={item.adminUsername}>
                          {item.adminUsername || 'SystemAdmin'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`action-badge ${getActionBadgeClass(item.action)}`}>
                        <span aria-hidden="true">{getActionIcon(item.action)}</span>
                        {item.action || 'OPERATION'}
                      </span>
                    </td>

                    <td>
                      <span className="target-badge">
                        <strong>{item.targetType || 'ENTITY'}</strong>
                        {item.targetId && (
                          <span style={{ color: '#94a3b8' }}>#{item.targetId.slice(-6)}</span>
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="audit-details-text" title={item.details}>
                        {item.details || 'No additional event details provided.'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-inspect"
                        onClick={() => setInspectModalItem(item)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured Inspect Modal */}
      {inspectModalItem && (
        <div className="audit-modal-overlay" onClick={() => setInspectModalItem(null)}>
          <div className="audit-modal-box" onClick={e => e.stopPropagation()}>
            <div className="audit-modal-header">
              <h3>🔍 Audit Event Inspector</h3>
              <button
                type="button"
                className="settings-toast__close"
                onClick={() => setInspectModalItem(null)}
              >
                ×
              </button>
            </div>

            <div className="audit-modal-body">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className={`action-badge ${getActionBadgeClass(inspectModalItem.action)}`}>
                  {getActionIcon(inspectModalItem.action)} {inspectModalItem.action}
                </span>
                <span className="target-badge">
                  {inspectModalItem.targetType} #{inspectModalItem.targetId}
                </span>
              </div>

              <div className="modal-field">
                <label>Administrator Actor:</label>
                <span>{inspectModalItem.adminUsername || 'SystemAdmin'}</span>
              </div>

              <div className="modal-field">
                <label>Exact Timestamp:</label>
                <span>
                  {inspectModalItem.timestamp ? new Date(inspectModalItem.timestamp).toUTCString() : '—'}
                  {' '}({inspectModalItem.timestamp ? new Date(inspectModalItem.timestamp).toLocaleString() : ''})
                </span>
              </div>

              <div className="modal-field">
                <label>Action Details & Rationale:</label>
                <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', color: '#f1f5f9' }}>
                  {inspectModalItem.details || 'None provided'}
                </div>
              </div>

              <div className="modal-field">
                <label>Raw Event Payload (JSON):</label>
                <pre className="modal-json-pre">
                  {JSON.stringify(inspectModalItem, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
