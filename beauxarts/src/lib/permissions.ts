/**
 * Permission and Authorization utilities for components
 */

export type UserRole = "ADMIN" | "USER" | "SELLER";

export interface PermissionUser {
  id: number;
  role: UserRole;
  email?: string;
}

/**
 * Check if user is an admin
 */
export const isAdmin = (user: PermissionUser | null): boolean => {
  return user?.role === "ADMIN";
};

/**
 * Check if user is a seller
 */
export const isSeller = (user: PermissionUser | null): boolean => {
  return user?.role === "SELLER";
};

/**
 * Check if user can sell (seller or admin)
 */
export const canSell = (user: PermissionUser | null): boolean => {
  return user?.role === "SELLER" || user?.role === "ADMIN";
};

/**
 * Check if user owns a specific resource
 */
export const ownsResource = (
  user: PermissionUser | null,
  resourceOwnerId: number
): boolean => {
  if (!user) return false;
  return user.id === resourceOwnerId || user.role === "ADMIN";
};

/**
 * Check if user can edit an artwork
 * Artworks can be edited by their creator or admins
 */
export const canEditArtwork = (
  user: PermissionUser | null,
  artworkArtistUserId: number
): boolean => {
  if (!user) return false;
  return user.id === artworkArtistUserId || user.role === "ADMIN";
};

/**
 * Check if user can delete an artwork
 */
export const canDeleteArtwork = (
  user: PermissionUser | null,
  artworkArtistUserId: number
): boolean => {
  return canEditArtwork(user, artworkArtistUserId);
};

/**
 * Check if user can access admin dashboard
 */
export const canAccessAdminDashboard = (
  user: PermissionUser | null
): boolean => {
  return isAdmin(user);
};

/**
 * Check if user can access artist dashboard
 */
export const canAccessArtistDashboard = (
  user: PermissionUser | null
): boolean => {
  return canSell(user);
};

/**
 * Get token from localStorage (client-side only)
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Get user from localStorage (client-side only)
 */
export const getStoredUser = (): PermissionUser | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated (client-side)
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Build authorization headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
