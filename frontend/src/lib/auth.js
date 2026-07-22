export const getToken = () => localStorage.getItem('track_token');

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('track_user') || 'null');
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('track_token');
  localStorage.removeItem('track_user');
};

// Returns headers for authenticated fetch calls
export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

// Base URL: empty string in dev (Vite proxy handles it), real URL in production
export const API_BASE = import.meta.env.VITE_API_URL || '';
