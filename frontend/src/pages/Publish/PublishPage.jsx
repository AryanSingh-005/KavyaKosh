import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PoemEditor from '../../components/publish/PoemEditor';
import InteractivePoemCard from '../../components/publish/InteractivePoemCard';
import { createPoem, getMyPoems, getMyReviewRequests, deletePoem } from '../../api/publishApi';
import './PublishPage.css';

const PublishPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('COMPOSE'); // COMPOSE | MY_POEMS | REVIEWS

  const [myPoems, setMyPoems] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [poemsData, reviewsData] = await Promise.all([
        getMyPoems().catch(() => []),
        getMyReviewRequests().catch(() => [])
      ]);
      setMyPoems(poemsData);
      setMyReviews(reviewsData);
    } catch (err) {
      console.warn('Could not fetch user poems or reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoem = async (poemPayload) => {
    const created = await createPoem(poemPayload);
    setNotification(poemPayload.published ? '🎉 Poem published successfully!' : '💾 Draft saved!');
    setTimeout(() => setNotification(null), 3000);
    fetchUserData();
    setActiveTab('MY_POEMS');
  };

  const handleDeletePoem = async (poemId) => {
    if (!window.confirm('Are you sure you want to delete this poem?')) return;
    try {
      await deletePoem(poemId);
      setMyPoems((prev) => prev.filter((p) => p.id !== poemId));
    } catch (err) {
      alert('Failed to delete poem.');
    }
  };

  return (
    <div className="publish-page">
      <div className="publish-container">
        
        {/* Header */}
        <header className="publish-header">
          <div className="publish-badge">✒️ Writers Sanctuary</div>
          <h1 className="publish-title">Publish & Craft Poetry</h1>
          <p className="publish-subtitle">
            Share your verses with millions of poetry lovers, request peer reviews, and track engagement in real-time.
          </p>
        </header>

        {/* Notifications */}
        {notification && (
          <div className="publish-toast-notification">
            {notification}
          </div>
        )}

        {/* Main Tab Navigation */}
        <nav className="publish-tabs">
          <button
            type="button"
            className={`publish-tab-btn ${activeTab === 'COMPOSE' ? 'publish-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('COMPOSE')}
          >
            ✒️ Compose New Verse
          </button>
          <button
            type="button"
            className={`publish-tab-btn ${activeTab === 'MY_POEMS' ? 'publish-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('MY_POEMS')}
          >
            📚 My Verses ({myPoems.length})
          </button>
          <button
            type="button"
            className={`publish-tab-btn ${activeTab === 'REVIEWS' ? 'publish-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('REVIEWS')}
          >
            🔍 Review Requests ({myReviews.length})
          </button>
        </nav>

        {/* Tab Content */}
        <div className="publish-content-area">
          
          {activeTab === 'COMPOSE' && (
            <PoemEditor onSave={handleCreatePoem} />
          )}

          {activeTab === 'MY_POEMS' && (
            <div className="my-poems-section">
              {loading ? (
                <div className="publish-loading">Loading your poetic portfolio...</div>
              ) : myPoems.length === 0 ? (
                <div className="publish-empty-card">
                  <span className="empty-emoji">📖</span>
                  <h3>No Poems Found</h3>
                  <p>You haven't written or published any verses yet.</p>
                  <button
                    type="button"
                    className="btn-create-first"
                    onClick={() => setActiveTab('COMPOSE')}
                  >
                    ✒️ Compose Your First Poem
                  </button>
                </div>
              ) : (
                <div className="my-poems-grid">
                  {myPoems.map((poem) => (
                    <div key={poem.id} className="my-poem-wrapper">
                      <div className="poem-manage-bar">
                        <span className={`status-badge ${poem.published ? 'status-badge--published' : 'status-badge--draft'}`}>
                          {poem.published ? '🟢 Published' : '🟡 Draft'}
                        </span>
                        <button
                          type="button"
                          className="delete-poem-btn"
                          onClick={() => handleDeletePoem(poem.id)}
                          title="Delete poem"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <InteractivePoemCard
                        poemData={poem}
                        isAuthor={true}
                        onPoemUpdated={fetchUserData}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'REVIEWS' && (
            <div className="my-reviews-section">
              {myReviews.length === 0 ? (
                <div className="publish-empty-card">
                  <span className="empty-emoji">🔍</span>
                  <h3>No Active Review Requests</h3>
                  <p>Request peer or editorial feedback on any of your poems to get started.</p>
                </div>
              ) : (
                <div className="review-requests-list">
                  {myReviews.map((req) => (
                    <div key={req.id} className="review-request-card">
                      <div className="review-req-header">
                        <span className="review-req-title font-serif">"{req.poemTitle}"</span>
                        <span className={`review-req-status status-${req.status ? req.status.toLowerCase() : 'pending'}`}>
                          {req.status || 'PENDING'}
                        </span>
                      </div>
                      <div className="review-req-details">
                        <span>Review Circle: <strong>{req.targetReviewer}</strong></span>
                        {req.authorNotes && (
                          <p className="author-notes-quote">Note: "{req.authorNotes}"</p>
                        )}
                        {req.reviewerFeedback && (
                          <div className="reviewer-feedback-box">
                            <strong>Feedback:</strong> {req.reviewerFeedback}
                          </div>
                        )}
                        <span className="req-time">
                          Requested: {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PublishPage;
