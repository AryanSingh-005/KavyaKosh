import React from 'react';
import './GenerationHistoryDrawer.css';

const GenerationHistoryDrawer = ({ history, onSelectHistory, onDeleteHistory, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="history-drawer-overlay" onClick={onClose}>
      <div className="history-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="history-drawer__header">
          <div className="history-drawer__title">
            <span className="history-icon">📜</span>
            <span>Generation History ({history.length})</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="history-drawer__list">
          {history.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty__icon">🕯️</span>
              <p>No prior generations found for your account.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item" onClick={() => onSelectHistory(item)}>
                <div className="history-item__top">
                  <span className={`history-type ${item.type === 'REWRITE' ? 'history-type--rewrite' : ''}`}>
                    {item.type || 'GENERATE'}
                  </span>
                  {item.emotion && <span className="history-badge">{item.emotion}</span>}
                  {item.language && <span className="history-badge">{item.language}</span>}
                  <button
                    type="button"
                    className="delete-history-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
                <div className="history-item__prompt">"{item.prompt}"</div>
                <div className="history-item__preview">
                  {item.resultText ? item.resultText.substring(0, 100) + '...' : ''}
                </div>
                <div className="history-item__time">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationHistoryDrawer;
