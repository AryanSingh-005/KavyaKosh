import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/adminApi';
import './SystemSettingsView.css';

const DEFAULT_FLAGS = {
  marketplaceEnabled: true,
  aiStudioEnabled: true,
  competitionsEnabled: true,
  reviewsEnabled: true,
  discussionsEnabled: true,
  userRegistrationEnabled: true,
  commentsEnabled: true,
  maintenanceMode: false,
};

const MODULE_DEFINITIONS = [
  {
    key: 'marketplaceEnabled',
    name: 'Marketplace & Bookstore',
    desc: 'Literary publications, author books, poetry anthologies, and checkout orders.',
    icon: '📚',
  },
  {
    key: 'aiStudioEnabled',
    name: 'AI Studio & Verse Assistant',
    desc: 'Metrical rhythm analyzer, Urdu/Hindi rhyming copilot, and generative stanza assistant.',
    icon: '✨',
  },
  {
    key: 'competitionsEnabled',
    name: 'Competitions & Mushairas',
    desc: 'Timed poetry contests, public and jury voting rounds, and winner reward distributions.',
    icon: '🏆',
  },
  {
    key: 'reviewsEnabled',
    name: 'Critique & Reviewer Network',
    desc: 'Structured peer reviews, certified mentor feedback, and literary scoring rubrics.',
    icon: '🖋️',
  },
  {
    key: 'discussionsEnabled',
    name: 'Community Discussions',
    desc: 'Poet forums, literary debates, ghazal interpretation threads, and community Q&A.',
    icon: '💬',
  },
  {
    key: 'commentsEnabled',
    name: 'Public Poem Comments',
    desc: 'Public reader comments, inline applause, and stanza reactions on published works.',
    icon: '📝',
  },
  {
    key: 'userRegistrationEnabled',
    name: 'User Registrations',
    desc: 'Allow new writers and readers to sign up and establish new poet profiles.',
    icon: '👤',
  },
  {
    key: 'maintenanceMode',
    name: 'Site-Wide Maintenance Mode',
    desc: 'Restricts non-administrator interactions while showing a maintenance advisory.',
    icon: '🚧',
    danger: true,
  },
];

export default function SystemSettingsView({ initialData, onRefresh }) {
  // Settings & Flags state
  const [flags, setFlags] = useState({ ...DEFAULT_FLAGS });
  const [savingFlags, setSavingFlags] = useState(false);

  // Announcement state
  const [announcement, setAnnouncement] = useState({
    enabled: false,
    message: '',
    type: 'info',
    link: '',
    linkText: 'Learn More',
    dismissible: true,
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Featured Poem state
  const [featuredStatus, setFeaturedStatus] = useState(null);
  const [poemsList, setPoemsList] = useState([]);
  const [searchPoemQuery, setSearchPoemQuery] = useState('');
  const [selectedPoemId, setSelectedPoemId] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  // Toast / feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Populate data on mount or when initialData changes
  useEffect(() => {
    if (initialData?.settings?.values) {
      const vals = initialData.settings.values;
      setFlags({
        marketplaceEnabled: vals.marketplaceEnabled !== false,
        aiStudioEnabled: vals.aiStudioEnabled !== false,
        competitionsEnabled: vals.competitionsEnabled !== false,
        reviewsEnabled: vals.reviewsEnabled !== false,
        discussionsEnabled: vals.discussionsEnabled !== false,
        userRegistrationEnabled: vals.userRegistrationEnabled !== false,
        commentsEnabled: vals.commentsEnabled !== false,
        maintenanceMode: Boolean(vals.maintenanceMode),
      });

      setAnnouncement({
        enabled: Boolean(vals.announcementEnabled),
        message: vals.announcementMessage || '',
        type: vals.announcementType || 'info',
        link: vals.announcementLink || '',
        linkText: vals.announcementLinkText || 'Learn More',
        dismissible: vals.announcementDismissible !== false,
      });
    }

    if (initialData?.featured) {
      setFeaturedStatus(initialData.featured);
    } else {
      // Fetch if not present
      adminApi.featuredPoemStatus()
        .then(res => setFeaturedStatus(res.data))
        .catch(() => {});
    }

    if (initialData?.poems && initialData.poems.length > 0) {
      setPoemsList(initialData.poems);
    } else {
      adminApi.allPoems({ status: 'PUBLISHED' })
        .then(res => setPoemsList(res.data || []))
        .catch(() => {});
    }
  }, [initialData]);

  // Count active modules
  const activeModulesCount = useMemo(() => {
    return Object.entries(flags).filter(([k, v]) => k !== 'maintenanceMode' && Boolean(v)).length;
  }, [flags]);

  // Handle Feature Flag Toggle
  const handleToggleFlag = (key) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Save Feature Flags to Backend
  const handleSaveFlags = async () => {
    setSavingFlags(true);
    try {
      await adminApi.saveSettings(flags);
      showToast('Feature flags successfully updated and applied runtime wide!');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save feature flags.', 'error');
    } finally {
      setSavingFlags(false);
    }
  };

  // Save / Broadcast Announcement
  const handleSaveAnnouncement = async () => {
    if (!announcement.message || announcement.message.trim().length === 0) {
      showToast('Announcement message text cannot be empty.', 'error');
      return;
    }
    setSavingAnnouncement(true);
    try {
      const payload = {
        ...announcement,
        enabled: true,
      };
      await adminApi.setAnnouncement(payload);
      setAnnouncement(prev => ({ ...prev, enabled: true }));
      showToast('Site-wide announcement broadcasted successfully!');
      
      // Dispatch client update event
      window.dispatchEvent(new CustomEvent('kavyakosh-announcement-updated', { detail: payload }));
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to broadcast announcement.', 'error');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Clear Announcement
  const handleClearAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      await adminApi.clearAnnouncement();
      setAnnouncement(prev => ({ ...prev, enabled: false, message: '' }));
      showToast('Site-wide announcement cleared and deactivated.');
      
      // Dispatch client clear event
      window.dispatchEvent(new CustomEvent('kavyakosh-announcement-updated', { detail: { enabled: false } }));
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clear announcement.', 'error');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Override Featured Poem
  const handleOverrideFeaturedPoem = async () => {
    if (!selectedPoemId) {
      showToast('Please select a poem from the candidate list below.', 'error');
      return;
    }
    setSavingOverride(true);
    try {
      const res = await adminApi.overrideFeaturedPoem(selectedPoemId, overrideNote);
      setFeaturedStatus(res.data);
      setSelectedPoemId('');
      setOverrideNote('');
      showToast("Daily Featured Poem manually overridden successfully!");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to set featured poem override.', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  // Clear Featured Poem Override
  const handleClearOverride = async () => {
    setSavingOverride(true);
    try {
      const res = await adminApi.clearFeaturedPoemOverride();
      setFeaturedStatus(res.data);
      showToast('Manual override cleared. Restored automated daily rotation.');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clear manual override.', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  // Trigger Automatic Job Selection Immediately
  const handleTriggerJob = async () => {
    setSavingOverride(true);
    try {
      const res = await adminApi.triggerFeaturedPoemSelection();
      setFeaturedStatus(res.data);
      showToast('Daily rotation algorithm executed. New poem selected!');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to trigger selection algorithm.', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  // Filter poems for the picker
  const filteredPoems = useMemo(() => {
    if (!poemsList || poemsList.length === 0) return [];
    if (!searchPoemQuery.trim()) return poemsList.slice(0, 15);
    const q = searchPoemQuery.toLowerCase();
    return poemsList.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.author?.username && p.author.username.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [poemsList, searchPoemQuery]);

  const currentPoem = featuredStatus?.poem;
  const isOverrideActive = Boolean(featuredStatus?.isOverride);

  return (
    <div className="settings-view">
      {/* Toast Notification */}
      {toast && (
        <div className={`settings-toast settings-toast--${toast.type}`} role="status">
          <span>{toast.message}</span>
          <button className="settings-toast__close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="settings-header">
        <div>
          <h1 className="settings-header__title">System & Platform Settings</h1>
          <p className="settings-header__desc">
            Manage runtime module feature flags, manually curate or automate the Poem of the Day,
            and broadcast urgent or celebratory site-wide banners across KavyaKosh.
          </p>
        </div>

        <div className="settings-header__badges">
          <span className="settings-pill settings-pill--emerald">
            <span className="pulse-dot" />
            {activeModulesCount} / 7 Modules Active
          </span>
          <span className={`settings-pill ${announcement.enabled ? 'settings-pill--amber' : ''}`}>
            {announcement.enabled ? '📢 Broadcast Live' : '⚪ Banner Idle'}
          </span>
          <span className={`settings-pill ${isOverrideActive ? 'settings-pill--purple' : ''}`}>
            {isOverrideActive ? '⭐ Override Active' : '⏰ Auto Rotation'}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PILLAR 1: FEATURE FLAGS
          ───────────────────────────────────────────────────────────── */}
      <section className="settings-card" aria-label="Feature Flags">
        <div className="settings-card__header">
          <div className="settings-card__title-group">
            <h2 className="settings-card__title">
              <span>🚩</span> Feature Flags & Module Toggles
            </h2>
            <p className="settings-card__subtitle">
              Enable or disable platform capabilities dynamically without redeploying code.
            </p>
          </div>

          <button
            type="button"
            className="btn-solid btn-solid--primary"
            onClick={handleSaveFlags}
            disabled={savingFlags}
          >
            {savingFlags ? 'Saving Flags...' : 'Save Feature Flags'}
          </button>
        </div>

        <div className="flags-grid">
          {MODULE_DEFINITIONS.map(mod => {
            const isChecked = flags[mod.key] !== false;
            return (
              <div
                key={mod.key}
                className={`flag-card ${!isChecked ? 'flag-card--disabled' : ''}`}
              >
                <div className="flag-card__left">
                  <div className="flag-card__icon">{mod.icon}</div>
                  <div className="flag-card__info">
                    <h3 className="flag-card__name">{mod.name}</h3>
                    <p className="flag-card__desc">{mod.desc}</p>
                    <span className={`flag-card__status ${isChecked ? 'flag-card__status--on' : 'flag-card__status--off'}`}>
                      {isChecked ? '● Active' : '○ Paused'}
                    </span>
                  </div>
                </div>

                <label className="switch" title={`Toggle ${mod.name}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleFlag(mod.key)}
                  />
                  <span className="switch__slider" />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PILLAR 2: DAILY FEATURED POEM CURATION
          ───────────────────────────────────────────────────────────── */}
      <section className="settings-card" aria-label="Daily Featured Poem Curation">
        <div className="settings-card__header">
          <div className="settings-card__title-group">
            <h2 className="settings-card__title">
              <span>🌟</span> Daily Featured Poem Curation (Poem of the Day)
            </h2>
            <p className="settings-card__subtitle">
              Showcase exceptional verses on the homepage hero section. Choose between manual editorial override or automatic midnight rotation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-solid btn-solid--ghost"
              onClick={handleTriggerJob}
              disabled={savingOverride}
              title="Runs selection algorithm to pick a top poem now"
            >
              🔄 Trigger Auto-Selection Now
            </button>
            {isOverrideActive && (
              <button
                type="button"
                className="btn-solid btn-solid--danger"
                onClick={handleClearOverride}
                disabled={savingOverride}
              >
                Revert to Auto Rotation
              </button>
            )}
          </div>
        </div>

        <div className="featured-curation">
          {/* Currently Active Showcase */}
          <div className="featured-showcase">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`featured-showcase__tag ${isOverrideActive ? 'featured-showcase__tag--override' : 'featured-showcase__tag--auto'}`}>
                {isOverrideActive ? '⭐ Manual Override Active' : '⏰ Automated Daily Rotation'}
              </span>
              {currentPoem?.category && (
                <span className="featured-showcase__category">{currentPoem.category}</span>
              )}
            </div>

            {currentPoem ? (
              <>
                <h3 className="featured-showcase__title">{currentPoem.title}</h3>

                <div className="featured-showcase__author">
                  <div className="featured-showcase__avatar">
                    {currentPoem.author?.username ? currentPoem.author.username[0].toUpperCase() : 'K'}
                  </div>
                  <div className="featured-showcase__author-info">
                    <span className="featured-showcase__author-name">
                      @{currentPoem.author?.username || 'KavyaKoshPoet'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {currentPoem.language || 'Hindi / Urdu'}
                    </span>
                  </div>
                </div>

                <blockquote className="featured-showcase__excerpt">
                  "{currentPoem.excerpt || currentPoem.content?.slice(0, 160) || 'No excerpt available.'}…"
                </blockquote>

                {isOverrideActive && featuredStatus?.overrideNote && (
                  <div style={{ fontSize: '12px', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid #f59e0b', color: '#fef3c7' }}>
                    <strong>Curator Note:</strong> {featuredStatus.overrideNote}
                  </div>
                )}

                <div className="featured-showcase__meta">
                  <span>♥ {currentPoem.likesCount || 0} likes</span>
                  <span>👁 {currentPoem.viewsCount || 0} views</span>
                  <span>💬 {currentPoem.commentsCount || 0} comments</span>
                  {featuredStatus?.updatedAt && (
                    <span>Curated: {new Date(featuredStatus.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                <p>No featured poem currently active. Select a poem from the right or trigger auto-selection.</p>
              </div>
            )}
          </div>

          {/* Search & Override Drawer */}
          <div className="featured-picker">
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
              Search & Override with Published Poem:
            </label>

            <div className="picker-search">
              <input
                type="text"
                className="picker-search__input"
                placeholder="Search poems by title, poet username, excerpt..."
                value={searchPoemQuery}
                onChange={e => setSearchPoemQuery(e.target.value)}
              />
            </div>

            <div className="picker-poems-list">
              {filteredPoems.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No published poems matched your query.
                </div>
              ) : (
                filteredPoems.map(p => {
                  const isSelected = selectedPoemId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`picker-poem-item ${isSelected ? 'picker-poem-item--selected' : ''}`}
                      onClick={() => setSelectedPoemId(p.id)}
                    >
                      <div>
                        <div className="picker-poem-item__title">{p.title}</div>
                        <div className="picker-poem-item__sub">
                          @{p.author?.username || 'Unknown'} · {p.category || 'Verse'} · ♥ {p.likesCount || 0}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="overridePoemRadio"
                        checked={isSelected}
                        onChange={() => setSelectedPoemId(p.id)}
                      />
                    </div>
                  );
                })
              )}
            </div>

            <input
              type="text"
              className="picker-note-input"
              placeholder="Editorial Note / Reason for Feature (e.g. Special Eid Feature, World Poetry Day Pick)..."
              value={overrideNote}
              onChange={e => setOverrideNote(e.target.value)}
            />

            <button
              type="button"
              className="btn-solid btn-solid--gold"
              onClick={handleOverrideFeaturedPoem}
              disabled={!selectedPoemId || savingOverride}
              style={{ justifyContent: 'center' }}
            >
              {savingOverride ? 'Applying Override...' : '⭐ Set as Poem of the Day'}
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PILLAR 3: SITE-WIDE ANNOUNCEMENT BANNER
          ───────────────────────────────────────────────────────────── */}
      <section className="settings-card" aria-label="Site-Wide Announcement Banner">
        <div className="settings-card__header">
          <div className="settings-card__title-group">
            <h2 className="settings-card__title">
              <span>📢</span> Site-Wide Announcement Banner
            </h2>
            <p className="settings-card__subtitle">
              Broadcast an immediate visual announcement at the top of every page for festivals, scheduled downtime, or competitions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label className="checkbox-label" style={{ fontWeight: '700' }}>
              <input
                type="checkbox"
                checked={announcement.enabled}
                onChange={e => setAnnouncement(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Live Broadcast Active
            </label>
          </div>
        </div>

        <div className="announcement-config">
          {/* Live Interactive Preview */}
          <div className="preview-box">
            <span className="preview-box__label">Live Banner Preview:</span>
            <div className="preview-box__canvas">
              <aside
                className={`announcement-banner announcement-banner--${announcement.type}`}
                role="alert"
                style={{ position: 'relative', boxShadow: 'none' }}
              >
                <div className="announcement-banner__container">
                  <span className="announcement-banner__icon">
                    {announcement.type === 'celebration' && '🎉'}
                    {announcement.type === 'warning' && '⚠️'}
                    {announcement.type === 'urgent' && '🚨'}
                    {announcement.type === 'info' && 'ℹ️'}
                  </span>
                  <div className="announcement-banner__content">
                    <span className="announcement-banner__tag">
                      {announcement.type === 'celebration' ? 'Special Celebration' :
                       announcement.type === 'warning' ? 'Notice' :
                       announcement.type === 'urgent' ? 'Urgent Alert' : 'Announcement'}
                    </span>
                    <span className="announcement-banner__message">
                      {announcement.message || 'Your announcement message will display here in real-time...'}
                    </span>
                    {announcement.link && (
                      <span className="announcement-banner__btn">
                        {announcement.linkText || 'Learn More'} →
                      </span>
                    )}
                  </div>
                  {announcement.dismissible && (
                    <span className="announcement-banner__close">×</span>
                  )}
                </div>
              </aside>
            </div>
          </div>

          {/* Style Type Selector */}
          <div className="form-group">
            <label>Announcement Style & Tone:</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${announcement.type === 'info' ? 'type-btn--active-info' : ''}`}
                onClick={() => setAnnouncement(prev => ({ ...prev, type: 'info' }))}
              >
                ℹ️ Information
              </button>
              <button
                type="button"
                className={`type-btn ${announcement.type === 'celebration' ? 'type-btn--active-celebration' : ''}`}
                onClick={() => setAnnouncement(prev => ({ ...prev, type: 'celebration' }))}
              >
                🎉 Celebration
              </button>
              <button
                type="button"
                className={`type-btn ${announcement.type === 'warning' ? 'type-btn--active-warning' : ''}`}
                onClick={() => setAnnouncement(prev => ({ ...prev, type: 'warning' }))}
              >
                ⚠️ Warning / Maintenance
              </button>
              <button
                type="button"
                className={`type-btn ${announcement.type === 'urgent' ? 'type-btn--active-urgent' : ''}`}
                onClick={() => setAnnouncement(prev => ({ ...prev, type: 'urgent' }))}
              >
                🚨 Critical Alert
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Announcement Broadcast Message:</label>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {announcement.message.length} / 250 characters
              </span>
            </div>
            <textarea
              maxLength={250}
              placeholder="e.g. 🎉 The 2026 Annual KavyaKosh Ghazal Mushaira is officially live! Submit your ghazals before Sunday midnight to win ₹15,000 in prizes."
              value={announcement.message}
              onChange={e => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>

          {/* Action Link & Text */}
          <div className="form-row">
            <div className="form-group">
              <label>Action Link URL / Route (Optional):</label>
              <input
                type="text"
                placeholder="e.g. /competitions or https://..."
                value={announcement.link}
                onChange={e => setAnnouncement(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Action Button Label:</label>
              <input
                type="text"
                placeholder="e.g. View Competitions, Register Now"
                value={announcement.linkText}
                onChange={e => setAnnouncement(prev => ({ ...prev, linkText: e.target.value }))}
              />
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={announcement.dismissible}
              onChange={e => setAnnouncement(prev => ({ ...prev, dismissible: e.target.checked }))}
            />
            Allow users to dismiss banner during their browsing session
          </label>

          <div className="action-row">
            <button
              type="button"
              className="btn-solid btn-solid--danger"
              onClick={handleClearAnnouncement}
              disabled={savingAnnouncement || (!announcement.enabled && !announcement.message)}
            >
              Clear & Deactivate Announcement
            </button>

            <button
              type="button"
              className="btn-solid btn-solid--primary"
              onClick={handleSaveAnnouncement}
              disabled={savingAnnouncement}
            >
              {savingAnnouncement ? 'Broadcasting...' : '📢 Broadcast Site-Wide Announcement'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
