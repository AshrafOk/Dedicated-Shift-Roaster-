import React, { useState, useMemo } from 'react';
import {
  CellValue,
  EmployeeRosterRow,
  LeaveCode,
  ShiftCode,
} from '../types/roster';
import {
  SHIFT_DEFINITIONS,
  LEAVE_DEFINITIONS,
} from '../data/initialData';
import {
  getDayOfWeekName,
  getDaysInMonth,
  isWeekend,
  getCellColorStyles,
  exportRosterToCSV,
} from '../utils/rosterUtils';
import {
  Search,
  Download,
  Filter,
  RotateCcw,
  Clock,
  Info,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface RosterGridViewProps {
  year: number;
  month: number;
  monthName: string;
  rows: EmployeeRosterRow[];
  onUpdateCell: (empId: string, day: number, value: CellValue) => void;
  onResetRoster: () => void;
  onSelectEmployee: (empId: string) => void;
  onMonthChange: (month: number) => void;
}

export const RosterGridView: React.FC<RosterGridViewProps> = ({
  year,
  month,
  monthName,
  rows,
  onUpdateCell,
  onResetRoster,
  onSelectEmployee,
  onMonthChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [editingCell, setEditingCell] = useState<{
    empId: string;
    day: number;
    currentVal: CellValue;
    empName: string;
  } | null>(null);

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.empId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (shiftFilter === 'all') return true;
      if (shiftFilter === 'leaves_only') {
        return Object.values(row.days).some((val) =>
          ['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML'].includes(val)
        );
      }
      return row.defaultShift === shiftFilter;
    });
  }, [rows, searchTerm, shiftFilter]);

  const handleCellClick = (empId: string, day: number, currentVal: CellValue, empName: string) => {
    setEditingCell({
      empId,
      day,
      currentVal,
      empName,
    });
  };

  const handleSelectCellValue = (value: CellValue) => {
    if (!editingCell) return;
    onUpdateCell(editingCell.empId, editingCell.day, value);
    setEditingCell(null);
  };

  const handleFillAllWeekOffs = () => {
    if (
      !window.confirm(
        `Are you sure you want to enforce default 'W' (Week Off) for all Saturdays and Sundays in ${monthName} ${year}? Existing leaves will not be overwritten.`
      )
    ) {
      return;
    }
    rows.forEach((row) => {
      for (let day = 1; day <= daysInMonth; day++) {
        if (isWeekend(year, month, day)) {
          const current = row.days[day];
          if (!['PL', 'SL', 'CL', 'CO', 'PH', 'Paternity', 'ML'].includes(current)) {
            onUpdateCell(row.empId, day, 'W');
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month Selector & Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => onMonthChange(Math.max(1, month - 1))}
                disabled={month <= 1}
                aria-label="Previous month"
                className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-bold text-slate-800 whitespace-nowrap tabular-nums">
                {monthName} {year}
              </span>
              <button
                onClick={() => onMonthChange(Math.min(12, month + 1))}
                disabled={month >= 12}
                aria-label="Next month"
                className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              Kaseya NOC Dedicated Team Roster · {daysInMonth} Days
            </div>
          </div>

          {/* Search & Shift Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setShiftFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  shiftFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setShiftFilter('23')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  shiftFilter === '23'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shift 23
              </button>
              <button
                onClick={() => setShiftFilter('1')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  shiftFilter === '1'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shift 1
              </button>
              <button
                onClick={() => setShiftFilter('4')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  shiftFilter === '4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shift 4
              </button>
              <button
                onClick={() => setShiftFilter('leaves_only')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  shiftFilter === 'leaves_only'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                On Leave
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportRosterToCSV(year, month, monthName, rows)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap"
                title="Download CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleFillAllWeekOffs}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap"
                title="Fill 'W' on all Saturdays & Sundays"
              >
                Fill Week Offs
              </button>

              <button
                onClick={onResetRoster}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset October 2026 data to original sheet state"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster Spreadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[70vh] relative">
          <table className="w-full text-xs text-left border-collapse border-spacing-0">
            {/* Header */}
            <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                {/* Fixed Left Header Columns */}
                <th className="sticky left-0 z-30 bg-slate-100 px-3 py-2.5 font-bold border-r border-slate-200 min-w-[180px] shadow-sm">
                  Resource Name
                </th>
                <th className="sticky left-[180px] z-30 bg-slate-100 px-2 py-2.5 font-bold border-r border-slate-200 min-w-[70px] text-center shadow-sm">
                  EMP ID
                </th>

                {/* Date Columns */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayName = getDayOfWeekName(year, month, day);
                  const weekend = isWeekend(year, month, day);
                  return (
                    <th
                      key={day}
                      className={`px-2 py-1.5 text-center font-bold border-r border-slate-200 min-w-[42px] max-w-[42px] ${
                        weekend ? 'bg-blue-50/80 text-blue-900' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono text-slate-500">
                        {dayName}
                      </div>
                      <div className="text-xs font-mono font-bold tabular-nums">
                        {day}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {filteredRows.map((row) => {
                return (
                  <tr key={row.empId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Fixed Resource Name */}
                    <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 py-1.5 border-r border-slate-200 font-sans shadow-xs whitespace-nowrap">
                      <button
                        onClick={() => onSelectEmployee(row.empId)}
                        className="text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 group"
                      >
                        <span className="truncate max-w-[140px]">{row.name}</span>
                      </button>
                    </td>

                    {/* Fixed EMP ID */}
                    <td className="sticky left-[180px] z-10 bg-white hover:bg-slate-50 px-2 py-1.5 border-r border-slate-200 text-center font-mono text-slate-600 text-[11px] shadow-xs tabular-nums">
                      {row.empId}
                    </td>

                    {/* Day Cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const val = row.days[day] || '';
                      const style = getCellColorStyles(val);
                      const weekend = isWeekend(year, month, day);

                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(row.empId, day, val, row.name)}
                          className={`px-1 py-1.5 text-center border-r border-slate-200 cursor-pointer select-none transition-all hover:ring-2 hover:ring-blue-500 hover:z-10 ${
                            weekend && !style.isLeave && val !== 'W' ? 'bg-blue-50/30' : ''
                          }`}
                          title={`${row.name} · Day ${day} (${getDayOfWeekName(year, month, day)}): ${style.label || val}`}
                        >
                          <div
                            className={`w-full py-1 text-[11px] font-bold rounded flex items-center justify-center ${style.bg} ${style.text}`}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={daysInMonth + 2} className="px-6 py-12 text-center text-slate-400 font-sans">
                    No resources matched your search or shift filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Legends: Exact match to Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Abbreviations Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Roster Abbreviations &amp; Leave Legend
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3.5">
            {LEAVE_DEFINITIONS.map((leave) => (
              <div
                key={leave.code}
                className="flex items-center gap-2.5 p-1.5 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <span
                  className={`w-8 h-6 flex items-center justify-center text-xs font-bold rounded ${leave.bgColor} ${leave.textColor}`}
                >
                  {leave.code}
                </span>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {leave.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Category Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Shift Categories &amp; Operational Timings (IST)
            </h3>
          </div>

          <div className="mt-3.5 divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {SHIFT_DEFINITIONS.map((shift) => (
              <div
                key={shift.code}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-6 flex items-center justify-center text-xs font-bold rounded border ${shift.badgeBg} ${shift.badgeText}`}
                  >
                    {shift.code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {shift.label}
                  </span>
                </div>
                <div className="text-xs font-mono font-medium text-slate-600">
                  {shift.istTiming}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Cell Edit Modal / Popover */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Shift or Leave
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingCell.empName} · Day {editingCell.day} ({monthName} {editingCell.day}, {year})
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Working Shifts */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Standard Shifts (IST)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SHIFT_DEFINITIONS.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => handleSelectCellValue(s.code)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                        editingCell.currentVal === s.code
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="text-sm">Shift {s.code}</span>
                      <span className="text-[10px] font-normal text-slate-500 font-mono mt-0.5">
                        {s.istTiming.split('–')[0].trim()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaves & Statuses */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Leaves &amp; Absence Codes
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LEAVE_DEFINITIONS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectCellValue(l.code)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                        editingCell.currentVal === l.code
                          ? 'ring-2 ring-blue-600 shadow-xs'
                          : 'hover:opacity-90'
                      } ${l.bgColor} ${l.textColor} ${l.borderColor}`}
                    >
                      <span>{l.code}</span>
                      <span className="text-[10px] font-medium opacity-90 truncate max-w-[90px]">
                        {l.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input or Clear */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleSelectCellValue('W')}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Set Week Off (W)
                </button>
                <button
                  onClick={() => setEditingCell(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
