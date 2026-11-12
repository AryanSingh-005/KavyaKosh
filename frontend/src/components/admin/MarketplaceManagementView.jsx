import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';

export function MarketplaceManagementView({ executeAction }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'orders'
  const [listingsList, setListingsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listings filter
  const [listingQuery, setListingQuery] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('ALL');

  // Orders filter
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Modals
  const [formModal, setFormModal] = useState(null); // { mode: 'CREATE' | 'EDIT', item?: obj }
  const [deleteListingModal, setDeleteListingModal] = useState(null); // listing object
  const [inspectOrderModal, setInspectOrderModal] = useState(null); // order object
  const [refundModal, setRefundModal] = useState(null); // order object

  // Fetch listings
  const loadListings = useCallback(async (q = listingQuery, type = listingTypeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listings({ q, type });
      setListingsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marketplace listings.');
    } finally {
      setLoading(false);
    }
  }, [listingQuery, listingTypeFilter]);

  // Fetch orders
  const loadOrders = useCallback(async (q = orderQuery, status = orderStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.orders({ q, status });
      setOrdersList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [orderQuery, orderStatusFilter]);

  useEffect(() => {
    if (activeTab === 'listings') {
      loadListings();
    } else {
      loadOrders();
    }
  }, [activeTab, loadListings, loadOrders]);

  // Handle Save Listing
  const handleSaveListing = async (formData, id) => {
    await executeAction(async () => {
      await adminApi.saveListing(formData, id);
      await loadListings();
    });
    setFormModal(null);
  };

  // Handle Delete Listing
  const handleDeleteListing = async (id) => {
    await executeAction(async () => {
      await adminApi.deleteListing(id);
      await loadListings();
    });
    setDeleteListingModal(null);
  };

  // Handle Issue Refund
  const handleRefundOrder = async (id, reason) => {
    await executeAction(async () => {
      await adminApi.refundOrder(id, reason);
      if (activeTab === 'orders') await loadOrders();
    });
    setRefundModal(null);
    if (inspectOrderModal && inspectOrderModal.id === id) {
      setInspectOrderModal({ ...inspectOrderModal, paymentStatus: 'REFUNDED' });
    }
  };

  // KPI Calculations
  const totalListings = listingsList.length;
  const totalOrders = ordersList.length;
  const completedOrders = ordersList.filter(o => o.paymentStatus === 'COMPLETED');
  const refundedOrders = ordersList.filter(o => o.paymentStatus === 'REFUNDED');

  const grossRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalRefunded = refundedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const typeIcons = {
    BOOK: '📚',
    COURSE: '🎓',
    PRINT: '🖼️',
    MERCHANDISE: '👕'
  };

  return (
    <div className="moderation-container">
      {/* ── Summary Statistics KPI Strip ── */}
      <div className="user-management-stats">
        <div className="user-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
          <small>Active Store Listings</small>
          <strong style={{ color: '#0284c7' }}>{totalListings}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
          <small>Gross Marketplace Sales</small>
          <strong style={{ color: '#16a34a' }}>
            ₹{grossRevenue.toLocaleString('en-IN')}
          </strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #6366f1' }}>
          <small>Total Orders Processed</small>
          <strong style={{ color: '#6366f1' }}>{totalOrders}</strong>
        </div>
        <div className="user-stat-box" style={{ borderLeft: '4px solid #d97706' }}>
          <small>Total Refunded</small>
          <strong style={{ color: '#d97706' }}>
            ₹{totalRefunded.toLocaleString('en-IN')} <span style={{ fontSize: '12px', color: '#64748b' }}>({refundedOrders.length})</span>
          </strong>
        </div>
      </div>

      {/* ── Sub Navigation Tabs & Top Actions ── */}
      <div className="mod-tabs-header">
        <div className="mod-tab-buttons">
          <button
            className={`mod-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            🛍️ Store Catalogue Listings ({totalListings})
          </button>
          <button
            className={`mod-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Customer Orders & Payments ({totalOrders})
          </button>
        </div>

        {activeTab === 'listings' && (
          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setFormModal({ mode: 'CREATE' })}
          >
            <span>➕</span> Add New Listing
          </button>
        )}
      </div>

      {error && (
        <div className="admin-alert error" style={{ margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: MARKETPLACE LISTINGS ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'listings' && (
        <div className="mod-section">
          {/* Listings Filter Bar */}
          <form
            className="mod-filter-bar"
            onSubmit={e => { e.preventDefault(); loadListings(listingQuery, listingTypeFilter); }}
          >
            <div className="filter-group">
              <label>Type:</label>
              <select
                value={listingTypeFilter}
                onChange={e => {
                  setListingTypeFilter(e.target.value);
                  loadListings(listingQuery, e.target.value);
                }}
                className="admin-select"
              >
                <option value="ALL">All Categories</option>
                <option value="BOOK">📚 Books & Anthologies</option>
                <option value="COURSE">🎓 Masterclasses & Courses</option>
                <option value="PRINT">🖼️ Art Prints</option>
                <option value="MERCHANDISE">👕 Merchandise</option>
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search listings by title, author, description, ID..."
                value={listingQuery}
                onChange={e => setListingQuery(e.target.value)}
                className="admin-input"
              />
            </div>

            <button type="submit" className="btn-primary">
              🔍 Search
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setListingQuery('');
                setListingTypeFilter('ALL');
                loadListings('', 'ALL');
              }}
            >
              Reset
            </button>
          </form>

          {/* Listings Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Listing</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Author / Creator</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right', minWidth: '180px' }}>Listing Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty-cell">Loading marketplace listings...</td></tr>
                )}
                {!loading && listingsList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No marketplace listings found. Click <strong>"Add New Listing"</strong> to create one.
                    </td>
                  </tr>
                )}
                {!loading && listingsList.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="user-cell">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="user-avatar"
                            style={{ borderRadius: '6px', width: '40px', height: '40px' }}
                          />
                        ) : (
                          <div
                            className="user-avatar"
                            style={{ borderRadius: '6px', background: '#0284c7', fontSize: '18px' }}
                          >
                            {typeIcons[item.type] || '🛍️'}
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                            {item.name}
                            <span className="user-id-badge">#{item.id}</span>
                            {item.featured && <span title="Featured Product" style={{ marginLeft: '4px' }}>⭐</span>}
                          </strong>
                          <p className="mod-preview-excerpt" style={{ maxWidth: '320px', margin: '2px 0 0 0' }}>
                            {item.description ? (item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description) : 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge role-REVIEWER">
                        {typeIcons[item.type] || '🏷️'} {item.type || 'PRODUCT'}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>

                    <td>
                      <span className="mod-author-tag">
                        @{item.author || 'Editorial'}
                      </span>
                    </td>

                    <td>
                      {item.rating > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#eab308' }}>★</span>
                          <strong style={{ fontSize: '12.5px', color: '#334155' }}>
                            {(item.rating / 10).toFixed(1)}
                          </strong>
                          <small style={{ color: '#64748b' }}>({item.reviewCount || 0})</small>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>New</span>
                      )}
                    </td>

                    <td>
                      <div className="mod-actions-cluster">
                        <button
                          className="btn-secondary btn-xs"
                          title="Edit marketplace listing"
                          onClick={() => setFormModal({ mode: 'EDIT', item })}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          title="Remove listing from catalog"
                          onClick={() => setDeleteListingModal(item)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: ORDERS & PAYMENT OVERSIGHT ── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="mod-section">
          {/* Orders Filter Bar */}
          <form
            className="mod-filter-bar"
            onSubmit={e => { e.preventDefault(); loadOrders(orderQuery, orderStatusFilter); }}
          >
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={orderStatusFilter}
                onChange={e => {
                  setOrderStatusFilter(e.target.value);
                  loadOrders(orderQuery, e.target.value);
                }}
                className="admin-select"
              >
                <option value="ALL">All Order Statuses</option>
                <option value="COMPLETED">🟢 Completed / Paid</option>
                <option value="REFUNDED">🟣 Refunded</option>
                <option value="PENDING">🟡 Pending Payment</option>
                <option value="FAILED">🔴 Payment Failed</option>
              </select>
            </div>

            <div className="filter-group search" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search orders by Order ID, buyer username, item name, address..."
                value={orderQuery}
                onChange={e => setOrderQuery(e.target.value)}
                className="admin-input"
              />
            </div>

            <button type="submit" className="btn-primary">
              🔍 Search
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOrderQuery('');
                setOrderStatusFilter('ALL');
                loadOrders('', 'ALL');
              }}
            >
              Reset
            </button>
          </form>

          {/* Orders Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Item Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'right', minWidth: '180px' }}>Order Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="7" className="empty-cell">Searching and loading orders...</td></tr>
                )}
                {!loading && ordersList.length === 0 && (
                  <tr><td colSpan="7" className="empty-cell">No customer orders found matching filter criteria.</td></tr>
                )}
                {!loading && ordersList.map(ord => {
                  const isCompleted = ord.paymentStatus === 'COMPLETED';
                  const isRefunded = ord.paymentStatus === 'REFUNDED';

                  return (
                    <tr key={ord.id} style={isRefunded ? { background: '#faf5ff' } : {}}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                            #{ord.id ? (ord.id.length > 10 ? ord.id.substring(0, 10) + '...' : ord.id) : 'ORD'}
                          </strong>
                          {ord.stripePaymentIntentId && (
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              Tx: {ord.stripePaymentIntentId.substring(0, 12)}...
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px' }}>👤</span>
                          <strong style={{ color: '#334155' }}>@{ord.username || 'Guest'}</strong>
                        </div>
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        {ord.items && ord.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {ord.items.map((item, idx) => (
                              <small key={idx} style={{ color: '#334155' }}>
                                📦 {item.name} <span style={{ color: '#64748b' }}>× {item.quantity}</span>
                              </small>
                            ))}
                          </div>
                        ) : (
                          <small style={{ color: '#94a3b8' }}>General Marketplace Order</small>
                        )}
                      </td>

                      <td>
                        <strong style={{ fontSize: '14.5px', color: isRefunded ? '#7c3aed' : '#0f172a' }}>
                          ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        <span className={`badge ${
                          isCompleted ? 'status-ACTIVE' :
                          isRefunded ? 'role-PREMIUM' :
                          ord.paymentStatus === 'PENDING' ? 'status-SUSPENDED' : 'status-BANNED'
                        }`}>
                          {isCompleted ? '🟢 COMPLETED' :
                           isRefunded ? '🟣 REFUNDED' :
                           ord.paymentStatus || 'PENDING'}
                        </span>
                      </td>

                      <td>
                        <small style={{ color: '#64748b' }}>
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'N/A'}
                        </small>
                      </td>

                      <td>
                        <div className="mod-actions-cluster">
                          <button
                            className="btn-secondary btn-xs"
                            title="Inspect order invoice and shipping details"
                            onClick={() => setInspectOrderModal(ord)}
                          >
                            👁️ View
                          </button>

                          {isCompleted && (
                            <button
                              className="btn-danger btn-xs"
                              title="Issue a full refund to customer"
                              onClick={() => setRefundModal(ord)}
                            >
                              ↩️ Issue Refund
                            </button>
                          )}

                          {isRefunded && (
                            <span className="badge" style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '10.5px' }}>
                              ✓ Refunded
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── MODALS ── */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* Create / Edit Listing Modal */}
      {formModal && (
        <ListingFormModal
          mode={formModal.mode}
          item={formModal.item}
          onClose={() => setFormModal(null)}
          onSave={handleSaveListing}
        />
      )}

      {/* Delete Listing Confirmation Modal */}
      {deleteListingModal && (
        <DeleteListingModal
          item={deleteListingModal}
          onClose={() => setDeleteListingModal(null)}
          onDelete={() => handleDeleteListing(deleteListingModal.id)}
        />
      )}

      {/* Inspect Order Details Modal */}
      {inspectOrderModal && (
        <OrderDetailsModal
          order={inspectOrderModal}
          onClose={() => setInspectOrderModal(null)}
          onOpenRefund={() => {
            const o = inspectOrderModal;
            setInspectOrderModal(null);
            setRefundModal(o);
          }}
        />
      )}

      {/* Refund Order Modal */}
      {refundModal && (
        <RefundOrderModal
          order={refundModal}
          onClose={() => setRefundModal(null)}
          onRefund={handleRefundOrder}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Add or Edit Marketplace Listing
// ──────────────────────────────────────────────────────────────────
function ListingFormModal({ mode = 'CREATE', item, onClose, onSave }) {
  const isEdit = mode === 'EDIT';
  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState(item?.type || 'BOOK');
  const [price, setPrice] = useState(item?.price != null ? item.price : 499);
  const [author, setAuthor] = useState(item?.author || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [featured, setFeatured] = useState(Boolean(item?.featured));
  const [description, setDescription] = useState(item?.description || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        price: Number(price),
        author: author.trim() || 'Editorial Board',
        imageUrl: imageUrl.trim() || null,
        featured,
        description: description.trim()
      };
      await onSave(payload, item?.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <header className="modal-header">
          <h3>{isEdit ? `✏️ Edit Listing: ${item?.name}` : '➕ Add Marketplace Listing'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <label>
              Product Name *
              <input
                required
                type="text"
                placeholder="e.g. KavyaKosh Annual Anthology Vol. 1"
                value={name}
                onChange={e => setName(e.target.value)}
                className="admin-input"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                Category Type
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="BOOK">📚 Book / Anthology</option>
                  <option value="COURSE">🎓 Masterclass / Course</option>
                  <option value="PRINT">🖼️ Art Print</option>
                  <option value="MERCHANDISE">👕 Merchandise / Goods</option>
                </select>
              </label>

              <label>
                Price in INR (₹) *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="499"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                Author / Creator
                <input
                  type="text"
                  placeholder="e.g. Editorial Board or Poet Name"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label>
                Cover Image URL
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>

            <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>⭐ Feature this product on the marketplace front page</span>
            </label>

            <label>
              Product Description *
              <textarea
                required
                rows={4}
                placeholder="Detailed description of the book edition, curriculum syllabus, physical print dimensions, or item specs..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="admin-input"
                style={{ resize: 'vertical' }}
              />
            </label>

            <div className="audit-notice">
              🔒 Changes will be permanently recorded in the system audit log.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? '💾 Update Product' : '✨ Publish Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Delete Marketplace Listing Confirmation
// ──────────────────────────────────────────────────────────────────
function DeleteListingModal({ item, onClose, onDelete }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onDelete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <header className="modal-header">
          <h3>🗑️ Remove Marketplace Listing</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p style={{ color: '#b91c1c', fontSize: '13.5px', marginTop: 0 }}>
            ⚠️ Are you sure you want to permanently remove listing <strong>"{item?.name}"</strong> (ID #{item?.id}) from the platform marketplace?
          </p>

          <div className="audit-notice">
            🔒 This action will be recorded in the system audit log.
          </div>
        </div>

        <div className="profile-actions-bar">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Removing...' : '🗑️ Confirm Removal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Order Details Inspector & Invoice Breakdown
// ──────────────────────────────────────────────────────────────────
function OrderDetailsModal({ order, onClose, onOpenRefund }) {
  if (!order) return null;
  const isCompleted = order.paymentStatus === 'COMPLETED';
  const isRefunded = order.paymentStatus === 'REFUNDED';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <header className="modal-header">
          <h3>📦 Order Inspector: #{order.id}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Header Status & Reference */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span className="user-id-badge">Order ID: {order.id}</span>
              <span className="mod-author-tag" style={{ marginLeft: '8px' }}>
                Customer: <strong>@{order.username || 'Guest'}</strong>
              </span>
            </div>
            <span className={`badge ${
              isCompleted ? 'status-ACTIVE' :
              isRefunded ? 'role-PREMIUM' : 'status-SUSPENDED'
            }`}>
              {order.paymentStatus}
            </span>
          </div>

          {/* Payment & Transaction Info */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Date Placed:</span>
              <strong>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Payment Intent Reference:</span>
              <span style={{ fontFamily: 'monospace', color: '#334155' }}>
                {order.stripePaymentIntentId || 'Stubbed / Offline Mock Payment'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Currency:</span>
              <strong>{order.currency || 'INR'}</strong>
            </div>
          </div>

          {/* Itemized Order Line Items */}
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#334155' }}>
            Itemized Order Breakdown
          </h4>
          <div className="admin-table-wrap" style={{ marginBottom: '16px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th style={{ textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.itemId && <small style={{ color: '#64748b', display: 'block' }}>ID #{item.itemId}</small>}
                      </td>
                      <td>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                      <td>× {item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>General Marketplace Order</td>
                    <td>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td>1</td>
                    <td style={{ textAlign: 'right' }}>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" style={{ textAlign: 'right' }}>Total Amount Paid:</th>
                  <th style={{ textAlign: 'right', fontSize: '15px', color: '#0f172a' }}>
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#334155' }}>
                📍 Shipping Address
              </h4>
              <div style={{ background: '#fff', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                {order.shippingAddress}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions-bar">
          {isCompleted && (
            <button type="button" className="btn-danger" onClick={onOpenRefund}>
              ↩️ Issue Refund
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={onClose} style={{ marginLeft: 'auto' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal: Issue Refund Confirmation with Reason
// ──────────────────────────────────────────────────────────────────
function RefundOrderModal({ order, onClose, onRefund }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onRefund(order.id, reason.trim() || 'Customer requested refund / order cancellation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <header className="modal-header">
          <h3>↩️ Issue Order Refund</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: '#0f172a', fontSize: '13.5px', marginTop: 0 }}>
              You are about to issue a refund for Order <strong>#{order.id}</strong> of <strong>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</strong> to customer <strong>@{order.username}</strong>.
            </p>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px', marginBottom: '14px' }}>
              <div><strong>Order ID:</strong> {order.id}</div>
              <div style={{ marginTop: '3px' }}><strong>Amount to Refund:</strong> ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</div>
              <div style={{ marginTop: '3px' }}><strong>Payment Provider:</strong> {order.stripePaymentIntentId || 'Stubbed Payment Gateway'}</div>
              <div style={{ marginTop: '3px', color: '#64748b' }}>
                Order status will update to <strong>REFUNDED</strong> and buyer will be notified.
              </div>
            </div>

            <label>
              Refund Justification Reason *
              <textarea
                required
                rows={3}
                placeholder="e.g. Defective print copy, duplicate transaction, customer cancellation requested..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="admin-input"
              />
            </label>

            <div className="audit-notice" style={{ marginTop: '8px' }}>
              🔒 Refund will be permanently recorded in the system audit log.
            </div>
          </div>

          <div className="profile-actions-bar">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-danger" disabled={submitting}>
              {submitting ? 'Processing...' : '↩️ Confirm & Issue Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
