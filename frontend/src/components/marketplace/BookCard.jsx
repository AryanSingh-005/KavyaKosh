import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ item, isWishlisted = false, onToggleWishlist, onBuyNow }) => {
  const formattedRating = item.rating ? (item.rating / 10).toFixed(1) : '4.5';
  const priceFormatted = item.price ? `₹${item.price}` : '₹499';

  return (
    <div className="book-card glass-card">
      
      {/* Cover Image & Wishlist Button */}
      <div className="book-cover-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="book-cover-img" />
        ) : (
          <div className="book-cover-placeholder">
            <span className="placeholder-icon">📖</span>
            <span className="placeholder-title">{item.name}</span>
          </div>
        )}

        <button
          type="button"
          className={`wishlist-heart-btn ${isWishlisted ? 'wishlist-heart-btn--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(item.id);
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        {item.type && <span className="book-type-badge">{item.type}</span>}
      </div>

      {/* Book Metadata */}
      <div className="book-card-info">
        <Link to={`/marketplace/books/${item.id}`} className="book-title-link">
          <h3 className="book-title font-serif">{item.name}</h3>
        </Link>
        <span className="book-author">By {item.author || 'KavyaKosh Press'}</span>

        <div className="book-rating-row">
          <span className="stars font-gold">★ {formattedRating}</span>
          <span className="review-count">({item.reviewCount || 12} reviews)</span>
        </div>

        <div className="book-card-footer">
          <span className="book-price">{priceFormatted}</span>
          <button
            type="button"
            className="book-buy-btn"
            onClick={() => onBuyNow(item)}
          >
            💳 Buy Now
          </button>
        </div>
      </div>

    </div>
  );
};

export default BookCard;
