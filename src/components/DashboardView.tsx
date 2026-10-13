import React, { useState } from 'react';
import { EmployeeLeaveBalance, EmployeeRosterRow, ShiftCode } from '../types/roster';
import { SHIFT_DEFINITIONS, LEAVE_DEFINITIONS } from '../data/initialData';
import { getDayOfWeekName, getDaysInMonth } from '../utils/rosterUtils';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Plane,
  HeartPulse,
  Coffee,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  balances: EmployeeLeaveBalance[];
  rosterRows: EmployeeRosterRow[];
  year: number;
  month: number;
  monthName: string;
  onSelectEmployee: (empId: string) => void;
  onNavigateToRoster: () => void;
  onNavigateToBalances: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  balances,
  rosterRows,
  year,
  month,
  monthName,
  onSelectEmployee,
  onNavigateToRoster,
  onNavigateToBalances,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  // Let user pick a day to preview duty status
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const effectiveDay = Math.min(selectedDay, daysInMonth);

  // Totals & Aggregations
  const totalEmployees = balances.length;

  const totalPlCarriedOver = balances.reduce((sum, b) => sum + b.plCarriedOver, 0);
  const totalPlAccumulated = balances.reduce((sum, b) => sum + b.plAccumulated, 0);
  const totalPlConsumed = balances.reduce((sum, b) => sum + b.plConsumed, 0);
  const totalPlBalance = balances.reduce((sum, b) => sum + b.plBalance, 0);

  const totalSlAccumulated = balances.reduce((sum, b) => sum + b.totalSlAccumulated, 0);
  const totalSlConsumed = balances.reduce((sum, b) => sum + b.slConsumed, 0);
  const totalSlBalance = balances.reduce((sum, b) => sum + b.slBalance, 0);

  const totalClAccumulated = balances.reduce((sum, b) => sum + b.totalClAccumulated, 0);
  const totalClConsumed = balances.reduce((sum, b) => sum + b.clConsumed, 0);
  const totalClBalance = balances.reduce((sum, b) => sum + b.clBalance, 0);

  const totalCoEligible = balances.reduce((sum, b) => sum + b.compOffEligible, 0);
  const totalCoConsumed = balances.reduce((sum, b) => sum + b.compOffConsumed, 0);
  const totalCoExpired = balances.reduce((sum, b) => sum + b.coExpired, 0);
  const totalCoBalance = balances.reduce((sum, b) => sum + b.compOffBalance, 0);

  const totalAllLeavesTaken = balances.reduce((sum, b) => sum + b.totalLeaveTaken, 0);

  // Status for effectiveDay
  const dayRosterEntries = rosterRows.map((row) => ({
    empId: row.empId,
    name: row.name,
    status: row.days[effectiveDay] || row.defaultShift,
    defaultShift: row.defaultShift,
  }));

  const workingOnSelectedDay = dayRosterEntries.filter(
    (e) => !['W', 'PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(e.status)
  );

  const onLeaveSelectedDay = dayRosterEntries.filter((e) =>
    ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML'].includes(e.status)
  );

  const weekOffSelectedDay = dayRosterEntries.filter((e) => e.status === 'W');

  // Negative comp-off employees (e.g., Prathik H with -5, Almueen with -3)
  const negativeCompOffEmployees = balances.filter((b) => b.compOffBalance < 0);

  // Highest leave consumers
  const highLeaveConsumers = [...balances]
    .sort((a, b) => b.totalLeaveTaken - a.totalLeaveTaken)
    .slice(0, 5);

  // Count distribution of shifts on selected day
  const shiftDistribution: Record<string, number> = {
    '23': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '12': 0,
  };
  workingOnSelectedDay.forEach((e) => {
    if (shiftDistribution[e.status] !== undefined) {
      shiftDistribution[e.status]++;
    }
  });

  const selectedDayName = getDayOfWeekName(year, month, effectiveDay);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kaseya NOC Dedicated Team — Shift &amp; Leave Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resource shift scheduling, real-time duty roster, and comprehensive {year} leave ledger for Kaseya NOC account
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-sm shadow-sm">
            <span className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Selected Day:
            </span>
            <select
              value={effectiveDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              aria-label="Select day of month for duty roster"
              className="px-2.5 py-1 text-sm font-semibold text-indigo-700 bg-slate-50 rounded border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer tabular-nums"
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {monthName} {d}, {year} ({getDayOfWeekName(year, month, d)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateToRoster}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
          >
            <span>View Full Roster</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Team</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900 tabular-nums">
            {totalEmployees}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Dedicated support resources
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">On Duty ({selectedDayName})</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-700 tabular-nums">
            {workingOnSelectedDay.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {((workingOnSelectedDay.length / totalEmployees) * 100).toFixed(0)}% staffing capacity
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">On Leave / Off</span>
            <Plane className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-700 tabular-nums">
            {onLeaveSelectedDay.length + weekOffSelectedDay.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {onLeaveSelectedDay.length} on leave · {weekOffSelectedDay.length} scheduled off
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">{year} Total Leaves</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-indigo-900 tabular-nums">
            {totalAllLeavesTaken}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Avg {(totalAllLeavesTaken / totalEmployees).toFixed(1)} days per employee
          </div>
        </div>
      </div>

      {/* 2026 Leave Quota Breakdown Table/Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {year} Company Leave Quotas &amp; Balance Utilization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative leave pool accounting across all 27 dedicated account team members
            </p>
          </div>
          <button
            onClick={onNavigateToBalances}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Open Leave Balances Table</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          {/* PL Quota */}
          <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded">PL</span>
              <span className="text-xs font-medium text-slate-500">Privilege Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalPlBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-red-100/60 font-mono">
              <div className="flex justify-between">
                <span>Carried Over:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalPlCarriedOver}</span>
              </div>
              <div className="flex justify-between">
                <span>Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalPlAccumulated}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Consumed:</span>
                <span className="font-semibold tabular-nums">{totalPlConsumed}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalPlConsumed / (totalPlCarriedOver + totalPlAccumulated)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalPlConsumed / (totalPlCarriedOver + totalPlAccumulated)) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* SL Quota */}
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-amber-950 rounded">SL</span>
              <span className="text-xs font-medium text-slate-500">Sick Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalSlBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-amber-100/60 font-mono">
              <div className="flex justify-between">
                <span>Total Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalSlAccumulated}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Consumed:</span>
                <span className="font-semibold tabular-nums">{totalSlConsumed}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalSlConsumed / totalSlAccumulated) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalSlConsumed / totalSlAccumulated) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* CL Quota */}
          <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-sky-500 text-white rounded">CL</span>
              <span className="text-xs font-medium text-slate-500">Casual Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalClBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-sky-100/60 font-mono">
              <div className="flex justify-between">
                <span>Total Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalClAccumulated}</span>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>Consumed:</span>
                <span className="font-semibold tabular-nums">{totalClConsumed}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalClConsumed / totalClAccumulated) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalClConsumed / totalClAccumulated) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* Comp Off Quota */}
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded">CO</span>
              <span className="text-xs font-medium text-slate-500">Comp Off</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalCoBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-emerald-100/60 font-mono">
              <div className="flex justify-between">
                <span>Eligible Earned:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalCoEligible}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Consumed:</span>
                <span className="font-semibold tabular-nums">{totalCoConsumed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Expired:</span>
                <span className="tabular-nums">{totalCoExpired}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalCoConsumed / (totalCoEligible || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalCoConsumed / (totalCoEligible || 1)) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Shift Distribution on Day vs Attention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Shift Coverage for Selected Day */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Shift Roster on {monthName} {selectedDay}, {year}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headcount breakdown by active IST operational window
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded tabular-nums">
              {workingOnSelectedDay.length} Active Staff
            </span>
          </div>

          {/* Shift Timing Rows */}
          <div className="mt-4 space-y-3">
            {SHIFT_DEFINITIONS.map((s) => {
              const count = shiftDistribution[s.code] || 0;
              const assignedMembers = workingOnSelectedDay.filter((e) => e.status === s.code);
              return (
                <div
                  key={s.code}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded border ${s.badgeBg} ${s.badgeText}`}>
                        Shift {s.code}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {s.istTiming}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {count}
                      </span>
                      <span className="text-xs text-slate-400">resources</span>
                    </div>
                  </div>

                  {count > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                      {assignedMembers.map((m) => (
                        <button
                          key={m.empId}
                          onClick={() => onSelectEmployee(m.empId)}
                          className="px-2 py-0.5 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 rounded hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                          {m.name} ({m.empId})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leaves/Offs on that day */}
          {(onLeaveSelectedDay.length > 0 || weekOffSelectedDay.length > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Leaves &amp; Week Offs ({onLeaveSelectedDay.length + weekOffSelectedDay.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {onLeaveSelectedDay.map((e) => (
                  <button
                    key={e.empId}
                    onClick={() => onSelectEmployee(e.empId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    <span className="font-bold">{e.status}</span>
                    <span>{e.name}</span>
                  </button>
                ))}
                {weekOffSelectedDay.slice(0, 8).map((e) => (
                  <span
                    key={e.empId}
                    className="px-2 py-0.5 text-[11px] rounded bg-blue-50 border border-blue-200 text-blue-800"
                  >
                    W · {e.name}
                  </span>
                ))}
                {weekOffSelectedDay.length > 8 && (
                  <span className="px-2 py-0.5 text-[11px] text-slate-500 self-center">
                    +{weekOffSelectedDay.length - 8} more off
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Attention Alerts & High Leave Consumers */}
        <div className="space-y-6">
          {/* Negative Comp-Off Alert Card */}
          <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Deficit &amp; Negative Comp-Off Balance Alert
                  </h3>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tabular-nums">
                    {negativeCompOffEmployees.length} Resources Affected
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Employees who have consumed more comp-off days than eligible. Requires manager reconciliation or overtime grant:
                </p>

                <div className="mt-3 divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                  {negativeCompOffEmployees.map((emp) => (
                    <div
                      key={emp.empId}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white transition-colors cursor-pointer"
                      onClick={() => onSelectEmployee(emp.empId)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{emp.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">#{emp.empId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 font-mono">
                          Eligible: {emp.compOffEligible} · Used: {emp.compOffConsumed}
                        </span>
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono tabular-nums">
                          {emp.compOffBalance} Balance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Highest Leave Consumers */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Top {year} Leave Consumers
              </h3>
              <span className="text-xs text-slate-500">Cumulative Days</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {highLeaveConsumers.map((emp, idx) => (
                <div
                  key={emp.empId}
                  onClick={() => onSelectEmployee(emp.empId)}
                  className="flex items-center justify-between py-2.5 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-slate-400 tabular-nums">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Joined {emp.joiningDate} · ID {emp.empId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {emp.totalLeaveTaken} days
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PL: {emp.plConsumed} · SL: {emp.slConsumed} · CO: {emp.compOffConsumed}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
