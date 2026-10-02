import { useState, useEffect } from 'react';
import { getCurrentSolarDateInfo, SolarDateInfo } from '../utils/dateUtils';

export interface LiveClockState {
  now: Date;
  solarDate: SolarDateInfo;
  timeString: string;
  timeStringPersian: string;
  fullTimeString: string;
  fullTimeStringPersian: string;
  dateString: string;
  dayNumber: number;
}

/**
 * Hook that returns live real-time clock and Solar Persian calendar data,
 * updating every second for smooth, accurate real-time displays.
 */
export function useLiveClock(intervalMs = 1000): LiveClockState {
  const [clock, setClock] = useState<LiveClockState>(() => {
    const now = new Date();
    const solarDate = getCurrentSolarDateInfo(now);
    return {
      now,
      solarDate,
      timeString: solarDate.timeString,
      timeStringPersian: solarDate.timeStringPersian,
      fullTimeString: solarDate.fullTimeString,
      fullTimeStringPersian: solarDate.fullTimeStringPersian,
      dateString: solarDate.dateString,
      dayNumber: solarDate.dayNumber,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const solarDate = getCurrentSolarDateInfo(now);
      setClock({
        now,
        solarDate,
        timeString: solarDate.timeString,
        timeStringPersian: solarDate.timeStringPersian,
        fullTimeString: solarDate.fullTimeString,
        fullTimeStringPersian: solarDate.fullTimeStringPersian,
        dateString: solarDate.dateString,
        dayNumber: solarDate.dayNumber,
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return clock;
}
