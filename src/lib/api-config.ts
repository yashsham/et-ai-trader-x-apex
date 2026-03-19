/**
 * Centralized API configuration for ET AI Trader X-Apex.
 * Supports switching between local development and production (Render) backends.
 */

// If deploying to GitHub Pages, the frontend will be on a different domain than the backend.
// We use VITE_API_URL environment variable to point to the Render backend.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Helper to build full API URLs.
 * Ensures that relative paths are prepended with the API_BASE_URL.
 */
export function getApiUrl(path: string): string {
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}
