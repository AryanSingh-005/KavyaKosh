import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookCard from '../../components/marketplace/BookCard';
import StripeCheckoutModal from '../../components/marketplace/StripeCheckoutModal';
import { getMarketplaceItemDetail, getSimilarMarketplaceItems, getBookReviews, addBookReview } from '../../api/marketplaceApi';
import './BookDetailPage.css';

const BookDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Submission State
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Stripe Modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const [itemData, similarData, reviewsData] = await Promise.all([
        getMarketplaceItemDetail(id),
        getSimilarMarketplaceItems(id).catch(() => []),
        getBookReviews(id).catch(() => [])
      ]);
      setItem(itemData);
      setSimilarItems(similarData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Failed to load book detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !item) return;

    setSubmittingReview(true);
    try {
      const newReview = await addBookReview(item.id, {
        rating: ratingInput,
        comment: commentInput.trim()
      });
      setReviews((prev) => [newReview, ...prev]);
      setCommentInput('');
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="book-detail-loading">Loading book publication details...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="book-detail-page">
        <div className="book-detail-error">
          <h2>Book Not Found</h2>
          <Link to="/marketplace" className="btn-back">Back to Bookstore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        
        {/* Top Back Link */}
        <div className="back-link-row">
          <Link to="/marketplace" className="back-link">← Back to Marketplace</Link>
        </div>

        {/* Main Book Hero Section */}
        <div className="book-hero-card glass-card">
          <div className="book-hero-cover">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} />
            ) : (
              <div className="hero-placeholder">
                <span className="ph-icon">📖</span>
                <span className="ph-title">{item.name}</span>
              </div>
            )}
          </div>

          <div className="book-hero-info">
            <span className="hero-type-badge">{item.type || 'BOOK'}</span>
            <h1 className="hero-title font-serif">{item.name}</h1>
            <p className="hero-author">Author: <strong>{item.author || 'KavyaKosh Press'}</strong></p>

            <div className="hero-rating-row">
              <span className="stars-gold font-gold">★ {item.rating ? (item.rating / 10).toFixed(1) : '4.8'}</span>
              <span className="reviews-lbl">({item.reviewCount || reviews.length} Customer Reviews)</span>
            </div>

            <div className="hero-price-row">
              <span className="hero-price">₹{item.price}</span>
              <span className="shipping-tag">✓ In Stock • Express Literary Shipping</span>
            </div>

            <p className="hero-desc">{item.description}</p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-buy-btn"
                onClick={() => setCheckoutModalOpen(true)}
              >
                💳 Buy Now with Stripe
              </button>
            </div>
          </div>
        </div>

        {/* Similar Books Recommendation Section */}
        {similarItems.length > 0 && (
          <section className="recommendations-section">
            <h3 className="section-title font-serif">📚 Readers Also Enjoyed (Similar Publications)</h3>
            <div className="recommendations-grid">
              {similarItems.map((sim) => (
                <BookCard
                  key={sim.id}
                  item={sim}
                  onToggleWishlist={() => {}}
                  onBuyNow={(selected) => setCheckoutModalOpen(true)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reviews & Star Rating Section */}
        <section className="reviews-section glass-card">
          <h3 className="section-title font-serif">⭐ Customer Ratings & Literary Reviews ({reviews.length})</h3>

          {/* Add Review Form */}
          <form onSubmit={handlePostReview} className="add-review-form">
            <div className="rating-select-row">
              <span>Your Rating:</span>
              {[5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`star-select-btn ${ratingInput === r ? 'star-select-btn--active' : ''}`}
                  onClick={() => setRatingInput(r)}
                >
                  {r} ★
                </button>
              ))}
            </div>

            <textarea
              className="review-textarea"
              rows={3}
              placeholder="Share your review of this poetry book, meter quality, or printing finish..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />

            <button type="submit" className="submit-review-btn" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Post Book Review'}
            </button>
          </form>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">No reader reviews submitted yet. Be the first!</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="review-item">
                  <div className="rev-header">
                    <span className="rev-author">@{rev.username || 'PoetryReader'}</span>
                    <span className="rev-stars">{'★'.repeat(rev.rating || 5)}</span>
                  </div>
                  <p className="rev-text">{rev.comment}</p>
                  <span className="rev-date">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* Stripe Modal */}
      <StripeCheckoutModal
        item={item}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccessOrder={() => alert('Order Placed Successfully!')}
      />
    </div>
  );
};

export default BookDetailPage;
