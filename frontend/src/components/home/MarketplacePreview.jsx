import { Link } from 'react-router-dom';
import './MarketplacePreview.css';

const typeLabels = {
  BOOK: { label: 'Book', badge: 'badge--gold' },
  COURSE: { label: 'Course', badge: 'badge--purple' },
  PRINT: { label: 'Fine Art', badge: 'badge--teal' },
  MERCHANDISE: { label: 'Merch', badge: 'badge--rose' },
};

function StarRating({ rating }) {
  // rating is stored as integer: 48 = 4.8 stars
  const stars = rating / 10;
  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.5;

  return (
    <div className="star-rating" aria-label={`${stars} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= fullStars ? 'star--full' : i === fullStars + 1 && hasHalf ? 'star--half' : 'star--empty'}`}
          aria-hidden="true"
        >★</span>
      ))}
      <span className="star-rating__value">{stars.toFixed(1)}</span>
    </div>
  );
}

function MarketplaceCard({ item, index }) {
  const meta = typeLabels[item.type] || { label: item.type, badge: 'badge--gold' };

  return (
    <article
      className="marketplace-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Product Image */}
      <div className="marketplace-card__image-wrap">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="marketplace-card__image"
            loading="lazy"
          />
        ) : (
          <div className="marketplace-card__image-placeholder">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
        )}
        <span className={`badge ${meta.badge} marketplace-card__type-badge`}>{meta.label}</span>
      </div>

      {/* Content */}
      <div className="marketplace-card__body">
        <Link to={`/marketplace/${item.id}`} className="marketplace-card__title-link">
          <h3 className="marketplace-card__title font-serif">{item.name}</h3>
        </Link>
        {item.author && (
          <p className="marketplace-card__author">by {item.author}</p>
        )}
        <p className="marketplace-card__desc">{item.description}</p>
      </div>

      {/* Footer */}
      <div className="marketplace-card__footer">
        <div className="marketplace-card__rating-row">
          <StarRating rating={item.rating || 0} />
          <span className="marketplace-card__review-count">({item.reviewCount || 0})</span>
        </div>
        <div className="marketplace-card__buy-row">
          <span className="marketplace-card__price">₹{parseFloat(item.price).toFixed(0)}</span>
          <Link
            to={`/marketplace/${item.id}`}
            className="btn btn-primary btn-sm"
            id={`marketplace-buy-${item.id}`}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}

function MarketplaceCardSkeleton() {
  return (
    <div className="marketplace-card glass-card">
      <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: 22, width: '80%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 28, width: '30%' }} />
          <div className="skeleton" style={{ height: 36, width: '40%', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePreview({ items, loading }) {
  return (
    <section className="section marketplace-preview" id="marketplace" aria-label="Marketplace Preview">
      <div className="marketplace-preview__bg" aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="section-header">
          <div>
            <p className="section-header__eyebrow">📚 Poetry Store</p>
            <h2 className="section-header__title">Marketplace</h2>
          </div>
          <Link to="/marketplace" className="section-header__link">
            Browse all items →
          </Link>
        </div>

        <div className="marketplace-preview__grid stagger-children">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <MarketplaceCardSkeleton key={i} />)
            : items.map((item, i) => <MarketplaceCard key={item.id} item={item} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
