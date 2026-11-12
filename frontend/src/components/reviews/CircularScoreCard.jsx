import React from 'react';
import './CircularScoreCard.css';

const CATEGORY_META = {
  emotion: { label: 'Emotion / Bhava', color: '#fb7185', icon: '💖' },
  creativity: { label: 'Creativity / Kalpana', color: '#ffd700', icon: '✨' },
  rhythm: { label: 'Rhythm / Chhanda', color: '#2dd4bf', icon: '🎵' },
  imagery: { label: 'Imagery / Drishya', color: '#c084fc', icon: '🎨' },
  symbolism: { label: 'Symbolism / Prateek', color: '#fb923c', icon: '🔮' },
  overall: { label: 'Overall Rating', color: '#d4af37', icon: '🏆' }
};

const CircularScoreCard = ({ categoryKey, score = 0, maxScore = 10, isAi = false }) => {
  const meta = CATEGORY_META[categoryKey] || { label: categoryKey, color: '#d4af37', icon: '⭐' };
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  // Circle geometry calculation
  const radius = 36;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`circular-score-card ${isAi ? 'circular-score-card--ai' : ''}`}>
      <div className="svg-container">
        <svg width="88" height="88" viewBox="0 0 88 88" className="score-ring-svg">
          {/* Background Track */}
          <circle
            cx="44"
            cy="44"
            r={radius}
            strokeWidth={strokeWidth}
            className="score-ring-bg"
          />
          {/* Animated Value Ring */}
          <circle
            cx="44"
            cy="44"
            r={radius}
            strokeWidth={strokeWidth}
            className="score-ring-fill"
            style={{
              stroke: meta.color,
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset
            }}
          />
        </svg>
        <div className="score-value-overlay">
          <span className="score-number" style={{ color: meta.color }}>
            {score !== null && score !== undefined ? score : '-'}
          </span>
          <span className="score-max">/{maxScore}</span>
        </div>
      </div>

      <div className="score-label-box">
        <span className="score-icon">{meta.icon}</span>
        <span className="score-title">{meta.label}</span>
      </div>
    </div>
  );
};

export default CircularScoreCard;
