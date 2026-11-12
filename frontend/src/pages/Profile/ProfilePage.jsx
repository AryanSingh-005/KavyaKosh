import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InteractivePoemCard from '../../components/publish/InteractivePoemCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { fetchUserProfile } from '../../api/profileApi';
import { toggleFollow } from '../../api/communityApi';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80';

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('POEMS'); // POEMS | DISCUSSIONS | REVIEWS | BOOKS | SAVED
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const targetUser = username || user?.username || 'Anonymous';
  const isOwnProfile = user && (user.username === targetUser || (!username && user.username));

  useEffect(() => {
    loadProfile();
  }, [username, user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile(targetUser);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('User profile not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      const newFollowState = await toggleFollow(profile.username);
      setProfile((prev) => ({
        ...prev,
        isFollowing: newFollowState,
        followersCount: newFollowState ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1)
      }));
    } catch (err) {
      console.error('Failed to toggle follow state:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-loading">
        <div className="loading-spinner"></div>
        <p>Gathering poet stats & literary profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page-error">
        <h2>Poet Profile Not Found</h2>
        <p>The requested writer profile does not exist or has been removed.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/explore')}>
          Explore Poems
        </button>
      </div>
    );
  }

  return (
    <div className="profile-dashboard-page">
      
      {/* ── 1. Hero Cover Banner ── */}
      <div
        className="profile-cover-banner"
        style={{ backgroundImage: `url(${profile.coverImageUrl || DEFAULT_COVER})` }}
      >
        <div className="cover-overlay-gradient"></div>
        {isOwnProfile && (
          <button
            type="button"
            className="edit-cover-btn"
            onClick={() => setIsEditModalOpen(true)}
          >
            ✏️ Customize Profile & Cover
          </button>
        )}
      </div>

      <div className="container profile-main-container">
        
        {/* ── 2. Profile Header Card ── */}
        <div className="profile-header-card glass-card">
          <div className="avatar-wrapper">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {profile.username ? profile.username[0].toUpperCase() : 'P'}
              </div>
            )}
            {profile.tier && profile.tier !== 'FREE' && (
              <span className="avatar-tier-badge" title={`${profile.tier} Member`}>
                {profile.tier === 'PRO' ? '👑 PRO' : '⚡ LITE'}
              </span>
            )}
          </div>

          <div className="profile-identity">
            <div className="username-row">
              <h1 className="profile-username font-serif">@{profile.username}</h1>
              {profile.role === 'ADMIN' && <span className="role-pill role-admin">Admin</span>}
              {profile.role === 'REVIEWER' && <span className="role-pill role-reviewer">Reviewer</span>}
            </div>
            
            <p className="profile-bio">
              {profile.bio || 'Poet & Literary Enthusiast on KavyaKosh'}
            </p>
            
            <span className="member-since">
              🗓️ Member since {profile.memberSince || 'January 2026'}
            </span>
          </div>

          <div className="profile-header-actions">
            {isOwnProfile ? (
              <button
                type="button"
                className="btn btn-secondary edit-profile-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                type="button"
                className={`btn follow-btn ${profile.isFollowing ? 'follow-btn--following' : 'btn-primary'}`}
                onClick={handleToggleFollow}
              >
                {profile.isFollowing ? '✓ Following' : '+ Follow Poet'}
              </button>
            )}
          </div>
        </div>

        {/* ── 3. Badges System ── */}
        <div className="profile-badges-section glass-card">
          <h3 className="section-title font-serif">🏅 Earned Badges & Achievements</h3>
          <div className="badges-grid">
            {profile.badges && profile.badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-card ${badge.earned ? 'badge-card--earned' : 'badge-card--locked'}`}
                title={badge.description}
              >
                <span className="badge-icon">{badge.icon}</span>
                <div className="badge-info">
                  <span className="badge-title">{badge.title}</span>
                  <span className="badge-status">{badge.earned ? '✓ Unlocked' : '🔒 Locked'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Writing Streak Tracker & Stats Grid ── */}
        <div className="stats-streak-row">
          
          {/* Writing Streak Card */}
          <div className="streak-card glass-card">
            <div className="streak-header">
              <span className="flame-icon">🔥</span>
              <div>
                <h3 className="streak-title font-serif">Writing Streak Tracker</h3>
                <p className="streak-subtitle">Daily poetry publishing & peer critique momentum</p>
              </div>
            </div>

            <div className="streak-counters">
              <div className="streak-counter-box">
                <span className="streak-num gold-text">{profile.currentStreak || 0}</span>
                <span className="streak-lbl">Current Streak (Days)</span>
              </div>
              <div className="streak-counter-box">
                <span className="streak-num purple-text">{profile.longestStreak || 0}</span>
                <span className="streak-lbl">Longest Record</span>
              </div>
            </div>

            <div className="streak-status-bar">
              {profile.activeToday ? (
                <span className="streak-active-pill">
                  ✓ Active Today! Streak protected for 24h
                </span>
              ) : (
                <span className="streak-pending-pill">
                  ⚡ Publish or review today to extend your streak!
                </span>
              )}
            </div>

            <div className="streak-dots-bar">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`streak-dot ${idx < (profile.currentStreak || 0) ? 'streak-dot--active' : ''}`}
                  title={`Day ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Aggregated Stats Grid */}
          <div className="stats-grid-card glass-card">
            <div className="stat-box">
              <span className="stat-icon">📚</span>
              <span className="stat-value">{profile.totalPoems || 0}</span>
              <span className="stat-label">Published Verses</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{profile.totalLikes || 0}</span>
              <span className="stat-label">Likes Earned</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">👁️</span>
              <span className="stat-value">{profile.totalViews || 0}</span>
              <span className="stat-label">Poem Views</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">🌟</span>
              <span className="stat-value">{profile.reviewScoreAverage || 4.8} / 5.0</span>
              <span className="stat-label">Avg Critique Score</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{profile.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">✨</span>
              <span className="stat-value">{profile.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

        </div>

        {/* ── 5. Profile Tabs Navigation ── */}
        <div className="profile-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'POEMS' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('POEMS')}
          >
            📚 Published Verses ({profile.poems?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'DISCUSSIONS' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('DISCUSSIONS')}
          >
            💬 Discussions ({profile.discussions?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'REVIEWS' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('REVIEWS')}
          >
            📜 Reviews Received ({profile.reviews?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'BOOKS' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('BOOKS')}
          >
            📖 Marketplace Books ({profile.books?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'SAVED' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('SAVED')}
          >
            🔖 Saved Verses ({profile.savedPoems?.length || 0})
          </button>
        </div>

        {/* ── 6. Tab Contents ── */}
        <div className="profile-tab-content">
          
          {/* Tab 1: Poems */}
          {activeTab === 'POEMS' && (
            <div className="poems-tab-grid">
              {profile.poems && profile.poems.length > 0 ? (
                profile.poems.map((poem) => (
                  <InteractivePoemCard key={poem.id} poemData={poem} />
                ))
              ) : (
                <div className="empty-tab-state glass-card">
                  <span className="empty-icon">📜</span>
                  <h3>No published verses yet</h3>
                  <p>Share your poetic creation with the KavyaKosh community.</p>
                  {isOwnProfile && (
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/publish')}>
                      + Publish First Verse
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Discussions */}
          {activeTab === 'DISCUSSIONS' && (
            <div className="discussions-tab-list">
              {profile.discussions && profile.discussions.length > 0 ? (
                profile.discussions.map((disc) => (
                  <div key={disc.id} className="discussion-card glass-card">
                    <h3 className="disc-title font-serif">{disc.title}</h3>
                    <p className="disc-excerpt">{disc.content}</p>
                    <div className="disc-meta">
                      <span className="disc-category">Category: {disc.category}</span>
                      <span>💬 {disc.replyCount || 0} Replies</span>
                      <span>❤️ {disc.likesCount || 0} Likes</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tab-state glass-card">
                  <span className="empty-icon">💬</span>
                  <h3>No discussion threads started yet</h3>
                  <p>Initiate literary conversations or poetry prompt challenges.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Reviews Received */}
          {activeTab === 'REVIEWS' && (
            <div className="reviews-tab-list">
              {profile.reviews && profile.reviews.length > 0 ? (
                profile.reviews.map((rev) => (
                  <div key={rev.id} className="profile-review-card glass-card">
                    <div className="rev-header">
                      <h4 className="rev-poem-title font-serif">"{rev.poemTitle}"</h4>
                      <span className="rev-status-pill">{rev.status}</span>
                    </div>
                    
                    {rev.overallScore && (
                      <div className="rev-scores-row">
                        <div className="score-mini-pill">Emotion: {rev.emotionScore}/10</div>
                        <div className="score-mini-pill">Creativity: {rev.creativityScore}/10</div>
                        <div className="score-mini-pill">Rhythm: {rev.rhythmScore}/10</div>
                        <div className="score-mini-pill">Imagery: {rev.imageryScore}/10</div>
                        <div className="score-mini-pill">Symbolism: {rev.symbolismScore}/10</div>
                        <div className="score-overall-gold">Overall: {rev.overallScore} / 10</div>
                      </div>
                    )}

                    {rev.reviewerFeedback && (
                      <p className="rev-feedback-text">"{rev.reviewerFeedback}"</p>
                    )}

                    <div className="rev-footer">
                      <span>Reviewer: @{rev.reviewerUsername || 'KavyaKosh Editorial Board'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tab-state glass-card">
                  <span className="empty-icon">🌟</span>
                  <h3>No peer review requests yet</h3>
                  <p>Request 5-category peer reviews on your published poems in the Reviews section.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Books */}
          {activeTab === 'BOOKS' && (
            <div className="books-tab-grid">
              {profile.books && profile.books.length > 0 ? (
                profile.books.map((book) => (
                  <div key={book.id} className="profile-book-card glass-card">
                    <img src={book.imageUrl || DEFAULT_COVER} alt={book.name} className="book-cover-img" />
                    <div className="book-info">
                      <h4 className="book-title font-serif">{book.name}</h4>
                      <p className="book-desc">{book.description}</p>
                      <div className="book-price-row">
                        <span className="book-price">₹{book.price}</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/marketplace/books/${book.id}`)}>
                          View Collection
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tab-state glass-card">
                  <span className="empty-icon">📖</span>
                  <h3>No published collections in Marketplace</h3>
                  <p>Publish poetry anthologies and printed books in the KavyaKosh Marketplace.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Saved Poems */}
          {activeTab === 'SAVED' && (
            <div className="poems-tab-grid">
              {profile.savedPoems && profile.savedPoems.length > 0 ? (
                profile.savedPoems.map((poem) => (
                  <InteractivePoemCard key={poem.id} poemData={poem} />
                ))
              ) : (
                <div className="empty-tab-state glass-card">
                  <span className="empty-icon">🔖</span>
                  <h3>No saved verses yet</h3>
                  <p>Bookmark your favorite verses while exploring to read them later.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          currentProfile={profile}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaveSuccess={(updated) => setProfile(updated)}
        />
      )}

    </div>
  );
};

export default ProfilePage;
