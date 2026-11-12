import React, { useState, useEffect } from 'react';
import { getDiscussions, createDiscussion, getDiscussionReplies, addDiscussionReply } from '../../api/communityApi';
import './DiscussionsPage.css';

const CATEGORIES = [
  { id: 'ALL', label: 'All Discussions' },
  { id: 'GHAZAL_METER', label: '🎼 Ghazal Meter (Beher) & Rules' },
  { id: 'CLASSICAL_POETS', label: '📜 Classical Poets (Ghalib, Kabir, Faiz)' },
  { id: 'CRITIQUE_CIRCLE', label: '✍️ Peer Critique Circle' },
  { id: 'GENERAL', label: '💬 General Literary Forum' }
];

const DiscussionsPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReplyText, setNewReplyText] = useState('');

  // New Thread Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('GHAZAL_METER');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const data = await getDiscussions(selectedCategory);
      setDiscussions(data);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenThread = async (thread) => {
    setActiveThread(thread);
    try {
      const replyData = await getDiscussionReplies(thread.id);
      setReplies(replyData);
    } catch (err) {
      console.error('Failed to fetch replies:', err);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReplyText.trim() || !activeThread) return;

    setSubmitting(true);
    try {
      const newReply = await addDiscussionReply(activeThread.id, newReplyText.trim());
      setReplies((prev) => [...prev, newReply]);
      setActiveThread((prev) => ({
        ...prev,
        replyCount: (prev.replyCount || 0) + 1
      }));
      setNewReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const created = await createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory
      });
      setDiscussions((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('Failed to create discussion:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="discussions-page">
      <div className="discussions-container">
        
        {/* Header */}
        <header className="discussions-header">
          <div className="discussions-badge">💬 Community Forum</div>
          <h1 className="discussions-title">Poetic Discussions & Literary Circle</h1>
          <p className="discussions-subtitle">
            Discuss poetic meters (Beher), classical ghazal traditions, symbolism, and connect with fellow writers.
          </p>

          <button
            type="button"
            className="start-thread-btn"
            onClick={() => setCreateModalOpen(true)}
          >
            + Start Discussion Thread
          </button>
        </header>

        {/* Category Filter Chips */}
        <div className="category-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-chip ${selectedCategory === cat.id ? 'cat-chip--active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Discussions Feed List */}
        <div className="discussions-feed">
          {loading ? (
            <div className="discussions-loading">Loading community discussions...</div>
          ) : discussions.length === 0 ? (
            <div className="discussions-empty">
              <span className="empty-icon">💬</span>
              <h3>No threads found in this category</h3>
              <p>Be the first to start a poetic discussion thread.</p>
            </div>
          ) : (
            discussions.map((disc) => (
              <div
                key={disc.id}
                className="thread-card glass-card"
                onClick={() => handleOpenThread(disc)}
              >
                <div className="thread-card-top">
                  <span className="thread-cat-badge">{disc.category}</span>
                  <span className="thread-author">By @{disc.authorUsername || 'Poet'}</span>
                </div>
                <h3 className="thread-title">{disc.title}</h3>
                <p className="thread-excerpt">{disc.content.substring(0, 140)}...</p>
                <div className="thread-footer">
                  <span className="thread-replies-count">💬 {disc.replyCount || 0} Replies</span>
                  <span className="thread-time">
                    {disc.createdAt ? new Date(disc.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Active Thread Detail Modal */}
      {activeThread && (
        <div className="thread-modal-overlay" onClick={() => setActiveThread(null)}>
          <div className="thread-modal" onClick={(e) => e.stopPropagation()}>
            <div className="thread-modal-header">
              <div>
                <span className="modal-cat">{activeThread.category}</span>
                <h2 className="modal-title font-serif">{activeThread.title}</h2>
                <span className="modal-byline">Started by @{activeThread.authorUsername}</span>
              </div>
              <button type="button" className="modal-close" onClick={() => setActiveThread(null)}>✕</button>
            </div>

            <div className="thread-modal-body">
              <div className="original-post-box">
                <p>{activeThread.content}</p>
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handlePostReply} className="reply-form">
                <textarea
                  className="reply-textarea"
                  rows={2}
                  placeholder="Join the discussion or share your perspective..."
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                />
                <button type="submit" className="reply-submit-btn" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </form>

              {/* Replies List */}
              <div className="replies-list">
                <h4>Discussion Replies ({replies.length})</h4>
                {replies.length === 0 ? (
                  <div className="no-replies">No replies yet. Be the first to share your thoughts!</div>
                ) : (
                  replies.map((reply) => (
                    <div key={reply.id} className="reply-card">
                      <div className="reply-author">@{reply.authorUsername || 'Anonymous'}</div>
                      <p className="reply-text">{reply.content}</p>
                      <div className="reply-time">
                        {reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Thread Modal */}
      {createModalOpen && (
        <div className="thread-modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="thread-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="thread-modal-header">
              <h2>+ Start New Community Discussion</h2>
              <button type="button" className="modal-close" onClick={() => setCreateModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateThread} className="create-thread-form">
              <div className="form-group">
                <label className="form-label">Category / Forum Topic</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="GHAZAL_METER">🎼 Ghazal Meter (Beher) & Rules</option>
                  <option value="CLASSICAL_POETS">📜 Classical Poets (Ghalib, Kabir, Faiz)</option>
                  <option value="CRITIQUE_CIRCLE">✍️ Peer Critique Circle</option>
                  <option value="GENERAL">💬 General Literary Forum</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Discussion Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 'Understanding Bahr-e-Hazaj meter in Urdu Ghazals'"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Topic Description & Questions *</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Explain your topic or ask a question to the community..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : '🚀 Launch Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscussionsPage;
