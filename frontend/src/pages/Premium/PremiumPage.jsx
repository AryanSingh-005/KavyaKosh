import React, { useState, useEffect } from 'react';
import { getTierDefinitions, cancelSubscription } from '../../api/premiumApi';
import { usePremium } from '../../context/PremiumContext';
import SubscribeModal from '../../components/premium/SubscribeModal';
import './PremiumPage.css';

/* ── Tier icons ── */
const TIER_ICONS = { FREE: '📖', LITE: '🌟', PRO: '✨' };

/* ── Feature rows for the comparison table ── */
const COMPARISON_ROWS = [
  { label: 'Daily AI Generations',  key: 'dailyAiGenerations',        format: (v) => v === -1 ? '∞ Unlimited' : `${v}/day` },
  { label: 'Priority Review Queue', key: 'priorityReview',            format: (v) => v ? '✅' : '—' },
  { label: 'Marketplace Discount',  key: 'marketplaceDiscountPercent', format: (v) => v > 0 ? `${v}% off` : '—' },
  { label: 'Early Competition Access', key: 'earlyCompetitionAccess', format: (v) => v ? '✅' : '—' },
];

/* ── Helper: badge class ── */
const badgeClass = (tier) =>
  tier === 'PRO' ? 'badge-pro' : tier === 'LITE' ? 'badge-lite' : 'badge-free';

/* ═══════════════════════════════════════════════════════════ */
const PremiumPage = () => {
  const { tier: currentTier, features, loading: premiumLoading, refresh } = usePremium();

  const [tiers, setTiers]               = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState(null); // tier to open modal for
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [toast, setToast]               = useState('');
  const [cancelling, setCancelling]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTierDefinitions();
        setTiers(data);
      } catch (err) {
        console.error('Failed to load tier definitions', err);
      } finally {
        setLoadingTiers(false);
      }
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSubscribeSuccess = async (result) => {
    setSubscribingTo(null);
    await refresh();
    showToast(`🎉 You are now on the ${result.tier} plan! Enjoy your premium benefits.`);
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      setCancelConfirm(false);
      await refresh();
      showToast('✅ Subscription cancelled. You\'ll revert to Free at end of billing period.');
    } catch (err) {
      console.error('Cancel failed', err);
    } finally {
      setCancelling(false);
    }
  };

  const getCtaLabel = (tierId) => {
    if (tierId === 'FREE') return 'Current Plan';
    if (tierId === currentTier) return '✅ Current Plan';
    if (currentTier !== 'FREE' && tierId !== currentTier) return `Switch to ${tierId === 'PRO' ? 'Pro' : 'Lite'}`;
    return `Upgrade to ${tierId === 'PRO' ? 'Pro ✨' : 'Lite 🌟'}`;
  };

  const getCtaClass = (tierId) => {
    if (tierId === 'FREE') return 'cta-free';
    if (tierId === currentTier) return 'cta-current';
    if (tierId === 'PRO') return 'cta-pro';
    return 'cta-lite';
  };

  return (
    <div className="premium-page">
      {/* ── Hero ── */}
      <header className="premium-hero">
        <div className="premium-eyebrow">✨ KavyaKosh Premium</div>
        <h1>
          Unlock Your Full <span className="gold">Poetic Potential</span>
        </h1>
        <p>
          Unlimited AI generations, priority editorial reviews, exclusive marketplace discounts,
          and early access to competitions — all in one plan.
        </p>

        {!premiumLoading && (
          <div className="current-plan-banner">
            <span>Your current plan:</span>
            <span className={`plan-badge ${badgeClass(currentTier)}`}>{currentTier}</span>
            {currentTier !== 'FREE' && (
              <button
                type="button"
                onClick={() => setCancelConfirm(true)}
                style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </header>

      <main className="premium-container">
        {/* ── Pricing Cards ── */}
        {loadingTiers ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,.4)' }}>
            Loading plans…
          </div>
        ) : (
          <div className="pricing-grid">
            {tiers.map((t) => {
              const isPopular  = t.id === 'LITE';
              const isCurrent  = t.id === currentTier;
              const featMap    = t.features || {};

              return (
                <article
                  key={t.id}
                  className={[
                    'tier-card',
                    isPopular ? 'tier-card--popular' : '',
                    isCurrent ? 'tier-card--current' : '',
                  ].join(' ').trim()}
                >
                  {isPopular && <div className="popular-ribbon">Most Popular</div>}

                  <div className="tier-icon">{TIER_ICONS[t.id] || '📌'}</div>
                  <h2 className="tier-name">{t.name}</h2>

                  <div className="tier-price-row">
                    {t.priceMonthly === 0 ? (
                      <span className="tier-price tier-price-free">Free</span>
                    ) : (
                      <>
                        <span className="tier-currency">₹</span>
                        <span className="tier-price">{t.priceMonthly}</span>
                        <span className="tier-period">/month</span>
                      </>
                    )}
                  </div>

                  <ul className="tier-features">
                    {COMPARISON_ROWS.map((row) => {
                      const val = featMap[row.key];
                      const included = val === true || val === -1 || (typeof val === 'number' && val > 0);
                      return (
                        <li
                          key={row.key}
                          className={`tier-feature ${included ? 'tier-feature--included' : 'tier-feature--excluded'}`}
                        >
                          <span className="feature-check">
                            {included ? '✓' : '✕'}
                          </span>
                          {row.label}: <strong style={{ marginLeft: '.25rem' }}>{row.format(val)}</strong>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    className={`tier-cta ${getCtaClass(t.id)}`}
                    disabled={t.id === 'FREE' || isCurrent}
                    onClick={() => !isCurrent && t.id !== 'FREE' && setSubscribingTo(t.id)}
                  >
                    {getCtaLabel(t.id)}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Comparison Table ── */}
        {!loadingTiers && tiers.length > 0 && (
          <section className="comparison-section" aria-label="Feature comparison">
            <h2 className="comparison-title">Full Feature Comparison</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {tiers.map((t) => (
                    <th key={t.id} className={t.id === currentTier ? 'comp-col-highlight' : ''}>
                      {t.name} {t.id === currentTier ? '(You)' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key}>
                    <td className="feature-name">{row.label}</td>
                    {tiers.map((t) => {
                      const val = t.features?.[row.key];
                      return (
                        <td key={t.id} className={t.id === currentTier ? 'comp-col-highlight' : ''}>
                          <span className={val === true || val === -1 ? 'comp-yes' : val === false ? 'comp-no' : 'comp-val'}>
                            {row.format(val)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Trust signals ── */}
        <div className="premium-trust-row">
          <div className="trust-item"><span className="trust-icon">🔒</span> Secure simulated payment</div>
          <div className="trust-item"><span className="trust-icon">🔄</span> Cancel anytime</div>
          <div className="trust-item"><span className="trust-icon">⚡</span> Instant activation</div>
          <div className="trust-item"><span className="trust-icon">🎁</span> 30-day satisfaction</div>
        </div>
      </main>

      {/* ── Subscribe Modal ── */}
      <SubscribeModal
        tier={subscribingTo}
        onClose={() => setSubscribingTo(null)}
        onSuccess={handleSubscribeSuccess}
      />

      {/* ── Cancel Confirm ── */}
      {cancelConfirm && (
        <div className="cancel-confirm-overlay" onClick={(e) => e.target === e.currentTarget && setCancelConfirm(false)}>
          <div className="cancel-confirm-box">
            <h3>Cancel Subscription?</h3>
            <p>
              You'll lose access to premium features immediately (in this simulation).
              Your plan will revert to <strong>Free</strong>.
            </p>
            <div className="cancel-confirm-actions">
              <button type="button" className="btn-cancel-yes" onClick={handleCancelConfirm} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
              <button type="button" className="btn-cancel-no" onClick={() => setCancelConfirm(false)}>
                Keep Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="premium-toast">{toast}</div>}
    </div>
  );
};

export default PremiumPage;
