import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnnouncement } from '../../api/homeApi';
import './AnnouncementBanner.css';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const loadAnnouncement = useCallback(() => {
    fetchAnnouncement()
      .then((data) => {
        if (data && data.enabled && data.message && data.message.trim().length > 0) {
          const cacheKey = `kavyakosh_announcement_${data.type}_${data.message.slice(0, 30)}`;
          const isDismissed = sessionStorage.getItem(cacheKey) === 'true';
          setDismissed(isDismissed);
          setAnnouncement(data);
        } else {
          setAnnouncement(null);
        }
      })
      .catch(() => {
        // Silently fallback if offline
        setAnnouncement(null);
      });
  }, []);

  useEffect(() => {
    loadAnnouncement();

    // Listen to admin broadcast updates in real-time
    const handleUpdate = (e) => {
      if (e.detail) {
        setAnnouncement(e.detail.enabled ? e.detail : null);
        setDismissed(false);
      } else {
        loadAnnouncement();
      }
    };

    window.addEventListener('kavyakosh-announcement-updated', handleUpdate);
    return () => window.removeEventListener('kavyakosh-announcement-updated', handleUpdate);
  }, [loadAnnouncement]);

  if (!announcement || !announcement.enabled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    const cacheKey = `kavyakosh_announcement_${announcement.type}_${announcement.message.slice(0, 30)}`;
    sessionStorage.setItem(cacheKey, 'true');
    setDismissed(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'celebration':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'urgent':
        return '🚨';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTag = (type) => {
    switch (type) {
      case 'celebration':
        return 'Special Celebration';
      case 'warning':
        return 'Notice';
      case 'urgent':
        return 'Urgent Alert';
      case 'info':
      default:
        return 'Announcement';
    }
  };

  const type = announcement.type || 'info';
  const isInternalLink = announcement.link && announcement.link.startsWith('/');

  return (
    <aside
      className={`announcement-banner announcement-banner--${type}`}
      role="alert"
      aria-label="Site announcement"
    >
      <div className="announcement-banner__container">
        <span className="announcement-banner__icon" aria-hidden="true">
          {getIcon(type)}
        </span>

        <div className="announcement-banner__content">
          <span className="announcement-banner__tag">{getTag(type)}</span>
          <span className="announcement-banner__message">{announcement.message}</span>

          {announcement.link && (
            isInternalLink ? (
              <Link to={announcement.link} className="announcement-banner__btn">
                <span>{announcement.linkText || 'Learn More'}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="announcement-banner__btn"
              >
                <span>{announcement.linkText || 'Learn More'}</span>
                <span aria-hidden="true">↗</span>
              </a>
            )
          )}
        </div>

        {announcement.dismissible !== false && (
          <button
            type="button"
            className="announcement-banner__close"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            title="Dismiss announcement"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
