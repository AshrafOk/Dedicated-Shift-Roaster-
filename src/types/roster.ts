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

export interface RosterRowColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
}

export const ROSTER_ROW_COLORS: RosterRowColorOption[] = [
  { id: 'green', name: 'Light Green', bg: '#A9D08E', text: '#143314', border: '#8BB670' },
  { id: 'yellow', name: 'Golden Yellow', bg: '#FFC000', text: '#3D2600', border: '#DCA400' },
  { id: 'peach', name: 'Peach / Salmon', bg: '#F4B084', text: '#441806', border: '#DA9264' },
  { id: 'blue', name: 'Light Blue', bg: '#B4C6E7', text: '#0F224A', border: '#95A9D2' },
  { id: 'orange', name: 'Deep Orange', bg: '#ED7D31', text: '#FFFFFF', border: '#CD6017' },
  { id: 'white', name: 'Default White', bg: '#FFFFFF', text: '#0F172A', border: '#E2E8F0' },
];

export function resolveRosterColor(colorKeyOrHex?: string): RosterRowColorOption {
  if (!colorKeyOrHex) return ROSTER_ROW_COLORS[5]; // Default White
  const found = ROSTER_ROW_COLORS.find(
    (c) => c.id === colorKeyOrHex.toLowerCase() || c.bg.toLowerCase() === colorKeyOrHex.toLowerCase()
  );
  if (found) return found;

  // Custom hex fallback
  if (colorKeyOrHex.startsWith('#')) {
    return {
      id: 'custom',
      name: 'Custom',
      bg: colorKeyOrHex,
      text: '#0F172A',
      border: '#CBD5E1',
    };
  }

  return ROSTER_ROW_COLORS[5]; // Default White
}
