import { ShiftDefinition, LeaveDefinition, EmployeeLeaveBalance, EmployeeRosterRow, ShiftCode } from '../types/roster';

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [
  {
    code: '1',
    label: 'Shift 1',
    istTiming: '7:00 AM – 3:00 AM IST',
    description: 'Day-to-night operational shift',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-800',
  },
  {
    code: '2',
    label: 'Shift 2',
    istTiming: '8:30 PM – 5:30 AM IST',
    description: 'Mid Night shift',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800',
  },
  {
    code: '3',
    label: 'Shift 3',
    istTiming: '10:00 PM – 7:00 AM IST',
    description: 'Graveyard Night shift',
    badgeBg: 'bg-slate-100 border-slate-300',
    badgeText: 'text-slate-800',
  },
  {
    code: '23',
    label: 'Shift 23',
    istTiming: '6:00 PM – 3:00 AM IST',
    description: 'Core US/Global support evening shift',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
  },
  {
    code: '12',
    label: 'Shift 12',
    istTiming: '10:00 AM – 6:00 PM IST',
    description: 'Day business shift',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
  },
  {
    code: '4',
    label: 'Shift 4',
    istTiming: '5:00 AM – 2:00 PM IST',
    description: 'Early morning APAC overlap shift',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-800',
  },
];

export const LEAVE_DEFINITIONS: LeaveDefinition[] = [
  {
    code: 'PH',
    name: 'Public Holiday',
    description: 'Company gazetted public holiday',
    bgColor: 'bg-cyan-200',
    textColor: 'text-cyan-900 font-semibold',
    borderColor: 'border-cyan-300',
  },
  {
    code: 'PL',
    name: 'PTO / Vacation Leave',
    description: 'Paid Privilege Leave / Annual Vacation',
    bgColor: 'bg-red-500',
    textColor: 'text-white font-bold',
    borderColor: 'border-red-600',
  },
  {
    code: 'W',
    name: 'Week Off',
    description: 'Scheduled weekly rest day (weekend/rostered off)',
    bgColor: 'bg-blue-200',
    textColor: 'text-blue-900 font-medium',
    borderColor: 'border-blue-300',
  },
  {
    code: 'SL',
    name: 'Sick Leave',
    description: 'Medical or sick recovery absence',
    bgColor: 'bg-amber-400',
    textColor: 'text-amber-950 font-bold',
    borderColor: 'border-amber-500',
  },
  {
    code: 'CO',
    name: 'Comp Off',
    description: 'Compensatory off / time in lieu for weekend or holiday work',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white font-bold',
    borderColor: 'border-emerald-600',
  },
  {
    code: 'CL',
    name: 'Casual Leave',
    description: 'Casual personal leave',
    bgColor: 'bg-sky-500',
    textColor: 'text-white font-bold',
    borderColor: 'border-sky-600',
  },
  {
    code: 'Paternity',
    name: 'Paternity Leave',
    description: 'Paternity leave allowance',
    bgColor: 'bg-purple-600',
    textColor: 'text-white font-bold',
    borderColor: 'border-purple-700',
  },
  {
    code: 'ML',
    name: 'Marriage Leave',
    description: 'Special marriage leave',
    bgColor: 'bg-amber-700',
    textColor: 'text-white font-bold',
    borderColor: 'border-amber-800',
  },
  {
    code: 'LWD',
    name: 'Last Working Day',
    description: 'Notice period completion',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-900 font-semibold',
    borderColor: 'border-rose-300',
  },
];

// 27 Employees extracted directly from the user's Excel spreadsheets
export const INITIAL_LEAVE_BALANCES: EmployeeLeaveBalance[] = [
  {
    empId: '1313',
    name: 'Mushtaque Shaikh',
    joiningDate: '9 Jan 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 12,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 1, // in Excel sheet (adjusted)
    phConsumed: 3,
    totalLeaveTaken: 9,
  },
  {
    empId: '1446',
    name: 'Jayesh Khadye',
    joiningDate: '5 Jun 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 13,
    totalSlAccumulated: 9,
    slConsumed: 2,
    slBalance: 7,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 3,
    phConsumed: 3,
    totalLeaveTaken: 8,
  },
  {
    empId: '1134',
    name: 'Mithun GK',
    joiningDate: '20 Jun 22',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 12,
    totalSlAccumulated: 9,
    slConsumed: 5,
    slBalance: 4,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 3,
    phConsumed: 1,
    totalLeaveTaken: 11,
  },
  {
    empId: '1448',
    name: 'MariKannan Subramanian',
    joiningDate: '12 Jun 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 1,
    plBalance: 14,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 5,
    coExpired: 0,
    compOffBalance: 0,
    phConsumed: 1,
    totalLeaveTaken: 8,
  },
  {
    empId: '1686',
    name: 'Aamir Ahmed',
    joiningDate: '12 Feb 24',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 12,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 1,
    coExpired: 0,
    compOffBalance: 3,
    phConsumed: 2,
    totalLeaveTaken: 6,
  },
  {
    empId: '971',
    name: 'Sarumathy Anbalgan',
    joiningDate: '6 Dec 21',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 0,
    plBalance: 15,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 4,
    phConsumed: 2,
    totalLeaveTaken: 2,
  },
  {
    empId: '1187',
    name: 'Prathik H',
    joiningDate: '8 Aug 22',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 13,
    totalSlAccumulated: 9,
    slConsumed: 2,
    slBalance: 7,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 9,
    coExpired: 1,
    compOffBalance: -5,
    phConsumed: 1,
    totalLeaveTaken: 15,
  },
  {
    empId: '2005',
    name: 'Puneet Devgan',
    joiningDate: '13 Oct 25',
    department: 'Dedicated Support',
    plCarriedOver: 3,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 9,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 5,
    phConsumed: 1,
    totalLeaveTaken: 5,
  },
  {
    empId: '1821',
    name: 'Rassell Coutinho',
    joiningDate: '30 Sep 24',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 12,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 3,
    clBalance: 1.5,
    compOffEligible: 6,
    compOffConsumed: 3,
    coExpired: 0,
    compOffBalance: 3,
    phConsumed: 0,
    totalLeaveTaken: 10,
  },
  {
    empId: '1335',
    name: 'Ankit Kumar',
    joiningDate: '30 Jan 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 13,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 4,
    coExpired: 0,
    compOffBalance: 2,
    phConsumed: 0,
    totalLeaveTaken: 7,
  },
  {
    empId: '1646',
    name: 'Sachin K',
    joiningDate: '4 Dec 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 9,
    plBalance: 6,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 2,
    clBalance: 2.5,
    compOffEligible: 6,
    compOffConsumed: 4,
    coExpired: 0,
    compOffBalance: -1,
    phConsumed: 3,
    totalLeaveTaken: 18,
  },
  {
    empId: '1786',
    name: 'Almueen Khalife',
    joiningDate: '19 Aug 24',
    department: 'Dedicated Support',
    plCarriedOver: 3,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 10,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 4,
    clBalance: 0.5,
    compOffEligible: 6,
    compOffConsumed: 3,
    coExpired: 0,
    compOffBalance: -3,
    phConsumed: 6,
    totalLeaveTaken: 15,
  },
  {
    empId: '2011',
    name: 'Harkamal Kaur',
    joiningDate: '3 Nov 25',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 3,
    plBalance: 6,
    totalSlAccumulated: 9,
    slConsumed: 3,
    slBalance: 6,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 3,
    coExpired: 0,
    compOffBalance: 0,
    phConsumed: 3,
    totalLeaveTaken: 12,
  },
  {
    empId: '1882',
    name: 'Manoj B',
    joiningDate: '9 Dec 24',
    department: 'Dedicated Support',
    plCarriedOver: 1,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 8,
    totalSlAccumulated: 9,
    slConsumed: 4,
    slBalance: 5,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 2,
    phConsumed: 2,
    totalLeaveTaken: 10,
  },
  {
    empId: '2033',
    name: 'Namshid T',
    joiningDate: '5 Jan 26',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 7,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 1,
    coExpired: 0,
    compOffBalance: 2,
    phConsumed: 3,
    totalLeaveTaken: 8,
  },
  {
    empId: '1433',
    name: 'Sampath Gudelli',
    joiningDate: '29 May 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 13,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 4,
    phConsumed: 2,
    totalLeaveTaken: 4,
  },
  {
    empId: '1932',
    name: 'Sujan K',
    joiningDate: '3 Mar 25',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 5,
    plBalance: 10,
    totalSlAccumulated: 9,
    slConsumed: 1,
    slBalance: 8,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 3,
    coExpired: 0,
    compOffBalance: 2,
    phConsumed: 1,
    totalLeaveTaken: 10,
  },
  {
    empId: '2061',
    name: 'Ajith V',
    joiningDate: '9 Feb 26',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 7,
    totalSlAccumulated: 9,
    slConsumed: 4,
    slBalance: 5,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 4,
    phConsumed: 0,
    totalLeaveTaken: 9,
  },
  {
    empId: '2034',
    name: 'Sarath Surendran',
    joiningDate: '5 Jan 26',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 1,
    plBalance: 8,
    totalSlAccumulated: 9,
    slConsumed: 6,
    slBalance: 3,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 4,
    coExpired: 0,
    compOffBalance: 2,
    phConsumed: 0,
    totalLeaveTaken: 12,
  },
  {
    empId: '532',
    name: 'Yadvinder Singh',
    joiningDate: '20 May 19',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 9,
    plBalance: 6,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 0,
    phConsumed: 0,
    totalLeaveTaken: 10,
  },
  {
    empId: '1783',
    name: 'Abhijit Das',
    joiningDate: '19 Aug 24',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 1,
    plBalance: 14,
    totalSlAccumulated: 9,
    slConsumed: 8,
    slBalance: 1,
    totalClAccumulated: 4.5,
    clConsumed: 2,
    clBalance: 2.5,
    compOffEligible: 6,
    compOffConsumed: 0,
    coExpired: 0,
    compOffBalance: 0,
    phConsumed: 0,
    totalLeaveTaken: 11,
  },
  {
    empId: '627',
    name: 'Mohammed Madeen',
    joiningDate: '24 Feb 20',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 0,
    plBalance: 15,
    totalSlAccumulated: 9,
    slConsumed: 0,
    slBalance: 9,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 6,
    compOffConsumed: 3,
    coExpired: 0,
    compOffBalance: 3,
    phConsumed: 0,
    totalLeaveTaken: 3,
  },
  {
    empId: '1982',
    name: 'Subhith MS',
    joiningDate: '21 Jul 25',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 1,
    plBalance: 14,
    totalSlAccumulated: 9,
    slConsumed: 3,
    slBalance: 6,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 4,
    coExpired: 0,
    compOffBalance: 0,
    phConsumed: 2,
    totalLeaveTaken: 11,
  },
  {
    empId: '1327',
    name: 'Asharaf Ali Khan',
    joiningDate: '23 Jan 23',
    department: 'Dedicated Support',
    plCarriedOver: 6,
    plAccumulated: 9,
    plConsumed: 7,
    plBalance: 8,
    totalSlAccumulated: 9,
    slConsumed: 2,
    slBalance: 7,
    totalClAccumulated: 4.5,
    clConsumed: 2,
    clBalance: 2.5,
    compOffEligible: 6,
    compOffConsumed: 7,
    coExpired: 0,
    compOffBalance: -1,
    phConsumed: 0,
    totalLeaveTaken: 18,
  },
  {
    empId: '2067',
    name: 'Olivia Kumar',
    joiningDate: '16 Feb 26',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 2,
    plBalance: 7,
    totalSlAccumulated: 9,
    slConsumed: 3,
    slBalance: 6,
    totalClAccumulated: 4.5,
    clConsumed: 2,
    clBalance: 2.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 4,
    phConsumed: 1,
    totalLeaveTaken: 10,
  },
  {
    empId: '1938',
    name: 'Sabith K',
    joiningDate: '24 Mar 25',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 9,
    plConsumed: 4,
    plBalance: 5,
    totalSlAccumulated: 9,
    slConsumed: 4,
    slBalance: 5,
    totalClAccumulated: 4.5,
    clConsumed: 1,
    clBalance: 3.5,
    compOffEligible: 6,
    compOffConsumed: 2,
    coExpired: 0,
    compOffBalance: 4,
    phConsumed: 1,
    totalLeaveTaken: 11,
  },
  {
    empId: '2041',
    name: 'Sagar Chaudhary',
    joiningDate: '12 Jan 26',
    department: 'Dedicated Support',
    plCarriedOver: 0,
    plAccumulated: 8,
    plConsumed: 1,
    plBalance: 7,
    totalSlAccumulated: 8,
    slConsumed: 2,
    slBalance: 6,
    totalClAccumulated: 4.5,
    clConsumed: 0,
    clBalance: 4.5,
    compOffEligible: 5,
    compOffConsumed: 4,
    coExpired: 1,
    compOffBalance: 1,
    phConsumed: 1,
    totalLeaveTaken: 8,
  },
];

export function generateOctober2026Rows(): EmployeeRosterRow[] {
  // Exact day-by-day cell data extracted from the verified October 2026 Kaseya NOC Dedicated Team Roster
  const exactRosterMap: Record<string, { defaultShift: ShiftCode; days: Record<number, string> }> = {
    // Row 4: Mushtaque Shaikh (1313)
    '1313': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 5: Jayesh Khadye (1446)
    '1446': {
      defaultShift: '23',
      days: {
        1: 'PL', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 6: Mithun GK (1134) - Rotational Shift 4 (Wed-Fri), Shift 23 (Sat-Sun), Mon-Tue (W), Day 31: LWD
    '1134': {
      defaultShift: '4',
      days: {
        1: '4', 2: '4', 3: '23', 4: '23', 5: 'W', 6: 'W', 7: '4', 8: '4', 9: '4',
        10: '23', 11: '23', 12: 'W', 13: 'W', 14: '4', 15: '4', 16: '4',
        17: '23', 18: '23', 19: 'W', 20: 'W', 21: '4', 22: '4', 23: '4',
        24: '23', 25: '23', 26: 'W', 27: 'W', 28: '4', 29: '4', 30: '4', 31: 'LWD'
      }
    },
    // Row 7: MariKannan Subramanian (1448) - Shift 1 on 10/1-4, W on 10/5, 1 on 10/6-9, W on 10/10-11, 1 on 10/12-16, W on 10/17-18, 1 on 10/19-23, W on 10/24-25, 1 on 10/26-30, W on 10/31
    '1448': {
      defaultShift: '1',
      days: {
        1: '1', 2: '1', 3: '1', 4: '1', 5: 'W', 6: '1', 7: '1', 8: '1', 9: '1',
        10: 'W', 11: 'W', 12: '1', 13: '1', 14: '1', 15: '1', 16: '1',
        17: 'W', 18: 'W', 19: '1', 20: '1', 21: '1', 22: '1', 23: '1',
        24: 'W', 25: 'W', 26: '1', 27: '1', 28: '1', 29: '1', 30: '1', 31: 'W'
      }
    },
    // Row 8: Aamir Ahmed (1686)
    '1686': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 9: Sarumathy Anbalgan (971)
    '971': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 10: Prathik H (1187) - CO on 10/28, CO on 10/29, PL on 10/30
    '1187': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: 'CO', 29: 'CO', 30: 'PL', 31: 'W'
      }
    },
    // Row 11: Puneet Devgan (2005)
    '2005': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 12: Rassell Coutinho (1821)
    '1821': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 13: Ankit Kumar (1335)
    '1335': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 14: Sachin K (1646) - PL on 10/15, 10/16
    '1646': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: 'PL', 16: 'PL',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 15: Almueen Khalife (1786)
    '1786': {
      defaultShift: '4',
      days: {
        1: '1', 2: '1', 3: '4', 4: '4', 5: '4', 6: 'W', 7: 'W', 8: '1', 9: '4',
        10: '4', 11: 'PL', 12: 'W', 13: '4', 14: '4', 15: 'PL', 16: 'PL',
        17: '4', 18: '4', 19: 'CL', 20: 'W', 21: 'W', 22: '1', 23: '4',
        24: '4', 25: '4', 26: 'W', 27: 'W', 28: '1', 29: '4', 30: '4', 31: '4'
      }
    },
    // Row 16: Harkamal Kaur (2011)
    '2011': {
      defaultShift: '4',
      days: {
        1: '4', 2: '4', 3: 'W', 4: 'W', 5: '4', 6: 'CO', 7: '4', 8: '4', 9: '4',
        10: 'W', 11: 'W', 12: '4', 13: '4', 14: '4', 15: '4', 16: '4',
        17: 'W', 18: 'W', 19: '4', 20: 'PH', 21: '4', 22: '4', 23: '4',
        24: 'W', 25: 'W', 26: '4', 27: 'CO', 28: '4', 29: '4', 30: 'CO', 31: 'W'
      }
    },
    // Row 17: Manoj B (1882)
    '1882': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 18: Namshid T (2033) - 10/4 W, 10/8 SL, 10/3 4, 10/31 4
    '2033': {
      defaultShift: '4',
      days: {
        1: '4', 2: '4', 3: '4', 4: 'W', 5: '4', 6: '4', 7: '4', 8: 'SL', 9: '4',
        10: 'W', 11: 'W', 12: '4', 13: '4', 14: '4', 15: '4', 16: '4',
        17: 'W', 18: 'W', 19: '4', 20: '4', 21: '4', 22: '4', 23: '4',
        24: 'W', 25: 'W', 26: '4', 27: '4', 28: '4', 29: '4', 30: '4', 31: '4'
      }
    },
    // Row 19: Sampath Gudelli (1433)
    '1433': {
      defaultShift: '1',
      days: {
        1: 'W', 2: '1', 3: '1', 4: '1', 5: '1', 6: '1', 7: '1', 8: 'W', 9: '1',
        10: '1', 11: '1', 12: 'W', 13: '1', 14: '1', 15: '1', 16: '1',
        17: '1', 18: '1', 19: '1', 20: 'W', 21: 'W', 22: 'W', 23: '1',
        24: '1', 25: '1', 26: '1', 27: 'W', 28: 'W', 29: '1', 30: '1', 31: '1'
      }
    },
    // Row 20: Sujan K (1932) - 10/19 CO, 10/20 CO, 10/21 CO
    '1932': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: 'CO', 20: 'CO', 21: 'CO', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 21: Ajith V (2061) - 10/8 SL
    '2061': {
      defaultShift: '2',
      days: {
        1: '2', 2: '2', 3: 'W', 4: 'W', 5: '2', 6: '2', 7: '2', 8: 'SL', 9: '2',
        10: 'W', 11: 'W', 12: '2', 13: '2', 14: '2', 15: '2', 16: '2',
        17: 'W', 18: 'W', 19: '2', 20: '2', 21: '2', 22: '2', 23: '2',
        24: 'W', 25: 'W', 26: '2', 27: '2', 28: '2', 29: '2', 30: '2', 31: 'W'
      }
    },
    // Row 22: Sarath Surendran (2034) - 10/19 CO, 10/20 CO
    '2034': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: 'CO', 20: 'CO', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 23: Yadvinder Singh (532)
    '532': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 24: Abhijit Das (1783) - Shift 23, Week Off on Mon & Tue (10/5-6, 10/12-13, 10/19-20, 10/26-27), works Sat & Sun
    '1783': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: '23', 4: '23', 5: 'W', 6: 'W', 7: '23', 8: '23', 9: '23',
        10: '23', 11: '23', 12: 'W', 13: 'W', 14: '23', 15: '23', 16: '23',
        17: '23', 18: '23', 19: 'W', 20: 'W', 21: '23', 22: '23', 23: '23',
        24: '23', 25: '23', 26: 'W', 27: 'W', 28: '23', 29: '23', 30: '23', 31: '23'
      }
    },
    // Row 25: Mohammed Madeen (627) - Shift 3, Week Off on Mon & Tue, works Sat & Sun
    '627': {
      defaultShift: '3',
      days: {
        1: '3', 2: '3', 3: '3', 4: '3', 5: 'W', 6: 'W', 7: '3', 8: '3', 9: '3',
        10: '3', 11: '3', 12: 'W', 13: 'W', 14: '3', 15: '3', 16: '3',
        17: '3', 18: '3', 19: 'W', 20: 'W', 21: '3', 22: '3', 23: '3',
        24: '3', 25: '3', 26: 'W', 27: 'W', 28: '3', 29: '3', 30: '3', 31: '3'
      }
    },
    // Row 26: Subhith MS (1982) - 10/6 CO, 10/7 CO, 10/19 PL, 10/20 PL
    '1982': {
      defaultShift: '1',
      days: {
        1: '1', 2: '1', 3: 'W', 4: 'W', 5: '1', 6: 'CO', 7: 'CO', 8: '1', 9: '1',
        10: 'W', 11: 'W', 12: '1', 13: '1', 14: '1', 15: '1', 16: '1',
        17: 'W', 18: 'W', 19: 'PL', 20: 'PL', 21: '1', 22: '1', 23: '1',
        24: 'W', 25: 'W', 26: '1', 27: '1', 28: '1', 29: '1', 30: '1', 31: 'W'
      }
    },
    // Row 27: Asharaf Ali Khan (1327)
    '1327': {
      defaultShift: '1',
      days: {
        1: '1', 2: '1', 3: 'W', 4: 'W', 5: '1', 6: '1', 7: '1', 8: '1', 9: '1',
        10: 'W', 11: 'W', 12: '1', 13: '1', 14: '1', 15: '1', 16: '1',
        17: 'W', 18: 'W', 19: '1', 20: '1', 21: '1', 22: '1', 23: '1',
        24: 'W', 25: 'W', 26: '1', 27: '1', 28: '1', 29: '1', 30: '1', 31: 'W'
      }
    },
    // Row 28: Olivia Kumar (2067)
    '2067': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
    // Row 29: Sabith K (1938)
    '1938': {
      defaultShift: '2',
      days: {
        1: '2', 2: '2', 3: 'W', 4: 'W', 5: '2', 6: '2', 7: '2', 8: '2', 9: '2',
        10: 'W', 11: 'W', 12: '2', 13: '2', 14: '2', 15: '2', 16: '2',
        17: 'W', 18: 'W', 19: '2', 20: '2', 21: '2', 22: '2', 23: '2',
        24: 'W', 25: 'W', 26: '2', 27: '2', 28: '2', 29: '2', 30: '2', 31: 'W'
      }
    },
    // Row 30: Sagar Chaudhary (2041)
    '2041': {
      defaultShift: '23',
      days: {
        1: '23', 2: '23', 3: 'W', 4: 'W', 5: '23', 6: '23', 7: '23', 8: '23', 9: '23',
        10: 'W', 11: 'W', 12: '23', 13: '23', 14: '23', 15: '23', 16: '23',
        17: 'W', 18: 'W', 19: '23', 20: '23', 21: '23', 22: '23', 23: '23',
        24: 'W', 25: 'W', 26: '23', 27: '23', 28: '23', 29: '23', 30: '23', 31: 'W'
      }
    },
  };

  return INITIAL_LEAVE_BALANCES.map((emp) => {
    const config = exactRosterMap[emp.empId] || {
      defaultShift: '23' as ShiftCode,
      days: {},
    };

    return {
      empId: emp.empId,
      name: emp.name,
      defaultShift: config.defaultShift,
      days: config.days,
    };
  });
}

