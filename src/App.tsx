/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CellValue,
  EmployeeLeaveBalance,
  EmployeeRosterRow,
  ViewTab,
} from './types/roster';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  getMonthRosterRows,
  exportDatabaseToCSV,
  DatabaseState,
} from './data/database';
import { calculateEmployeeBalance } from './utils/rosterUtils';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RosterGridView } from './components/RosterGridView';
import { LeaveBalancesView } from './components/LeaveBalancesView';
import { EmployeeDirectoryView } from './components/EmployeeDirectoryView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { AddLeaveModal } from './components/AddLeaveModal';
import { ImportCsvModal } from './components/ImportCsvModal';

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
  const [year] = useState<number>(2026);
  // Default to October 2026, or user can toggle to any month (1-12)
  const [month, setMonth] = useState<number>(10);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Master Database State (Holds all 365 days of schedules and leave balances for all 28 employees)
  const [db, setDb] = useState<DatabaseState>(() => loadDatabase());

  // Derive Roster Rows for currently active month from database
  const rosterRows = useMemo(() => {
    return getMonthRosterRows(db, year, month);
  }, [db, year, month]);

  // Balances
  const balances = db.balances;

  // Modal states
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [addModalPreselectedEmpId, setAddModalPreselectedEmpId] = useState<
    string | undefined
  >(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 1. Update single day cell in database
  const handleUpdateCell = (empId: string, day: number, value: CellValue) => {
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
    saveDatabase(newDb);
    showToast(`Saved Day ${day} (${month}/${day}/${year}) to '${value}' in database`);
  };

  // 2. Update employee leave balance quota
  const handleUpdateBalance = (empId: string, updated: EmployeeLeaveBalance) => {
    const recomputed = calculateEmployeeBalance(updated);
    const newBalances = db.balances.map((b) => (b.empId === empId ? recomputed : b));

    const newDb: DatabaseState = {
      ...db,
      balances: newBalances,
    };

    setDb(newDb);
    saveDatabase(newDb);
    showToast(`Updated 2026 quota ledger for ${updated.name}`);
  };

  // 3. Reset database to master CSV
  const handleResetToMaster = () => {
    if (
      window.confirm(
        'Reset the entire database back to the official Kaseya NOC master CSV data?'
      )
    ) {
      const resetState = resetDatabase();
      setDb(resetState);
      showToast('Reset database to official master Kaseya NOC roster');
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
          else if (value === 'PH') mod.phConsumed += daysCount;
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
    saveDatabase(newDb);

    const emp = db.balances.find((b) => b.empId === empId);
    showToast(
      `Logged ${value} for ${emp?.name || empId} from Day ${startDay} to ${endDay} (${MONTH_NAMES[month - 1]})`
    );
  };

  // 5. Apply newly imported CSV
  const handleImportSuccess = (importedState: DatabaseState) => {
    setDb(importedState);
    saveDatabase(importedState);
    showToast(
      `Successfully loaded and synchronized ${importedState.balances.length} team members into database!`
    );
  };

  const handleOpenAddModal = (targetEmpId?: string) => {
    setAddModalPreselectedEmpId(targetEmpId);
    setIsAddModalOpen(true);
  };

  const monthName = MONTH_NAMES[month - 1];

  const selectedEmployeeBalance = balances.find((b) => b.empId === selectedEmpId);
  const selectedEmployeeRoster = rosterRows.find((r) => r.empId === selectedEmpId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-50/50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar with 3-Zone Top Bar Contract, Month Selector, and CSV Database Tools */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenLogModal={() => handleOpenAddModal()}
        year={year}
        month={month}
        onMonthChange={setMonth}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportMasterCsv={() => exportDatabaseToCSV(db, year)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          />
        )}

        {currentTab === 'balances' && (
          <LeaveBalancesView
            balances={balances}
            year={year}
            onUpdateBalance={handleUpdateBalance}
            onSelectEmployee={(empId) => setSelectedEmpId(empId)}
            onOpenLogModal={handleOpenAddModal}
          />
        )}

        {currentTab === 'directory' && (
          <EmployeeDirectoryView
            balances={balances}
            rosterRows={rosterRows}
            year={year}
            onSelectEmployee={(empId) => setSelectedEmpId(empId)}
            onOpenLogLeave={handleOpenAddModal}
          />
        )}
      </main>

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
        />
      )}

      {/* Add Leave / Assign Shift Modal */}
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

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <ImportCsvModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
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
