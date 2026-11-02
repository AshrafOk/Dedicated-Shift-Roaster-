import { TeamId } from '../types/user';
import { DatabaseState, parseRosterCsv } from './database';
import { MASTER_ROSTER_CSV } from './rawRosterCsv';
import { EmployeeLeaveBalance } from '../types/roster';
import { calculateEmployeeBalance } from '../utils/rosterUtils';

interface StarterMember {
  name: string;
  empId: string;
  department: string;
  defaultShift: string;
  joiningDate: string;
  plCarried: number;
  plAccum: number;
  slAccum: number;
  clAccum: number;
  coEligible: number;
  color?: string;
}

const STARTER_TEAMS: Record<Exclude<TeamId, 'dedicated'>, StarterMember[]> = {
  elite: [],
  standard: [
    { name: 'Amitabh Sen', empId: 'ST-201', department: 'NOC Standard T2', defaultShift: '1', joiningDate: '2023-02-14', plCarried: 11, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Divya Aggarwal', empId: 'ST-202', department: 'NOC Standard T2', defaultShift: '2', joiningDate: '2023-04-10', plCarried: 10, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Gaurav Mishra', empId: 'ST-203', department: 'NOC Standard T2', defaultShift: '3', joiningDate: '2022-12-01', plCarried: 14, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Ishita Bansal', empId: 'ST-204', department: 'NOC Standard T2', defaultShift: '23', joiningDate: '2023-08-20', plCarried: 9, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 1 },
    { name: 'Karthik Raja', empId: 'ST-205', department: 'NOC Standard T2', defaultShift: '1', joiningDate: '2024-03-05', plCarried: 6, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Manish Pandey', empId: 'ST-206', department: 'NOC Standard T2', defaultShift: '2', joiningDate: '2023-01-25', plCarried: 12, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Nidhi Kulkarni', empId: 'ST-207', department: 'NOC Standard T2', defaultShift: '3', joiningDate: '2023-07-15', plCarried: 8, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Praveen Yadav', empId: 'ST-208', department: 'NOC Standard T2', defaultShift: '23', joiningDate: '2022-09-19', plCarried: 15, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 5 },
    { name: 'Ritu Chaudhary', empId: 'ST-209', department: 'NOC Standard T2', defaultShift: '1', joiningDate: '2023-11-02', plCarried: 7, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 1 },
    { name: 'Sanjay Dutt Sharma', empId: 'ST-210', department: 'NOC Standard T2', defaultShift: '2', joiningDate: '2024-02-18', plCarried: 5, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Tarun Bhatia', empId: 'ST-211', department: 'NOC Standard T2', defaultShift: '3', joiningDate: '2023-05-12', plCarried: 13, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Varun Grover', empId: 'ST-212', department: 'NOC Standard T2', defaultShift: '23', joiningDate: '2022-10-30', plCarried: 16, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Yashika Mehra', empId: 'ST-213', department: 'NOC Standard T2', defaultShift: '1', joiningDate: '2024-01-22', plCarried: 8, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Zeeshan Khan', empId: 'ST-214', department: 'NOC Standard T2', defaultShift: '2', joiningDate: '2023-06-29', plCarried: 10, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
  ],
  flex: [
    { name: 'Deepak Thapa', empId: 'FL-301', department: 'NOC Flex Dispatch', defaultShift: '1', joiningDate: '2023-04-05', plCarried: 9, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 6 },
    { name: 'Harpreet Singh', empId: 'FL-302', department: 'NOC Flex Dispatch', defaultShift: '2', joiningDate: '2023-08-14', plCarried: 11, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 8 },
    { name: 'Lavanya Reddy', empId: 'FL-303', department: 'NOC Flex Dispatch', defaultShift: '3', joiningDate: '2024-01-10', plCarried: 7, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 5 },
    { name: 'Mayank Srivastava', empId: 'FL-304', department: 'NOC Flex Dispatch', defaultShift: '23', joiningDate: '2022-11-15', plCarried: 14, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 7 },
    { name: 'Pallavi Ghosh', empId: 'FL-305', department: 'NOC Flex Dispatch', defaultShift: '1', joiningDate: '2023-03-22', plCarried: 12, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Rajesh Chauhan', empId: 'FL-306', department: 'NOC Flex Dispatch', defaultShift: '2', joiningDate: '2023-09-08', plCarried: 8, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 9 },
    { name: 'Sneha Bhatt', empId: 'FL-307', department: 'NOC Flex Dispatch', defaultShift: '3', joiningDate: '2024-03-12', plCarried: 6, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Tejaswi Patel', empId: 'FL-308', department: 'NOC Flex Dispatch', defaultShift: '23', joiningDate: '2022-07-28', plCarried: 15, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 6 },
    { name: 'Umesh Gupta', empId: 'FL-309', department: 'NOC Flex Dispatch', defaultShift: '1', joiningDate: '2023-12-05', plCarried: 7, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 5 },
    { name: 'Vinay Kumar', empId: 'FL-310', department: 'NOC Flex Dispatch', defaultShift: '2', joiningDate: '2024-02-01', plCarried: 8, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
  ],
  bcn: [
    { name: 'Balaji Natarajan', empId: 'BC-401', department: 'BCN Operations', defaultShift: '1', joiningDate: '2022-06-15', plCarried: 16, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Chitra Subramanian', empId: 'BC-402', department: 'BCN Operations', defaultShift: '2', joiningDate: '2023-01-20', plCarried: 12, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Eshwar Murthy', empId: 'BC-403', department: 'BCN Operations', defaultShift: '3', joiningDate: '2023-05-18', plCarried: 10, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Farhan Siddiqui', empId: 'BC-404', department: 'BCN Operations', defaultShift: '23', joiningDate: '2022-10-05', plCarried: 14, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 5 },
    { name: 'Geetika Anand', empId: 'BC-405', department: 'BCN Operations', defaultShift: '1', joiningDate: '2024-02-10', plCarried: 6, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 1 },
    { name: 'Himanshu Rawat', empId: 'BC-406', department: 'BCN Operations', defaultShift: '2', joiningDate: '2023-07-01', plCarried: 11, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Jitendra Sahu', empId: 'BC-407', department: 'BCN Operations', defaultShift: '3', joiningDate: '2023-11-14', plCarried: 8, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Kusum Lata', empId: 'BC-408', department: 'BCN Operations', defaultShift: '23', joiningDate: '2024-04-18', plCarried: 5, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Manoj Tiwari', empId: 'BC-409', department: 'BCN Operations', defaultShift: '1', joiningDate: '2022-08-22', plCarried: 15, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Naveen Jindal', empId: 'BC-410', department: 'BCN Operations', defaultShift: '2', joiningDate: '2023-09-30', plCarried: 9, plAccum: 18, slAccum: 12, clAccum: 8, coEligible: 3 },
  ],
  managers: [
    { name: 'Siddheshwar Roy', empId: 'MG-501', department: 'NOC Management', defaultShift: '1', joiningDate: '2021-04-01', plCarried: 20, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 6 },
    { name: 'Smita Sengupta', empId: 'MG-502', department: 'NOC Management', defaultShift: '2', joiningDate: '2021-09-15', plCarried: 18, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Gautam Gambhir Roy', empId: 'MG-503', department: 'NOC Management', defaultShift: '1', joiningDate: '2022-02-10', plCarried: 15, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 5 },
    { name: 'Archana Dixit', empId: 'MG-504', department: 'NOC Management', defaultShift: '23', joiningDate: '2022-07-20', plCarried: 14, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 7 },
    { name: 'Brijesh Pandey', empId: 'MG-505', department: 'NOC Management', defaultShift: '1', joiningDate: '2022-11-05', plCarried: 16, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 3 },
    { name: 'Debashish Mitra', empId: 'MG-506', department: 'NOC Management', defaultShift: '2', joiningDate: '2023-03-12', plCarried: 12, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 4 },
    { name: 'Komal Singhal', empId: 'MG-507', department: 'NOC Management', defaultShift: '3', joiningDate: '2023-08-01', plCarried: 10, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 2 },
    { name: 'Pradeep Narayanan', empId: 'MG-508', department: 'NOC Management', defaultShift: '1', joiningDate: '2021-12-18', plCarried: 19, plAccum: 20, slAccum: 12, clAccum: 8, coEligible: 8 },
  ],
};

function generateYearSchedule(
  members: StarterMember[],
  year = 2026
): Record<string, Record<string, string>> {
  const schedules: Record<string, Record<string, string>> = {};

  members.forEach((m, memberIdx) => {
    schedules[m.empId] = {};
    const defaultShift = m.defaultShift;

    // Generate for all 12 months
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0=Sun, 6=Sat

        // Rotate week offs based on member index so coverage is 24x7
        const offDay1 = (memberIdx * 2) % 7;
        const offDay2 = (offDay1 + 1) % 7;

        if (dayOfWeek === offDay1 || dayOfWeek === offDay2) {
          schedules[m.empId][dateKey] = 'W';
        } else {
          // Occasional leave simulation (e.g. 1-2 days per quarter)
          if ((day === 12 || day === 24) && (month === 3 || month === 7 || month === 10) && memberIdx % 3 === 0) {
            schedules[m.empId][dateKey] = 'PL';
          } else if (day === 8 && month === 5 && memberIdx % 4 === 0) {
            schedules[m.empId][dateKey] = 'SL';
          } else if (day === 19 && month === 8 && memberIdx % 5 === 0) {
            schedules[m.empId][dateKey] = 'CL';
          } else {
            schedules[m.empId][dateKey] = defaultShift;
          }
        }
      }
    }
  });

  return schedules;
}

export function getInitialTeamDatabase(teamId: TeamId): DatabaseState {
  if (teamId === 'dedicated') {
    return parseRosterCsv(MASTER_ROSTER_CSV);
  }

  if (teamId === 'elite') {
    return {
      version: 3,
      balances: [],
      dailySchedules: {},
      employeeColors: {},
    };
  }

  const members = STARTER_TEAMS[teamId] || STARTER_TEAMS.standard;
  const dailySchedules = generateYearSchedule(members, 2026);

  const balances: EmployeeLeaveBalance[] = members.map((m) => {
    // Count leaves in 2026
    let plCount = 0;
    let slCount = 0;
    let clCount = 0;
    let coCount = 0;
    const sched = dailySchedules[m.empId] || {};

    Object.values(sched).forEach((val) => {
      if (val === 'PL') plCount++;
      else if (val === 'SL') slCount++;
      else if (val === 'CL') clCount++;
      else if (val === 'CO') coCount++;
    });

    const rawBalance: EmployeeLeaveBalance = {
      empId: m.empId,
      name: m.name,
      department: m.department,
      joiningDate: m.joiningDate,
      plCarriedOver: m.plCarried,
      plAccumulated: m.plAccum,
      plConsumed: plCount,
      plBalance: m.plCarried + m.plAccum - plCount,
      totalSlAccumulated: m.slAccum,
      slConsumed: slCount,
      slBalance: m.slAccum - slCount,
      totalClAccumulated: m.clAccum,
      clConsumed: clCount,
      clBalance: m.clAccum - clCount,
      compOffEligible: m.coEligible,
      compOffConsumed: coCount,
      coExpired: 0,
      compOffBalance: m.coEligible - coCount,
      phConsumed: 3,
      totalLeaveTaken: plCount + slCount + clCount + coCount,
    };

    return calculateEmployeeBalance(rawBalance);
  });

  const employeeColors: Record<string, string> = {};
  members.forEach((m) => {
    if (m.color) {
      employeeColors[m.empId] = m.color;
    }
  });

  return {
    version: 3,
    balances,
    dailySchedules,
    employeeColors,
  };
}
