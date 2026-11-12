import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

export function UserManagementView({ data, executeAction, setModal }) {
  const usersList = Array.isArray(data) ? data : [];

  const totalCount = usersList.length;
  const activeCount = usersList.filter(u => u.status === 'ACTIVE').length;
  const suspendedCount = usersList.filter(u => u.status === 'SUSPENDED').length;
  const bannedCount = usersList.filter(u => u.status === 'BANNED').length;
  const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
  const reviewerCount = usersList.filter(u => u.role === 'REVIEWER').length;
  const premiumCount = usersList.filter(u => u.role === 'PREMIUM').length;

  const roleIcons = {
    ADMIN: '🛡️',
    REVIEWER: '✍️',
    PREMIUM: '👑',
    USER: '👤'
  };

  const statusIcons = {
    ACTIVE: '🟢',
    SUSPENDED: '🟡',
    BANNED: '🔴'
  };

  return (
    <div>
      {/* ── User Overview Stats Strip ── */}
      <div className="user-management-stats">
        <div className="user-stat-box">
          <small>Total Users</small>
          <strong>{totalCount}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
          <small>Active Accounts</small>
          <strong style={{ color: '#16a34a' }}>{activeCount}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #d97706' }}>
          <small>Suspended</small>
          <strong style={{ color: '#d97706' }}>{suspendedCount}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #dc2626' }}>
          <small>Banned</small>
          <strong style={{ color: '#dc2626' }}>{bannedCount}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
          <small>Staff & VIPs</small>
          <strong style={{ color: '#0284c7' }}>{adminCount + reviewerCount + premiumCount}</strong>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Engagement</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No users match the search and filter query.
                </td>
              </tr>
            ) : (
              usersList.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.username || u.email} className="user-avatar" />
                      ) : (
                        <div className="user-avatar">
                          {(u.username || u.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong>
                          {u.username || 'Anonymous User'}
                          <span className="user-id-badge">#{u.id}</span>
                          {u.featuredWriter && <span title="Featured Poet" style={{ marginLeft: '4px' }}>⭐</span>}
                        </strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge role-${u.role}`}>
                      {roleIcons[u.role] || ''} {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${u.status}`}>
                      {statusIcons[u.status] || ''} {u.status}
                    </span>
                  </td>
                  <td>
                    <small style={{ display: 'block' }}>👥 {u.followerCount?.toLocaleString() || 0} followers</small>
                    <small style={{ color: u.currentStreak > 0 ? '#ea580c' : '#94a3b8' }}>
                      🔥 {u.currentStreak || 0}d streak
                    </small>
                  </td>
                  <td>
                    <small>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </small>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      {/* View Profile Action */}
                      <button
                        type="button"
                        className="btn-secondary"
                        title="View Full Profile & Writing Metrics"
                        onClick={() => setModal({ type: 'VIEW_USER_PROFILE', item: u })}
                      >
                        👁️ Profile
                      </button>

                      {/* Change Role Action */}
                      <button
                        type="button"
                        className="btn-secondary"
                        title="Change User Role (USER, REVIEWER, PREMIUM, ADMIN)"
                        onClick={() => setModal({ type: 'CHANGE_USER_ROLE', item: u })}
                      >
                        👑 Role
                      </button>

                      {/* Suspend / Ban / Unban actions */}
                      {u.status === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            className="btn-warning"
                            title="Temporarily suspend account"
                            onClick={() => setModal({ type: 'SUSPEND_USER', item: u })}
                          >
                            🟡 Suspend
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            title="Permanently ban account"
                            onClick={() => setModal({ type: 'BAN_USER', item: u })}
                          >
                            🔴 Ban
                          </button>
                        </>
                      )}

                      {u.status === 'SUSPENDED' && (
                        <>
                          <button
                            type="button"
                            className="btn-success"
                            title="Unban and restore to ACTIVE"
                            onClick={() => executeAction(() => adminApi.unbanUser(u.id))}
                          >
                            🟢 Unban
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            title="Escalate suspension to permanent Ban"
                            onClick={() => setModal({ type: 'BAN_USER', item: u })}
                          >
                            🔴 Ban
                          </button>
                        </>
                      )}

                      {u.status === 'BANNED' && (
                        <button
                          type="button"
                          className="btn-success"
                          title="Unban and restore to ACTIVE"
                          onClick={() => executeAction(() => adminApi.unbanUser(u.id))}
                        >
                          🟢 Unban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserProfileInspector({ user, onClose, executeAction, onOpenModal }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      adminApi.getUserProfile(user.id)
        .then(res => setProfile(res.data))
        .catch(() => setError('Failed to load user profile.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <div>Loading User Profile & Activity Data...</div>
      </div>
    );
  }

  if (error || !profile) {
    return <div style={{ padding: '24px', color: '#dc2626' }}>{error || 'User not found.'}</div>;
  }

  const u = profile.user;
  const poemCount = profile.poemCount || 0;
  const reviewCount = profile.reviewCount || 0;

  return (
    <div className="profile-modal-content">
      <div className="profile-cover">
        <div className="profile-avatar-wrap">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt={u.username || u.email} className="profile-large-avatar" />
          ) : (
            <div className="profile-large-avatar">
              {(u.username || u.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="profile-header-info">
        <h2>
          {u.username || 'Anonymous User'}
          <span className="user-id-badge">ID #{u.id}</span>
          {u.featuredWriter && <span title="Featured Poet">⭐</span>}
        </h2>
        <p>{u.email}</p>
        <div className="profile-badges">
          <span className={`badge role-${u.role}`}>{u.role}</span>
          <span className={`badge status-${u.status}`}>{u.status}</span>
          <span className="audit-notice">🔒 Audit: Profile View Logged</span>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-item">
          <strong>{poemCount}</strong>
          <span>Published Poems</span>
        </div>
        <div className="profile-stat-item">
          <strong>{u.followerCount?.toLocaleString() || 0}</strong>
          <span>Followers</span>
        </div>
        <div className="profile-stat-item">
          <strong style={{ color: '#ea580c' }}>🔥 {u.currentStreak || 0}d</strong>
          <span>Current Streak</span>
        </div>
        <div className="profile-stat-item">
          <strong>{u.longestStreak || 0}d</strong>
          <span>Longest Streak</span>
        </div>
      </div>

      <div className="profile-meta-list">
        <div className="profile-meta-row">
          <span>Member Since</span>
          <strong>{u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</strong>
        </div>
        <div className="profile-meta-row">
          <span>Last Writing Activity</span>
          <strong>{u.lastWritingDate ? new Date(u.lastWritingDate).toLocaleDateString() : 'Never'}</strong>
        </div>
        <div className="profile-meta-row">
          <span>Reviews Handled</span>
          <strong>{reviewCount} reviews</strong>
        </div>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>About / Bio</span>
          <div className="profile-bio-box">
            {u.bio || 'No personal bio provided.'}
          </div>
        </div>
      </div>

      <div className="profile-actions-bar">
        <div className="profile-actions-left">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenModal({ type: 'CHANGE_USER_ROLE', item: u })}
          >
            👑 Change Role
          </button>

          {u.status === 'ACTIVE' && (
            <>
              <button
                type="button"
                className="btn-warning"
                onClick={() => onOpenModal({ type: 'SUSPEND_USER', item: u })}
              >
                🟡 Suspend
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => onOpenModal({ type: 'BAN_USER', item: u })}
              >
                🔴 Ban
              </button>
            </>
          )}

          {u.status === 'SUSPENDED' && (
            <>
              <button
                type="button"
                className="btn-success"
                onClick={() => executeAction(() => adminApi.unbanUser(u.id))}
              >
                🟢 Unban / Reactivate
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => onOpenModal({ type: 'BAN_USER', item: u })}
              >
                🔴 Ban
              </button>
            </>
          )}

          {u.status === 'BANNED' && (
            <button
              type="button"
              className="btn-success"
              onClick={() => executeAction(() => adminApi.unbanUser(u.id))}
            >
              🟢 Unban / Reactivate
            </button>
          )}
        </div>

        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export function SuspendUserModal({ user, onClose, executeAction }) {
  const [reason, setReason] = useState('Violation of platform community standards');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      executeAction(() => adminApi.suspendUser(user.id, reason));
    }}>
      <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#334155' }}>
        You are about to suspend <strong>{user.username || user.email}</strong> (ID #{user.id}). Suspended users cannot publish poems, post comments, or participate in competitions.
      </p>
      <label>
        Reason for Suspension (recorded in Audit Log)
        <textarea
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="State the reason for this suspension..."
        />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-warning">Confirm Suspension</button>
      </div>
    </form>
  );
}

export function BanUserModal({ user, onClose, executeAction }) {
  const [reason, setReason] = useState('Severe spam / terms of service violation');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      executeAction(() => adminApi.banUser(user.id, reason));
    }}>
      <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#991b1b' }}>
        ⚠️ <strong>Warning:</strong> You are about to permanently ban <strong>{user.username || user.email}</strong> (ID #{user.id}). This prevents the account from accessing the platform.
      </p>
      <label>
        Reason for Ban (recorded in Audit Log)
        <textarea
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="State the reason for this permanent ban..."
        />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-danger">Confirm Permanent Ban</button>
      </div>
    </form>
  );
}

export function ChangeRoleModal({ user, onClose, executeAction }) {
  const [selectedRole, setSelectedRole] = useState(user.role || 'USER');

  const roleDescriptions = {
    USER: 'Standard poet. Can read, write, comment, and participate in challenges.',
    REVIEWER: 'Reviewer. Can review and score submitted poems in the peer review system.',
    PREMIUM: 'Premium subscriber. Unlocks premium club, badges, and advanced features.',
    ADMIN: 'Administrator. Full access to Admin Panel, moderation, settings, and user management.'
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      executeAction(() => adminApi.userRole(user.id, selectedRole));
    }}>
      <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#334155' }}>
        Change role for <strong>{user.username || user.email}</strong> (currently: <span className={`badge role-${user.role}`}>{user.role}</span>)
      </p>

      <label>
        Select New Role
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="USER">USER (Standard Poet)</option>
          <option value="REVIEWER">REVIEWER (Review Network)</option>
          <option value="PREMIUM">PREMIUM (Subscriber Club)</option>
          <option value="ADMIN">ADMIN (Full Control Center)</option>
        </select>
      </label>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '12.5px', color: '#475569' }}>
        <strong>Role Privileges:</strong>
        <p style={{ margin: '4px 0 0 0' }}>{roleDescriptions[selectedRole]}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">Update Role</button>
      </div>
    </form>
  );
}
