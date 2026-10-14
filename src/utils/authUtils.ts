/**
 * Centralized authentication and password utilities for the Kaseya NOC Portal.
 * Handles:
 * 1. App-level entrance password ('Noc@Roster2026')
 * 2. Admin privilege unlock password ('Kaseya2026!@#')
 * 3. Old password verification and changing with re-entry confirmation.
 */

export const DEFAULT_APP_PASSWORD = 'Noc@Roster2026';
export const DEFAULT_ADMIN_PASSWORD = 'Kaseya2026!@#';

const APP_PWD_KEY = 'kaseya_noc_app_password_v1';
const ADMIN_PWD_KEY = 'kaseya_noc_admin_password_v1';
const APP_AUTHED_SESSION_KEY = 'kaseya_noc_portal_authenticated_v1';

export function getAppPassword(): string {
  try {
    return localStorage.getItem(APP_PWD_KEY) || DEFAULT_APP_PASSWORD;
  } catch {
    return DEFAULT_APP_PASSWORD;
  }
}

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function verifyAppPassword(input: string): boolean {
  return input.trim() === getAppPassword();
}

export function verifyAdminPassword(input: string): boolean {
  return input.trim() === getAdminPassword();
}

export function isAppAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(APP_AUTHED_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAppAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(APP_AUTHED_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(APP_AUTHED_SESSION_KEY);
    }
  } catch {
    // Ignore storage availability errors
  }
}

export interface PasswordChangeResult {
  success: boolean;
  error?: string;
  message?: string;
}

export function updateAppPassword(
  oldPassword: string,
  newPassword: string,
  reenterPassword: string
): PasswordChangeResult {
  const current = getAppPassword();
  if (oldPassword !== current) {
    return {
      success: false,
      error: 'Current old password does not match. Please verify your current app password.',
    };
  }
  if (!newPassword || newPassword.trim().length === 0) {
    return {
      success: false,
      error: 'New password cannot be empty.',
    };
  }
  if (newPassword.length < 4) {
    return {
      success: false,
      error: 'New password must be at least 4 characters long.',
    };
  }
  if (newPassword !== reenterPassword) {
    return {
      success: false,
      error: 'New password and Re-entered new password do not match.',
    };
  }
  if (newPassword === current) {
    return {
      success: false,
      error: 'New password cannot be the same as your current password.',
    };
  }

  try {
    localStorage.setItem(APP_PWD_KEY, newPassword);
    return {
      success: true,
      message: 'App entrance password successfully updated.',
    };
  } catch {
    return {
      success: false,
      error: 'Could not save new password to storage.',
    };
  }
}

export function updateAdminPassword(
  oldPassword: string,
  newPassword: string,
  reenterPassword: string
): PasswordChangeResult {
  const current = getAdminPassword();
  if (oldPassword !== current) {
    return {
      success: false,
      error: 'Current old password does not match. Please verify your current admin password.',
    };
  }
  if (!newPassword || newPassword.trim().length === 0) {
    return {
      success: false,
      error: 'New password cannot be empty.',
    };
  }
  if (newPassword.length < 4) {
    return {
      success: false,
      error: 'New password must be at least 4 characters long.',
    };
  }
  if (newPassword !== reenterPassword) {
    return {
      success: false,
      error: 'New password and Re-entered new password do not match.',
    };
  }
  if (newPassword === current) {
    return {
      success: false,
      error: 'New password cannot be the same as your current admin password.',
    };
  }

  try {
    localStorage.setItem(ADMIN_PWD_KEY, newPassword);
    return {
      success: true,
      message: 'Admin privilege password successfully updated.',
    };
  } catch {
    return {
      success: false,
      error: 'Could not save new admin password to storage.',
    };
  }
}
