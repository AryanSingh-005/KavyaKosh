import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import AdminGuard from '../../components/auth/AdminGuard';
import {
  UserManagementView,
  UserProfileInspector,
  SuspendUserModal,
  BanUserModal,
  ChangeRoleModal
} from '../../components/admin/UserManagementView';
import { ContentModerationView } from '../../components/admin/ContentModerationView';
import { ReviewerManagementView } from '../../components/admin/ReviewerManagementView';
import { CompetitionManagementView } from '../../components/admin/CompetitionManagementView';
import { MarketplaceManagementView } from '../../components/admin/MarketplaceManagementView';
import { SiteAnalyticsDashboardView } from '../../components/admin/SiteAnalyticsDashboardView';
import SystemSettingsView from '../../components/admin/SystemSettingsView';
import AuditLogViewer from '../../components/admin/AuditLogViewer';
import './AdminPage.css';

const sections = [
  ['overview', 'Analytics Dashboard', '📊'],
  ['users', 'User Management', '👥'],
  ['moderation', 'Content Moderation', '🛡️'],
  ['reviewers', 'Reviewer Oversight', '✍️'],
  ['competitions', 'Competition Management', '🏆'],
  ['marketplace', 'Marketplace Management', '🛍️'],
  ['subscriptions', 'Subscription Oversight', '⭐'],
  ['settings', 'System Settings', '⚙️'],
  ['audit', 'Audit Log Viewer', '📋'],
];

const generateDemoAnalyticsData = (range = '30d') => {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? 180 : 30;
  const trends = [];
  const now = new Date();
  let cumLikes = 12000;
  let cumComments = 2400;
  let cumReviews = 450;
  let cumRevenue = 32000;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayOfWeek = d.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
    const likes = Math.round((140 + Math.sin(i * 0.4) * 50 + (i % 5) * 12) * weekendBoost);
    const comments = Math.round((28 + Math.cos(i * 0.3) * 12 + (i % 4) * 5) * weekendBoost);
    const reviews = Math.round(6 + (i % 3) * 3 + Math.sin(i * 0.5) * 2);
    const views = likes * 4 + comments * 6;
    const dailyRev = (i % 3 === 0 ? 1299 : i % 2 === 0 ? 849 : 399) + (i % 7 === 0 ? 499 : 0);

    cumLikes += likes;
    cumComments += comments;
    cumReviews += reviews;
    cumRevenue += dailyRev;

    trends.push({
      date: dateStr,
      label,
      day,
      likes,
      comments,
      reviews,
      views,
      revenue: dailyRev,
      marketplaceRevenue: dailyRev > 499 ? dailyRev - 199 : dailyRev,
      subscriptionRevenue: dailyRev > 499 ? 199 : 0,
      poems: Math.round(1 + (i % 2)),
      users: Math.round(2 + (i % 4)),
      cumulativeLikes: cumLikes,
      cumulativeComments: cumComments,
      cumulativeReviews: cumReviews,
      cumulativeRevenue: cumRevenue,
    });
  }

  return {
    totalUsers: 24850,
    poemsPublished: 1420,
    activeCompetitions: 3,
    revenue: 48950,
    marketplaceRevenue: 32450,
    subscriptionRevenue: 16500,
    likes: 42890,
    comments: 6340,
    reviews: 840,
    views: 284500,
    range,
    engagementTrends: trends,
    categoryDistribution: [
      { category: 'Ghazal', count: 540, percentage: 38 },
      { category: 'Nazm', count: 355, percentage: 25 },
      { category: 'Doha', count: 213, percentage: 15 },
      { category: 'Free Verse', count: 170, needle: 12, percentage: 12 },
      { category: 'Sher', count: 85, percentage: 6 },
      { category: 'Kavita', count: 57, percentage: 4 },
    ],
    languageDistribution: [
      { language: 'Hindi', count: 653, percentage: 46 },
      { language: 'Urdu', count: 398, percentage: 28 },
      { language: 'English', count: 255, percentage: 18 },
      { language: 'Punjabi', count: 114, percentage: 8 },
    ],
    activeCompetitionsList: [
      {
        id: 1,
        title: 'Monsoon Muses',
        theme: 'Rain & Longing',
        participantCount: 1247,
        daysLeft: 7,
        prizeDescription: '₹5,000 cash prize + Featured on KavyaKosh home',
      },
      {
        id: 2,
        title: 'Doha Duel — Kabir Tribute',
        theme: 'Wisdom & Philosophy',
        participantCount: 834,
        daysLeft: 14,
        prizeDescription: 'Handcrafted poetry journal + ₹3,000',
      },
      {
        id: 3,
        title: 'Urban Loneliness',
        theme: 'Solitude & Modernity',
        participantCount: 562,
        daysLeft: 21,
        prizeDescription: '1-year KavyaKosh Premium subscription',
      },
    ],
    topPoems: [
      { id: '1', title: 'Hazaaron Khwahishen Aisi', author: 'MirzaGhalib', category: 'Ghazal', likesCount: 4821, commentsCount: 312, viewsCount: 18400, trendingScore: 98.7 },
      { id: '2', title: 'Tere Bina Zindagi Se', author: 'Gulzar', category: 'Nazm', likesCount: 6203, commentsCount: 487, viewsCount: 24100, trendingScore: 97.2 },
      { id: '3', title: 'Inquilab Zindabad', author: 'PriyaVerse', category: 'Nazm', likesCount: 4321, commentsCount: 412, viewsCount: 17400, trendingScore: 96.2 },
      { id: '4', title: 'Aj Aakhaan Waris Shah Nu', author: 'AmritaPritam', category: 'Punjabi Kavita', likesCount: 5419, commentsCount: 398, viewsCount: 21300, trendingScore: 95.8 },
      { id: '5', title: 'Maati Kahe Kumhar Se', author: 'KabirDas', category: 'Doha', likesCount: 3876, commentsCount: 224, viewsCount: 15600, trendingScore: 93.1 },
    ],
    userBreakdown: {
      total: 24850,
      active: 24350,
      suspended: 320,
      banned: 180,
      writers: 18400,
      reviewers: 1240,
      premium: 4800,
      admins: 8,
    },
    revenueBreakdown: {
      total: 48950,
      marketplace: 32450,
      subscriptions: 16500,
      completedOrdersCount: 48,
      activeSubscribersCount: 84,
      liteSubscribers: 56,
      proSubscribers: 28,
    },
    recentActivity: [
      { type: 'REVIEW', title: "Review on 'Hazaaron Khwahishen Aisi'", actor: 'PriyaVerse', status: 'COMPLETED' },
      { type: 'COMMENT', title: 'Comment: "Ghalib\'s depth in this couplet is unmatched..."', actor: 'Gulzar' },
      { type: 'ORDER', title: 'Order #ORD-849 (INR 849)', actor: 'MirzaGhalib' },
    ],
  };
};

function StatCard({ label, value, subtext, icon }) {
  return (
    <div className="admin-stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <strong className="stat-value">{value ?? 0}</strong>
      {subtext && <small className="stat-subtext">{subtext}</small>}
    </div>
  );
}

export default function AdminPage() {
  const [section, setSection] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [modal, setModal] = useState(null); // { type, item }
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const parts = location.pathname.split('/');
    let requested = parts[2] || 'overview';
    if (requested === 'analytics') requested = 'overview';
    if (sections.some(([id]) => id === requested)) {
      setSection(requested);
    }
  }, [location.pathname]);

  const loadData = async (name = section, searchQ = query, statusF = statusFilter, roleF = roleFilter, rangeVal = timeRange) => {
    setLoadingData(true);
    try {
      let res;
      switch (name) {
        case 'overview':
          try {
            res = await adminApi.dashboard({ range: rangeVal });
          } catch {
            res = { data: generateDemoAnalyticsData(rangeVal) };
          }
          break;
        case 'users':
          res = await adminApi.users({ q: searchQ, status: statusF, role: roleF });
          break;
        case 'moderation':
          res = await adminApi.flags();
          break;
        case 'reviewers': {
          const [revUsers, revHistory] = await Promise.all([adminApi.reviewers(), adminApi.reviews()]);
          res = { data: { reviewers: revUsers.data, reviews: revHistory.data } };
          break;
        }
        case 'competitions':
          res = await adminApi.competitions();
          break;
        case 'marketplace': {
          const [listings, orders] = await Promise.all([adminApi.listings(), adminApi.orders()]);
          res = { data: { listings: listings.data, orders: orders.data } };
          break;
        }
        case 'subscriptions':
          res = await adminApi.subscriptions();
          break;
        case 'settings': {
          try {
            const [settingsRes, featuredRes, poemsRes] = await Promise.allSettled([
              adminApi.settings(),
              adminApi.featuredPoemStatus(),
              adminApi.allPoems({ status: 'PUBLISHED' }),
            ]);
            res = {
              data: {
                settings: settingsRes.status === 'fulfilled' ? settingsRes.value.data : { values: {} },
                featured: featuredRes.status === 'fulfilled' ? featuredRes.value.data : null,
                poems: poemsRes.status === 'fulfilled' ? (poemsRes.value.data || []) : [],
              }
            };
          } catch {
            res = {
              data: {
                settings: { values: {} },
                featured: null,
                poems: [],
              }
            };
          }
          break;
        }
        case 'audit':
          res = await adminApi.audit({ q: searchQ });
          break;
        default:
          res = { data: null };
      }
      setData(res.data);
    } catch (err) {
      setData({ error: err.response?.status === 403 ? 'Access Denied: Admin authority required.' : 'Failed to load module data.' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData(section, query, statusFilter, roleFilter, timeRange);
  }, [section]);

  const handleSelect = (name) => {
    setSection(name);
    setQuery('');
    setStatusFilter('');
    setRoleFilter('');
    navigate(`/admin/${name}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData(section, query, statusFilter, roleFilter);
  };

  const executeAction = async (asyncFn) => {
    try {
      await asyncFn();
      setModal(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed. Check permissions.');
    }
  };

  return (
    <AdminGuard>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="brand-logo">🏛️ KavyaKosh</div>
            <small>CONTROL CENTER</small>
          </div>
          <nav className="admin-nav">
            {sections.map(([id, label, icon]) => (
              <NavLink
                key={id}
                to={`/admin/${id}`}
                onClick={() => handleSelect(id)}
                className={section === id ? 'active' : ''}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-user-info">
              <span>Logged as: <strong>{user?.username || user?.email}</strong></span>
              <small className="badge-admin">ADMINISTRATOR</small>
            </div>
            <button className="admin-exit" onClick={() => navigate('/')}>
              🚪 Return to Site
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <div>
              <p className="admin-kicker">Admin System / Surface</p>
              <h1>{sections.find(([id]) => id === section)?.[1]}</h1>
            </div>
            
            <form className="admin-toolbar" onSubmit={handleSearch}>
              {section === 'users' && (
                <>
                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); loadData(section, query, e.target.value, roleFilter); }}>
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                  <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); loadData(section, query, statusFilter, e.target.value); }}>
                    <option value="">All Roles</option>
                    <option value="USER">User</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </>
              )}
              
              {(section === 'users' || section === 'audit') && (
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Filter records..."
                />
              )}
              
              <button type="submit" className="btn-primary">
                {loadingData ? 'Loading...' : 'Refresh'}
              </button>
            </form>
          </header>

          {data?.error ? (
            <div className="admin-alert error">{data.error}</div>
          ) : (
            <ModuleView
              section={section}
              data={data}
              executeAction={executeAction}
              setModal={setModal}
              timeRange={timeRange}
              onRangeChange={(newRange) => {
                setTimeRange(newRange);
                loadData(section, query, statusFilter, roleFilter, newRange);
              }}
              loading={loadingData}
              onRefresh={() => loadData(section, query, statusFilter, roleFilter, timeRange)}
            />
          )}

          {modal && (
            <AdminModal
              modal={modal}
              onClose={() => setModal(null)}
              executeAction={executeAction}
              onOpenModal={setModal}
            />
          )}
        </main>
      </div>
    </AdminGuard>
  );
}

function ModuleView({ section, data, executeAction, setModal, timeRange, onRangeChange, loading, onRefresh }) {
  if (section === 'overview') {
    return (
      <SiteAnalyticsDashboardView
        data={data}
        executeAction={executeAction}
        setModal={setModal}
        timeRange={timeRange}
        onRangeChange={onRangeChange}
        loading={loading}
        onRefresh={onRefresh}
      />
    );
  }

  if (section === 'users') {
    return (
      <UserManagementView
        data={data}
        executeAction={executeAction}
        setModal={setModal}
      />
    );
  }

  if (section === 'moderation') {
    return (
      <ContentModerationView
        executeAction={executeAction}
        setModal={setModal}
      />
    );
  }

  if (section === 'reviewers') {
    return (
      <ReviewerManagementView
        executeAction={executeAction}
      />
    );
  }

  if (section === 'competitions') {
    return (
      <CompetitionManagementView
        executeAction={executeAction}
      />
    );
  }

  if (section === 'marketplace') {
    return (
      <MarketplaceManagementView
        executeAction={executeAction}
      />
    );
  }

  if (section === 'subscriptions') {
    return (
      <div>
        <h2>Active & Historical Subscriptions</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscriber Email</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map(row => {
                const sub = row.subscription;
                const u = row.user;
                return (
                  <tr key={sub.id}>
                    <td>
                      <strong>{u?.username || u?.email || sub.userId}</strong>
                      <small>{u?.email}</small>
                    </td>
                    <td><span className="badge role-PREMIUM">{sub.tier}</span></td>
                    <td><span className={`badge status-${sub.status}`}>{sub.status}</span></td>
                    <td className="actions-cell">
                      {sub.status !== 'CANCELLED' && (
                        <>
                          <button className="btn-secondary" onClick={() => executeAction(() => adminApi.cancelSubscription(sub.id, false))}>
                            Cancel
                          </button>
                          <button className="btn-danger" onClick={() => executeAction(() => adminApi.cancelSubscription(sub.id, true))}>
                            Cancel & Refund
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section === 'settings') {
    return (
      <SystemSettingsView
        initialData={data}
        onRefresh={() => loadData('settings')}
      />
    );
  }

  if (section === 'audit') {
    return (
      <AuditLogViewer
        logs={Array.isArray(data) ? data : []}
        onRefresh={() => loadData('audit')}
        loading={loadingData}
      />
    );
  }

  return null;
}

function SettingsForm({ data, executeAction }) {
  const [values, setValues] = useState(data?.values || {});

  useEffect(() => {
    setValues(data?.values || {});
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeAction(() => adminApi.saveSettings(values));
  };

  return (
    <form className="admin-panel settings-form" onSubmit={handleSubmit}>
      <h2>Site-Wide System Configuration</h2>
      
      <label>
        Announcement Banner Message
        <textarea
          value={values.announcement || ''}
          onChange={e => setValues({ ...values, announcement: e.target.value })}
          placeholder="Enter site-wide announcement text..."
        />
      </label>

      <label>
        Daily Featured Poem ID
        <input
          type="text"
          value={values.featuredPoemId || ''}
          onChange={e => setValues({ ...values, featuredPoemId: e.target.value })}
          placeholder="e.g. 64f102..."
        />
      </label>

      <div className="toggles-group">
        <h3>Feature Toggles</h3>
        <label className="toggle">
          <input
            type="checkbox"
            checked={values.marketplaceEnabled !== false}
            onChange={e => setValues({ ...values, marketplaceEnabled: e.target.checked })}
          />
          Enable Marketplace Module
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={values.aiStudioEnabled !== false}
            onChange={e => setValues({ ...values, aiStudioEnabled: e.target.checked })}
          />
          Enable AI Studio Module
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={values.competitionsEnabled !== false}
            onChange={e => setValues({ ...values, competitionsEnabled: e.target.checked })}
          />
          Enable Competitions Module
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={values.reviewsEnabled !== false}
            onChange={e => setValues({ ...values, reviewsEnabled: e.target.checked })}
          />
          Enable Reviewer Network
        </label>
      </div>

      <button type="submit" className="btn-primary">Save System Settings</button>
    </form>
  );
}

function AdminModal({ modal, onClose, executeAction, onOpenModal }) {
  const { type, item } = modal;

  if (type === 'VIEW_USER_PROFILE') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()}>
          <UserProfileInspector
            user={item}
            onClose={onClose}
            executeAction={executeAction}
            onOpenModal={onOpenModal}
          />
        </div>
      </div>
    );
  }

  // Form states
  const [targetType, setTargetType] = useState('POEM');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  
  const [score, setScore] = useState(item?.overallScore || 5.0);

  const [compForm, setCompForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    theme: item?.theme || '',
    prizeDescription: item?.prizeDescription || '',
    deadline: item?.deadline || '',
    status: item?.status || 'ACTIVE'
  });

  const [listingForm, setListingForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    author: item?.author || '',
    type: item?.type || 'BOOK'
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(false);

  useEffect(() => {
    if (type === 'VIEW_LEADERBOARD' && item?.id) {
      setLoadingLb(true);
      adminApi.leaderboard(item.id)
        .then(res => setLeaderboard(res.data))
        .catch(() => setLeaderboard([]))
        .finally(() => setLoadingLb(false));
    }
  }, [type, item]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>
            {type === 'SUSPEND_USER' && `🟡 Suspend User: ${item?.username || item?.email}`}
            {type === 'BAN_USER' && `🔴 Ban User: ${item?.username || item?.email}`}
            {type === 'CHANGE_USER_ROLE' && `👑 Change Role: ${item?.username || item?.email}`}
            {type === 'MANUAL_FLAG' && 'Flag Content Manually'}
            {type === 'OVERRIDE_SCORE' && 'Override Review Score'}
            {type === 'CREATE_COMPETITION' && 'Create Competition'}
            {type === 'EDIT_COMPETITION' && 'Edit Competition'}
            {type === 'VIEW_LEADERBOARD' && `Leaderboard: ${item.title}`}
            {type === 'ADD_LISTING' && 'Add Marketplace Listing'}
            {type === 'EDIT_LISTING' && 'Edit Marketplace Listing'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          {type === 'SUSPEND_USER' && (
            <SuspendUserModal
              user={item}
              onClose={onClose}
              executeAction={executeAction}
            />
          )}

          {type === 'BAN_USER' && (
            <BanUserModal
              user={item}
              onClose={onClose}
              executeAction={executeAction}
            />
          )}

          {type === 'CHANGE_USER_ROLE' && (
            <ChangeRoleModal
              user={item}
              onClose={onClose}
              executeAction={executeAction}
            />
          )}
          {type === 'MANUAL_FLAG' && (
            <form onSubmit={(e) => { e.preventDefault(); executeAction(() => adminApi.flag({ targetType, targetId, reason })); }}>
              <label>Target Type
                <select value={targetType} onChange={e => setTargetType(e.target.value)}>
                  <option value="POEM">POEM</option>
                  <option value="COMMENT">COMMENT</option>
                </select>
              </label>
              <label>Target Record ID
                <input required value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Enter ID..." />
              </label>
              <label>Reason for Flagging
                <textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason..." />
              </label>
              <button type="submit" className="btn-primary">Submit Flag</button>
            </form>
          )}

          {type === 'OVERRIDE_SCORE' && (
            <form onSubmit={(e) => { e.preventDefault(); executeAction(() => adminApi.reviewScore(item.id, Number(score))); }}>
              <label>Review ID: <strong>{item.id}</strong></label>
              <label>New Overall Score (1.0 - 10.0)
                <input type="number" step="0.1" min="1" max="10" value={score} onChange={e => setScore(e.target.value)} />
              </label>
              <button type="submit" className="btn-primary">Update Score</button>
            </form>
          )}

          {(type === 'CREATE_COMPETITION' || type === 'EDIT_COMPETITION') && (
            <form onSubmit={(e) => { e.preventDefault(); executeAction(() => adminApi.saveCompetition(compForm, item?.id)); }}>
              <label>Title
                <input required value={compForm.title} onChange={e => setCompForm({ ...compForm, title: e.target.value })} />
              </label>
              <label>Theme
                <input value={compForm.theme} onChange={e => setCompForm({ ...compForm, theme: e.target.value })} />
              </label>
              <label>Prize Description
                <input value={compForm.prizeDescription} onChange={e => setCompForm({ ...compForm, prizeDescription: e.target.value })} />
              </label>
              <label>Deadline (YYYY-MM-THH:mm)
                <input type="datetime-local" value={compForm.deadline ? compForm.deadline.substring(0, 16) : ''} onChange={e => setCompForm({ ...compForm, deadline: e.target.value })} />
              </label>
              <label>Description
                <textarea value={compForm.description} onChange={e => setCompForm({ ...compForm, description: e.target.value })} />
              </label>
              <button type="submit" className="btn-primary">Save Competition</button>
            </form>
          )}

          {type === 'VIEW_LEADERBOARD' && (
            <div>
              {loadingLb ? <p>Loading leaderboard...</p> : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Score</th>
                      <th>Rank</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr><td colSpan="4">No submissions found.</td></tr>
                    ) : (
                      leaderboard.map(sub => (
                        <tr key={sub.id}>
                          <td><strong>{sub.id}</strong></td>
                          <td>{sub.totalScore}</td>
                          <td>{sub.rank ? `Rank #${sub.rank}` : 'Unranked'}</td>
                          <td>
                            <button className="btn-success" onClick={() => executeAction(() => adminApi.publishWinner(sub.id, 1))}>Winner #1</button>
                            <button className="btn-secondary" onClick={() => executeAction(() => adminApi.publishWinner(sub.id, 2))}>Rank #2</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {(type === 'ADD_LISTING' || type === 'EDIT_LISTING') && (
            <form onSubmit={(e) => { e.preventDefault(); executeAction(() => adminApi.saveListing(listingForm, item?.id)); }}>
              <label>Name
                <input required value={listingForm.name} onChange={e => setListingForm({ ...listingForm, name: e.target.value })} />
              </label>
              <label>Type
                <input value={listingForm.type} onChange={e => setListingForm({ ...listingForm, type: e.target.value })} />
              </label>
              <label>Price (₹)
                <input type="number" required value={listingForm.price} onChange={e => setListingForm({ ...listingForm, price: e.target.value })} />
              </label>
              <label>Author
                <input value={listingForm.author} onChange={e => setListingForm({ ...listingForm, author: e.target.value })} />
              </label>
              <label>Description
                <textarea value={listingForm.description} onChange={e => setListingForm({ ...listingForm, description: e.target.value })} />
              </label>
              <button type="submit" className="btn-primary">Save Listing</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
