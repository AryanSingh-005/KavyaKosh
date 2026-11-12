import { Link } from 'react-router-dom';
import './TrendingPoems.css';

// SVG Icons
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function PoemCard({ poem, index }) {
  const initials = poem.author?.username
    ? poem.author.username.slice(0, 2).toUpperCase()
    : '??';

  const categoryClass = poem.category?.toLowerCase().replace(/\s+/g, '-') || 'verse';

  return (
    <article
      className="poem-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="poem-card__header">
        <span className={`badge badge--${index % 3 === 0 ? 'gold' : index % 3 === 1 ? 'purple' : 'rose'}`}>
          {poem.category || 'Verse'}
        </span>
        <div className="poem-card__rank">#{index + 1}</div>
      </div>

      <Link to={`/poems/${poem.id}`} className="poem-card__title-link">
        <h3 className="poem-card__title font-serif">{poem.title}</h3>
      </Link>

      <blockquote className="poem-card__excerpt font-serif">
        {poem.excerpt || 'Click to read this beautiful poem...'}
      </blockquote>

      <div className="poem-card__footer">
        <div className="poem-card__author">
          <div className="poem-card__avatar" data-initials={initials}>
            {initials}
          </div>
          <span className="poem-card__author-name">{poem.author?.username || 'Unknown'}</span>
        </div>

        <div className="poem-card__stats">
          <span className="stat-pill">
            <HeartIcon />{formatNumber(poem.likesCount)}
          </span>
          <span className="stat-pill">
            <EyeIcon />{formatNumber(poem.viewsCount)}
          </span>
          <span className="stat-pill">
            <CommentIcon />{formatNumber(poem.commentsCount)}
          </span>
        </div>
      </div>
    </article>
  );
}

// Skeleton card shown while loading
function PoemCardSkeleton() {
  return (
    <div className="poem-card glass-card poem-card--skeleton">
      <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 24, width: '80%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 24 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ height: 32, width: '40%', borderRadius: '999px' }} />
        <div className="skeleton" style={{ height: 16, width: '30%' }} />
      </div>
    </div>
  );
}

export default function TrendingPoems({ poems, loading }) {
  return (
    <section className="section trending-poems" id="trending-poems" aria-label="Trending Poems">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-header__eyebrow">🔥 What's Hot</p>
            <h2 className="section-header__title">Trending Poems</h2>
          </div>
          <Link to="/explore" className="section-header__link">
            View all poems →
          </Link>
        </div>

        <div className="trending-poems__grid stagger-children">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <PoemCardSkeleton key={i} />)
            : poems.map((poem, i) => <PoemCard key={poem.id} poem={poem} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
