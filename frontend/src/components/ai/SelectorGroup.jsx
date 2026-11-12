import React from 'react';
import './SelectorGroup.css';

export const EMOTIONS = [
  { id: 'ROMANTIC', label: 'Ishq / Romantic', emoji: '💖' },
  { id: 'MELANCHOLY', label: 'Dard / Melancholy', emoji: '🌧️' },
  { id: 'MYSTICAL', label: 'Sufi / Mystical', emoji: '✨' },
  { id: 'JOYFUL', label: 'Anand / Joyful', emoji: '🌸' },
  { id: 'DEVOTIONAL', label: 'Bhakti / Devotional', emoji: '🕉️' },
  { id: 'INSPIRATIONAL', label: 'Veer / Inspiring', emoji: '🔥' },
  { id: 'PATRIOTIC', label: 'Desh Prem / Patriotic', emoji: '🇮🇳' },
  { id: 'GRIEF', label: 'Gham / Grief', emoji: '🥀' },
];

export const LANGUAGES = [
  { id: 'HINDI', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { id: 'URDU', label: 'Urdu (اردو)', flag: '📜' },
  { id: 'HINDUSTANI', label: 'Hindustani (Hindi-Urdu)', flag: '🌙' },
  { id: 'ENGLISH', label: 'English', flag: '🌐' },
  { id: 'PUNJABI', label: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🌾' },
  { id: 'BENGALI', label: 'Bengali (বাংলা)', flag: '🎨' },
];

export const THEMES = [
  { id: 'LOVE', label: 'Mohabbat / Love' },
  { id: 'SEPARATION', label: 'Judai / Separation' },
  { id: 'SOLITUDE', label: 'Tanhai / Solitude' },
  { id: 'NATURE', label: 'Prakriti / Nature' },
  { id: 'NOSTALGIA', label: 'Yaadein / Nostalgia' },
  { id: 'SPIRITUALITY', label: 'Rooh / Spirituality' },
  { id: 'REBELLION', label: 'Inquilab / Rebellion' },
  { id: 'DEATH', label: 'Maut / Mortality' },
];

export const FORMS = [
  { id: 'SHAYARI', label: 'Sher-o-Shayari (शेर)' },
  { id: 'GHAZAL', label: 'Ghazal (ग़ज़ल)' },
  { id: 'NAZM', label: 'Nazm (नज़्म)' },
  { id: 'DOHA', label: 'Doha (दोहा)' },
  { id: 'RUBAAI', label: "Rubā'ī (रुबाई)" },
  { id: 'QAWWALI', label: 'Qawwali (क़व्वाली)' },
  { id: 'FREE_VERSE', label: 'Muktak / Free Verse' },
  { id: 'SONNET', label: 'Sonnet' },
  { id: 'HAIKU', label: 'Haiku' },
];

const SelectorGroup = ({ title, options, selectedValue, onChange, icon }) => {
  return (
    <div className="selector-group">
      <div className="selector-group__label">
        {icon && <span className="selector-group__icon">{icon}</span>}
        <span>{title}</span>
      </div>
      <div className="selector-group__chips">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`selector-chip ${isSelected ? 'selector-chip--active' : ''}`}
              onClick={() => onChange(opt.id)}
            >
              {opt.emoji && <span className="selector-chip__emoji">{opt.emoji}</span>}
              {opt.flag && <span className="selector-chip__emoji">{opt.flag}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorGroup;
