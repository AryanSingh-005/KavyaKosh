import React, { useState } from 'react';
import './PoemResultCard.css';

const FORM_LABELS = {
  SHAYARI: 'Sher-o-Shayari', GHAZAL: 'Ghazal', NAZM: 'Nazm',
  DOHA: 'Doha', RUBAAI: "Rubā'ī", QAWWALI: 'Qawwali',
  FREE_VERSE: 'Free Verse', SONNET: 'Sonnet', HAIKU: 'Haiku',
};

const PoemResultCard = ({ result, onSendToPolisher, onSendToPublish }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="poem-result-card">
      <div className="poem-result-card__header">
        <div className="poem-result-card__badges">
          {result.type && (
            <span className="result-badge result-badge--type">
              {result.type === 'GENERATE' ? '✨ AI Verses' : '🖋️ Polished Verse'}
            </span>
          )}
          {result.form && (
            <span className="result-badge result-badge--form">
              {FORM_LABELS[result.form] || result.form}
            </span>
          )}
          {result.emotion && <span className="result-badge">{result.emotion}</span>}
          {result.language && <span className="result-badge">{result.language}</span>}
        </div>

        <div className="poem-result-card__actions">
          <button type="button" className="action-btn" onClick={handleCopy} title="Copy poem text">
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          {onSendToPolisher && (
            <button
              type="button"
              className="action-btn action-btn--gold"
              onClick={() => onSendToPolisher(result.generatedText)}
              title="Refine in AI Polisher"
            >
              🔄 Polish
            </button>
          )}
          {onSendToPublish && (
            <button
              type="button"
              className="action-btn action-btn--publish"
              onClick={() => onSendToPublish(result.generatedText, result)}
              title="Send to Publish editor"
            >
              📝 Publish
            </button>
          )}
        </div>
      </div>

      <div className="poem-result-card__body">
        <pre className="poem-text">{result.generatedText}</pre>
      </div>

      <div className="poem-result-card__footer">
        <span className="footer-meta">
          Prompt: <em>"{result.prompt}"</em>
        </span>
        <span className="footer-time">
          {result.createdAt
            ? new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now'}
        </span>
      </div>
    </div>
  );
};

export default PoemResultCard;
