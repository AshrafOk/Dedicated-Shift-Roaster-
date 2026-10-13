import React, { useState } from 'react';
import {
  EmployeeLeaveBalance,
  LeaveCode,
  ShiftCode,
  CellValue,
} from '../types/roster';
import { LEAVE_DEFINITIONS, SHIFT_DEFINITIONS } from '../data/initialData';
import { getDaysInMonth } from '../utils/rosterUtils';
import { X, Calendar, User, Clock, Check } from 'lucide-react';

interface AddLeaveModalProps {
  employees: EmployeeLeaveBalance[];
  preSelectedEmpId?: string;
  year: number;
  month: number;
  monthName: string;
  onClose: () => void;
  onSubmit: (data: {
    empId: string;
    startDay: number;
    endDay: number;
    value: CellValue;
    updateQuota: boolean;
    reason?: string;
  }) => void;
}

export const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
  employees,
  preSelectedEmpId,
  year,
  month,
  monthName,
  onClose,
  onSubmit,
}) => {
  const [empId, setEmpId] = useState<string>(preSelectedEmpId || employees[0]?.empId || '');
  const [entryType, setEntryType] = useState<'leave' | 'shift' | 'week_off'>('leave');
  const [leaveCode, setLeaveCode] = useState<LeaveCode>('PL');
  const [shiftCode, setShiftCode] = useState<ShiftCode>('23');
  const [startDay, setStartDay] = useState<number>(1);
  const [endDay, setEndDay] = useState<number>(1);
  const [updateQuota, setUpdateQuota] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');

  const daysInMonth = getDaysInMonth(year, month);
  const selectedEmployee = employees.find((e) => e.empId === empId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalValue: CellValue = 'PL';
    if (entryType === 'leave') finalValue = leaveCode;
    else if (entryType === 'shift') finalValue = shiftCode;
    else if (entryType === 'week_off') finalValue = 'W';

    onSubmit({
      empId,
      startDay: Math.min(startDay, endDay),
      endDay: Math.max(startDay, endDay),
      value: finalValue,
      updateQuota: entryType === 'leave' && updateQuota,
      reason,
    });
    onClose();
  };

  const daysCount = Math.abs(endDay - startDay) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Log Leave or Assign Shift
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update {monthName} {year} roster &amp; synchronized quota balance
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Employee Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Team Member
            </label>
            <select
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {employees.map((e) => (
                <option key={e.empId} value={e.empId}>
                  {e.name} (ID: {e.empId}) · PL Bal: {e.plBalance} · CL Bal: {e.clBalance} · CO Bal: {e.compOffBalance}
                </option>
              ))}
            </select>
          </div>

          {/* Entry Type Tabs */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Entry Category
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setEntryType('leave')}
                className={`py-1.5 font-bold rounded-md transition-colors ${
                  entryType === 'leave'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apply Leave
              </button>
              <button
                type="button"
                onClick={() => setEntryType('shift')}
                className={`py-1.5 font-bold rounded-md transition-colors ${
                  entryType === 'shift'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assign Shift
              </button>
              <button
                type="button"
                onClick={() => setEntryType('week_off')}
                className={`py-1.5 font-bold rounded-md transition-colors ${
                  entryType === 'week_off'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week Off (W)
              </button>
            </div>
          </div>

          {/* If Leave: Select Leave Code */}
          {entryType === 'leave' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Leave Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEAVE_DEFINITIONS.filter((l) => l.code !== 'W').map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => setLeaveCode(l.code)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      leaveCode === l.code
                        ? 'ring-2 ring-indigo-600 shadow-xs scale-102 font-bold'
                        : 'opacity-85'
                    } ${l.bgColor} ${l.textColor} ${l.borderColor}`}
                  >
                    <div className="text-xs">{l.code}</div>
                    <div className="text-[10px] opacity-90 truncate">{l.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If Shift: Select Shift Code */}
          {entryType === 'shift' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Shift Timing (IST)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHIFT_DEFINITIONS.map((s) => (
                  <button
                    type="button"
                    key={s.code}
                    onClick={() => setShiftCode(s.code)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      shiftCode === s.code
                        ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-slate-900">Shift {s.code}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.istTiming}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range: Day Number */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Start Day ({monthName})
              </label>
              <select
                value={startDay}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStartDay(val);
                  if (val > endDay) setEndDay(val);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d} ({monthName} {d}, {year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                End Day ({monthName})
              </label>
              <select
                value={endDay}
                onChange={(e) => setEndDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} disabled={d < startDay}>
                    Day {d} ({monthName} {d}, {year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg font-medium flex items-center justify-between">
            <span>Duration:</span>
            <span className="font-bold font-mono">{daysCount} Day(s) Selected</span>
          </div>

          {/* Sync Quota Checkbox */}
          {entryType === 'leave' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="updateQuota"
                checked={updateQuota}
                onChange={(e) => setUpdateQuota(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="updateQuota" className="font-semibold text-slate-700 cursor-pointer">
                Auto-update consumed counter in {year} Leave Balances table (+{daysCount} {leaveCode})
              </label>
            </div>
          )}

          {/* Reason / Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Vacation trip, Medical recovery, Emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Apply to Roster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
