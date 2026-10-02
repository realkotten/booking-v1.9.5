import React from 'react';
import { Reservation, Appointment, Service } from '../types';
import { MyBookingsView } from './MyBookingsView';

interface VisitsViewProps {
  currentReservation?: Reservation;
  pastAppointmentsList?: Appointment[];
  onViewPass?: () => void;
  onRebook: (service?: Service) => void;
  onOpenProfile: () => void;
}

export const VisitsView: React.FC<VisitsViewProps> = (props) => {
  return <MyBookingsView {...props} />;
};
