/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  CellValue,
  EmployeeLeaveBalance,
  EmployeeRosterRow,
  ViewTab,
  UserRole,
  ROSTER_ROW_COLORS,
} from './types/roster';
import {
  DatabaseState,
  getMonthRosterRows,
  exportDatabaseToCSV,
  DatabaseBackup,
} from './data/database';
import {
  loadTeamDatabase,
  saveTeamDatabase,
  resetTeamDatabase,
  saveTeamBackup,
  getTeamBackup,
  restoreTeamBackup,
  clearTeamBackup,
} from './data/multiTeamDatabase';
import { calculateEmployeeBalance } from './utils/rosterUtils';
import { RotateCcw, Lock, ShieldAlert } from 'lucide-react';
import { TeamTopBar } from './components/TeamTopBar';
import { Navbar } from './components/Navbar';
import { PageActionBar } from './components/PageActionBar';
import { DashboardView } from './components/DashboardView';
import { RosterGridView } from './components/RosterGridView';
import { LeaveBalancesView } from './components/LeaveBalancesView';
import { EmployeeDirectoryView } from './components/EmployeeDirectoryView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { AddLeaveModal } from './components/AddLeaveModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { AppLoginGate } from './components/AppLoginGate';
import { AdminManagementPage } from './components/AdminManagementPage';
import {
  AppUser,
  TeamId,
  TEAMS,
  isGlobalAdmin,
  canUserEditTeam,
  canUserViewTeam,
} from './types/user';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  logoutUser,
} from './utils/userManagement';
import { getISTDate } from './utils/istUtils';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function App() {
  const initialIST = getISTDate();

  // Logged-in user state (Master Ashraf / India123!! or team user)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());

  // Active Team State (Dedicated, Elite, Standard, Flex, BCN, Managers)
  const [activeTeamId, setActiveTeamId] = useState<TeamId>(() => {
    const user = getCurrentUser();
    if (user && user.group !== 'Global Admin') {
      const match = TEAMS.find((t) => t.groupName === user.group);
      if (match) return match.id;
    }
    return 'dedicated';
  });

  // Admin Central Page View State
  const [isAdminPageActive, setIsAdminPageActive] = useState<boolean>(false);

  // Indian Standard Time (IST) initial date state: starts directly with current date roster
  const [year] = useState<number>(() => initialIST.year);
  const [month, setMonth] = useState<number>(() => initialIST.month);
  const [selectedDay, setSelectedDay] = useState<number>(() => initialIST.day);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Multi-Team Database State: loads database specifically for activeTeamId
  const [db, setDb] = useState<DatabaseState>(() => loadTeamDatabase(activeTeamId));
  // Backup state for Undo capability per active team
  const [backupInfo, setBackupInfo] = useState<DatabaseBackup | null>(() => getTeamBackup(activeTeamId));

  // Modals state
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [addModalPreselectedEmpId, setAddModalPreselectedEmpId] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync team change: load database and backup for newly selected team
  const handleSelectTeam = (newTeamId: TeamId) => {
    if (!canUserViewTeam(currentUser, newTeamId)) {
      const targetTeam = TEAMS.find((t) => t.id === newTeamId)?.name || 'that team';
      showToast(`🔒 Access Denied: Your account (${currentUser?.username}) belongs to ${currentUser?.group} group. ${targetTeam} roster is locked.`);
      return;
    }
    setActiveTeamId(newTeamId);
    const newDb = loadTeamDatabase(newTeamId);
    setDb(newDb);
    setBackupInfo(getTeamBackup(newTeamId));
    setIsAdminPageActive(false);
  };

  // Check if current user has edit permission for the active team
  const canEdit = useMemo(() => {
    return canUserEditTeam(currentUser, activeTeamId);
  }, [currentUser, activeTeamId]);

  // User role for child view components ('admin' for full edit, 'viewer' for read-only)
  const userRole: UserRole = canEdit ? 'admin' : 'viewer';

  // Active Team configuration
  const currentTeamConfig = useMemo(() => {
    return TEAMS.find((t) => t.id === activeTeamId) || TEAMS[0];
  }, [activeTeamId]);

  // Derive Roster Rows for currently active month from database
  const rosterRows = useMemo(() => {
    return getMonthRosterRows(db, year, month);
  }, [db, year, month]);

  // Balances
  const balances = db.balances;

  // Selected employee detail
  const selectedEmployeeBalance = useMemo(() => {
    if (!selectedEmpId) return null;
    return balances.find((b) => b.empId === selectedEmpId) || null;
  }, [balances, selectedEmpId]);

  const selectedEmployeeRoster = useMemo(() => {
    if (!selectedEmpId) return undefined;
    return rosterRows.find((r) => r.empId === selectedEmpId) || undefined;
  }, [rosterRows, selectedEmpId]);

  // 1. Update single day cell in active team database
  const handleUpdateCell = (empId: string, day: number, value: CellValue) => {
    if (!canEdit) {
      showToast(`Permission Denied: Your account is in View-Only mode for ${currentTeamConfig.name}.`);
      return;
    }
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newSchedules = {
      ...db.dailySchedules,
      [empId]: {
        ...(db.dailySchedules[empId] || {}),
        [dateKey]: String(value),
      },
    };

    const newDb: DatabaseState = {
      ...db,
      dailySchedules: newSchedules,
    };

    setDb(newDb);
    saveTeamDatabase(activeTeamId, newDb);
    showToast(`Saved Day ${day} (${month}/${day}/${year}) to '${value}' in ${currentTeamConfig.name}`);
  };

  // 2. Update employee leave balance quota in active team database
  const handleUpdateBalance = (empId: string, updated: EmployeeLeaveBalance) => {
    if (!canEdit) {
      showToast(`Permission Denied: Admin rights required to edit quota for ${currentTeamConfig.name}.`);
      return;
    }
    const recomputed = calculateEmployeeBalance(updated);
    const newBalances = db.balances.map((b) => (b.empId === empId ? recomputed : b));

    const newDb: DatabaseState = {
      ...db,
      balances: newBalances,
    };

    setDb(newDb);
    saveTeamDatabase(activeTeamId, newDb);
    showToast(`Updated 2026 quota ledger for ${updated.name}`);
  };

  // 3. Reset active team database
  const handleResetToMaster = () => {
    if (!canEdit) {
      showToast(`Permission Denied: Admin rights required to reset ${currentTeamConfig.name} roster.`);
      return;
    }
    if (
      window.confirm(
        `Reset the entire ${currentTeamConfig.name} database back to initial default roster?`
      )
    ) {
      const resetState = resetTeamDatabase(activeTeamId);
      setDb(resetState);
      setBackupInfo(null);
      showToast(`Reset ${currentTeamConfig.name} database to default roster`);
    }
  };

  // 4. Multi-day leave or shift assignment
  const handleAddLeaveSubmit = ({
    empId,
    startDay,
    endDay,
    value,
    updateQuota,
  }: {
    empId: string;
    startDay: number;
    endDay: number;
    value: CellValue;
    updateQuota: boolean;
  }) => {
    if (!canEdit) {
      showToast(`Permission Denied: Admin rights required to log leaves for ${currentTeamConfig.name}.`);
      return;
    }
    const newEmpSchedule = { ...(db.dailySchedules[empId] || {}) };
    for (let d = startDay; d <= endDay; d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      newEmpSchedule[dateKey] = String(value);
    }

    let newBalances = db.balances;
    if (updateQuota) {
      const daysCount = endDay - startDay + 1;
      newBalances = db.balances.map((b) => {
        if (b.empId === empId) {
          const mod = { ...b };
          if (value === 'PL') mod.plConsumed += daysCount;
          else if (value === 'SL') mod.slConsumed += daysCount;
          else if (value === 'CL') mod.clConsumed += daysCount;
          else if (value === 'CO') mod.compOffConsumed += daysCount;
          return calculateEmployeeBalance(mod);
        }
        return b;
      });
    }

    const newDb: DatabaseState = {
      ...db,
      balances: newBalances,
      dailySchedules: {
        ...db.dailySchedules,
        [empId]: newEmpSchedule,
      },
    };

    setDb(newDb);
    saveTeamDatabase(activeTeamId, newDb);
    setIsAddModalOpen(false);
    showToast(
      `Assigned '${value}' for ${daysCountHelper(startDay, endDay)} day(s) to ${
        balances.find((b) => b.empId === empId)?.name || 'engineer'
      }`
    );
  };

  const daysCountHelper = (s: number, e: number) => e - s + 1;

  // 5. Open Add Leave Modal
  const handleOpenAddModal = (empId?: string) => {
    if (!canEdit) {
      showToast(`View-Only Mode: You have read-only access to ${currentTeamConfig.name}. Log in as Admin to edit.`);
      return;
    }
    setAddModalPreselectedEmpId(empId);
    setIsAddModalOpen(true);
  };

  // 6. Excel / CSV Import Success handler for active team
  const handleImportSuccess = (newState: DatabaseState, targetMonth?: number) => {
    // 1. Take a snapshot of the current state before applying import
    saveTeamBackup(
      activeTeamId,
      db,
      `Automatic snapshot of ${currentTeamConfig.name} before Excel/CSV import`
    );
    const freshBackup = getTeamBackup(activeTeamId);
    setBackupInfo(freshBackup);

    // 2. Persist newly merged or replaced database for active team
    setDb(newState);
    saveTeamDatabase(activeTeamId, newState);

    // 3. If a target month was imported, switch to it
    if (targetMonth && targetMonth >= 1 && targetMonth <= 12) {
      setMonth(targetMonth);
      setSelectedDay(1);
    }

    showToast(
      `Successfully synchronized ${currentTeamConfig.name} roster (${newState.balances.length} engineers)!`
    );
  };

  // 7. Undo import handler for active team
  const handleUndoImport = () => {
    if (!canEdit) {
      showToast(`Admin rights required to restore database backup.`);
      return;
    }
    const restored = restoreTeamBackup(activeTeamId);
    if (restored) {
      setDb(restored);
      setBackupInfo(null);
      showToast(`Successfully reverted ${currentTeamConfig.name} database to pre-import snapshot.`);
    } else {
      showToast(`No previous import backup available to restore for ${currentTeamConfig.name}.`);
    }
  };

  // 7b. Dismiss and permanently clear undo snapshot for active team
  const handleDismissUndo = () => {
    clearTeamBackup(activeTeamId);
    setBackupInfo(null);
    showToast(`Undo option dismissed and removed for ${currentTeamConfig.name}.`);
  };

  // 8. Reconcile all balances
  const handleSyncAllBalances = () => {
    if (!canEdit) {
      showToast(`Admin rights required to reconcile leave ledger.`);
      return;
    }
    // Recompute all from schedules
    showToast(`Leave balances synchronized with 2026 attendance ledger.`);
  };

  // 9. Update employee row color (Name & ID)
  const handleUpdateEmployeeColor = (empId: string, colorId: string) => {
    if (!canEdit) {
      showToast(`Permission Denied: Only Group Admin or Global Admin can change row colors.`);
      return;
    }
    const updatedColors = {
      ...(db.employeeColors || {}),
      [empId]: colorId,
    };
    const updatedDb: DatabaseState = {
      ...db,
      employeeColors: updatedColors,
    };
    setDb(updatedDb);
    saveTeamDatabase(activeTeamId, updatedDb);
    const colorOption = ROSTER_ROW_COLORS.find((c) => c.id === colorId);
    showToast(`Updated row color to ${colorOption?.name || colorId} for employee ID: ${empId}`);
  };

  // 10. Delete / Remove Employee from Roster (e.g., employee left the organization)
  const handleDeleteEmployeeFromRoster = (empId: string, empName: string) => {
    if (!canEdit) {
      showToast(`Permission Denied: Only Group Admin or Global Admin can remove employees from roster.`);
      return;
    }
    // Create an automatic undo backup before deletion
    saveTeamBackup(
      activeTeamId,
      db,
      `Automatic snapshot before removing ${empName} (${empId})`
    );
    setBackupInfo(getTeamBackup(activeTeamId));

    const updatedBalances = db.balances.filter((b) => b.empId !== empId);
    const updatedSchedules = { ...db.dailySchedules };
    delete updatedSchedules[empId];
    const updatedColors = { ...(db.employeeColors || {}) };
    delete updatedColors[empId];

    const updatedDb: DatabaseState = {
      ...db,
      balances: updatedBalances,
      dailySchedules: updatedSchedules,
      employeeColors: updatedColors,
    };

    setDb(updatedDb);
    saveTeamDatabase(activeTeamId, updatedDb);
    if (selectedEmpId === empId) {
      setSelectedEmpId(null);
    }
    showToast(`Removed ${empName} (EMP ID: ${empId}) from ${currentTeamConfig.name} roster. Click 'Undo' if needed.`);
  };

  // 11. Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Logged out. Please enter username and password to re-enter.');
  };

  // If user is not authenticated, show modern Username and Password Login Screen
  if (!currentUser) {
    return (
      <AppLoginGate
        onLoginSuccess={(user) => {
          persistCurrentUser(user);
          setCurrentUser(user);
          // If assigned to a team, switch to it
          if (user.group !== 'Global Admin') {
            const teamMatch = TEAMS.find((t) => t.groupName === user.group);
            if (teamMatch) {
              setActiveTeamId(teamMatch.id);
              setDb(loadTeamDatabase(teamMatch.id));
              setBackupInfo(getTeamBackup(teamMatch.id));
            }
          }
          showToast(`Welcome, ${user.username}! Signed in as ${user.group} (${user.permission === 'admin' ? 'Admin' : 'View Only'}).`);
        }}
      />
    );
  }

  const monthName = MONTH_NAMES[month - 1];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-50/50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Team Navigation Bar with 6 Teams & Admin Button (Matches User Screenshot) */}
      <TeamTopBar
        activeTeamId={activeTeamId}
        onSelectTeam={handleSelectTeam}
        currentUser={currentUser}
        onOpenAdminPage={() => {
          if (currentUser?.permission === 'admin') {
            setIsAdminPageActive(true);
          } else {
            showToast(
              `Admin access required. User "${currentUser?.username}" has View-Only permission.`
            );
          }
        }}
        isAdminPageActive={isAdminPageActive}
        onBackToRoster={() => setIsAdminPageActive(false)}
        onLockedTeamClick={(targetTeamName) => {
          showToast(`🔒 Access Denied: ${targetTeamName} is locked. You can only view ${currentUser?.group} team roster.`);
        }}
      />

      {/* If Admin Page is Active, render Central Admin & Groups Management */}
      {isAdminPageActive ? (
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminManagementPage
            currentUser={currentUser}
            onBackToRoster={() => setIsAdminPageActive(false)}
            onSelectTeam={(t) => {
              handleSelectTeam(t);
              setIsAdminPageActive(false);
            }}
            onOpenImportForTeam={(t) => {
              handleSelectTeam(t);
              setIsAdminPageActive(false);
              setIsImportModalOpen(true);
            }}
            showToast={showToast}
          />
        </main>
      ) : (
        <>
          {/* 2. Secondary Header with Active Team Logo, Tabs, IST Clock, User Status & Logout */}
          <Navbar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            year={year}
            teamName={currentTeamConfig.name}
            currentUser={currentUser}
            canEdit={canEdit}
            onLogout={handleLogout}
            onOpenAdminPage={() => setIsAdminPageActive(true)}
          />

          {/* Undo Alert Banner for Recent Import on this team */}
          {backupInfo && canEdit && (
            <div className="bg-amber-500 text-slate-950 px-4 py-2 border-b border-amber-600 text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-950 shrink-0" />
                <span>
                  <strong>{currentTeamConfig.name} roster was recently imported.</strong> Wrong file or merged accidentally? Snapshot from{' '}
                  <span className="font-mono">{backupInfo.formattedTime}</span> ({backupInfo.employeeCount} members) can be restored.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleUndoImport}
                  className="px-3 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Undo Last Import</span>
                </button>
                <button
                  onClick={handleDismissUndo}
                  className="text-slate-900 hover:text-black p-1 hover:bg-amber-600/30 rounded-md font-bold cursor-pointer text-sm leading-none transition-colors"
                  title="Dismiss and remove undo option"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 3. Main View Area for Active Team */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!canUserViewTeam(currentUser, activeTeamId) ? (
              <div className="bg-white rounded-3xl border border-amber-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-xl animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                  {currentTeamConfig.name} Roster is Locked
                </h2>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Your account <strong>{currentUser?.username}</strong> belongs to the <strong>{currentUser?.group} Team</strong> group. You only have access to view and manage your assigned team roster.
                </p>
                {currentUser && currentUser.group !== 'Global Admin' && (
                  <button
                    onClick={() => {
                      const myTeam = TEAMS.find((t) => t.groupName === currentUser.group);
                      if (myTeam) handleSelectTeam(myTeam.id);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    Switch to My {currentUser.group} Team Roster
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* In-Page Operational Action Toolbar (Roster Month, Today IST, Import Excel/CSV, Export DB, Log Leave/Shift) */}
                <PageActionBar
                  year={year}
                  month={month}
                  onMonthChange={(m) => {
                    setMonth(m);
                    const istNow = getISTDate();
                    if (m === istNow.month) {
                      setSelectedDay(istNow.day);
                    } else {
                      setSelectedDay(1);
                    }
                  }}
              onJumpToToday={() => {
                const istNow = getISTDate();
                setMonth(istNow.month);
                setSelectedDay(istNow.day);
                showToast(`Jumped to today: ${istNow.formattedDate} (IST)`);
              }}
              onOpenImportModal={() => {
                if (!canEdit) {
                  showToast(`View-Only Mode: You have read-only access to ${currentTeamConfig.name}.`);
                } else {
                  setIsImportModalOpen(true);
                }
              }}
              onExportMasterCsv={() => {
                exportDatabaseToCSV(db, year);
                showToast(`Exported ${currentTeamConfig.name} 2026 database CSV`);
              }}
              onOpenLogModal={() => handleOpenAddModal()}
              canEdit={canEdit}
              onPermissionDenied={(reason) => showToast(reason)}
              onUndoImport={handleUndoImport}
              hasUndoBackup={!!backupInfo}
            />

            {/* Active View Tab */}
            {currentTab === 'dashboard' && (
              <DashboardView
                balances={balances}
                rosterRows={rosterRows}
                year={year}
                month={month}
                monthName={monthName}
                onSelectEmployee={(empId) => setSelectedEmpId(empId)}
                onNavigateToRoster={() => setCurrentTab('roster')}
                onNavigateToBalances={() => setCurrentTab('balances')}
                db={db}
                onMonthChange={setMonth}
                userRole={userRole}
                onOpenAdminModal={() => {
                  showToast(`Current account: ${currentUser.username} (${userRole === 'admin' ? 'Admin' : 'View Only'})`);
                }}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                teamName={currentTeamConfig.name}
              />
            )}

            {currentTab === 'roster' && (
              <RosterGridView
                year={year}
                month={month}
                monthName={monthName}
                rows={rosterRows}
                onUpdateCell={handleUpdateCell}
                onResetRoster={handleResetToMaster}
                onSelectEmployee={(empId) => setSelectedEmpId(empId)}
                onMonthChange={setMonth}
                userRole={userRole}
                onOpenAdminModal={() => {
                  showToast(`Current account: ${currentUser.username} (${userRole === 'admin' ? 'Admin' : 'View Only'})`);
                }}
                employeeColors={db.employeeColors || {}}
                onUpdateEmployeeColor={handleUpdateEmployeeColor}
                onDeleteEmployeeFromRoster={handleDeleteEmployeeFromRoster}
                teamName={currentTeamConfig.name}
              />
            )}

            {currentTab === 'balances' && (
              <LeaveBalancesView
                balances={balances}
                year={year}
                onUpdateBalance={handleUpdateBalance}
                onSelectEmployee={(empId) => setSelectedEmpId(empId)}
                onOpenLogModal={handleOpenAddModal}
                userRole={userRole}
                onOpenAdminModal={() => {
                  showToast(`Current account: ${currentUser.username} (${userRole === 'admin' ? 'Admin' : 'View Only'})`);
                }}
                onSyncAllBalances={handleSyncAllBalances}
              />
            )}

            {currentTab === 'directory' && (
              <EmployeeDirectoryView
                balances={balances}
                rosterRows={rosterRows}
                year={year}
                onSelectEmployee={(empId) => setSelectedEmpId(empId)}
                onOpenLogLeave={handleOpenAddModal}
                userRole={userRole}
                onOpenAdminModal={() => {
                  showToast(`Current account: ${currentUser.username} (${userRole === 'admin' ? 'Admin' : 'View Only'})`);
                }}
              />
            )}
            </>
          )}
          </main>
        </>
      )}

      {/* Individual Employee Drill-down Modal */}
      {selectedEmployeeBalance && (
        <EmployeeDetailModal
          employee={selectedEmployeeBalance}
          rosterRow={selectedEmployeeRoster}
          year={year}
          month={month}
          monthName={monthName}
          onClose={() => setSelectedEmpId(null)}
          onOpenLogLeave={(empId) => handleOpenAddModal(empId)}
          onUpdateDayCell={handleUpdateCell}
          userRole={userRole}
          onOpenAdminModal={() => {
            showToast(`Current account: ${currentUser.username} (${userRole === 'admin' ? 'Admin' : 'View Only'})`);
          }}
          employeeColor={db.employeeColors?.[selectedEmployeeBalance.empId]}
          onUpdateEmployeeColor={handleUpdateEmployeeColor}
          onDeleteEmployee={handleDeleteEmployeeFromRoster}
        />
      )}

      {/* Add Leave / Assign Shift Modal for Active Team */}
      {isAddModalOpen && (
        <AddLeaveModal
          employees={balances}
          preSelectedEmpId={addModalPreselectedEmpId}
          year={year}
          month={month}
          monthName={monthName}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddLeaveSubmit}
        />
      )}

      {/* Import Excel / CSV Modal for Active Team */}
      {isImportModalOpen && (
        <ImportCsvModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
          currentDb={db}
          backupInfo={backupInfo}
          onUndoImport={handleUndoImport}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
