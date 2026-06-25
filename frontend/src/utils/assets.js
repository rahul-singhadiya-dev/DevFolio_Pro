// src/utils/assets.js

/**
 * Resolves a given path to a full asset URL.
 * If the path is absolute (starts with http://, https://, or data:), it is returned as is.
 * Otherwise, it prefixes the API host.
 * @param {string} path - The relative or absolute path of the asset
 * @returns {string} The full asset URL
 */
export const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Strip '/api' from base URL, add slash if needed, and append relative path
  const host = apiBaseUrl.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${host}${cleanPath}`;
};
