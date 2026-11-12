import React, { useState, useEffect } from 'react';
import './PoemEditor.css';

const CATEGORIES = ['Free Verse', 'Ghazal', 'Nazm', 'Shayari', 'Sonnet', 'Haiku', 'Doha'];
const MOODS = ['ROMANTIC', 'MELANCHOLY', 'MYSTICAL', 'JOYFUL', 'DEVOTIONAL', 'INSPIRATIONAL'];
const LANGUAGES = ['HINDI', 'URDU', 'ENGLISH', 'PUNJABI', 'BENGALI'];
const THEMES = ['LOVE', 'SOLITUDE', 'NATURE', 'NOSTALGIA', 'SPIRITUALITY', 'REBELLION'];

const PoemEditor = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [category, setCategory] = useState(initialData?.category || 'Free Verse');
  const [mood, setMood] = useState(initialData?.mood || 'ROMANTIC');
  const [language, setLanguage] = useState(initialData?.language || 'HINDI');
  const [theme, setTheme] = useState(initialData?.theme || 'LOVE');
  const [tagsInput, setTagsInput] = useState(initialData?.tags ? initialData.tags.join(', ') : '');

  const [activeTab, setActiveTab] = useState('EDIT'); // EDIT | PREVIEW
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAutoGenerateExcerpt = () => {
    if (!content.trim()) return;
    const autoExcerpt = content.length > 140 ? content.substring(0, 140) + '...' : content;
    setExcerpt(autoExcerpt);
  };

  const handleSubmit = async (publishedState = true) => {
    if (!title.trim()) {
      setError('Please enter a title for your poem.');
      return;
    }
    if (!content.trim()) {
      setError('Poem content cannot be empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const tagsList = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        category,
        mood,
        language,
        theme,
        tags: tagsList,
        published: publishedState
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save poem. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="poem-editor-container">
      
      {/* Editor Sub-Header / Tabs */}
      <div className="editor-top-bar">
        <div className="editor-tab-switcher">
          <button
            type="button"
            className={`editor-tab ${activeTab === 'EDIT' ? 'editor-tab--active' : ''}`}
            onClick={() => setActiveTab('EDIT')}
          >
            ✒️ Write & Edit
          </button>
          <button
            type="button"
            className={`editor-tab ${activeTab === 'PREVIEW' ? 'editor-tab--active' : ''}`}
            onClick={() => setActiveTab('PREVIEW')}
          >
            👁️ Reader Preview
          </button>
        </div>

        <div className="editor-top-actions">
          {onCancel && (
            <button type="button" className="btn-secondary-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-draft-sm"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            className="btn-publish-sm"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : '🚀 Publish Poem'}
          </button>
        </div>
      </div>

      {error && <div className="editor-error">{error}</div>}

      {activeTab === 'EDIT' ? (
        <div className="editor-form-grid">
          
          {/* Main Editing Column */}
          <div className="editor-column editor-column--main">
            <div className="form-group">
              <label htmlFor="poemTitle" className="editor-label">Poem Title *</label>
              <input
                id="poemTitle"
                type="text"
                className="title-input font-serif"
                placeholder="e.g. 'Banaras at Midnight' or 'चाँदनी की चुप'"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="poemContent" className="editor-label">Poem Content *</label>
              <textarea
                id="poemContent"
                className="content-textarea font-serif"
                rows={14}
                placeholder="Write your stanzas here. Use line breaks for poetic rhythm..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="poemExcerpt" className="editor-label">Poetic Excerpt (Card Summary)</label>
                <button type="button" className="btn-link-sm" onClick={handleAutoGenerateExcerpt}>
                  ✨ Auto-generate from content
                </button>
              </div>
              <textarea
                id="poemExcerpt"
                className="excerpt-textarea font-serif"
                rows={3}
                placeholder="First 2 lines or evocative summary shown on Explore feed cards..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* Metadata Sidebar Column */}
          <div className="editor-column editor-column--sidebar">
            
            <div className="meta-card">
              <h4 className="meta-card__title">🏷️ Classification & Mood</h4>

              <div className="form-group">
                <label className="editor-label">Mood / Ras</label>
                <select className="meta-select" value={mood} onChange={(e) => setMood(e.target.value)}>
                  {MOODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="editor-label">Language</label>
                <select className="meta-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="editor-label">Poetic Category</label>
                <select className="meta-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="editor-label">Central Theme</label>
                <select className="meta-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  {THEMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="poemTags" className="editor-label">Tags (comma separated)</label>
                <input
                  id="poemTags"
                  type="text"
                  className="meta-input"
                  placeholder="monsoon, ghazal, Viraha"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Live Reader Preview */
        <div className="preview-container">
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-mood">{mood}</span>
              <span className="preview-cat">{category} • {language}</span>
            </div>
            <h1 className="preview-title font-serif">{title || 'Untitled Poem'}</h1>
            <div className="preview-content font-serif">
              {content || 'Your poem verses will appear here...'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PoemEditor;
