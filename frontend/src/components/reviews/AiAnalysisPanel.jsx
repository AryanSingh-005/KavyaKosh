import React, { useState } from 'react';
import CircularScoreCard from './CircularScoreCard';
import './AiAnalysisPanel.css';

const AiAnalysisPanel = ({ review, onTriggerAi }) => {
  const [loading, setLoading] = useState(false);

  const handleRunAi = async () => {
    setLoading(true);
    try {
      await onTriggerAi();
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAiAnalysis = review?.aiEmotionScore !== undefined && review?.aiEmotionScore !== null;

  return (
    <div className="ai-analysis-panel">
      <div className="ai-panel-header">
        <div className="header-left">
          <span className="ai-badge">✨ AI First-Pass Analysis</span>
          <span className="panel-subtitle">Automated literary critique & 5-category evaluation</span>
        </div>
        <button
          type="button"
          className="trigger-ai-btn"
          onClick={handleRunAi}
          disabled={loading}
        >
          {loading ? '⚡ Analyzing Verse...' : hasAiAnalysis ? '🔄 Re-Run AI First Pass' : '✨ Generate AI First Pass'}
        </button>
      </div>

      {loading ? (
        <div className="ai-panel-loading">
          <div className="ai-loader-icon">📜</div>
          <p>Analyzing rhyme scheme, emotional resonance, and imagery with KavyaKosh AI...</p>
        </div>
      ) : hasAiAnalysis ? (
        <div className="ai-panel-body">
          {/* 5-Category Scores Grid */}
          <div className="ai-scores-grid">
            <CircularScoreCard categoryKey="emotion" score={review.aiEmotionScore} isAi={true} />
            <CircularScoreCard categoryKey="creativity" score={review.aiCreativityScore} isAi={true} />
            <CircularScoreCard categoryKey="rhythm" score={review.aiRhythmScore} isAi={true} />
            <CircularScoreCard categoryKey="imagery" score={review.aiImageryScore} isAi={true} />
            <CircularScoreCard categoryKey="symbolism" score={review.aiSymbolismScore} isAi={true} />
          </div>

          {/* Critique Summary */}
          {review.aiSummary && (
            <div className="ai-critique-box">
              <h5>🤖 AI Critique Summary:</h5>
              <p>"{review.aiSummary}"</p>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="ai-lists-grid">
            {review.aiStrengths && review.aiStrengths.length > 0 && (
              <div className="ai-list-card strengths-card">
                <h5>🌟 Key Strengths</h5>
                <ul>
                  {review.aiStrengths.map((s, idx) => (
                    <li key={idx}>✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.aiImprovements && review.aiImprovements.length > 0 && (
              <div className="ai-list-card improvements-card">
                <h5>💡 Areas for Polishing</h5>
                <ul>
                  {review.aiImprovements.map((imp, idx) => (
                    <li key={idx}>• {imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ai-panel-empty">
          <p>No AI first-pass analysis generated yet. Click above to run an automated literary evaluation.</p>
        </div>
      )}
    </div>
  );
};

export default AiAnalysisPanel;
