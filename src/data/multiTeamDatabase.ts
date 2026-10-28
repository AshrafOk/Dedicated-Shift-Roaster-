import { TeamId } from '../types/user';
import { DatabaseState, DatabaseBackup } from './database';
import { getInitialTeamDatabase } from './teamInitialData';

const TEAM_DB_STORAGE_PREFIX = 'kaseya_noc_team_database_v1_';
const TEAM_BACKUP_STORAGE_PREFIX = 'kaseya_noc_team_backup_v1_';

function getStorageKey(teamId: TeamId): string {
  // Backwards compatibility for dedicated team
  if (teamId === 'dedicated') {
    return 'kaseya_noc_database_2026_master_v3';
  }
  return `${TEAM_DB_STORAGE_PREFIX}${teamId}`;
}

function getBackupStorageKey(teamId: TeamId): string {
  if (teamId === 'dedicated') {
    return 'kaseya_noc_database_backup_pre_import_v2';
  }
  return `${TEAM_BACKUP_STORAGE_PREFIX}${teamId}`;
}

export function loadTeamDatabase(teamId: TeamId): DatabaseState {
  const key = getStorageKey(teamId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 3 && Array.isArray(parsed.balances) && parsed.balances.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to load database for team ${teamId}`, e);
  }

  // Initialize fresh starter database for this team
  const fresh = getInitialTeamDatabase(teamId);
  saveTeamDatabase(teamId, fresh);
  return fresh;
}

export function saveTeamDatabase(teamId: TeamId, db: DatabaseState): void {
  const key = getStorageKey(teamId);
  try {
    localStorage.setItem(key, JSON.stringify(db));
  } catch (e) {
    console.error(`Failed to persist database for team ${teamId}`, e);
  }
}

export function resetTeamDatabase(teamId: TeamId): DatabaseState {
  const key = getStorageKey(teamId);
  const backupKey = getBackupStorageKey(teamId);
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(backupKey);
  } catch (e) {
    console.error(`Failed to clear storage for team ${teamId}`, e);
  }

  const fresh = getInitialTeamDatabase(teamId);
  saveTeamDatabase(teamId, fresh);
  return fresh;
}

export function saveTeamBackup(
  teamId: TeamId,
  db: DatabaseState,
  note = 'Automatic snapshot before import'
): void {
  const backupKey = getBackupStorageKey(teamId);
  try {
    const backup: DatabaseBackup = {
      state: JSON.parse(JSON.stringify(db)),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      note,
      employeeCount: db.balances.length,
    };
    localStorage.setItem(backupKey, JSON.stringify(backup));
  } catch (e) {
    console.error(`Failed to save backup for team ${teamId}`, e);
  }
}

export function getTeamBackup(teamId: TeamId): DatabaseBackup | null {
  const backupKey = getBackupStorageKey(teamId);
  try {
    const raw = localStorage.getItem(backupKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state && parsed.state.balances) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to get backup for team ${teamId}`, e);
  }
  return null;
}

export function restoreTeamBackup(teamId: TeamId): DatabaseState | null {
  const backup = getTeamBackup(teamId);
  if (backup && backup.state) {
    saveTeamDatabase(teamId, backup.state);
    clearTeamBackup(teamId);
    return backup.state;
  }
  return null;
}

export function clearTeamBackup(teamId: TeamId): void {
  const backupKey = getBackupStorageKey(teamId);
  try {
    localStorage.removeItem(backupKey);
  } catch (e) {
    console.error(`Failed to clear backup for team ${teamId}`, e);
  }
}
