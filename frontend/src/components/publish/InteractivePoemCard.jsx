import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReviewRequestModal from './ReviewRequestModal';
import { toggleLike, toggleSave, addComment, requestReview } from '../../api/publishApi';
import './InteractivePoemCard.css';

const MOOD_COLOR_MAP = {
  ROMANTIC: 'rose',
  MELANCHOLY: 'teal',
  MYSTICAL: 'purple',
  JOYFUL: 'gold',
  DEVOTIONAL: 'gold',
  INSPIRATIONAL: 'orange'
};

const InteractivePoemCard = ({ poemData, initialLiked = false, initialSaved = false, initialComments = [], isAuthor = false, onPoemUpdated }) => {
  const [poem, setPoem] = useState(poemData);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [comments, setComments] = useState(initialComments);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(poemData.reviewStatus || null);

  const moodColor = MOOD_COLOR_MAP[poem?.mood?.toUpperCase()] || 'gold';

  const handleLike = async () => {
    try {
      const res = await toggleLike(poem.id);
      setIsLiked(res.isLiked);
      setPoem(res.poem);
      if (onPoemUpdated) onPoemUpdated(res.poem);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await toggleSave(poem.id);
      setIsSaved(res.isSaved);
      if (onPoemUpdated) onPoemUpdated(res.poem);
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  const handleAddComment = async (text) => {
    try {
      const newComment = await addComment(poem.id, text);
      setComments((prev) => [newComment, ...prev]);
      setPoem((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    } catch (err) {
      console.error('Comment submission failed:', err);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/poems/${poem.id}`;
    navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleSubmitReviewRequest = async (data) => {
    const reviewReq = await requestReview(data);
    setReviewStatus(reviewReq.status);
  };

  return (
    <article className="interactive-poem-card glass-card">
      
      {/* Header */}
      <div className="card-top">
        <div className="author-info">
          <div className="author-avatar">
            {poem.author?.username ? poem.author.username[0].toUpperCase() : 'A'}
          </div>
          <div className="author-meta">
            <Link to={`/writers/${poem.author?.userId}`} className="author-name">
              {poem.author?.username || 'Anonymous Writer'}
            </Link>
            <span className="publish-time">
              {poem.createdAt ? new Date(poem.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>
        </div>

        <div className="card-badges">
          {poem.mood && (
            <span className={`mood-badge mood-badge--${moodColor}`}>
              {poem.mood}
            </span>
          )}
          {poem.category && <span className="cat-badge">{poem.category}</span>}
          {reviewStatus && (
            <span className="review-status-badge">
              🔍 Review: {reviewStatus}
            </span>
          )}
        </div>
      </div>

      {/* Title & Body */}
      <div className="card-body">
        <Link to={`/poems/${poem.id}`} className="poem-title-link">
          <h2 className="poem-title font-serif">{poem.title}</h2>
        </Link>

        <div className="poem-content font-serif">
          {poem.content}
        </div>

        {poem.tags && poem.tags.length > 0 && (
          <div className="poem-tags">
            {poem.tags.map((tag) => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Action Bar (Persisted Counts) */}
      <div className="card-actions-bar">
        
        {/* Like Button */}
        <button
          type="button"
          className={`action-pill ${isLiked ? 'action-pill--liked' : ''}`}
          onClick={handleLike}
        >
          <span className="pill-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>{poem.likesCount || 0} Likes</span>
        </button>

        {/* Comment Toggle Button */}
        <button
          type="button"
          className="action-pill"
          onClick={() => setCommentsOpen((prev) => !prev)}
        >
          <span className="pill-icon">💬</span>
          <span>{poem.commentsCount || comments.length} Comments</span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          type="button"
          className={`action-pill ${isSaved ? 'action-pill--saved' : ''}`}
          onClick={handleSave}
        >
          <span className="pill-icon">{isSaved ? '🔖' : '📑'}</span>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share Button */}
        <button type="button" className="action-pill" onClick={handleShare}>
          <span className="pill-icon">🔗</span>
          <span>Share</span>
        </button>

        {/* Request Review (Author option) */}
        {isAuthor && (
          <button
            type="button"
            className="action-pill action-pill--review"
            onClick={() => setReviewModalOpen(true)}
          >
            <span className="pill-icon">🔍</span>
            <span>Request Review</span>
          </button>
        )}
      </div>

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="share-toast">
          ✓ Poem link copied to clipboard!
        </div>
      )}

      {/* Expandable Comments Drawer */}
      {commentsOpen && (
        <CommentSection
          poemId={poem.id}
          comments={comments}
          onAddComment={handleAddComment}
        />
      )}

      {/* Review Request Modal */}
      <ReviewRequestModal
        poem={poem}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmitReviewRequest={handleSubmitReviewRequest}
      />
    </article>
  );
};

export default InteractivePoemCard;
