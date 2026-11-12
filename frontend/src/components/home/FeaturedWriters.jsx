import { Link } from 'react-router-dom';
import './FeaturedWriters.css';

function WriterCard({ writer, index }) {
  const initials = writer.username
    ? writer.username.slice(0, 2).toUpperCase()
    : '??';

  const avatarColors = [
    'linear-gradient(135deg, #7c5cfc 0%, #d4af37 100%)',
    'linear-gradient(135deg, #e05c97 0%, #7c5cfc 100%)',
    'linear-gradient(135deg, #d4af37 0%, #e05c97 100%)',
    'linear-gradient(135deg, #2dd4bf 0%, #7c5cfc 100%)',
    'linear-gradient(135deg, #7c5cfc 0%, #2dd4bf 100%)',
    'linear-gradient(135deg, #e05c97 0%, #d4af37 100%)',
  ];
  const gradient = avatarColors[index % avatarColors.length];

  function formatFollowers(n) {
    if (!n) return '0';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  return (
    <article
      className="writer-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="writer-card__avatar-wrap">
        {writer.avatarUrl ? (
          <img
            src={writer.avatarUrl}
            alt={`${writer.username} avatar`}
            className="writer-card__avatar-img"
            loading="lazy"
          />
        ) : (
          <div className="writer-card__avatar" style={{ background: gradient }}>
            {initials}
          </div>
        )}
        <div className="writer-card__badge">Featured</div>
      </div>

      <div className="writer-card__body">
        <Link to={`/writers/${writer.id}`} className="writer-card__name-link">
          <h3 className="writer-card__name font-serif">{writer.username}</h3>
        </Link>
        <p className="writer-card__bio">{writer.bio || 'A voice in the poetry universe.'}</p>
      </div>

      <div className="writer-card__stats">
        <div className="writer-card__stat">
          <span className="writer-card__stat-value">{formatFollowers(writer.followerCount)}</span>
          <span className="writer-card__stat-label">Followers</span>
        </div>
        <div className="writer-card__stat-divider" />
        <div className="writer-card__stat">
          <span className="writer-card__stat-value">{writer.poemCount ?? 0}</span>
          <span className="writer-card__stat-label">Poems</span>
        </div>
      </div>

      <Link to={`/writers/${writer.id}`} className="btn btn-ghost btn-sm writer-card__follow-btn">
        Follow
      </Link>
    </article>
  );
}

function WriterCardSkeleton() {
  return (
    <div className="writer-card glass-card">
      <div className="writer-card__avatar-wrap">
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
      </div>
      <div className="writer-card__body">
        <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
      </div>
      <div className="skeleton" style={{ height: 36, borderRadius: '999px', marginTop: 16 }} />
    </div>
  );
}

export default function FeaturedWriters({ writers, loading }) {
  return (
    <section className="section featured-writers" id="featured-writers" aria-label="Featured Writers">
      <div className="featured-writers__bg" aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="section-header">
          <div>
            <p className="section-header__eyebrow">✦ Voices to Follow</p>
            <h2 className="section-header__title">Featured Writers</h2>
          </div>
          <Link to="/writers" className="section-header__link">
            Browse all writers →
          </Link>
        </div>

        <div className="featured-writers__grid stagger-children">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <WriterCardSkeleton key={i} />)
            : writers.map((w, i) => <WriterCard key={w.id} writer={w} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
