/**
 * Indian Standard Time (IST) utilities
 * Timezone: Asia/Kolkata (UTC +05:30)
 *
 * Ensures all dates, roster start points, times, and day highlights in the portal
 * operate strictly according to Indian Standard Time (IST).
 */

import { useState, useEffect } from 'react';

export interface ISTDateInfo {
  year: number; // e.g. 2026
  month: number; // 1-12
  day: number; // 1-31
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  dayOfWeekName: string; // "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  monthName: string; // "October"
  monthNameShort: string; // "Oct"
  formattedDate: string; // "14 Oct 2026"
  formattedTime: string; // "06:21:45 PM"
  formattedDateTime: string; // "14 Oct 2026, 06:21 PM IST"
  isoDateString: string; // "2026-10-14"
}

const MONTHS_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
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

/**
 * Returns current date and time evaluated in Indian Standard Time (Asia/Kolkata).
 */
export function getISTDate(baseDate: Date = new Date()): ISTDateInfo {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'short',
    });

    const parts = formatter.formatToParts(baseDate);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const year = parseInt(map.year, 10) || 2026;
    const month = parseInt(map.month, 10) || 10;
    const day = parseInt(map.day, 10) || 14;
    const rawHour = parseInt(map.hour, 10) || 0;
    const hours = rawHour % 24;
    const minutes = parseInt(map.minute, 10) || 0;
    const seconds = parseInt(map.second, 10) || 0;
    const dayOfWeekName = map.weekday || 'Wed';

    const monthName = MONTHS_FULL[month - 1] || 'October';
    const monthNameShort = MONTHS_SHORT[month - 1] || 'Oct';

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const pad = (n: number) => String(n).padStart(2, '0');

    const formattedTime = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
    const formattedDate = `${day} ${monthNameShort} ${year}`;
    const formattedDateTime = `${day} ${monthNameShort} ${year}, ${pad(displayHours)}:${pad(minutes)} ${ampm} IST`;
    const isoDateString = `${year}-${pad(month)}-${pad(day)}`;

    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      dayOfWeekName,
      monthName,
      monthNameShort,
      formattedDate,
      formattedTime,
      formattedDateTime,
      isoDateString,
    };
  } catch {
    // Fallback if Intl timeZone is unsupported
    const offsetMs = 5.5 * 60 * 60 * 1000;
    const utcTime = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
    const istDate = new Date(utcTime + offsetMs);

    const year = istDate.getFullYear();
    const month = istDate.getMonth() + 1;
    const day = istDate.getDate();
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const seconds = istDate.getSeconds();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeekName = days[istDate.getDay()];

    const monthName = MONTHS_FULL[month - 1] || 'October';
    const monthNameShort = MONTHS_SHORT[month - 1] || 'Oct';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      dayOfWeekName,
      monthName,
      monthNameShort,
      formattedDate: `${day} ${monthNameShort} ${year}`,
      formattedTime: `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`,
      formattedDateTime: `${day} ${monthNameShort} ${year}, ${pad(displayHours)}:${pad(minutes)} ${ampm} IST`,
      isoDateString: `${year}-${pad(month)}-${pad(day)}`,
    };
  }
}

/**
 * React hook to keep a live IST clock updated every second
 */
export function useISTClock(intervalMs = 1000): ISTDateInfo {
  const [ist, setIst] = useState<ISTDateInfo>(() => getISTDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setIst(getISTDate());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return ist;
}
