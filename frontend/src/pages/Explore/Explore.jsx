import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import SearchBar from '../../components/explore/SearchBar';
import FilterBar from '../../components/explore/FilterBar';
import ExplorePoemCard, { ExplorePoemCardSkeleton } from '../../components/explore/ExplorePoemCard';
import { fetchExplorePoems, fetchExploreFilters } from '../../api/exploreApi';
import './Explore.css';

/* ── State management ─────────────────────────────────────────────────────── */

const INITIAL_STATE = {
  poems: [],
  page: 0,
  totalPages: 1,
  loading: false,
  loadingMore: false,
  error: null,
};

function feedReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null, poems: [], page: 0 };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        poems: action.payload.content,
        totalPages: action.payload.totalPages,
        page: 0,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'MORE_START':
      return { ...state, loadingMore: true };
    case 'MORE_SUCCESS': {
      const nextPage = state.page + 1;
      return {
        ...state,
        loadingMore: false,
        poems: [...state.poems, ...action.payload.content],
        totalPages: action.payload.totalPages,
        page: nextPage,
      };
    }
    case 'MORE_ERROR':
      return { ...state, loadingMore: false };
    default:
      return state;
  }
}

/* ── Debounce hook ────────────────────────────────────────────────────────── */

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── Explore page ─────────────────────────────────────────────────────────── */

export default function Explore() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [activeFilters, setActiveFilters] = useState({ mood: '', theme: '', language: '', category: '' });
  const [filterOptions, setFilterOptions] = useState({ moods: [], themes: [], languages: [], categories: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, dispatch] = useReducer(feedReducer, INITIAL_STATE);

  const debouncedSearch = useDebounce(search, 400);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Load filter options once on mount
  useEffect(() => {
    fetchExploreFilters()
      .then(setFilterOptions)
      .catch(console.error);
  }, []);

  // Build query params object (memoized as JSON string to use as dep)
  const queryParams = useCallback(() => ({
    search:   debouncedSearch,
    mood:     activeFilters.mood,
    theme:    activeFilters.theme,
    language: activeFilters.language,
    category: activeFilters.category,
    sortBy,
    page: 0,
    size: 12,
  }), [debouncedSearch, activeFilters, sortBy]);

  // Initial / filter-changed fetch
  useEffect(() => {
    const params = queryParams();
    dispatch({ type: 'FETCH_START' });
    fetchExplorePoems(params)
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err.message }));
  }, [queryParams]);

  // Load next page
  const loadMore = useCallback(() => {
    if (state.loadingMore || state.loading) return;
    if (state.page + 1 >= state.totalPages) return;

    const params = { ...queryParams(), page: state.page + 1 };
    dispatch({ type: 'MORE_START' });
    fetchExplorePoems(params)
      .then(data => dispatch({ type: 'MORE_SUCCESS', payload: data }))
      .catch(() => dispatch({ type: 'MORE_ERROR' }));
  }, [state, queryParams]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  // Filter change handler
  function handleFilterChange(key, value) {
    if (key === '__clear__') {
      setActiveFilters({ mood: '', theme: '', language: '', category: '' });
    } else {
      setActiveFilters(prev => ({ ...prev, [key]: value }));
    }
  }

  const hasActiveFilters = Object.values(activeFilters).some(Boolean) || debouncedSearch;
  const hasMore = state.page + 1 < state.totalPages && !state.loading;

  return (
    <div className="explore-page">
      {/* Page header */}
      <div className="explore-page__header container">
        <div className="explore-page__title-group">
          <p className="section-header__eyebrow">🔭 Discover</p>
          <h1 className="explore-page__title font-serif">Explore Poetry</h1>
          <p className="explore-page__subtitle">
            Browse {filterOptions.moods.length > 0 ? '30+' : ''} poems across languages, moods, and forms
          </p>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="explore-page__body container">
        {/* Mobile filter toggle */}
        <button
          className="explore-page__filter-toggle"
          onClick={() => setSidebarOpen(o => !o)}
          aria-expanded={sidebarOpen}
          aria-controls="explore-sidebar"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="20" y2="12"/>
            <line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          Filters
          {hasActiveFilters && <span className="explore-page__filter-dot" aria-label="Active filters" />}
        </button>

        <div className="explore-page__layout">
          {/* Sidebar */}
          <aside
            id="explore-sidebar"
            className={`explore-page__sidebar ${sidebarOpen ? 'explore-page__sidebar--open' : ''}`}
          >
            <FilterBar
              filters={filterOptions}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </aside>

          {/* Feed */}
          <main className="explore-page__feed" aria-label="Poem feed" aria-live="polite">
            {/* Active filter summary */}
            {hasActiveFilters && !state.loading && (
              <div className="explore-page__results-bar">
                <span className="explore-page__results-count">
                  {state.poems.length > 0
                    ? `${state.poems.length}+ poems found`
                    : 'No poems match your filters'}
                </span>
                <button
                  className="explore-page__results-clear"
                  onClick={() => { handleFilterChange('__clear__', ''); setSearch(''); }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Poem grid */}
            {state.loading ? (
              <div className="explore-feed__grid stagger-children">
                {Array.from({ length: 12 }).map((_, i) => <ExplorePoemCardSkeleton key={i} />)}
              </div>
            ) : state.error ? (
              <div className="explore-page__error">
                <p>⚠️ Could not load poems. Is the backend running?</p>
                <p className="explore-page__error-detail">{state.error}</p>
              </div>
            ) : state.poems.length === 0 ? (
              <div className="explore-page__empty">
                <div className="explore-page__empty-icon">📭</div>
                <h3 className="font-serif">No poems found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="explore-feed__grid stagger-children">
                {state.poems.map((poem, i) => (
                  <ExplorePoemCard key={poem.id} poem={poem} index={i} />
                ))}
              </div>
            )}

            {/* Load more / spinner */}
            {state.loadingMore && (
              <div className="explore-page__loading-more" aria-label="Loading more poems">
                <div className="spinner" />
              </div>
            )}

            {/* Sentinel for IntersectionObserver */}
            {hasMore && !state.loading && (
              <div ref={sentinelRef} className="explore-page__sentinel" aria-hidden="true" />
            )}

            {!state.loading && !hasMore && state.poems.length > 0 && (
              <p className="explore-page__end-message">— You've reached the end —</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
