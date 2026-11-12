import { Link } from 'react-router-dom';
import './ExplorePoemCard.css';

/* SVG icons */
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

function formatNum(n) {
  if (!n) return '0';
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

const MOOD_COLORS = {
  Romance: 'rose', Melancholy: 'blue', Devotion: 'amber',
  Nature: 'teal', Philosophy: 'purple', Rebellion: 'red', Joy: 'gold',
};

export default function ExplorePoemCard({ poem, index = 0 }) {
  if (!poem) return null;

  const initials = poem.author?.username?.slice(0, 2).toUpperCase() || '??';
  const moodColor = MOOD_COLORS[poem.mood] || 'default';

  return (
    <article
      className="explore-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${(index % 6) * 60}ms` }}
      aria-label={`Poem: ${poem.title}`}
    >
      {/* Top metadata row */}
      <div className="explore-card__meta">
        <div className="explore-card__badges">
          {poem.mood && (
            <span className={`explore-card__mood-badge mood-badge--${moodColor}`}>
              {poem.mood}
            </span>
          )}
          {poem.category && (
            <span className="explore-card__category">{poem.category}</span>
          )}
          {poem.language && (
            <span className="explore-card__language">{poem.language}</span>
          )}
        </div>
        <time className="explore-card__time" dateTime={poem.createdAt}>
          {timeAgo(poem.createdAt)}
        </time>
      </div>

      {/* Title */}
      <Link to={`/poems/${poem.id}`} className="explore-card__title-link">
        <h2 className="explore-card__title font-serif">{poem.title}</h2>
      </Link>

      {/* Excerpt */}
      <blockquote className="explore-card__excerpt font-serif">
        {poem.excerpt || '…'}
      </blockquote>

      {/* Tags */}
      {poem.tags?.length > 0 && (
        <div className="explore-card__tags" aria-label="Tags">
          {poem.tags.slice(0, 4).map(tag => (
            <span key={tag} className="explore-card__tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: author + stats */}
      <div className="explore-card__footer">
        <Link to={`/writers/${poem.author?.userId}`} className="explore-card__author">
          <div className="explore-card__avatar" aria-hidden="true">
            {initials}
          </div>
          <span className="explore-card__author-name">{poem.author?.username || 'Anonymous'}</span>
        </Link>

        <div className="explore-card__stats" aria-label="Engagement">
          <span className="stat-pill">
            <HeartIcon />{formatNum(poem.likesCount)}
          </span>
          <span className="stat-pill">
            <EyeIcon />{formatNum(poem.viewsCount)}
          </span>
          <span className="stat-pill">
            <CommentIcon />{formatNum(poem.commentsCount)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ExplorePoemCardSkeleton() {
  return (
    <div className="explore-card glass-card">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 999 }} />
      </div>
      <div className="skeleton" style={{ height: 26, width: '75%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 16, width: '85%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 20 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ height: 32, width: '40%', borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 16, width: '30%' }} />
      </div>
    </div>
  );
}
