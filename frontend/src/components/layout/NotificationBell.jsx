import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../api/notificationApi';
import './NotificationBell.css';

const NOTIF_ICONS = {
  LIKE: '❤️',
  COMMENT: '💬',
  REVIEW_COMPLETE: '📜',
  COMPETITION_RESULT: '🏆',
  FEATURED_POEM: '🌟',
  INFO: '✦'
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Ignore silent errors for unauthenticated state
    }
  };

  const handleToggleOpen = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setLoading(true);
      try {
        const data = await fetchNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`notif-bell-btn ${unreadCount > 0 ? 'notif-bell-btn--active' : ''}`}
        onClick={handleToggleOpen}
        aria-label="Notifications"
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="bell-svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown glass-card">
          <div className="notif-dropdown-header">
            <div className="header-title-box">
              <h3 className="notif-title font-serif">Notifications</h3>
              {unreadCount > 0 && <span className="unread-pill">{unreadCount} unread</span>}
            </div>
            {unreadCount > 0 && (
              <button type="button" className="mark-all-btn" onClick={handleMarkAllRead}>
                ✓ Mark all as read
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {loading ? (
              <div className="notif-loading">Loading activity alerts...</div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className="notif-icon-badge">
                    {NOTIF_ICONS[n.type] || NOTIF_ICONS.INFO}
                  </span>
                  <div className="notif-content">
                    <h4 className="notif-item-title">{n.title}</h4>
                    <p className="notif-item-msg">{n.message}</p>
                  </div>
                  {!n.read && <span className="unread-dot" />}
                </div>
              ))
            ) : (
              <div className="notif-empty">
                <span>🔔</span>
                <p>No activity notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
