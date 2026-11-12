import React, { useState } from 'react';
import { subscribeToPlan } from '../../api/premiumApi';
import './SubscribeModal.css';

const TIER_LABELS = { LITE: 'Lite — ₹199/month', PRO: 'Pro — ₹499/month' };

const SubscribeModal = ({ tier, onClose, onSuccess }) => {
  const [cardName, setCardName]     = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  if (!tier) return null;

  const formatCardNumber = (v) =>
    v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '');
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2, 4) : d;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card name and 16-digit card number.');
      return;
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Enter expiry in MM/YY format.');
      return;
    }
    if (cvv.length < 3) {
      setError('CVV must be at least 3 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Simulate a payment method token from the card details
      const simulatedPmId = 'pm_test_' + Math.random().toString(36).substring(2, 14);
      const result = await subscribeToPlan(tier, simulatedPmId);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sub-modal-panel" role="dialog" aria-modal="true">
        <button className="sub-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="sub-modal-header">
          <div className="sub-modal-icon">✨</div>
          <h2 className="sub-modal-title">Unlock {TIER_LABELS[tier]}</h2>
          <p className="sub-modal-subtitle">Simulated Stripe checkout — no real charges.</p>
        </div>

        <form className="sub-modal-form" onSubmit={handleSubmit}>
          {error && <div className="sub-modal-error">{error}</div>}

          <div className="sub-form-group">
            <label className="sub-form-label" htmlFor="sub-card-name">Cardholder Name</label>
            <input
              id="sub-card-name"
              className="sub-form-input"
              type="text"
              placeholder="Mirza Asad-Ullah Khan"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label" htmlFor="sub-card-number">Card Number</label>
            <div className="sub-card-input-row">
              <input
                id="sub-card-number"
                className="sub-form-input sub-form-input--card"
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                inputMode="numeric"
              />
              <span className="sub-card-brand">💳</span>
            </div>
          </div>

          <div className="sub-form-row">
            <div className="sub-form-group">
              <label className="sub-form-label" htmlFor="sub-expiry">Expiry</label>
              <input
                id="sub-expiry"
                className="sub-form-input"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                inputMode="numeric"
              />
            </div>
            <div className="sub-form-group">
              <label className="sub-form-label" htmlFor="sub-cvv">CVV</label>
              <input
                id="sub-cvv"
                className="sub-form-input"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="sub-total-row">
            <span>Billed monthly</span>
            <span className="sub-total-amount">{tier === 'PRO' ? '₹499' : '₹199'}</span>
          </div>

          <button
            type="submit"
            className={`sub-submit-btn ${tier === 'PRO' ? 'sub-submit-btn--pro' : 'sub-submit-btn--lite'}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Subscribe to ${tier === 'PRO' ? 'Pro ✨' : 'Lite 🌟'}`}
          </button>

          <p className="sub-secure-note">🔒 Test mode — no real payment processed</p>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;
