export type ShiftCode = '1' | '2' | '3' | '23' | '12' | '4';

export type LeaveCode = 'PH' | 'PL' | 'W' | 'SL' | 'CO' | 'CL' | 'Paternity' | 'ML' | 'LWD';

export type UserRole = 'admin' | 'viewer';

export type CellValue = ShiftCode | LeaveCode | string;

export interface ShiftDefinition {
  code: ShiftCode;
  label: string;
  istTiming: string;
  description: string;
  badgeBg: string;
  badgeText: string;
}

export interface LeaveDefinition {
  code: LeaveCode;
  name: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface EmployeeLeaveBalance {
  empId: string;
  name: string;
  joiningDate: string;
  department?: string;
  // PL (Privilege/Vacation Leave)
  plCarriedOver: number;
  plAccumulated: number;
  plConsumed: number;
  plBalance: number; // (plCarriedOver + plAccumulated) - plConsumed
  // SL (Sick Leave)
  totalSlAccumulated: number;
  slConsumed: number;
  slBalance: number; // totalSlAccumulated - slConsumed
  // CL (Casual Leave)
  totalClAccumulated: number;
  clConsumed: number;
  clBalance: number; // totalClAccumulated - clConsumed
  // Comp Off (Time in Lieu)
  compOffEligible: number;
  compOffConsumed: number;
  coExpired: number;
  compOffBalance: number; // compOffEligible - compOffConsumed - coExpired
  // Public Holiday
  phConsumed: number;
  // Total leaves
  totalLeaveTaken: number;
}

export interface EmployeeRosterRow {
  empId: string;
  name: string;
  defaultShift: ShiftCode;
  // Map of day number (1..31) to cell value (ShiftCode or LeaveCode or note)
  days: Record<number, CellValue>;
}

export interface MonthRosterData {
  year: number;
  month: number; // 1-12
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number; // 0=Sun, 1=Mon, ..., 4=Thu
  rows: EmployeeRosterRow[];
}

export type ViewTab = 'dashboard' | 'roster' | 'balances' | 'directory';
