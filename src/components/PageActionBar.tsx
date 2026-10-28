import React from 'react';
import {
  Clock,
  Download,
  Plus,
  RotateCcw,
  Lock,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { useISTClock } from '../utils/istUtils';

interface PageActionBarProps {
  year: number;
  month: number;
  onMonthChange: (month: number) => void;
  onJumpToToday?: () => void;
  onOpenImportModal: () => void;
  onExportMasterCsv: () => void;
  onOpenLogModal: () => void;
  canEdit: boolean;
  onPermissionDenied?: (reason: string) => void;
  onUndoImport?: () => void;
  hasUndoBackup?: boolean;
}

const MONTH_OPTIONS = [
  { val: 1, label: 'January' },
  { val: 2, label: 'February' },
  { val: 3, label: 'March' },
  { val: 4, label: 'April' },
  { val: 5, label: 'May' },
  { val: 6, label: 'June' },
  { val: 7, label: 'July' },
  { val: 8, label: 'August' },
  { val: 9, label: 'September' },
  { val: 10, label: 'October' },
  { val: 11, label: 'November' },
  { val: 12, label: 'December' },
];

export const PageActionBar: React.FC<PageActionBarProps> = ({
  year,
  month,
  onMonthChange,
  onJumpToToday,
  onOpenImportModal,
  onExportMasterCsv,
  onOpenLogModal,
  canEdit,
  onPermissionDenied,
  onUndoImport,
  hasUndoBackup,
}) => {
  const ist = useISTClock();
  const isCurrentMonth = month === ist.month;

  const handleRestrictedAction = (actionName: string) => {
    if (!canEdit) {
      if (onPermissionDenied) {
        onPermissionDenied(`Permission Denied: Admin rights required to ${actionName}. Your account is in View-Only mode for this team.`);
      }
      return;
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Month Selection & Today IST Jump */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Roster Month:</span>
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              aria-label="Select active roster month"
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.val} value={m.val} className="text-slate-900 font-medium">
                  {m.label} {year} {m.val === ist.month ? '• (Current IST)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick jump to Today (IST) button */}
          <button
            onClick={() => {
              onMonthChange(ist.month);
              if (onJumpToToday) onJumpToToday();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-98 ${
              isCurrentMonth
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
            }`}
            title={`Jump to Today's Current Date Roster: ${ist.formattedDate} (IST)`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today (IST)</span>
            {isCurrentMonth && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-500 bg-slate-100/70 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Synced to Indian Standard Time (IST)</span>
          </div>
        </div>

        {/* Right Section: Roster Operational Controls (Import, Undo, Export DB, Log Leave/Shift) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Undo button if a backup exists and user is admin */}
          {hasUndoBackup && onUndoImport && canEdit && (
            <button
              onClick={onUndoImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-98 shadow-2xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300"
              title="Revert to previous database state before last import"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Undo Last Import</span>
            </button>
          )}

          {/* Import Excel / CSV Button */}
          <button
            onClick={() => {
              if (canEdit) {
                onOpenImportModal();
              } else {
                handleRestrictedAction('import roster files');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-2xs ${
              canEdit
                ? 'text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-blue-400 cursor-pointer active:scale-98'
                : 'text-slate-500 bg-slate-100/80 border border-slate-200 hover:border-amber-400 cursor-not-allowed'
            }`}
            title={
              canEdit
                ? 'Import & sync Excel (.xlsx, .xls) or CSV roster file for this team'
                : 'View Only: Admin access required to import roster for this team'
            }
          >
            {canEdit ? (
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>Import Excel / CSV</span>
            {!canEdit && (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-mono font-medium">
                Admin Only
              </span>
            )}
          </button>

          {/* Export DB Button */}
          <button
            onClick={onExportMasterCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-2xs text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 cursor-pointer active:scale-98"
            title="Export complete 2026 database CSV for this team"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export DB</span>
          </button>

          {/* Log Leave or Assign Shift Primary Button */}
          <button
            onClick={() => {
              if (canEdit) {
                onOpenLogModal();
              } else {
                handleRestrictedAction('log leaves or assign shifts');
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap ${
              canEdit
                ? 'text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20 cursor-pointer active:scale-98'
                : 'text-slate-600 bg-slate-100 border border-slate-300 cursor-not-allowed opacity-80'
            }`}
            title={canEdit ? 'Log Leave or Assign Shift' : 'View-Only Mode: Admin access required to edit roster'}
          >
            {canEdit ? (
              <Plus className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{canEdit ? '+ Log Leave / Shift' : 'View Only (Read-Only)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
