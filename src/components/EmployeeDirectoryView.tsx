import React, { useState } from 'react';
import { EmployeeLeaveBalance, EmployeeRosterRow } from '../types/roster';
import { SHIFT_DEFINITIONS } from '../data/initialData';
import {
  Search,
  Users,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Clock,
  Filter,
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  balances: EmployeeLeaveBalance[];
  rosterRows: EmployeeRosterRow[];
  year: number;
  onSelectEmployee: (empId: string) => void;
  onOpenLogLeave: (empId: string) => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  balances,
  rosterRows,
  year,
  onSelectEmployee,
  onOpenLogLeave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');

  const filteredEmployees = balances.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.joiningDate.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (shiftFilter === 'all') return true;
    const roster = rosterRows.find((r) => r.empId === emp.empId);
    return roster?.defaultShift === shiftFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Directory Header & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Team Directory &amp; Individual Quota Records
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {balances.length} Dedicated Account resources with {year} leave ledgers and shift assignments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID, joining date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Shift Filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              aria-label="Filter by assigned shift"
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Shifts</option>
              <option value="23">Shift 23 (6pm – 3am)</option>
              <option value="1">Shift 1 (5pm – 2:30am)</option>
              <option value="2">Shift 2 (8:30pm – 5:30am)</option>
              <option value="3">Shift 3 (10pm – 7am)</option>
              <option value="4">Shift 4 (5am – 2pm)</option>
              <option value="12">Shift 12 (10am – 6pm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Employee Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          const roster = rosterRows.find((r) => r.empId === emp.empId);
          const defaultShift = roster?.defaultShift || '23';
          const shiftDef = SHIFT_DEFINITIONS.find((s) => s.code === defaultShift);

          return (
            <div
              key={emp.empId}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top: Name, ID, Shift */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      onClick={() => onSelectEmployee(emp.empId)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {emp.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      EMP ID: {emp.empId} · Joined {emp.joiningDate}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded border ${shiftDef?.badgeBg} ${shiftDef?.badgeText}`}
                    title={shiftDef?.istTiming}
                  >
                    Shift {defaultShift}
                  </span>
                </div>

                {/* Shift Timing Subtitle */}
                <div className="mt-2 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{shiftDef?.istTiming}</span>
                </div>

                {/* Leave Quota Balances Pill Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  {/* PL */}
                  <div className="p-2 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-red-700">PL (Vacation)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Used: {emp.plConsumed}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {emp.plBalance}
                    </div>
                  </div>

                  {/* CL */}
                  <div className="p-2 rounded-lg bg-sky-50/50 border border-sky-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-sky-700">CL (Casual)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Used: {emp.clConsumed}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {emp.clBalance}
                    </div>
                  </div>

                  {/* SL */}
                  <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-amber-800">SL (Sick)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Used: {emp.slConsumed}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {emp.slBalance}
                    </div>
                  </div>

                  {/* Comp Off */}
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      emp.compOffBalance < 0
                        ? 'bg-rose-50/60 border-rose-200'
                        : 'bg-emerald-50/50 border-emerald-100'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800">Comp Off</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Used: {emp.compOffConsumed}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold font-mono tabular-nums ${
                        emp.compOffBalance < 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {emp.compOffBalance}
                    </div>
                  </div>
                </div>

                {/* Total Taken */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono px-1">
                  <span>{year} Total Absences:</span>
                  <span className="font-bold text-slate-900">{emp.totalLeaveTaken} days</span>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectEmployee(emp.empId)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <span>Individual Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenLogLeave(emp.empId)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log Leave</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
