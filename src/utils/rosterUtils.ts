import {
  CellValue,
  EmployeeLeaveBalance,
  EmployeeRosterRow,
  LeaveCode,
  ShiftCode,
} from '../types/roster';
import { LEAVE_DEFINITIONS, SHIFT_DEFINITIONS } from '../data/initialData';

export function calculateEmployeeBalance(balance: Partial<EmployeeLeaveBalance>): EmployeeLeaveBalance {
  const plCarriedOver = Number(balance.plCarriedOver) || 0;
  const plAccumulated = Number(balance.plAccumulated) || 0;
  const plConsumed = Number(balance.plConsumed) || 0;
  const plBalance = Number(((plCarriedOver + plAccumulated) - plConsumed).toFixed(1));

  const totalSlAccumulated = Number(balance.totalSlAccumulated) || 0;
  const slConsumed = Number(balance.slConsumed) || 0;
  const slBalance = Number((totalSlAccumulated - slConsumed).toFixed(1));

  const totalClAccumulated = Number(balance.totalClAccumulated) || 0;
  const clConsumed = Number(balance.clConsumed) || 0;
  const clBalance = Number((totalClAccumulated - clConsumed).toFixed(1));

  const compOffEligible = Number(balance.compOffEligible) || 0;
  const compOffConsumed = Number(balance.compOffConsumed) || 0;
  const coExpired = Number(balance.coExpired) || 0;
  const compOffBalance = Number((compOffEligible - compOffConsumed - coExpired).toFixed(1));

  const phConsumed = Number(balance.phConsumed) || 0;

  const totalLeaveTaken = Number(
    (plConsumed + slConsumed + clConsumed + compOffConsumed + phConsumed).toFixed(1)
  );

  return {
    empId: balance.empId || '',
    name: balance.name || '',
    joiningDate: balance.joiningDate || 'N/A',
    department: balance.department || 'Dedicated Support',
    plCarriedOver,
    plAccumulated,
    plConsumed,
    plBalance,
    totalSlAccumulated,
    slConsumed,
    slBalance,
    totalClAccumulated,
    clConsumed,
    clBalance,
    compOffEligible,
    compOffConsumed,
    coExpired,
    compOffBalance,
    phConsumed,
    totalLeaveTaken,
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  // Returns 0 for Sunday, 1 for Monday, etc.
  return new Date(year, month - 1, 1).getDay();
}

export function getDayOfWeekName(year: number, month: number, day: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(year, month - 1, day).getDay()];
}

export function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day).getDay();
  return d === 0 || d === 6; // Sunday or Saturday
}

export function getCellColorStyles(value: CellValue): {
  bg: string;
  text: string;
  border: string;
  isLeave: boolean;
  label?: string;
} {
  const leaveDef = LEAVE_DEFINITIONS.find((l) => l.code === value);
  if (leaveDef) {
    return {
      bg: leaveDef.bgColor,
      text: leaveDef.textColor,
      border: leaveDef.borderColor,
      isLeave: true,
      label: leaveDef.name,
    };
  }

  const shiftDef = SHIFT_DEFINITIONS.find((s) => s.code === value);
  if (shiftDef) {
    return {
      bg: shiftDef.badgeBg,
      text: shiftDef.badgeText,
      border: 'border-slate-200',
      isLeave: false,
      label: shiftDef.label,
    };
  }

  // Fallback for custom or empty
  return {
    bg: 'bg-white',
    text: 'text-slate-700',
    border: 'border-slate-200',
    isLeave: false,
  };
}

export function exportRosterToCSV(
  year: number,
  month: number,
  monthName: string,
  rows: EmployeeRosterRow[]
) {
  const daysInMonth = getDaysInMonth(year, month);
  const header = ['EMP ID', 'Name'];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayName = getDayOfWeekName(year, month, d);
    header.push(`${month}/${d}/${year} (${dayName})`);
  }

  const csvRows = [header.join(',')];

  rows.forEach((row) => {
    const line = [
      `"${row.empId}"`,
      `"${row.name}"`,
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      line.push(`"${row.days[d] || ''}"`);
    }
    csvRows.push(line.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Kaseya_NOC_Dedicated_Team_Roster_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBalancesToCSV(year: number, balances: EmployeeLeaveBalance[]) {
  const header = [
    'EMP ID',
    'Name',
    'Joining Date',
    'PL Carried Over',
    'PL Accumulated',
    'PL Consumed',
    'PL Balance',
    'Total SL Accumulated',
    'SL Consumed',
    'SL Balance',
    'Total CL Accumulated',
    'CL Consumed',
    'CL Balance',
    'Comp Off Eligible',
    'Comp Off Consumed',
    'CO Expired',
    'Comp Off Balance',
    'PH Consumed',
    'Total Leave Taken',
  ];

  const csvRows = [header.join(',')];

  balances.forEach((b) => {
    csvRows.push([
      `"${b.empId}"`,
      `"${b.name}"`,
      `"${b.joiningDate}"`,
      b.plCarriedOver,
      b.plAccumulated,
      b.plConsumed,
      b.plBalance,
      b.totalSlAccumulated,
      b.slConsumed,
      b.slBalance,
      b.totalClAccumulated,
      b.clConsumed,
      b.clBalance,
      b.compOffEligible,
      b.compOffConsumed,
      b.coExpired,
      b.compOffBalance,
      b.phConsumed,
      b.totalLeaveTaken,
    ].join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Leave_Balance_Tracker_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
