import React, { useState } from 'react';
import { updateUserProfile } from '../../api/profileApi';
import './EditProfileModal.css';

const COVER_PRESETS = [
  { id: 'parchment', name: 'Parchment & Quill', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { id: 'night', name: 'Cosmic Constellations', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { id: 'candle', name: 'Antique Library', url: 'https://images.unsplash.com/photo-1474939557548-f842486be195?auto=format&fit=crop&w=1200&q=80' },
  { id: 'sunset', name: 'Mystic Horizon', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' }
];

const AVATAR_PRESETS = [
  { id: 'quill', name: 'Golden Quill', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80' },
  { id: 'poetess', name: 'Royal Scholar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'thinker', name: 'Philosopher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'artist', name: 'Starry Dreamer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' }
];

const EditProfileModal = ({ currentProfile, isOpen, onClose, onSaveSuccess }) => {
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(currentProfile?.coverImageUrl || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updated = await updateUserProfile({
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        coverImageUrl: coverImageUrl.trim()
      });
      if (onSaveSuccess) {
        onSaveSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="edit-modal-header">
          <h2 className="modal-title font-serif">✏️ Edit Poet Profile</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          
          {/* Bio Field */}
          <div className="form-group">
            <label className="form-label">Poet Biography / Tagline</label>
            <textarea
              className="form-input form-textarea"
              rows={3}
              placeholder="Tell the KavyaKosh community about your poetic inspiration..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
            />
            <span className="char-count">{bio.length}/280</span>
          </div>

          {/* Avatar Section */}
          <div className="form-group">
            <label className="form-label">Profile Avatar</label>
            <div className="preset-grid">
              {AVATAR_PRESETS.map((item) => (
                <div
                  key={item.id}
                  className={`preset-chip ${avatarUrl === item.url ? 'preset-chip--active' : ''}`}
                  onClick={() => setAvatarUrl(item.url)}
                >
                  <img src={item.url} alt={item.name} className="preset-thumb-avatar" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              className="form-input custom-url-input"
              placeholder="Or paste custom Avatar Image URL..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          {/* Cover Image Section */}
          <div className="form-group">
            <label className="form-label">Profile Cover Banner</label>
            <div className="preset-grid">
              {COVER_PRESETS.map((item) => (
                <div
                  key={item.id}
                  className={`preset-chip ${coverImageUrl === item.url ? 'preset-chip--active' : ''}`}
                  onClick={() => setCoverImageUrl(item.url)}
                >
                  <img src={item.url} alt={item.name} className="preset-thumb-cover" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              className="form-input custom-url-input"
              placeholder="Or paste custom Banner Cover Image URL..."
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="edit-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
