import React, { useState, useEffect } from 'react';
import BookCard from '../../components/marketplace/BookCard';
import WishlistDrawer from '../../components/marketplace/WishlistDrawer';
import StripeCheckoutModal from '../../components/marketplace/StripeCheckoutModal';
import { getMarketplaceItems, getWishlistIds, toggleMarketplaceWishlist, getWishlistItems } from '../../api/marketplaceApi';
import './MarketplacePage.css';

const TYPES = [
  { id: 'ALL', label: 'All Items' },
  { id: 'BOOK', label: '📚 Poetry Books & Ghazal Anthologies' },
  { id: 'COURSE', label: '🎓 Masterclasses & Poetry Workshops' },
  { id: 'PRINT', label: '🖼️ Calligraphy Prints & Framed Verses' },
  { id: 'MERCHANDISE', label: '🕯️ Literary Goods & Journal Sets' }
];

const MarketplacePage = () => {
  const [items, setItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortOption, setSortOption] = useState('popular');
  
  // Modals & Drawers
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
    fetchWishlist();
  }, [search, selectedType, sortOption]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await getMarketplaceItems({
        search: search.trim() || undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        sort: sortOption
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const ids = await getWishlistIds();
      setWishlistIds(new Set(ids));
    } catch (err) {
      console.warn('Wishlist load warning:', err);
    }
  };

  const handleToggleWishlist = async (itemId) => {
    try {
      const isAdded = await toggleMarketplaceWishlist(itemId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isAdded) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const handleOpenWishlistDrawer = async () => {
    setWishlistOpen(true);
    try {
      const itemsData = await getWishlistItems();
      setWishlistItems(itemsData);
    } catch (err) {
      console.error('Failed to fetch wishlist items:', err);
    }
  };

  const handleOrderSuccess = (orderResponse) => {
    setOrderConfirmation(orderResponse);
    setTimeout(() => setOrderConfirmation(null), 5000);
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        
        {/* Header Banner */}
        <header className="marketplace-header">
          <div className="header-badge">🏛️ KavyaKosh Bookstore & Fine Arts</div>
          <h1 className="marketplace-title">Poetic Collections & Publications</h1>
          <p className="marketplace-subtitle">
            Explore authentic Ghazal anthologies, signed poetry collections, calligraphy prints, and masterclasses.
          </p>

          <div className="header-actions">
            <button
              type="button"
              className="wishlist-trigger-btn"
              onClick={handleOpenWishlistDrawer}
            >
              ❤️ Saved Wishlist ({wishlistIds.size})
            </button>
          </div>
        </header>

        {/* Order Success Toast */}
        {orderConfirmation && (
          <div className="order-success-toast">
            🎉 Order Placed Successfully! Tracking Order ID: <strong>{orderConfirmation.orderId}</strong>
          </div>
        )}

        {/* Search & Filter Control Bar */}
        <div className="marketplace-filter-bar">
          <div className="search-box font-sans">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search books, authors, or collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-box">
            <label htmlFor="sortSelect" className="sort-label">Sort By:</label>
            <select
              id="sortSelect"
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="popular">Popularity & Rating</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated (5 Stars)</option>
            </select>
          </div>
        </div>

        {/* Format Filter Chips */}
        <div className="type-chips-row">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`type-chip ${selectedType === t.id ? 'type-chip--active' : ''}`}
              onClick={() => setSelectedType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="catalog-grid">
          {loading ? (
            <div className="catalog-loading">Loading poetry collections...</div>
          ) : items.length === 0 ? (
            <div className="catalog-empty">
              <span className="empty-icon">📖</span>
              <h3>No Collections Found</h3>
              <p>Try clearing your search or format filters.</p>
            </div>
          ) : (
            items.map((item) => (
              <BookCard
                key={item.id}
                item={item}
                isWishlisted={wishlistIds.has(item.id)}
                onToggleWishlist={handleToggleWishlist}
                onBuyNow={(selected) => setCheckoutItem(selected)}
              />
            ))
          )}
        </div>

      </div>

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={handleToggleWishlist}
        onCheckoutItem={(selected) => setCheckoutItem(selected)}
      />

      {/* Stripe Test Checkout Modal */}
      <StripeCheckoutModal
        item={checkoutItem}
        isOpen={!!checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onSuccessOrder={handleOrderSuccess}
      />
    </div>
  );
};

export default MarketplacePage;
