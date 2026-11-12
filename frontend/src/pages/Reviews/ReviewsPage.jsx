import React, { useState, useEffect } from 'react';
import CircularScoreCard from '../../components/reviews/CircularScoreCard';
import AiAnalysisPanel from '../../components/reviews/AiAnalysisPanel';
import ScoringForm from '../../components/reviews/ScoringForm';
import { getReviewQueue, triggerAiFirstPass, submitHumanReview } from '../../api/reviewApi';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const [queue, setQueue] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | PENDING | IN_REVIEW | COMPLETED
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getReviewQueue(statusFilter);
      setQueue(data);
      if (data.length > 0 && !selectedReview) {
        setSelectedReview(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAi = async () => {
    if (!selectedReview) return;
    const updated = await triggerAiFirstPass(selectedReview.id);
    setSelectedReview(updated);
    setQueue((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleSubmitHumanReview = async (formData) => {
    if (!selectedReview) return;
    const updated = await submitHumanReview(selectedReview.id, formData);
    setSelectedReview(updated);
    setQueue((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setNotification('🏆 Review successfully published!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="reviews-page">
      <div className="reviews-container">
        
        {/* Header */}
        <header className="reviews-header">
          <div className="header-badge">🏛️ Editorial & Peer Critique</div>
          <h1 className="reviews-title">Review Request Queue & Evaluation</h1>
          <p className="reviews-subtitle">
            Provide 5-category literary scoring, AI-assisted first-pass analysis, and line-by-line feedback for fellow poets.
          </p>
        </header>

        {notification && <div className="review-toast">{notification}</div>}

        {/* Filter Bar */}
        <div className="queue-filter-bar">
          <span className="filter-label">Filter Queue:</span>
          {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-btn ${statusFilter === st ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Main Workspace Layout */}
        <div className="reviews-workspace">
          
          {/* Left Queue Panel */}
          <div className="queue-panel">
            <h3 className="queue-title">Requests Queue ({queue.length})</h3>

            {loading ? (
              <div className="queue-loading">Loading requests...</div>
            ) : queue.length === 0 ? (
              <div className="queue-empty">No review requests in this queue.</div>
            ) : (
              <div className="queue-list">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className={`queue-item ${selectedReview?.id === item.id ? 'queue-item--selected' : ''}`}
                    onClick={() => setSelectedReview(item)}
                  >
                    <div className="queue-item-top">
                      <span className="queue-item-title font-serif">{item.poemTitle}</span>
                      <span className={`status-pill status-${item.status ? item.status.toLowerCase() : 'pending'}`}>
                        {item.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="queue-item-meta">
                      <span>By @{item.authorUsername}</span>
                      <span>Target: {item.targetReviewer}</span>
                    </div>
                    {item.overallScore && (
                      <div className="queue-score-badge">
                        Overall Score: ⭐ {item.overallScore}/10
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Detail & Evaluation Panel */}
          <div className="review-detail-panel">
            {selectedReview ? (
              <div className="detail-scroll-area">
                
                {/* Poem Metadata & Content */}
                <div className="review-poem-card">
                  <div className="poem-card-header">
                    <div>
                      <h2 className="review-poem-title font-serif">{selectedReview.poemTitle}</h2>
                      <div className="review-author-byline">
                        Submitted by <strong>@{selectedReview.authorUsername}</strong> for <strong>{selectedReview.targetReviewer}</strong>
                      </div>
                    </div>

                    {selectedReview.overallScore && (
                      <CircularScoreCard categoryKey="overall" score={selectedReview.overallScore} />
                    )}
                  </div>

                  {selectedReview.authorNotes && (
                    <div className="author-notes-box">
                      <strong>Author Note:</strong> "{selectedReview.authorNotes}"
                    </div>
                  )}

                  <div className="review-poem-text font-serif">
                    {selectedReview.poemContent || 'Poem text loading...'}
                  </div>
                </div>

                {/* AI First-Pass Panel */}
                <AiAnalysisPanel
                  review={selectedReview}
                  onTriggerAi={handleTriggerAi}
                />

                {/* Human 5-Category Scoring Form */}
                <ScoringForm
                  review={selectedReview}
                  onSubmitReview={handleSubmitHumanReview}
                />

              </div>
            ) : (
              <div className="detail-empty-state">
                <span className="empty-icon">📜</span>
                <h3>Select a Review Request</h3>
                <p>Choose any pending request from the left queue to begin literary analysis and scoring.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReviewsPage;
