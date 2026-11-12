import React, { useState } from 'react';
import './ReviewRequestModal.css';

const REVIEWER_TARGETS = [
  { id: 'EDITORIAL_BOARD', label: '🏛️ KavyaKosh Editorial Board (Official Review)' },
  { id: 'SENIOR_POET', label: '✒️ Senior Ustad / Peer Poet Feedback' },
  { id: 'COMMUNITY_CRITIC', label: '💬 Community Literary Circle' }
];

const ReviewRequestModal = ({ poem, isOpen, onClose, onSubmitReviewRequest }) => {
  const [targetReviewer, setTargetReviewer] = useState('EDITORIAL_BOARD');
  const [authorNotes, setAuthorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !poem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReviewRequest({
        poemId: poem.id,
        targetReviewer,
        authorNotes
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit review request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal__header">
          <h3>🔍 Request Editorial Review</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="review-modal__body">
          <p className="modal-desc">
            Submit <strong>"{poem.title}"</strong> for peer critique, meter validation, or editorial spotlight consideration.
          </p>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label className="form-label">Select Review Circle / Panel</label>
              <div className="reviewer-options">
                {REVIEWER_TARGETS.map((t) => (
                  <label
                    key={t.id}
                    className={`reviewer-option ${targetReviewer === t.id ? 'reviewer-option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="reviewerTarget"
                      value={t.id}
                      checked={targetReviewer === t.id}
                      onChange={() => setTargetReviewer(t.id)}
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reviewNotes" className="form-label">
                Notes for the Reviewer (Optional)
              </label>
              <textarea
                id="reviewNotes"
                className="review-textarea"
                rows={3}
                placeholder="Specific areas you'd like feedback on (e.g. meter, imagery, vocabulary, or emotional resonance)..."
                value={authorNotes}
                onChange={(e) => setAuthorNotes(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : '🚀 Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestModal;
