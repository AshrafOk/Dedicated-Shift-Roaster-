import { AppUser, TeamId, UserGroup, UserPermission, TEAMS } from '../types/user';

const USERS_STORAGE_KEY = 'kaseya_noc_users_store_v1';
const CURRENT_USER_KEY = 'kaseya_noc_current_authenticated_user_v1';

// Seed default users including master Ashraf
const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_master_ashraf',
    username: 'Ashraf',
    password: 'India123!!',
    group: 'Global Admin',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-01',
    displayName: 'Ashraf Ali (Master Admin)',
  },
  {
    id: 'user_dedicated_admin',
    username: 'dedicated_admin',
    password: 'Kaseya2026!@#',
    group: 'Dedicated',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-10',
    displayName: 'Dedicated Team Admin',
  },
  {
    id: 'user_dedicated_viewer',
    username: 'dedicated_viewer',
    password: 'Kaseya2026!@#',
    group: 'Dedicated',
    permission: 'view_only',
    mustChangePassword: false,
    createdAt: '2026-01-10',
    displayName: 'Dedicated Shift Viewer',
  },
  {
    id: 'user_elite_admin',
    username: 'elite_admin',
    password: 'Elite2026!@#',
    group: 'Elite',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-12',
    displayName: 'Elite Team Lead',
  },
  {
    id: 'user_elite_viewer',
    username: 'elite_viewer',
    password: 'Elite2026!@#',
    group: 'Elite',
    permission: 'view_only',
    mustChangePassword: true,
    createdAt: '2026-01-12',
    displayName: 'Elite Tier 3 Analyst',
  },
  {
    id: 'user_standard_admin',
    username: 'standard_admin',
    password: 'Standard2026!@#',
    group: 'Standard',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-15',
    displayName: 'Standard Team Lead',
  },
  {
    id: 'user_flex_admin',
    username: 'flex_admin',
    password: 'Flex2026!@#',
    group: 'Flex',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-18',
    displayName: 'Flex Roster Dispatcher',
  },
  {
    id: 'user_bcn_admin',
    username: 'bcn_admin',
    password: 'Bcn2026!@#',
    group: 'BCN',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-20',
    displayName: 'BCN Operations Lead',
  },
  {
    id: 'user_managers_lead',
    username: 'managers_lead',
    password: 'Manager2026!@#',
    group: 'Managers',
    permission: 'admin',
    mustChangePassword: false,
    createdAt: '2026-01-05',
    displayName: 'Duty Operations Manager',
  },
];

export function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure master Ashraf always exists with master credentials
        const hasAshraf = parsed.some(
          (u: AppUser) => u.username.toLowerCase() === 'ashraf'
        );
        if (!hasAshraf) {
          parsed.unshift(DEFAULT_USERS[0]);
          saveUsers(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
  }

  saveUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function saveUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { user: AppUser | null; error?: string } {
  const users = loadUsers();
  const trimmedUser = usernameInput.trim().toLowerCase();
  const user = users.find((u) => u.username.trim().toLowerCase() === trimmedUser);

  if (!user) {
    return { user: null, error: 'User does not exist in any group.' };
  }

  if (user.password !== passwordInput.trim()) {
    return { user: null, error: 'Incorrect password for this user.' };
  }

  // Record last login
  const updatedUser = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };
  updateUser(user.id, { lastLoginAt: updatedUser.lastLoginAt });

  return { user: updatedUser };
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get current user', e);
  }
  return null;
}

export function setCurrentUser(user: AppUser | null, remember = true): void {
  try {
    if (user) {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      if (remember) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    } else {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export function addUser(user: Omit<AppUser, 'id' | 'createdAt'>): AppUser {
  const users = loadUsers();
  const exists = users.some(
    (u) => u.username.trim().toLowerCase() === user.username.trim().toLowerCase()
  );
  if (exists) {
    throw new Error(`Username "${user.username}" already exists.`);
  }

  const newUser: AppUser = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updated = [newUser, ...users];
  saveUsers(updated);
  return newUser;
}

export function updateUser(id: string, updates: Partial<AppUser>): AppUser {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`User not found with id ${id}`);
  }

  const updatedUser = {
    ...users[index],
    ...updates,
  };

  users[index] = updatedUser;
  saveUsers(users);

  // If current logged-in user was updated, refresh session
  const current = getCurrentUser();
  if (current && current.id === id) {
    setCurrentUser(updatedUser);
  }

  return updatedUser;
}

export function deleteUser(id: string): void {
  const users = loadUsers();
  const target = users.find((u) => u.id === id);
  if (target && target.username.toLowerCase() === 'ashraf') {
    throw new Error('Master Global Admin account "Ashraf" cannot be deleted.');
  }

  const filtered = users.filter((u) => u.id !== id);
  saveUsers(filtered);
}

/**
 * Access Control Helpers:
 * Check if the given user can edit the specified team's roster
 */
export function canUserEditTeam(user: AppUser | null, teamId: TeamId): boolean {
  if (!user) return false;
  if (user.group === 'Global Admin') return true;

  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return false;

  return user.group === team.groupName && user.permission === 'admin';
}

/**
 * Check if the given user can view the specified team's roster
 */
export function canUserViewTeam(user: AppUser | null, teamId: TeamId): boolean {
  if (!user) return false;
  if (user.group === 'Global Admin') return true;

  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return false;

  // Group members can view their group roster
  return user.group === team.groupName;
}

/**
 * Check if the given user has access to Global Admin management page
 */
export function isGlobalAdmin(user: AppUser | null): boolean {
  return !!user && user.group === 'Global Admin';
}
