import './FilterBar.css';

/* ── Configuration ───────────────────────────────────────────────────────── */

const MOOD_META = {
  Romance:    { emoji: '💕', color: 'rose' },
  Melancholy: { emoji: '🌧️', color: 'blue' },
  Devotion:   { emoji: '🙏', color: 'amber' },
  Nature:     { emoji: '🌿', color: 'teal' },
  Philosophy: { emoji: '🌙', color: 'purple' },
  Rebellion:  { emoji: '⚡', color: 'red' },
  Joy:        { emoji: '✨', color: 'gold' },
};

const SORT_OPTIONS = [
  { value: 'trending',  label: '🔥 Trending' },
  { value: 'newest',    label: '🕐 Newest' },
  { value: 'popular',   label: '❤️ Most Liked' },
  { value: 'discussed', label: '💬 Most Discussed' },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FilterChip({ label, active, onClick, color }) {
  return (
    <button
      className={`filter-chip filter-chip--${color ?? 'default'} ${active ? 'filter-chip--active' : ''}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">
      <span className="filter-group__label">{title}</span>
      <div className="filter-group__chips">{children}</div>
    </div>
  );
}

/* ── Main FilterBar ──────────────────────────────────────────────────────── */

export default function FilterBar({ filters, activeFilters, onFilterChange, sortBy, onSortChange }) {
  const { moods = [], themes = [], languages = [], categories = [] } = filters;

  function toggle(key, value) {
    onFilterChange(key, activeFilters[key] === value ? '' : value);
  }

  return (
    <div className="filter-bar glass-card" aria-label="Explore filters">

      {/* Sort */}
      <div className="filter-bar__sort">
        <label htmlFor="explore-sort" className="filter-group__label">Sort</label>
        <select
          id="explore-sort"
          className="filter-bar__sort-select"
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          aria-label="Sort poems by"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-bar__divider" />

      {/* Mood chips */}
      {moods.length > 0 && (
        <FilterGroup title="Mood">
          {moods.map(mood => {
            const meta = MOOD_META[mood] || { emoji: '✦', color: 'default' };
            return (
              <FilterChip
                key={mood}
                label={`${meta.emoji} ${mood}`}
                active={activeFilters.mood === mood}
                color={meta.color}
                onClick={() => toggle('mood', mood)}
              />
            );
          })}
        </FilterGroup>
      )}

      {/* Language chips */}
      {languages.length > 0 && (
        <FilterGroup title="Language">
          {languages.map(lang => (
            <FilterChip
              key={lang}
              label={lang}
              active={activeFilters.language === lang}
              color="default"
              onClick={() => toggle('language', lang)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Theme chips */}
      {themes.length > 0 && (
        <FilterGroup title="Theme">
          {themes.map(theme => (
            <FilterChip
              key={theme}
              label={theme}
              active={activeFilters.theme === theme}
              color="purple"
              onClick={() => toggle('theme', theme)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Category chips */}
      {categories.length > 0 && (
        <FilterGroup title="Form">
          {categories.map(cat => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeFilters.category === cat}
              color="gold"
              onClick={() => toggle('category', cat)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Active filter summary + clear */}
      {Object.values(activeFilters).some(Boolean) && (
        <button
          className="filter-bar__clear-all"
          onClick={() => onFilterChange('__clear__', '')}
          type="button"
        >
          ✕ Clear all filters
        </button>
      )}
    </div>
  );
}
