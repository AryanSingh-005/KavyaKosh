import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import AnnouncementBanner from './AnnouncementBanner';
import { fetchFeatureFlags } from '../../api/homeApi';
import './MainLayout.css';

const NavIcon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [flags, setFlags] = useState({
    marketplaceEnabled: true,
    aiStudioEnabled: true,
    competitionsEnabled: true,
    reviewsEnabled: true,
    discussionsEnabled: true,
  });

  useEffect(() => {
    fetchFeatureFlags()
      .then(res => {
        if (res) setFlags(prev => ({ ...prev, ...res }));
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* ── Global Announcement Banner ── */}
      <AnnouncementBanner />

      {/* ── Top Navbar ── */}
      <header className="navbar" role="banner">
        <div className="container navbar__inner">
          {/* Logo */}
          <NavLink to="/" className="navbar__logo" aria-label="KavyaKosh Home">
            <span className="navbar__logo-icon">✦</span>
            <span className="navbar__logo-text">KavyaKosh</span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="navbar__links" aria-label="Main navigation">
            <NavLink to="/" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`} end>Home</NavLink>
            <NavLink to="/explore" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Explore</NavLink>
            {flags.aiStudioEnabled !== false && (
              <NavLink to="/ai-studio" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>AI Studio</NavLink>
            )}
            {flags.reviewsEnabled !== false && (
              <NavLink to="/reviews" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Reviews</NavLink>
            )}
            {flags.discussionsEnabled !== false && (
              <NavLink to="/discussions" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Discussions</NavLink>
            )}
            {flags.competitionsEnabled !== false && (
              <NavLink to="/competitions" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Competitions</NavLink>
            )}
            {flags.marketplaceEnabled !== false && (
              <NavLink to="/marketplace" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Marketplace</NavLink>
            )}
            <NavLink to="/premium" className={({isActive}) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Premium 👑</NavLink>
          </nav>

          {/* CTA / Auth */}
          <div className="navbar__actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <>
                <button className="btn btn-ghost btn-sm" id="btn-publish" onClick={() => navigate('/publish')}>
                  <NavIcon d="M12 5v14M5 12h14" />
                  Publish
                </button>
                <NotificationBell />
                <button className="navbar__avatar" onClick={() => navigate('/profile')} title="My Poet Dashboard" id="btn-profile">
                  <span>{user.email ? user.email[0].toUpperCase() : 'U'}</span>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout" id="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm" id="btn-login">Sign In</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm" id="btn-register">Get Started</NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="layout__main">
        <Outlet />
      </main>

      {/* ── Bottom Nav (Mobile) ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/" className={({isActive}) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`} end id="mobile-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="bottom-nav__icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
          <span>Home</span>
        </NavLink>
        <NavLink to="/explore" className={({isActive}) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`} id="mobile-nav-explore">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="bottom-nav__icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Explore</span>
        </NavLink>
        <NavLink to="/publish" className={({isActive}) => `bottom-nav__item bottom-nav__item--publish ${isActive ? 'bottom-nav__item--active' : ''}`} id="mobile-nav-publish">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bottom-nav__icon">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Publish</span>
        </NavLink>
        <NavLink to="/competitions" className={({isActive}) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`} id="mobile-nav-competitions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="bottom-nav__icon">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
          </svg>
          <span>Challenges</span>
        </NavLink>
        <NavLink to={user ? "/profile" : "/login"} className={({isActive}) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`} id="mobile-nav-profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="bottom-nav__icon">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <span className="navbar__logo-icon" aria-hidden="true">✦</span>
            <span className="navbar__logo-text">KavyaKosh</span>
            <p className="footer__tagline">Where words find their wings.</p>
          </div>
          <p className="footer__copy">© 2026 KavyaKosh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
