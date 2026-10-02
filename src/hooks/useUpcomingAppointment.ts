import { useMemo } from 'react';
import { Appointment, ClientProfile } from '../types';
import { getCurrentSolarDateInfo } from '../utils/dateUtils';
import { isAppointmentForUser, getStoredUserBookingIds } from '../utils/browserStorage';

/**
 * Robust hook to retrieve the nearest active or upcoming appointment.
 * Prioritizes browser storage booking IDs, exact Customer ID, Normalized Phone, and Customer Name match.
 */
export function useUpcomingAppointment(
  appointments: Appointment[],
  currentCustomer: ClientProfile | null
): Appointment | null {
  return useMemo(() => {
    const localBookingIds = getStoredUserBookingIds();

    const userAppointments = appointments.filter((apt) =>
      isAppointmentForUser(apt, currentCustomer, localBookingIds)
    );

    const activeList = userAppointments.filter(
      (apt) => apt.status === 'confirmed' || apt.status === 'in_progress' || apt.status === 'reserved'
    );

    if (activeList.length > 0) {
      const currentDay = getCurrentSolarDateInfo().dayNumber;
      activeList.sort((a, b) => {
        const diffA = (a.dayNumber - currentDay + 31) % 31;
        const diffB = (b.dayNumber - currentDay + 31) % 31;
        if (diffA !== diffB) return diffA - diffB;
        return a.startTime.localeCompare(b.startTime);
      });
      return activeList[0];
    }

    return null;
  }, [appointments, currentCustomer]);
}

