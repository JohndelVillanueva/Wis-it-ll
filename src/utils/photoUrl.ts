const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

/**
 * Convert a stored photo path into a full URL.
 * - If it's already absolute (http/https), return as-is.
 * - If it's a relative path ("/uploads/..."), prepend the API_URL.
 * - If empty/null, return a fallback.
 */
export function photoUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${clean}`;
}