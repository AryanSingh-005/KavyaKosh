import { useState, useRef, useCallback } from 'react';
import './SearchBar.css';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function SearchBar({ value, onChange, placeholder = 'Search poems, poets, moods…' }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = useCallback(e => onChange(e.target.value), [onChange]);
  const handleClear = useCallback(() => { onChange(''); inputRef.current?.focus(); }, [onChange]);

  return (
    <div className={`search-bar ${focused ? 'search-bar--focused' : ''} ${value ? 'search-bar--has-value' : ''}`}>
      <span className="search-bar__icon"><SearchIcon /></span>
      <input
        ref={inputRef}
        id="explore-search"
        type="search"
        className="search-bar__input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        spellCheck="false"
        aria-label="Search poems"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}
