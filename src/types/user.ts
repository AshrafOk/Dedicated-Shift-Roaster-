export type TeamId = 'dedicated' | 'elite' | 'standard' | 'flex' | 'bcn' | 'managers';

export type UserGroup =
  | 'Dedicated'
  | 'Elite'
  | 'Standard'
  | 'Flex'
  | 'BCN'
  | 'Managers'
  | 'Global Admin';

export type UserPermission = 'view_only' | 'admin';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  group: UserGroup;
  permission: UserPermission;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  displayName?: string;
}

export interface TeamConfig {
  id: TeamId;
  name: string;
  shortLabel: string;
  groupName: UserGroup;
  description: string;
  colorScheme: {
    primary: string;
    light: string;
    border: string;
    text: string;
  };
}

export const TEAMS: TeamConfig[] = [
  {
    id: 'dedicated',
    name: 'Dedicated Team',
    shortLabel: 'Dedicated',
    groupName: 'Dedicated',
    description: 'Kaseya Dedicated 24x7 NOC Operations Engineers',
    colorScheme: {
      primary: 'bg-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
    },
  },
  {
    id: 'elite',
    name: 'Elite Team',
    shortLabel: 'Elite',
    groupName: 'Elite',
    description: 'Elite Tier 3 Systems, Incident Management & Critical Outage Specialists',
    colorScheme: {
      primary: 'bg-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
    },
  },
  {
    id: 'standard',
    name: 'Standard Team',
    shortLabel: 'Standard',
    groupName: 'Standard',
    description: 'Standard Tier 2 Infrastructure & Client Environments Monitoring',
    colorScheme: {
      primary: 'bg-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-700',
    },
  },
  {
    id: 'flex',
    name: 'Flex Team',
    shortLabel: 'Flex',
    groupName: 'Flex',
    description: 'Flexible Roster Dispatch Engineers across Peak Workloads & Weekends',
    colorScheme: {
      primary: 'bg-amber-600',
      light: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-700',
    },
  },
  {
    id: 'bcn',
    name: 'BCN Team',
    shortLabel: 'BCN',
    groupName: 'BCN',
    description: 'Business Continuity, Backup & Disaster Recovery Network Operations',
    colorScheme: {
      primary: 'bg-cyan-600',
      light: 'bg-cyan-50',
      border: 'border-cyan-300',
      text: 'text-cyan-700',
    },
  },
  {
    id: 'managers',
    name: 'Managers Team',
    shortLabel: 'Managers',
    groupName: 'Managers',
    description: 'NOC Operations Managers, Team Leads & Shift Incident Commanders',
    colorScheme: {
      primary: 'bg-rose-600',
      light: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-700',
    },
  },
];

export const USER_GROUPS: UserGroup[] = [
  'Dedicated',
  'Elite',
  'Standard',
  'Flex',
  'BCN',
  'Managers',
  'Global Admin',
];

export function getTeamByGroup(group: UserGroup): TeamConfig | undefined {
  if (group === 'Global Admin') return undefined;
  return TEAMS.find((t) => t.groupName === group);
}

export function isGlobalAdmin(user: AppUser | null): boolean {
  return !!user && user.group === 'Global Admin';
}

export function canUserEditTeam(user: AppUser | null, teamId: TeamId): boolean {
  if (!user) return false;
  if (user.group === 'Global Admin') return true;

  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return false;

  return user.group === team.groupName && user.permission === 'admin';
}

export function canUserViewTeam(user: AppUser | null, teamId: TeamId): boolean {
  if (!user) return false;
  if (user.group === 'Global Admin') return true;

  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return false;

  return user.group === team.groupName;
}


