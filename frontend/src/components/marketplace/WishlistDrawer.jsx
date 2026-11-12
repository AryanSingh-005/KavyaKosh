import React from 'react';
import './WishlistDrawer.css';

const WishlistDrawer = ({ isOpen, onClose, wishlistItems, onRemoveFromWishlist, onCheckoutItem }) => {
  if (!isOpen) return null;

  return (
    <div className="wishlist-drawer-overlay" onClick={onClose}>
      <div className="wishlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-drawer__header">
          <div className="wishlist-title">
            <span>❤️ Saved Wishlist ({wishlistItems.length})</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="wishlist-drawer__list">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-empty">
              <span className="empty-icon">📖</span>
              <p>Your wishlist is currently empty.</p>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-item">
                <div className="wishlist-item__img">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <span>📖</span>
                  )}
                </div>

                <div className="wishlist-item__info">
                  <h4 className="item-name font-serif">{item.name}</h4>
                  <span className="item-author">By {item.author || 'KavyaKosh'}</span>
                  <span className="item-price">₹{item.price}</span>
                </div>

                <div className="wishlist-item__actions">
                  <button
                    type="button"
                    className="buy-wishlist-btn"
                    onClick={() => {
                      onCheckoutItem(item);
                      onClose();
                    }}
                  >
                    💳 Buy
                  </button>
                  <button
                    type="button"
                    className="remove-wishlist-btn"
                    onClick={() => onRemoveFromWishlist(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
