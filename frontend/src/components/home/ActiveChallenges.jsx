import { Link } from 'react-router-dom';
import './ActiveChallenges.css';

function formatDeadline(deadlineStr) {
  if (!deadlineStr) return 'Ongoing';
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Closed';
  if (diffDays === 0) return 'Last day!';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
}

function getUrgency(deadlineStr) {
  if (!deadlineStr) return 'normal';
  const deadline = new Date(deadlineStr);
  const diffDays = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return 'urgent';
  if (diffDays <= 7) return 'soon';
  return 'normal';
}

const themeColors = [
  { bg: 'rgba(212,175,55,0.08)', accent: 'var(--gold)', badge: 'badge--gold' },
  { bg: 'rgba(124,92,252,0.08)', accent: 'var(--purple-light)', badge: 'badge--purple' },
  { bg: 'rgba(45,212,191,0.08)', accent: 'var(--teal)', badge: 'badge--teal' },
];

function ChallengeCard({ challenge, index }) {
  const theme = themeColors[index % themeColors.length];
  const urgency = getUrgency(challenge.deadline);
  const timeLeft = formatDeadline(challenge.deadline);

  return (
    <article
      className={`challenge-card glass-card challenge-card--${urgency} animate-fade-in-up`}
      style={{
        animationDelay: `${index * 100}ms`,
        '--card-accent': theme.accent,
        '--card-bg': theme.bg,
      }}
    >
      {urgency === 'urgent' && (
        <div className="challenge-card__urgent-banner animate-pulse-glow">
          🔥 Ending Soon
        </div>
      )}

      <div className="challenge-card__header">
        <span className={`badge ${theme.badge}`}>{challenge.theme || 'Open Theme'}</span>
        <div className={`challenge-card__timer challenge-card__timer--${urgency}`}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {timeLeft}
        </div>
      </div>

      <div className="challenge-card__body">
        <Link to={`/challenges/${challenge.id}`} className="challenge-card__title-link">
          <h3 className="challenge-card__title font-serif">{challenge.title}</h3>
        </Link>
        <p className="challenge-card__desc">{challenge.description}</p>
      </div>

      <div className="challenge-card__footer">
        <div className="challenge-card__participants">
          <div className="challenge-card__participant-avatars" aria-hidden="true">
            {['A', 'B', 'C'].map((l, i) => (
              <div key={i} className="challenge-card__participant-dot" style={{ zIndex: 3 - i }}>{l}</div>
            ))}
          </div>
          <span>{(challenge.participantCount || 0).toLocaleString()} poets joined</span>
        </div>

        {challenge.prizeDescription && (
          <div className="challenge-card__prize">
            <span>🏆</span>
            <span>{challenge.prizeDescription}</span>
          </div>
        )}

        <Link
          to={`/challenges/${challenge.id}`}
          className="btn btn-primary btn-sm challenge-card__cta"
          id={`challenge-join-${challenge.id}`}
        >
          Join Challenge
        </Link>
      </div>
    </article>
  );
}

function ChallengeCardSkeleton() {
  return (
    <div className="challenge-card glass-card">
      <div className="skeleton" style={{ height: 22, width: '30%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 26, width: '70%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 40, borderRadius: '999px' }} />
    </div>
  );
}

export default function ActiveChallenges({ challenges, loading }) {
  return (
    <section className="section active-challenges" id="active-challenges" aria-label="Active Challenges">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-header__eyebrow">⚡ Compete & Create</p>
            <h2 className="section-header__title">Active Challenges</h2>
          </div>
          <Link to="/challenges" className="section-header__link">
            All challenges →
          </Link>
        </div>

        <div className="active-challenges__grid stagger-children">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ChallengeCardSkeleton key={i} />)
            : challenges.map((c, i) => <ChallengeCard key={c.id} challenge={c} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
