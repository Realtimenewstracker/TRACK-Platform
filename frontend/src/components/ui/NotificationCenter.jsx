import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info, Flame, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { authHeaders, API_BASE, getUser } from '../../lib/auth';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef(null);

  // Fetch notification history from the database
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, { headers: authHeaders() });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silently fail — the bell count and live socket still work
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Socket.IO for live notifications + initial history load
  useEffect(() => {
    fetchNotifications();

    const user = getUser();
    const socket = io(API_BASE || 'http://localhost:5000');

    if (user?.id) {
      socket.emit('join_user_room', user.id);
    }

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, [fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = async () => {
    setUnreadCount(0);
    try {
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: authHeaders()
      });
    } catch {
      // Non-critical — UI already updated optimistically
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await fetch(`${API_BASE}/api/notifications`, {
        method: 'DELETE',
        headers: authHeaders()
      });
    } catch {
      // Non-critical
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) markAllAsRead();
  };

  const getStyleForImportance = (importance) => {
    switch (importance) {
      case 'CRITICAL':
        return { icon: <Flame className="w-5 h-5 text-red-500" />,      bg: 'bg-red-500/10 border-red-500/30' };
      case 'HIGH':
        return { icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-500/10 border-orange-500/30' };
      case 'MEDIUM':
        return { icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,   bg: 'bg-yellow-400/10 border-yellow-400/30' };
      default:
        return { icon: <Info className="w-5 h-5 text-blue-400" />,       bg: 'bg-blue-400/10 border-blue-400/30' };
    }
  };

  return (
    <div className="fixed top-6 right-24 z-50 font-sans" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
      >
        <Bell className="w-6 h-6 text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden origin-top-right">

          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold text-white">Smart Alerts</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar p-2 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
                <Bell className="w-8 h-8 opacity-20" />
                <p className="text-sm">System is quiet. No active alerts.</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const style = getStyleForImportance(notif.importance || notif.type);
                return (
                  <div
                    key={notif._id || index}
                    className={`p-4 rounded-xl border flex gap-4 items-start ${style.bg} hover:brightness-110 cursor-pointer transition-colors`}
                  >
                    <div className="shrink-0 mt-1">{style.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">{notif.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed mb-2">{notif.message}</p>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                        {/* Use DB timestamp instead of rendering-time */}
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center bg-black/40">
              <button
                onClick={clearAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
