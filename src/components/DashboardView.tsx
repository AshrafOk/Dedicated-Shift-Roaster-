import React, { useState, useMemo } from 'react';
import {
  EmployeeLeaveBalance,
  EmployeeRosterRow,
  ShiftCode,
} from '../types/roster';
import { DatabaseState } from '../data/database';
import { SHIFT_DEFINITIONS, LEAVE_DEFINITIONS } from '../data/initialData';
import { getDayOfWeekName, getDaysInMonth } from '../utils/rosterUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
} from 'recharts';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Plane,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CalendarDays,
  Sparkles,
  Coffee,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Printer,
  Maximize2,
  FileText,
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
  db?: DatabaseState;
  onMonthChange?: (month: number) => void;
}

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  balances,
  rosterRows,
  year,
  month,
  monthName,
  onSelectEmployee,
  onNavigateToRoster,
  onNavigateToBalances,
  db,
  onMonthChange,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const effectiveDay = Math.min(selectedDay, daysInMonth);

  // Modal State for viewing employees on duty, on leave, or week off
  const [staffingModalTab, setStaffingModalTab] = useState<'duty' | 'leave' | 'week_off' | 'all' | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // Interactive In-Dashboard Staffing Inspector State (Duty, Leave, Week Off, All)
  const [activeStaffingTab, setActiveStaffingTab] = useState<'duty' | 'leave' | 'week_off' | 'all'>('duty');
  const [inDashboardSearchTerm, setInDashboardSearchTerm] = useState('');
  const [inDashboardShiftFilter, setInDashboardShiftFilter] = useState<string>('all');
  const [inDashboardLeaveFilter, setInDashboardLeaveFilter] = useState<string>('all');

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

  // Status for effectiveDay with individual employee balance records
  const dayRosterEntries = useMemo(() => {
    return rosterRows.map((row) => {
      const status = row.days[effectiveDay] || row.defaultShift;
      const balance = balances.find((b) => b.empId === row.empId);
      return {
        empId: row.empId,
        name: row.name,
        status,
        defaultShift: row.defaultShift,
        balance,
      };
    });
  }, [rosterRows, effectiveDay, balances]);

  const workingOnSelectedDay = useMemo(() => {
    return dayRosterEntries.filter(
      (e) => !['W', 'PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD', ''].includes(e.status)
    );
  }, [dayRosterEntries]);

  const onLeaveSelectedDay = useMemo(() => {
    return dayRosterEntries.filter((e) =>
      ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(e.status)
    );
  }, [dayRosterEntries]);

  const weekOffSelectedDay = useMemo(() => {
    return dayRosterEntries.filter((e) => e.status === 'W');
  }, [dayRosterEntries]);

  // In-dashboard filtered list for effectiveDay
  const inDashboardFilteredList = useMemo(() => {
    let list = dayRosterEntries;
    if (activeStaffingTab === 'duty') {
      list = workingOnSelectedDay;
      if (inDashboardShiftFilter !== 'all') {
        list = list.filter((e) => e.status === inDashboardShiftFilter);
      }
    } else if (activeStaffingTab === 'leave') {
      list = onLeaveSelectedDay;
      if (inDashboardLeaveFilter !== 'all') {
        list = list.filter((e) => e.status === inDashboardLeaveFilter);
      }
    } else if (activeStaffingTab === 'week_off') {
      list = weekOffSelectedDay;
    }

    if (inDashboardSearchTerm.trim()) {
      const term = inDashboardSearchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.empId.toLowerCase().includes(term) ||
          e.status.toLowerCase().includes(term) ||
          (e.balance?.department && e.balance.department.toLowerCase().includes(term))
      );
    }
    return list;
  }, [
    dayRosterEntries,
    activeStaffingTab,
    workingOnSelectedDay,
    onLeaveSelectedDay,
    weekOffSelectedDay,
    inDashboardShiftFilter,
    inDashboardLeaveFilter,
    inDashboardSearchTerm,
  ]);

  // Negative comp-off employees
  const negativeCompOffEmployees = balances.filter((b) => b.compOffBalance < 0);

  // Highest leave consumers
  const highLeaveConsumers = [...balances]
    .sort((a, b) => b.totalLeaveTaken - a.totalLeaveTaken)
    .slice(0, 5);

  // Count distribution of shifts on effectiveDay
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

  // --- Calculate 12-Month Attendance & Leave Trends for 2026 ---
  const monthlyTrendsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const daysCount = getDaysInMonth(year, m);
      let worked = 0;
      let leaves = 0;
      let weekOffs = 0;

      if (db?.dailySchedules) {
        // Compute from master database
        balances.forEach((emp) => {
          const sched = db.dailySchedules[emp.empId] || {};
          for (let d = 1; d <= daysCount; d++) {
            const dateKey = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const val = sched[dateKey];
            if (['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML'].includes(val)) {
              leaves++;
            } else if (val === 'W') {
              weekOffs++;
            } else if (val && val !== 'LWD') {
              worked++;
            }
          }
        });
      } else {
        // Fallback calculation
        worked = m === month ? workingOnSelectedDay.length * 22 : 450;
        leaves = m === month ? onLeaveSelectedDay.length * 5 : 24;
        weekOffs = m === month ? weekOffSelectedDay.length * 8 : 120;
      }

      const totalDuty = worked + leaves;
      const attendanceRate = totalDuty > 0 ? Number(((worked / totalDuty) * 100).toFixed(1)) : 100;

      return {
        monthIndex: m,
        monthName: MONTH_NAMES_SHORT[i],
        fullName: `${MONTH_NAMES_SHORT[i]} ${year}`,
        workedDays: worked,
        leaveDays: leaves,
        weekOffs,
        attendanceRate,
        isCurrent: m === month,
      };
    });
  }, [db, balances, year, month, workingOnSelectedDay.length, onLeaveSelectedDay.length, weekOffSelectedDay.length]);

  // Aggregate annual worked vs leaves vs week offs
  const totalAnnualWorked = monthlyTrendsData.reduce((acc, curr) => acc + curr.workedDays, 0);
  const totalAnnualLeaves = monthlyTrendsData.reduce((acc, curr) => acc + curr.leaveDays, 0);
  const totalAnnualWeekOffs = monthlyTrendsData.reduce((acc, curr) => acc + curr.weekOffs, 0);
  const avgAttendanceRate =
    totalAnnualWorked + totalAnnualLeaves > 0
      ? ((totalAnnualWorked / (totalAnnualWorked + totalAnnualLeaves)) * 100).toFixed(1)
      : '95.0';

  return (
    <div className="relative space-y-8 pb-12">
      {/* Decorative Light Blur & Royal Blue Ambient Background Layers */}
      <div className="absolute -top-12 right-1/4 w-[32rem] h-[32rem] bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -left-12 w-[28rem] h-[28rem] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[24rem] h-[24rem] bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Executive Header with Royal Blue Glass Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/60 backdrop-blur-md">
        {/* Subtle decorative royal blue glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-800/80 text-blue-200 border border-blue-700/60 backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Kaseya NOC Dedicated Team
              </span>
              <span className="text-xs text-blue-300 font-mono">
                {monthName} {year} Overview
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Shift Attendance &amp; Leave Dashboard
            </h1>
            <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
              Consolidated 2026 operations cockpit monitoring roster coverage across {totalEmployees} engineers, real-time duty allocations, and live quota burn rates.
            </p>
          </div>

          {/* Quick Date Selector Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/10 border border-white/20 rounded-xl p-1.5 backdrop-blur-md shadow-inner text-sm">
              <span className="px-2.5 py-1 text-xs font-bold text-blue-200 uppercase tracking-wider">
                Inspect Day:
              </span>
              <select
                value={effectiveDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                aria-label="Select day of month for duty roster"
                className="px-2.5 py-1 text-xs font-bold text-white bg-blue-900/90 rounded-lg border border-blue-700/60 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer tabular-nums"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {monthName} {d}, {year} ({getDayOfWeekName(year, month, d)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-blue-800/90 hover:bg-blue-800 border border-blue-700/80 rounded-xl transition-all shadow-sm active:scale-98 whitespace-nowrap"
              title="Generate and print PDF executive roster report for the current month"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Export PDF Report</span>
            </button>

            <button
              onClick={onNavigateToRoster}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-blue-950 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-md active:scale-98 whitespace-nowrap"
            >
              <span>Open Shift Grid</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip: Separated On Duty, On Leave, Week Off (Clickable to switch employee lists) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Total Team */}
        <div
          onClick={() => {
            setActiveStaffingTab('all');
            setInDashboardSearchTerm('');
            document.getElementById('daily-staffing-inspector')?.scrollIntoView({ behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          className={`group p-4.5 bg-white/85 backdrop-blur-md rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
            activeStaffingTab === 'all'
              ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/40 shadow-md'
              : 'border border-blue-100/90 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Click to view all team members and their assignments"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Team</span>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalEmployees}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Kaseya NOC Dedicated resources
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 group-hover:text-blue-800">
            <span>{activeStaffingTab === 'all' ? '● Showing in List' : `View All (${totalEmployees})`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card 2: On Duty */}
        <div
          onClick={() => {
            setActiveStaffingTab('duty');
            setInDashboardShiftFilter('all');
            setInDashboardSearchTerm('');
            document.getElementById('daily-staffing-inspector')?.scrollIntoView({ behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          className={`group p-4.5 bg-white/85 backdrop-blur-md rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
            activeStaffingTab === 'duty'
              ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/40 shadow-md'
              : 'border border-emerald-100/90 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-emerald-500/10'
          }`}
          title={`Click to view the ${workingOnSelectedDay.length} engineers on duty on Day ${effectiveDay}`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">On Duty ({selectedDayName})</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-700 tabular-nums">
              {workingOnSelectedDay.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {((workingOnSelectedDay.length / totalEmployees) * 100).toFixed(0)}% staffing capacity on Day {effectiveDay}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-100/70 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
            <span>{activeStaffingTab === 'duty' ? '● Showing in List' : `View On-Duty (${workingOnSelectedDay.length})`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card 3: On Leave (SEPARATE) */}
        <div
          onClick={() => {
            setActiveStaffingTab('leave');
            setInDashboardLeaveFilter('all');
            setInDashboardSearchTerm('');
            document.getElementById('daily-staffing-inspector')?.scrollIntoView({ behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          className={`group p-4.5 bg-white/85 backdrop-blur-md rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
            activeStaffingTab === 'leave'
              ? 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/40 shadow-md'
              : 'border border-rose-100/90 hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-rose-500/10'
          }`}
          title={`Click to view who is on leave on Day ${effectiveDay}`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">On Leave ({selectedDayName})</span>
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-200 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-rose-700 tabular-nums">
              {onLeaveSelectedDay.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {onLeaveSelectedDay.length === 0
                ? 'Full attendance, 0 leaves'
                : `${onLeaveSelectedDay.length} on approved leave`}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100/70 flex items-center justify-between text-[11px] font-bold text-rose-700 group-hover:text-rose-800">
            <span>{activeStaffingTab === 'leave' ? '● Showing in List' : `View On Leave (${onLeaveSelectedDay.length})`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card 4: Week Off (SEPARATE) */}
        <div
          onClick={() => {
            setActiveStaffingTab('week_off');
            setInDashboardSearchTerm('');
            document.getElementById('daily-staffing-inspector')?.scrollIntoView({ behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          className={`group p-4.5 bg-white/85 backdrop-blur-md rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
            activeStaffingTab === 'week_off'
              ? 'ring-2 ring-sky-500 border-sky-300 bg-sky-50/40 shadow-md'
              : 'border border-sky-100/90 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-sky-500/10'
          }`}
          title={`Click to view who has week off on Day ${effectiveDay}`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Week Off ({selectedDayName})</span>
              <div className="p-2 bg-sky-50 rounded-xl text-sky-600 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Coffee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-sky-800 tabular-nums">
              {weekOffSelectedDay.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {weekOffSelectedDay.length} scheduled rest day
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-sky-100/70 flex items-center justify-between text-[11px] font-bold text-sky-700 group-hover:text-sky-800">
            <span>{activeStaffingTab === 'week_off' ? '● Showing in List' : `View Week Off (${weekOffSelectedDay.length})`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card 5: 2026 Total Leaves */}
        <div
          onClick={onNavigateToBalances}
          role="button"
          tabIndex={0}
          className="group p-4.5 bg-white/85 backdrop-blur-md border border-blue-100/90 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between col-span-2 md:col-span-1"
          title="Click to open the 2026 Leave Balances Table"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{year} Total Leaves</span>
              <div className="p-2 bg-blue-100/80 rounded-xl text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-blue-950 tabular-nums">
              {totalAllLeavesTaken}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Avg {(totalAllLeavesTaken / totalEmployees).toFixed(1)} days per engineer
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 group-hover:text-blue-800">
            <span>Open Leave Balances</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* --- INTERACTIVE IN-DASHBOARD EMPLOYEE LIST (ON DUTY / ON LEAVE / WEEK OFF) --- */}
      <div
        id="daily-staffing-inspector"
        className="bg-white/90 backdrop-blur-md border border-blue-100/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:border-blue-200 transition-all"
      >
        {/* Header with Title, Segmented Tabs, Day Quick Switcher, and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-100/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl text-white shadow-xs ${
                  activeStaffingTab === 'duty'
                    ? 'bg-emerald-600'
                    : activeStaffingTab === 'leave'
                    ? 'bg-rose-600'
                    : activeStaffingTab === 'week_off'
                    ? 'bg-sky-600'
                    : 'bg-blue-600'
                }`}
              >
                {activeStaffingTab === 'duty' && <CalendarCheck className="w-5 h-5" />}
                {activeStaffingTab === 'leave' && <Plane className="w-5 h-5" />}
                {activeStaffingTab === 'week_off' && <Coffee className="w-5 h-5" />}
                {activeStaffingTab === 'all' && <Users className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  <span>
                    {activeStaffingTab === 'duty' && `On-Duty Engineers (${workingOnSelectedDay.length})`}
                    {activeStaffingTab === 'leave' && `Engineers On Approved Leave (${onLeaveSelectedDay.length})`}
                    {activeStaffingTab === 'week_off' && `Scheduled Week Off Rest Days (${weekOffSelectedDay.length})`}
                    {activeStaffingTab === 'all' && `All Dedicated Team Resources (${totalEmployees})`}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    Day {effectiveDay} ({selectedDayName}) · {monthName} {year}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time employee breakdown for the selected day. Click on On Duty, On Leave, or Week Off tabs to switch.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Filter Pills */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveStaffingTab('duty');
                  setInDashboardShiftFilter('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeStaffingTab === 'duty'
                    ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>On Duty ({workingOnSelectedDay.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveStaffingTab('leave');
                  setInDashboardLeaveFilter('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeStaffingTab === 'leave'
                    ? 'bg-white text-rose-800 shadow-xs border border-rose-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>On Leave ({onLeaveSelectedDay.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveStaffingTab('week_off');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeStaffingTab === 'week_off'
                    ? 'bg-white text-sky-800 shadow-xs border border-sky-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Week Off ({weekOffSelectedDay.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveStaffingTab('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeStaffingTab === 'all'
                    ? 'bg-white text-blue-900 shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>All ({totalEmployees})</span>
              </button>
            </div>

            {/* Quick Pop-out Modal Button */}
            <button
              onClick={() => {
                setStaffingModalTab(activeStaffingTab);
                setModalSearchTerm(inDashboardSearchTerm);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
              title="Open full-screen modal inspector"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Modal</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (Shifts for Duty, Leave Codes for Leave) & Live Search */}
        <div className="pt-4 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Filter:
            </span>

            {activeStaffingTab === 'duty' && (
              <>
                <button
                  onClick={() => setInDashboardShiftFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    inDashboardShiftFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  All Shifts ({workingOnSelectedDay.length})
                </button>
                {SHIFT_DEFINITIONS.filter((s) => (shiftDistribution[s.code] || 0) > 0).map((s) => (
                  <button
                    key={s.code}
                    onClick={() => setInDashboardShiftFilter(s.code)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      inDashboardShiftFilter === s.code
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : `${s.badgeBg} ${s.badgeText} border hover:opacity-80`
                    }`}
                  >
                    <span>Shift {s.code}</span>
                    <span className="font-mono text-[10px] opacity-80">({shiftDistribution[s.code]})</span>
                  </button>
                ))}
              </>
            )}

            {activeStaffingTab === 'leave' && (
              <>
                <button
                  onClick={() => setInDashboardLeaveFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    inDashboardLeaveFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  All Leaves ({onLeaveSelectedDay.length})
                </button>
                {['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML'].map((code) => {
                  const cnt = onLeaveSelectedDay.filter((e) => e.status === code).length;
                  if (cnt === 0) return null;
                  return (
                    <button
                      key={code}
                      onClick={() => setInDashboardLeaveFilter(code)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        inDashboardLeaveFilter === code
                          ? 'bg-rose-700 text-white shadow-2xs'
                          : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <span>{code}</span>
                      <span className="font-mono text-[10px]">({cnt})</span>
                    </button>
                  );
                })}
              </>
            )}

            {activeStaffingTab === 'week_off' && (
              <span className="text-xs text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                Displaying all {weekOffSelectedDay.length} team members on scheduled rest day (W)
              </span>
            )}

            {activeStaffingTab === 'all' && (
              <span className="text-xs text-slate-600 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                Displaying complete team roster of {totalEmployees} engineers
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by engineer, ID, shift..."
              value={inDashboardSearchTerm}
              onChange={(e) => setInDashboardSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {inDashboardSearchTerm && (
              <button
                onClick={() => setInDashboardSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Employee List Grid */}
        <div className="mt-4">
          {inDashboardFilteredList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="font-semibold text-sm text-slate-600">No engineers match this filter on Day {effectiveDay}</p>
              <p className="text-xs text-slate-400 mt-1">
                Try switching between On Duty, On Leave, and Week Off tabs or clearing your search term
              </p>
              <button
                onClick={() => {
                  setInDashboardSearchTerm('');
                  setInDashboardShiftFilter('all');
                  setInDashboardLeaveFilter('all');
                }}
                className="mt-3 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
              {inDashboardFilteredList.map((emp) => {
                const isDuty = !['W', 'PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(emp.status);
                const isLeave = ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(emp.status);
                const isWeekOff = emp.status === 'W';
                const shiftDef = SHIFT_DEFINITIONS.find((s) => s.code === (isDuty ? emp.status : emp.defaultShift));
                const leaveDef = LEAVE_DEFINITIONS.find((l) => l.code === emp.status);

                return (
                  <div
                    key={emp.empId}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Avatar, Name, ID */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ${
                              isDuty
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isLeave
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isWeekOff
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                              {emp.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 font-semibold">
                              #{emp.empId}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isDuty && (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${shiftDef?.badgeBg} ${shiftDef?.badgeText}`}>
                            Shift {emp.status}
                          </span>
                        )}
                        {isLeave && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 border border-rose-200 text-rose-900 shrink-0">
                            {emp.status} · Leave
                          </span>
                        )}
                        {isWeekOff && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 border border-sky-200 text-sky-900 shrink-0">
                            Week Off (W)
                          </span>
                        )}
                      </div>

                      {/* Middle Details */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] space-y-1">
                        {isDuty && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Working Hours:</span>
                            <span className="font-mono font-bold text-emerald-800">{shiftDef?.istTiming}</span>
                          </div>
                        )}
                        {isLeave && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">{leaveDef?.name || 'Leave Type'}:</span>
                            <span className="font-mono font-bold text-rose-800">
                              {emp.status === 'PL' && `${emp.balance?.plBalance.toFixed(1)} PL Balance`}
                              {emp.status === 'SL' && `${emp.balance?.slBalance.toFixed(1)} SL Balance`}
                              {emp.status === 'CL' && `${emp.balance?.clBalance.toFixed(1)} CL Balance`}
                              {emp.status === 'CO' && `${emp.balance?.compOffBalance.toFixed(1)} CO Balance`}
                              {!['PL', 'SL', 'CL', 'CO'].includes(emp.status) && `${emp.balance?.totalLeaveTaken} days in 2026`}
                            </span>
                          </div>
                        )}
                        {isWeekOff && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Scheduled Rest:</span>
                            <span className="font-mono font-semibold text-sky-900">
                              Default: Shift {emp.defaultShift} ({shiftDef?.istTiming.split('–')[0].trim()})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Department:</span>
                          <span className="font-medium text-slate-700">{emp.balance?.department || 'Dedicated Support'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Joined {emp.balance?.joiningDate || '2023'}
                      </span>
                      <button
                        onClick={() => onSelectEmployee(emp.empId)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/80 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- RECHARTS 2026 TEAM ATTENDANCE TRENDS LINE CHART (WORKED VS LEAVE VS WEEK OFF) --- */}
      <div className="bg-white/85 backdrop-blur-md border border-blue-100/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-100/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                2026 Monthly Team Attendance Trends
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualizing worked duty days vs recorded leave days vs scheduled week offs across all 12 months for the Kaseya NOC team
            </p>
          </div>

          {/* Quick Stats Pill Strip: Worked Duty, Leaves Taken, Scheduled Week Offs, Avg Attendance */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Worked Duty: <strong className="tabular-nums">{totalAnnualWorked.toLocaleString()}</strong> days</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span>Leaves Taken: <strong className="tabular-nums">{totalAnnualLeaves.toLocaleString()}</strong> days</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-sky-50/80 border border-sky-200 text-sky-900 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span>Week Offs: <strong className="tabular-nums">{totalAnnualWeekOffs.toLocaleString()}</strong> days</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Avg Attendance: <strong className="tabular-nums">{avgAttendanceRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* Month Quick Jump Selector */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto border-b border-blue-50 mb-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Jump to Month:
          </span>
          {monthlyTrendsData.map((m) => (
            <button
              key={m.monthIndex}
              onClick={() => onMonthChange && onMonthChange(m.monthIndex)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                m.isCurrent
                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                  : 'bg-blue-50/70 hover:bg-blue-100 text-blue-900 border border-blue-100'
              }`}
            >
              {m.monthName}
            </button>
          ))}
        </div>

        {/* The Recharts Line Chart Container */}
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrendsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="workedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#bfdbfe" opacity={0.4} />

              <XAxis
                dataKey="monthName"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#93c5fd', opacity: 0.3 }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#93c5fd', opacity: 0.3 }}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-blue-500/30 text-xs space-y-1.5 font-sans min-w-[210px]">
                        <div className="font-bold text-sm text-blue-200 border-b border-slate-700 pb-1 flex items-center justify-between">
                          <span>{data.fullName}</span>
                          <span className="text-[11px] text-emerald-400 font-mono">
                            {data.attendanceRate}% Attendance
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-blue-300 font-mono">
                          <span>Worked Duty Days:</span>
                          <span className="font-bold tabular-nums text-white">{data.workedDays}</span>
                        </div>
                        <div className="flex items-center justify-between text-rose-300 font-mono">
                          <span>Approved Leaves:</span>
                          <span className="font-bold tabular-nums text-white">{data.leaveDays}</span>
                        </div>
                        <div className="flex items-center justify-between text-sky-300 font-mono pt-1 border-t border-slate-800">
                          <span>Scheduled Week Offs:</span>
                          <span className="font-bold tabular-nums text-white">{data.weekOffs}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />

              {/* Line 1: Worked Days */}
              <Line
                type="monotone"
                dataKey="workedDays"
                name="Worked Days (Duty)"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 3, fill: '#ffffff' }}
              />

              {/* Line 2: Leave Days (Separate!) */}
              <Line
                type="monotone"
                dataKey="leaveDays"
                name="Approved Leaves"
                stroke="#e11d48"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#e11d48', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#be123c', strokeWidth: 3, fill: '#ffffff' }}
              />

              {/* Line 3: Scheduled Week Offs (Separate!) */}
              <Line
                type="monotone"
                dataKey="weekOffs"
                name="Scheduled Week Offs"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, stroke: '#0284c7', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#0369a1', strokeWidth: 3, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2026 Leave Quota Breakdown Cards (Frosted Glass with Royal Blue Accents) */}
      <div className="bg-white/85 backdrop-blur-md border border-blue-100/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {year} Company Leave Quotas &amp; Balance Utilization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative leave pool accounting across all {totalEmployees} dedicated account team members
            </p>
          </div>
          <button
            onClick={onNavigateToBalances}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors"
          >
            <span>Open Leave Balances Table</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {/* PL Quota */}
          <div className="p-4.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/90 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-md shadow-2xs">PL</span>
              <span className="text-xs font-semibold text-slate-500">Privilege Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalPlBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-blue-50 font-mono">
              <div className="flex justify-between">
                <span>Carried Over:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalPlCarriedOver}</span>
              </div>
              <div className="flex justify-between">
                <span>Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalPlAccumulated}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Consumed:</span>
                <span className="font-bold tabular-nums">{totalPlConsumed}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalPlConsumed / (totalPlCarriedOver + totalPlAccumulated || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalPlConsumed / (totalPlCarriedOver + totalPlAccumulated || 1)) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* SL Quota */}
          <div className="p-4.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/90 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-amber-950 rounded-md shadow-2xs">SL</span>
              <span className="text-xs font-semibold text-slate-500">Sick Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalSlBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-blue-50 font-mono">
              <div className="flex justify-between">
                <span>Total Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalSlAccumulated}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Consumed:</span>
                <span className="font-bold tabular-nums">{totalSlConsumed}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalSlConsumed / (totalSlAccumulated || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalSlConsumed / (totalSlAccumulated || 1)) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* CL Quota */}
          <div className="p-4.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/90 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-sky-500 text-white rounded-md shadow-2xs">CL</span>
              <span className="text-xs font-semibold text-slate-500">Casual Leave</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalClBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-blue-50 font-mono">
              <div className="flex justify-between">
                <span>Total Accumulated:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalClAccumulated}</span>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>Consumed:</span>
                <span className="font-bold tabular-nums">{totalClConsumed}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalClConsumed / (totalClAccumulated || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 text-right">
                {((totalClConsumed / (totalClAccumulated || 1)) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* Comp Off Quota */}
          <div className="p-4.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/90 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-md shadow-2xs">CO</span>
              <span className="text-xs font-semibold text-slate-500">Comp Off</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalCoBalance.toFixed(1)}
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Available</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1 pt-2 border-t border-blue-50 font-mono">
              <div className="flex justify-between">
                <span>Eligible Earned:</span>
                <span className="font-semibold text-slate-800 tabular-nums">{totalCoEligible}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Consumed:</span>
                <span className="font-bold tabular-nums">{totalCoConsumed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Expired:</span>
                <span className="tabular-nums">{totalCoExpired}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
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

      {/* Two-Column Layout: Shift Coverage on Selected Day vs Deficit Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Shift Coverage for Selected Day */}
        <div className="bg-white/85 backdrop-blur-md border border-blue-100/90 rounded-3xl p-6 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-blue-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Shift Roster on {monthName} {effectiveDay}, {year}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headcount distribution across active IST operational windows
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 tabular-nums">
              {workingOnSelectedDay.length} Active On Duty
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
                  className="p-3.5 rounded-xl border border-blue-100/80 bg-white/80 hover:bg-blue-50/40 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${s.badgeBg} ${s.badgeText}`}>
                        Shift {s.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {s.istTiming}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {count}
                      </span>
                      <span className="text-xs text-slate-400">engineers</span>
                    </div>
                  </div>

                  {count > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {assignedMembers.map((m) => (
                        <button
                          key={m.empId}
                          onClick={() => onSelectEmployee(m.empId)}
                          className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-md hover:border-blue-400 hover:text-blue-700 transition-colors"
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

          {/* Separate Section 1: Approved Leaves on Selected Day */}
          <div className="mt-5 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                  <Plane className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Approved Leaves on Day {effectiveDay} ({onLeaveSelectedDay.length})
                </span>
              </div>
              <button
                onClick={() => { setStaffingModalTab('leave'); setModalSearchTerm(''); }}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
              >
                <span>View All Leaves ({onLeaveSelectedDay.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {onLeaveSelectedDay.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {onLeaveSelectedDay.map((e) => (
                  <button
                    key={e.empId}
                    onClick={() => onSelectEmployee(e.empId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border bg-rose-50/90 border-rose-200 text-rose-900 hover:bg-rose-100 transition-colors shadow-2xs group"
                    title={`Click to view leave ledger for ${e.name}`}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] uppercase font-mono">
                      {e.status}
                    </span>
                    <span className="group-hover:underline">{e.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>No resources on leave on {monthName} {effectiveDay} (100% scheduled workforce available).</span>
              </div>
            )}
          </div>

          {/* Separate Section 2: Scheduled Week Offs on Selected Day */}
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Scheduled Week Offs on Day {effectiveDay} ({weekOffSelectedDay.length})
                </span>
              </div>
              <button
                onClick={() => { setStaffingModalTab('week_off'); setModalSearchTerm(''); }}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors flex items-center gap-1"
              >
                <span>View All Week Offs ({weekOffSelectedDay.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {weekOffSelectedDay.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {weekOffSelectedDay.slice(0, 10).map((e) => (
                  <button
                    key={e.empId}
                    onClick={() => onSelectEmployee(e.empId)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-sky-50/70 border border-sky-200 text-sky-900 hover:bg-sky-100 transition-colors"
                    title={`Click to view details for ${e.name}`}
                  >
                    W · {e.name}
                  </button>
                ))}
                {weekOffSelectedDay.length > 10 && (
                  <button
                    onClick={() => { setStaffingModalTab('week_off'); setModalSearchTerm(''); }}
                    className="px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:underline self-center"
                  >
                    +{weekOffSelectedDay.length - 10} more week offs
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                No resources scheduled for week off on this date.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deficit Comp-Off Attention & Leaderboard */}
        <div className="space-y-6">
          {/* Negative Comp-Off Alert Card */}
          <div className="bg-white/90 backdrop-blur-md border border-blue-200 rounded-3xl p-6 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 border border-blue-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Deficit &amp; Negative Comp-Off Balance Alert
                  </h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 tabular-nums">
                    {negativeCompOffEmployees.length} Engineers Affected
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Resources who consumed more comp-off days than earned. Requires compensatory reconciliation or overtime hours:
                </p>

                <div className="mt-3.5 divide-y divide-blue-100 border border-blue-100 rounded-xl overflow-hidden bg-blue-50/30">
                  {negativeCompOffEmployees.map((emp) => (
                    <div
                      key={emp.empId}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white transition-colors cursor-pointer"
                      onClick={() => onSelectEmployee(emp.empId)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">#{emp.empId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 font-mono">
                          Eligible: {emp.compOffEligible} · Used: {emp.compOffConsumed}
                        </span>
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-mono tabular-nums">
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
          <div className="bg-white/85 backdrop-blur-md border border-blue-100/90 rounded-3xl p-6 shadow-xs hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between pb-3.5 border-b border-blue-100">
              <h3 className="text-sm font-bold text-slate-900">
                Top {year} Leave Consumers
              </h3>
              <span className="text-xs text-slate-500 font-medium">Cumulative Days Taken</span>
            </div>

            <div className="mt-3.5 divide-y divide-slate-100">
              {highLeaveConsumers.map((emp, idx) => (
                <div
                  key={emp.empId}
                  onClick={() => onSelectEmployee(emp.empId)}
                  className="flex items-center justify-between py-2.5 hover:bg-blue-50/50 px-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-extrabold text-blue-600 tabular-nums">
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
                    <div className="text-sm font-extrabold text-blue-950 font-mono tabular-nums">
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

      {/* Daily Staffing Inspector Modal (Triggered by clicking On Duty, On Leave, Week Off, or Total cards) */}
      {staffingModalTab !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-800/80 rounded-xl border border-blue-700/60 shadow-xs">
                  {staffingModalTab === 'duty' && <CalendarCheck className="w-5 h-5 text-emerald-400" />}
                  {staffingModalTab === 'leave' && <Plane className="w-5 h-5 text-rose-400" />}
                  {staffingModalTab === 'week_off' && <Coffee className="w-5 h-5 text-sky-400" />}
                  {staffingModalTab === 'all' && <Users className="w-5 h-5 text-blue-300" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>
                      {staffingModalTab === 'duty' && 'On-Duty Engineers & Shifts'}
                      {staffingModalTab === 'leave' && 'Engineers on Leave'}
                      {staffingModalTab === 'week_off' && 'Scheduled Week Off (Rest Days)'}
                      {staffingModalTab === 'all' && 'All Team Roster & Attendance'}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-blue-200 mt-0.5">
                    <span className="font-semibold">{monthName} {effectiveDay}, {year} ({selectedDayName})</span>
                    <span>·</span>
                    <span>Kaseya NOC Dedicated Team</span>
                  </div>
                </div>
              </div>

              {/* Day Quick Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
                  <button
                    onClick={() => setSelectedDay(Math.max(1, effectiveDay - 1))}
                    disabled={effectiveDay <= 1}
                    className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Previous day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold tabular-nums">
                    Day {effectiveDay}
                  </span>
                  <button
                    onClick={() => setSelectedDay(Math.min(daysInMonth, effectiveDay + 1))}
                    disabled={effectiveDay >= daysInMonth}
                    className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Next day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setStaffingModalTab(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Segmented Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setStaffingModalTab('duty')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    staffingModalTab === 'duty'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>On Duty ({workingOnSelectedDay.length})</span>
                </button>

                <button
                  onClick={() => setStaffingModalTab('leave')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    staffingModalTab === 'leave'
                      ? 'bg-white text-rose-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>On Leave ({onLeaveSelectedDay.length})</span>
                </button>

                <button
                  onClick={() => setStaffingModalTab('week_off')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    staffingModalTab === 'week_off'
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Week Off ({weekOffSelectedDay.length})</span>
                </button>

                <button
                  onClick={() => setStaffingModalTab('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    staffingModalTab === 'all'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>All ({totalEmployees})</span>
                </button>
              </div>

              {/* Live Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name, ID, shift..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Scrollable Employee List */}
            <div className="p-6 overflow-y-auto max-h-[58vh] divide-y divide-slate-100">
              {(() => {
                let list = dayRosterEntries;
                if (staffingModalTab === 'duty') {
                  list = workingOnSelectedDay;
                } else if (staffingModalTab === 'leave') {
                  list = onLeaveSelectedDay;
                } else if (staffingModalTab === 'week_off') {
                  list = weekOffSelectedDay;
                }

                if (modalSearchTerm.trim()) {
                  const term = modalSearchTerm.toLowerCase();
                  list = list.filter(
                    (e) =>
                      e.name.toLowerCase().includes(term) ||
                      e.empId.toLowerCase().includes(term) ||
                      e.status.toLowerCase().includes(term) ||
                      (e.balance?.department && e.balance.department.toLowerCase().includes(term))
                  );
                }

                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <p className="font-semibold text-sm">No team members match this category on Day {effectiveDay}</p>
                      <p className="text-xs mt-1">Try selecting another tab or clearing search filter</p>
                    </div>
                  );
                }

                return list.map((e) => {
                  const isDuty = !['W', 'PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(e.status);
                  const isLeave = ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(e.status);
                  const isWeekOff = e.status === 'W';
                  const shiftDef = SHIFT_DEFINITIONS.find((s) => s.code === (isDuty ? e.status : e.defaultShift));
                  const leaveDef = LEAVE_DEFINITIONS.find((l) => l.code === e.status);

                  return (
                    <div
                      key={e.empId}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-50/40 px-3 rounded-xl transition-colors"
                    >
                      {/* Employee Avatar & Basic Info */}
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 ${
                            isDuty
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isLeave
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {e.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{e.name}</span>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              #{e.empId}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {e.balance?.department || 'Dedicated Support'} · Joined {e.balance?.joiningDate || '2023'}
                          </div>
                        </div>
                      </div>

                      {/* Status & Timing / Leave Balance Details */}
                      <div className="flex items-center gap-3">
                        {isDuty && (
                          <div className="text-left sm:text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${shiftDef?.badgeBg} ${shiftDef?.badgeText}`}>
                              Shift {e.status}
                            </span>
                            <div className="text-[11px] font-mono font-semibold text-slate-700 mt-0.5">
                              {shiftDef?.istTiming}
                            </div>
                          </div>
                        )}

                        {isLeave && (
                          <div className="text-left sm:text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 border border-rose-200 text-rose-900">
                              <span>{e.status}</span>
                              <span>·</span>
                              <span>{leaveDef?.name || 'Leave'}</span>
                            </span>
                            <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                              {e.status === 'PL' && `${e.balance?.plBalance.toFixed(1)} PL Balance Available`}
                              {e.status === 'SL' && `${e.balance?.slBalance.toFixed(1)} SL Balance Available`}
                              {e.status === 'CL' && `${e.balance?.clBalance.toFixed(1)} CL Balance Available`}
                              {e.status === 'CO' && `${e.balance?.compOffBalance.toFixed(1)} Comp-Off Balance`}
                              {!['PL', 'SL', 'CL', 'CO'].includes(e.status) && `${e.balance?.totalLeaveTaken} total days in 2026`}
                            </div>
                          </div>
                        )}

                        {isWeekOff && (
                          <div className="text-left sm:text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-100 border border-sky-200 text-sky-900">
                              Week Off (W)
                            </span>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              Regular Shift: Shift {e.defaultShift} ({shiftDef?.istTiming.split('–')[0].trim()})
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            onSelectEmployee(e.empId);
                            setStaffingModalTab(null);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 font-mono">
                <span>On Duty: <strong className="text-emerald-700">{workingOnSelectedDay.length}</strong></span>
                <span>On Leave: <strong className="text-rose-700">{onLeaveSelectedDay.length}</strong></span>
                <span>Week Off: <strong className="text-sky-700">{weekOffSelectedDay.length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onNavigateToRoster();
                    setStaffingModalTab(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Shift Grid</span>
                </button>
                <button
                  onClick={() => setStaffingModalTab(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PRINT-ONLY EXECUTIVE ROSTER & ATTENDANCE PDF REPORT --- */}
      <div className="hidden print:block print-only p-8 text-black bg-white">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              KASEYA NOC DEDICATED TEAM
            </h1>
            <h2 className="text-lg font-bold text-slate-700 mt-1">
              Monthly Shift Roster &amp; Attendance Executive Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Period: {monthName} {year} · Operations Cockpit &amp; Leave Statistics
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Report Date: {new Date().toLocaleDateString()}</div>
            <div>Inspected Day: Day {effectiveDay} ({selectedDayName})</div>
            <div>Team Size: {totalEmployees} Dedicated Engineers</div>
          </div>
        </div>

        {/* Executive Summary Metrics Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
            Executive Key Performance Metrics ({monthName} {year})
          </h3>
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="p-2 text-left border-r border-slate-300">Metric</th>
                <th className="p-2 text-center border-r border-slate-300">Count / Value</th>
                <th className="p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Total Workforce</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{totalEmployees}</td>
                <td className="p-2">Full headcount of dedicated Kaseya NOC engineers</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">On Duty (Day {effectiveDay})</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{workingOnSelectedDay.length}</td>
                <td className="p-2">{((workingOnSelectedDay.length / totalEmployees) * 100).toFixed(0)}% scheduled staffing capacity active on duty</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">On Leave (Day {effectiveDay})</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{onLeaveSelectedDay.length}</td>
                <td className="p-2">Engineers on approved PL, SL, CL, or Comp-Off</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Week Off (Day {effectiveDay})</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{weekOffSelectedDay.length}</td>
                <td className="p-2">Scheduled regular rest day (W)</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">2026 Annual Leaves Taken</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{totalAllLeavesTaken}</td>
                <td className="p-2">Cumulative leave consumption across all leave types</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Average Attendance Rate</td>
                <td className="p-2 font-mono text-center font-bold border-r border-slate-300">{avgAttendanceRate}%</td>
                <td className="p-2">Worked duty days vs total scheduled duty ratio</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2026 Leave Quotas Balance Pool */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
            2026 Company Leave Quota Pools
          </h3>
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="p-2 text-left border-r border-slate-300">Leave Type</th>
                <th className="p-2 text-center border-r border-slate-300">Carried Over</th>
                <th className="p-2 text-center border-r border-slate-300">Accumulated</th>
                <th className="p-2 text-center border-r border-slate-300">Consumed</th>
                <th className="p-2 text-center">Net Available Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Privilege Leave (PL)</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalPlCarriedOver}</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalPlAccumulated}</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalPlConsumed}</td>
                <td className="p-2 font-mono text-center font-bold">{totalPlBalance.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Sick Leave (SL)</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">-</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalSlAccumulated}</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalSlConsumed}</td>
                <td className="p-2 font-mono text-center font-bold">{totalSlBalance.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Casual Leave (CL)</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">-</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalClAccumulated}</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalClConsumed}</td>
                <td className="p-2 font-mono text-center font-bold">{totalClBalance.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">Compensatory Off (CO)</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">-</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalCoEligible}</td>
                <td className="p-2 font-mono text-center border-r border-slate-300">{totalCoConsumed}</td>
                <td className="p-2 font-mono text-center font-bold">{totalCoBalance.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Day Attendance Detail Roster */}
        <div className="print-break-inside-avoid">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
            Day {effectiveDay} Attendance Status Detail ({monthName} {year})
          </h3>
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="p-1.5 text-left border-r border-slate-300">#</th>
                <th className="p-1.5 text-left border-r border-slate-300">ID</th>
                <th className="p-1.5 text-left border-r border-slate-300">Engineer Name</th>
                <th className="p-1.5 text-center border-r border-slate-300">Status</th>
                <th className="p-1.5 text-left border-r border-slate-300">Shift / Timing / Leave Type</th>
                <th className="p-1.5 text-left">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dayRosterEntries.map((emp, idx) => {
                const isDuty = !['W', 'PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(emp.status);
                const isLeave = ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML', 'LWD'].includes(emp.status);
                const shiftDef = SHIFT_DEFINITIONS.find((s) => s.code === (isDuty ? emp.status : emp.defaultShift));

                return (
                  <tr key={emp.empId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 text-slate-400 font-mono border-r border-slate-300">{idx + 1}</td>
                    <td className="p-1.5 font-mono font-semibold border-r border-slate-300">{emp.empId}</td>
                    <td className="p-1.5 font-bold border-r border-slate-300">{emp.name}</td>
                    <td className="p-1.5 text-center font-mono font-bold border-r border-slate-300">
                      {isDuty ? `Shift ${emp.status}` : isLeave ? emp.status : 'Week Off (W)'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300">
                      {isDuty ? shiftDef?.istTiming : isLeave ? `Leave (${emp.status})` : `Rest Day (Default: Shift ${emp.defaultShift})`}
                    </td>
                    <td className="p-1.5 text-slate-600">{emp.balance?.department || 'Dedicated Support'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Kaseya NOC Dedicated Team · Confidential Operations Report</span>
          <span>Generated by Roster &amp; Leave System · Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
