import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailyFeaturedPoem } from '../../api/homeApi';
import './HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();
  const [featuredPoem, setFeaturedPoem] = useState(null);

  useEffect(() => {
    fetchDailyFeaturedPoem()
      .then(data => {
        if (data && data.title) setFeaturedPoem(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="hero" aria-label="Hero section">
      {/* Ambient background blobs */}
      <div className="hero__blob hero__blob--purple animate-blob" aria-hidden="true" />
      <div className="hero__blob hero__blob--gold animate-blob" style={{ animationDelay: '3s' }} aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content animate-fade-in-up">
          {/* Eyebrow */}
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            India's Premier Poetry Platform
          </div>

          {/* Headline */}
          <h1 className="hero__title text-display">
            Where Words Become{' '}
            <span className="gradient-gold">Immortal</span>
          </h1>

          {/* Subline */}
          <p className="hero__subtitle text-subheading">
            Discover ghazals that ache, nazms that soar, and dohas that carry the wisdom of ages.
            Publish your verse. Find your voice.
          </p>

          {/* CTAs */}
          <div className="hero__ctas">
            <button className="btn btn-primary" id="hero-btn-explore" onClick={() => navigate('/explore')}>
              <span>Explore Poetry</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
            <button className="btn btn-secondary" id="hero-btn-publish" onClick={() => navigate('/publish')}>
              Start Writing
            </button>
          </div>

          {/* Stats bar */}
          <div className="hero__stats" role="list">
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-gold">48K+</span>
              <span className="hero__stat-label">Poems</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-gold">12K+</span>
              <span className="hero__stat-label">Poets</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-gold">320+</span>
              <span className="hero__stat-label">Challenges</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-gold">15+</span>
              <span className="hero__stat-label">Languages</span>
            </div>
          </div>
        </div>

        {/* Decorative floating poem card */}
        <div 
          className="hero__poem-card animate-float glass-card"
          onClick={() => featuredPoem && featuredPoem.id && navigate(`/poems/${featuredPoem.id}`)}
          style={{ cursor: featuredPoem ? 'pointer' : 'default' }}
        >
          <div className="hero__poem-card-header">
            <span className="badge badge--gold">Poem of the Day</span>
            <span className="hero__poem-category">{featuredPoem?.category || 'Ghazal'}</span>
          </div>
          <blockquote className="hero__poem-quote font-serif">
            "{featuredPoem?.excerpt || 'Hazaaron khwahishen aisi ke har khwahish pe dam nikle…'}"
          </blockquote>
          <div className="hero__poem-author">
            <div className="hero__poem-avatar">
              {featuredPoem?.author?.username ? featuredPoem.author.username[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="hero__poem-author-name">{featuredPoem?.author?.username || 'Mirza Ghalib'}</div>
              <div className="hero__poem-likes">♥ {featuredPoem?.likesCount ? featuredPoem.likesCount.toLocaleString() : '4,821'} likes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-hint" aria-hidden="true">
        <span>Scroll to discover</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
