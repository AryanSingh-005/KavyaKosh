import React, { useState } from 'react';
import { processStripeCheckout } from '../../api/marketplaceApi';
import { usePremium } from '../../context/PremiumContext';
import './StripeCheckoutModal.css';

const StripeCheckoutModal = ({ item, isOpen, onClose, onSuccessOrder }) => {
  const { features, tier } = usePremium();
  const [shippingAddress, setShippingAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12 / 28');
  const [cvc, setCvc] = useState('123');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const discountPercent = features?.marketplaceDiscountPercent || 0;
  const discountAmount = Math.round((item.price * discountPercent) / 100);
  const finalTotal = item.price - discountAmount;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await processStripeCheckout({
        items: [
          {
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
          }
        ],
        shippingAddress: shippingAddress || '12-A Poetry Boulevard, Literary Colony, New Delhi - 110001',
        currency: 'INR'
      });

      if (onSuccessOrder) {
        onSuccessOrder(response);
      }
      onClose();
    } catch (err) {
      console.error('Stripe checkout failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stripe-modal-overlay" onClick={onClose}>
      <div className="stripe-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="stripe-modal__header">
          <div className="stripe-branding">
            <span className="stripe-badge">💳 Stripe Checkout</span>
            <span className="test-mode-pill">Test Mode</span>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmitPayment} className="stripe-checkout-form">
          
          {/* Item Order Summary */}
          <div className="order-summary-box">
            <div className="summary-item-row">
              <span className="item-title font-serif">"{item.name}"</span>
              <span className="item-price">
                {discountPercent > 0 ? (
                  <>
                    <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.9em', marginRight: '6px' }}>₹{item.price}</span>
                    <span style={{ color: '#eab308' }}>₹{finalTotal}</span>
                  </>
                ) : (
                  <>₹{item.price}</>
                )}
              </span>
            </div>
            <div className="summary-breakdown">
              {discountPercent > 0 && (
                <span style={{ color: '#eab308' }}>
                  <strong>{tier} Member Discount ({discountPercent}% off):</strong> -₹{discountAmount}
                </span>
              )}
              <span>Standard Literary Express Shipping: <strong>FREE</strong></span>
              <span>Total Amount: <strong className="total-gold">₹{finalTotal}</strong></span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-group">
            <label className="stripe-label">Shipping Address</label>
            <textarea
              className="stripe-textarea"
              rows={2}
              placeholder="House/Street, Landmark, City, Postal Code..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>

          {/* Card Details (Stripe Card Element Simulation) */}
          <div className="form-group">
            <label className="stripe-label">Credit or Debit Card</label>
            <div className="stripe-card-element">
              <div className="card-input-row">
                <span className="card-icon">💳</span>
                <input
                  type="text"
                  className="card-num-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div className="card-expiry-row">
                <input
                  type="text"
                  className="card-exp-input"
                  placeholder="MM / YY"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                />
                <input
                  type="text"
                  className="card-cvc-input"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="stripe-pay-btn" disabled={submitting}>
            {submitting ? '🔒 Processing Payment...' : `🔒 Pay ₹${item.price} via Stripe`}
          </button>
          <span className="stripe-guarantee font-sans">
            🔒 Encrypted by 256-Bit SSL Stripe Security. No real charges occur in test mode.
          </span>
        </form>

      </div>
    </div>
  );
};

export default StripeCheckoutModal;
