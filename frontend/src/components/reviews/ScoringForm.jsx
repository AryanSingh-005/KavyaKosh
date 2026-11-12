import React, { useState } from 'react';
import CircularScoreCard from './CircularScoreCard';
import './ScoringForm.css';

const CATEGORIES = [
  { key: 'emotionScore', label: 'Emotion / Bhava', icon: '💖', color: '#fb7185' },
  { key: 'creativityScore', label: 'Creativity / Kalpana', icon: '✨', color: '#ffd700' },
  { key: 'rhythmScore', label: 'Rhythm / Chhanda', icon: '🎵', color: '#2dd4bf' },
  { key: 'imageryScore', label: 'Imagery / Drishya', icon: '🎨', color: '#c084fc' },
  { key: 'symbolismScore', label: 'Symbolism / Prateek', icon: '🔮', color: '#fb923c' }
];

const ScoringForm = ({ review, onSubmitReview }) => {
  const [scores, setScores] = useState({
    emotionScore: review?.emotionScore || review?.aiEmotionScore || 8,
    creativityScore: review?.creativityScore || review?.aiCreativityScore || 8,
    rhythmScore: review?.rhythmScore || review?.aiRhythmScore || 8,
    imageryScore: review?.imageryScore || review?.aiImageryScore || 9,
    symbolismScore: review?.symbolismScore || review?.aiSymbolismScore || 8
  });

  const [reviewerFeedback, setReviewerFeedback] = useState(review?.reviewerFeedback || '');
  const [lineSuggestions, setLineSuggestions] = useState(review?.lineSuggestions || []);
  const [newLineIndex, setNewLineIndex] = useState(1);
  const [newSuggestedLine, setNewSuggestedLine] = useState('');
  const [newLineComment, setNewLineComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({
      ...prev,
      [key]: parseInt(value, 10)
    }));
  };

  const calculatedAvg = Math.round(
    ((scores.emotionScore + scores.creativityScore + scores.rhythmScore + scores.imageryScore + scores.symbolismScore) / 5) * 10
  ) / 10;

  const handleAddLineSuggestion = () => {
    if (!newSuggestedLine.trim()) return;
    setLineSuggestions((prev) => [
      ...prev,
      {
        lineIndex: newLineIndex,
        originalLine: `Line ${newLineIndex}`,
        suggestedLine: newSuggestedLine.trim(),
        comment: newLineComment.trim()
      }
    ]);
    setNewSuggestedLine('');
    setNewLineComment('');
  };

  const handleRemoveLineSuggestion = (idx) => {
    setLineSuggestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReview({
        ...scores,
        reviewerFeedback,
        lineSuggestions
      });
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="scoring-form-container">
      
      <div className="form-header">
        <div className="header-title">
          <h4>✒️ Human Reviewer 5-Category Evaluation</h4>
          <p>Score each category from 1 to 10 and provide constructive feedback</p>
        </div>

        <div className="overall-gauge-wrapper">
          <CircularScoreCard categoryKey="overall" score={calculatedAvg} />
        </div>
      </div>

      {/* 5-Category Score Sliders */}
      <div className="category-sliders-grid">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="slider-item">
            <div className="slider-label-row">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-title">{cat.label}</span>
              <span className="cat-val" style={{ color: cat.color }}>
                {scores[cat.key]} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={scores[cat.key]}
              onChange={(e) => handleScoreChange(cat.key, e.target.value)}
              className="cat-range-input"
              style={{ accentColor: cat.color }}
            />
          </div>
        ))}
      </div>

      {/* Reviewer Feedback Input */}
      <div className="form-group">
        <label htmlFor="reviewerFeedback" className="form-label">
          Editorial Critique & Overall Remarks
        </label>
        <textarea
          id="reviewerFeedback"
          className="feedback-textarea"
          rows={4}
          placeholder="Write constructive notes for the poet on tone, meter flow, word choice, and emotional impact..."
          value={reviewerFeedback}
          onChange={(e) => setReviewerFeedback(e.target.value)}
        />
      </div>

      {/* Line-by-Line Suggestions */}
      <div className="line-suggestions-box">
        <h5>📝 Line-by-Line Polishing Suggestions</h5>

        {lineSuggestions.length > 0 && (
          <div className="suggestions-list">
            {lineSuggestions.map((s, idx) => (
              <div key={idx} className="suggestion-item">
                <div className="sugg-top">
                  <span className="sugg-line-num">Line #{s.lineIndex}</span>
                  <button
                    type="button"
                    className="remove-sugg-btn"
                    onClick={() => handleRemoveLineSuggestion(idx)}
                  >
                    ✕
                  </button>
                </div>
                <div className="sugg-text">Suggested: <em>"{s.suggestedLine}"</em></div>
                {s.comment && <div className="sugg-comment">Note: {s.comment}</div>}
              </div>
            ))}
          </div>
        )}

        <div className="add-suggestion-row">
          <input
            type="number"
            min="1"
            className="line-num-input"
            value={newLineIndex}
            onChange={(e) => setNewLineIndex(parseInt(e.target.value, 10) || 1)}
            title="Line number"
          />
          <input
            type="text"
            className="sugg-input"
            placeholder="Suggested line wording..."
            value={newSuggestedLine}
            onChange={(e) => setNewSuggestedLine(e.target.value)}
          />
          <input
            type="text"
            className="sugg-comment-input"
            placeholder="Comment (optional)..."
            value={newLineComment}
            onChange={(e) => setNewLineComment(e.target.value)}
          />
          <button
            type="button"
            className="add-sugg-btn"
            onClick={handleAddLineSuggestion}
          >
            + Add Line Note
          </button>
        </div>
      </div>

      <button type="submit" className="submit-scoring-btn" disabled={submitting}>
        {submitting ? 'Saving Review...' : '🏆 Submit Complete Review & Publish Scores'}
      </button>

    </form>
  );
};

export default ScoringForm;
