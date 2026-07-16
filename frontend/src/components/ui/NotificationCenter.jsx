```react
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info, Flame } from 'lucide-react';
import { io } from 'socket.io-client';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    // Connect to the backend WebSocket server
    // Note: In production, use your actual deployed backend URL
    const socket = io('http://localhost:5000');

    // For demonstration, we assume a static user ID. 
    // In a real app, this comes from your Auth context/JWT.
    const userId = "DEFAULT_USER_ID"; 
    socket.emit('join_user_room', userId);

    // Listen for new alerts
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Close the panel if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    setUnreadCount(0);
    // In a full implementation, you would also send a request to your backend 
    // to update the 'isRead' status in the database.
  };

  // Helper function to style the notification based on its severity level
  const getStyleForType = (type) => {
    switch (type) {
      case 'CRITICAL':
        return { icon: <Flame className="w-5 h-5 text-red-500" />, bg: 'bg-red-500/10 border-red-500/30' };
      case 'HIGH':
        return { icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-500/10 border-orange-500/30' };
      case 'MEDIUM':
        return { icon: <AlertCircle className="w-5 h-5 text-yellow-400" />, bg: 'bg-yellow-400/10 border-yellow-400/30' };
      case 'LOW':
      default:
        return { icon: <Info className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-400/10 border-blue-400/30' };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 font-sans" ref={panelRef}>
      {/* Bell Button */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllAsRead();
        }}
        className="relative p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
      >
        <Bell className="w-6 h-6 text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden origin-top-right transform transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold text-white">Smart Alerts</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert List */}
          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
                <Bell className="w-8 h-8 opacity-20" />
                <p className="text-sm">System is quiet. No active alerts.</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const style = getStyleForType(notif.type);
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border flex gap-4 items-start ${style.bg} transition-colors hover:brightness-110 cursor-pointer`}
                  >
                    <div className="shrink-0 mt-1">
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">{notif.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed mb-2">{notif.message}</p>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center bg-black/40">
              <button 
                onClick={() => setNotifications([])}
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

```
