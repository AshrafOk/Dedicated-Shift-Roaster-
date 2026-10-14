import React, { useState } from 'react';
import {
  EmployeeLeaveBalance,
  EmployeeRosterRow,
  CellValue,
  LeaveCode,
  UserRole,
} from '../types/roster';
import { SHIFT_DEFINITIONS, LEAVE_DEFINITIONS } from '../data/initialData';
import {
  getDayOfWeekName,
  getDaysInMonth,
  isWeekend,
  getCellColorStyles,
} from '../utils/rosterUtils';
import { getISTDate } from '../utils/istUtils';
import {
  X,
  User,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  Plus,
  CheckCircle2,
  CalendarDays,
  Lock,
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: EmployeeLeaveBalance;
  rosterRow?: EmployeeRosterRow;
  year: number;
  month: number;
  monthName: string;
  onClose: () => void;
  onOpenLogLeave: (empId: string) => void;
  onUpdateDayCell: (empId: string, day: number, value: CellValue) => void;
  userRole?: UserRole;
  onOpenAdminModal?: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  rosterRow,
  year,
  month,
  monthName,
  onClose,
  onOpenLogLeave,
  onUpdateDayCell,
  userRole = 'viewer',
  onOpenAdminModal,
}) => {
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const defaultShiftDef = SHIFT_DEFINITIONS.find((s) => s.code === rosterRow?.defaultShift);

  const plTotalEntitlement = employee.plCarriedOver + employee.plAccumulated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-blue-300">
                  EMP ID: {employee.empId}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>Joined: {employee.joiningDate}</span>
                <span>·</span>
                <span>Department: {employee.department || 'Dedicated Support'}</span>
                <span>·</span>
                <span>Default: Shift {rosterRow?.defaultShift || '23'} ({defaultShiftDef?.istTiming})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' ? (
              <button
                onClick={() => onOpenLogLeave(employee.empId)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Leave</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors shadow-xs"
                title="Admin only: Unlock to log leave"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlock to Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Year-Wise 2026 Quota Overview Cards: PL, CL, SL, Comp Off */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {year} Individual Leave Quota &amp; Balance Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Cumulative Taken: <strong className="text-slate-900 font-mono">{employee.totalLeaveTaken} days</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PL Card */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded">
                    PL (Vacation)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Total: {plTotalEntitlement}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Used (Consumed)</div>
                    <div className="text-xl font-bold text-red-700 font-mono tabular-nums">
                      {employee.plConsumed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Pending (Balance)</div>
                    <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {employee.plBalance}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-red-100 flex justify-between">
                  <span>Carried: {employee.plCarriedOver}</span>
                  <span>Acc: {employee.plAccumulated}</span>
                </div>
              </div>

              {/* CL Card */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-bold bg-sky-500 text-white rounded">
                    CL (Casual)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Total: {employee.totalClAccumulated}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Used (Consumed)</div>
                    <div className="text-xl font-bold text-sky-700 font-mono tabular-nums">
                      {employee.clConsumed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Pending (Balance)</div>
                    <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {employee.clBalance}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-sky-100 flex justify-between">
                  <span>Accumulated:</span>
                  <span>{employee.totalClAccumulated} days</span>
                </div>
              </div>

              {/* SL Card */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-amber-950 rounded">
                    SL (Sick)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Total: {employee.totalSlAccumulated}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Used (Consumed)</div>
                    <div className="text-xl font-bold text-amber-800 font-mono tabular-nums">
                      {employee.slConsumed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Pending (Balance)</div>
                    <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {employee.slBalance}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-amber-100 flex justify-between">
                  <span>Accumulated:</span>
                  <span>{employee.totalSlAccumulated} days</span>
                </div>
              </div>

              {/* Comp Off Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  employee.compOffBalance < 0
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-emerald-200 bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded">
                    Comp Off (CO)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Eligible: {employee.compOffEligible}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Used (Consumed)</div>
                    <div className="text-xl font-bold text-emerald-800 font-mono tabular-nums">
                      {employee.compOffConsumed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Net Balance</div>
                    <div
                      className={`text-xl font-bold font-mono tabular-nums ${
                        employee.compOffBalance < 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {employee.compOffBalance}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-emerald-100 flex justify-between">
                  <span>Expired: {employee.coExpired}</span>
                  {employee.compOffBalance < 0 && (
                    <span className="text-rose-600 font-bold">Deficit Alert</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Month Roster Calendar View */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {monthName} {year} Shift &amp; Attendance Calendar
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                {userRole === 'admin'
                  ? 'Click any day to update shift or mark leave'
                  : 'Read-Only Calendar: Admin permission required to edit days'}
              </span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="font-bold text-slate-400 py-1 uppercase text-[10px]">
                  {d}
                </div>
              ))}

              {/* Padding for first day of month */}
              {Array.from(
                { length: new Date(year, month - 1, 1).getDay() },
                (_, i) => (
                  <div key={`empty-${i}`} className="p-2 min-h-[56px] rounded bg-transparent" />
                )
              )}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const val = rosterRow?.days[day] || rosterRow?.defaultShift || '23';
                const style = getCellColorStyles(val);
                const weekend = isWeekend(year, month, day);
                const ist = getISTDate();
                const isToday = year === ist.year && month === ist.month && day === ist.day;

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (userRole !== 'admin') {
                        if (onOpenAdminModal) onOpenAdminModal();
                        return;
                      }
                      setSelectedDayToEdit(day);
                    }}
                    className={`p-2 min-h-[60px] rounded-lg border transition-all flex flex-col justify-between ${
                      isToday
                        ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/70 shadow-2xs'
                        : weekend && !style.isLeave && val !== 'W'
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-white border-slate-200'
                    } ${
                      userRole === 'admin'
                        ? 'cursor-pointer hover:shadow-xs hover:border-indigo-400'
                        : 'cursor-not-allowed hover:bg-amber-50/50'
                    }`}
                    title={
                      userRole === 'admin'
                        ? `Click to edit Day ${day}${isToday ? ' (TODAY IST)' : ''}`
                        : `Day ${day}: ${val} (Read-Only · Admin required to edit)`
                    }
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className={isToday ? 'font-bold text-blue-900 font-sans' : ''}>{day}</span>
                      {isToday ? (
                        <span className="text-[8px] bg-blue-600 text-white font-sans font-bold px-1 rounded-[2px]">TODAY</span>
                      ) : weekend ? (
                        <span className="text-[9px] text-blue-600 font-bold">W/E</span>
                      ) : null}
                    </div>

                    <div
                      className={`py-1 text-xs font-bold rounded flex items-center justify-center ${style.bg} ${style.text}`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Profile
          </button>
        </div>

        {/* Inline Day Changer */}
        {selectedDayToEdit !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-5 max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="text-sm font-bold text-slate-900">
                  Update Day {selectedDayToEdit} ({monthName} {selectedDayToEdit}, {year})
                </div>
                <button
                  onClick={() => setSelectedDayToEdit(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2">Select Shift:</div>
                <div className="grid grid-cols-3 gap-2">
                  {SHIFT_DEFINITIONS.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => {
                        onUpdateDayCell(employee.empId, selectedDayToEdit, s.code);
                        setSelectedDayToEdit(null);
                      }}
                      className="p-2 border rounded text-xs font-bold bg-slate-50 hover:bg-indigo-50 hover:border-indigo-500"
                    >
                      Shift {s.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-2">Mark Leave / Off:</div>
                <div className="grid grid-cols-3 gap-2">
                  {LEAVE_DEFINITIONS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onUpdateDayCell(employee.empId, selectedDayToEdit, l.code);
                        setSelectedDayToEdit(null);
                      }}
                      className={`p-2 rounded text-xs font-bold ${l.bgColor} ${l.textColor}`}
                    >
                      {l.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
