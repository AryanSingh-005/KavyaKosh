import React, { useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ poemId, comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-section__header">
        <h4>💬 Reader Discussions ({comments.length})</h4>
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          className="comment-textarea"
          rows={2}
          placeholder="Share your thoughts or poetic reflection..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="no-comments">Be the first to leave a comment on this verse.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.username ? comment.username[0].toUpperCase() : 'U'}
              </div>
              <div className="comment-content-box">
                <div className="comment-meta">
                  <span className="comment-author">{comment.username || 'Anonymous Poet'}</span>
                  <span className="comment-time">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Recently'}
                  </span>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
