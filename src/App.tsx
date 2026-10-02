import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenMode, BookingStep, NavigationTab, Service, Accoutrement } from './types';
import { SERVICES_DATA, ACCOUTREMENTS_DATA } from './data/mockData';
import { AtelierProvider, useAtelier } from './store/AtelierContext';
import { getCurrentSolarDateInfo } from './utils/dateUtils';
import { hapticStepAdvance, hapticLight, hapticSelection } from './utils/hapticUtils';
import { calculateBookingTotals, checkSlotAvailability, getInitialBookingSlot, isSlotExpired } from './utils/bookingUtils';

// Core eagerly-loaded screens
import { WelcomeScreen } from './components/WelcomeScreen';
import { AtelierHomeView } from './components/AtelierHomeView';
import { BookServicesView } from './components/BookServicesView';
import { BottomNavBar } from './components/BottomNavBar';
import { AsyncErrorBoundary } from './components/common/AsyncErrorBoundary';

// Resilient code-splitting loader with automatic retries for low-end / flaky network environments
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3,
  interval = 400
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (left: number) => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (left <= 0) {
              reject(error);
              return;
            }
            setTimeout(() => attempt(left - 1), interval);
          });
      };
      attempt(retries);
    })
  );
}

// Code-split views and modals with robust automatic retry
const OnboardingStep1 = lazyWithRetry(() => import('./components/OnboardingStep1').then(m => ({ default: m.OnboardingStep1 })));
const OnboardingStep2 = lazyWithRetry(() => import('./components/OnboardingStep2').then(m => ({ default: m.OnboardingStep2 })));
const OnboardingStep3 = lazyWithRetry(() => import('./components/OnboardingStep3').then(m => ({ default: m.OnboardingStep3 })));
const BookPreferenceView = lazyWithRetry(() => import('./components/BookPreferenceView').then(m => ({ default: m.BookPreferenceView || m.default })));
const BookDateTimeView = lazyWithRetry(() => import('./components/BookDateTimeView').then(m => ({ default: m.BookDateTimeView })));
const BookCheckoutView = lazyWithRetry(() => import('./components/BookCheckoutView').then(m => ({ default: m.BookCheckoutView })));
const BookConfirmedView = lazyWithRetry(() => import('./components/BookConfirmedView').then(m => ({ default: m.BookConfirmedView })));
const MyBookingsView = lazyWithRetry(() => import('./components/MyBookingsView').then(m => ({ default: m.MyBookingsView })));
const ClientProfileView = lazyWithRetry(() => import('./components/ClientProfileView').then(m => ({ default: m.ClientProfileView })));
const ManagementShell = lazyWithRetry(() => import('./components/management/ManagementShell').then(m => ({ default: m.ManagementShell })));
const AdminAuthModal = lazyWithRetry(() => import('./components/management/AdminAuthModal').then(m => ({ default: m.AdminAuthModal })));
const AuthModal = lazyWithRetry(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

const ViewLoadingFallback = () => (
  <div className="flex-1 w-full min-h-[300px] flex items-center justify-center p-8">
    <div className="w-7 h-7 border-2 border-[#bf5938] border-t-transparent rounded-full animate-spin" />
  </div>
);

const STEP_ORDER: Record<BookingStep, number> = {
  services: 0,
  addons: 0,
  preference: 1,
  datetime: 2,
  checkout: 3,
  confirmed: 4,
};

const bookingStepVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 14 : -14,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -12 : 12,
    opacity: 0,
    transition: {
      duration: 0.08,
    },
  }),
};

const tabVariants = {
  initial: { opacity: 0.88, y: 3 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.04 },
  },
};

function AtelierAppContent() {
  const {
    currentReservation,
    setCurrentReservation,
    portalMode,
    isAuthModalOpen,
    closeManagementAuth,
    isClientAuthModalOpen,
    closeClientAuthModal,
    clientAuthMode,
    services,
    activeServices,
    accoutrements: contextAccoutrements,
    appointments,
  } = useAtelier();

  // Primary navigation state
  const [screenMode, setScreenMode] = useState<ScreenMode>('app');
  const [activeTab, setActiveTab] = useState<NavigationTab>('atelier');
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  const [bookingDirection, setBookingDirection] = useState<number>(1);
  const [skippedDateTimeConfirmation, setSkippedDateTimeConfirmation] = useState<boolean>(false);

  // Booking Form State initialized with dynamic Solar date and non-expired time slot
  const initialSlot = useMemo(() => getInitialBookingSlot(appointments), []);
  const [selectedService, setSelectedService] = useState<Service | null>(() => activeServices[0] || services[0] || null);
  const [selectedDay, setSelectedDay] = useState<number>(() => initialSlot.dayNumber);
  const [selectedTime, setSelectedTime] = useState<string>(() => initialSlot.time);
  const [preferredTime, setPreferredTime] = useState<string>(() => initialSlot.time);
  const [accoutrements, setAccoutrements] = useState<Accoutrement[]>(() =>
    (contextAccoutrements || ACCOUTREMENTS_DATA).map((acc) => ({ ...acc, selected: false }))
  );

  // Sync accoutrements whenever admin modifies them
  useEffect(() => {
    if (contextAccoutrements) {
      setAccoutrements((prev) => {
        const selectedMap = new Map(prev.map((a) => [a.id, Boolean(a.selected)]));
        return contextAccoutrements.map((acc) => ({
          ...acc,
          selected: selectedMap.get(acc.id) || false,
        }));
      });
    }
  }, [contextAccoutrements]);

  // Guard against stale or deleted service selection
  useEffect(() => {
    if (selectedService && !services.some((s) => s.id === selectedService.id && s.isActive)) {
      setSelectedService(activeServices[0] || null);
    } else if (!selectedService && activeServices.length > 0) {
      setSelectedService(activeServices[0]);
    }
  }, [services, activeServices, selectedService]);

  const navigateBookingStep = useCallback((nextStep: BookingStep) => {
    const currentIdx = STEP_ORDER[bookingStep] ?? 0;
    const nextIdx = STEP_ORDER[nextStep] ?? 0;
    if (nextIdx > currentIdx) {
      hapticStepAdvance();
    } else {
      hapticLight();
    }
    setBookingDirection(nextIdx >= currentIdx ? 1 : -1);
    setBookingStep(nextStep);

    // Sync with browser history
    if (window.history?.pushState) {
      window.history.pushState({ tab: 'book', step: nextStep, screen: 'app' }, '');
    }
  }, [bookingStep]);

  // Handle browser back button (PopState)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.screen) setScreenMode(state.screen);
        if (state.tab) setActiveTab(state.tab);
        if (state.step) setBookingStep(state.step);
      } else {
        setActiveTab('atelier');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Active effective service fallback
  const currentEffectiveService = selectedService || activeServices[0] || services[0];

  // If in Management Portal Mode, render the Management Shell
  if (portalMode === 'management') {
    return (
      <main className="h-[100dvh] max-h-[100dvh] w-full bg-gradient-to-b from-white via-white via-60% to-[#fbf0ea] flex flex-col items-center justify-start sm:justify-center p-0 sm:p-5 overflow-hidden relative selection:bg-[#fdf2ee] selection:text-[#bf5938]">
        <Suspense fallback={<ViewLoadingFallback />}>
          <ManagementShell />
        </Suspense>
      </main>
    );
  }

  // Handlers for Accoutrements
  const handleToggleAccoutrement = (acc: Accoutrement) => {
    hapticSelection();
    setAccoutrements((prev) =>
      prev.map((item) =>
        item.id === acc.id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Switch tabs cleanly
  const handleTabChange = (tab: NavigationTab) => {
    hapticLight();
    setActiveTab(tab);
    if (tab === 'book' && bookingStep === 'confirmed') {
      navigateBookingStep('services');
    }
    if (window.history?.pushState) {
      window.history.pushState({ tab, step: bookingStep, screen: 'app' }, '');
    }
  };

  // Rebook an appointment with prefilled service and reset stale selections
  const handleRebook = (service?: Service) => {
    // Reset any stale accoutrements or time with safe non-expired slot
    const freshSlot = getInitialBookingSlot(appointments);
    setAccoutrements((contextAccoutrements || ACCOUTREMENTS_DATA).map((acc) => ({ ...acc, selected: false })));
    setSelectedDay(freshSlot.dayNumber);
    setSelectedTime(freshSlot.time);

    if (service) {
      setSelectedService(service);
      navigateBookingStep('datetime');
    } else {
      navigateBookingStep('services');
    }
    setActiveTab('book');
  };

  // Direct Navigator for user convenience
  const handleDirectNavigation = (mode: ScreenMode, step?: BookingStep) => {
    setScreenMode(mode);
    if (mode === 'app') {
      if (step) {
        setActiveTab('book');
        navigateBookingStep(step);
      } else {
        setActiveTab('atelier');
      }
    }
  };

  return (
    <main className="w-full h-[100dvh] min-h-[100dvh] bg-gradient-to-b from-white via-white via-60% to-[#fbf0ea] flex flex-col items-stretch justify-start p-0 m-0 overflow-hidden relative selection:bg-[#fdf2ee] selection:text-[#bf5938]">
      {/* Brand Light Ambient Blooms (White Dominant) */}
      <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-[#fedecb]/30 via-[#fdf2ee]/50 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#f3d0c4]/20 via-white to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 right-1/4 w-[420px] h-[350px] rounded-full bg-gradient-to-t from-[#fdf2ee]/40 via-white/80 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. Welcome Screen */}
      {screenMode === 'welcome' && (
        <WelcomeScreen
          onEnter={() => {
            setScreenMode('app');
            setActiveTab('book');
            navigateBookingStep('services');
          }}
          onStartOnboarding={() => setScreenMode('onboarding-1')}
        />
      )}

      {/* 2. Onboarding Steps */}
      <Suspense fallback={<ViewLoadingFallback />}>
        {screenMode === 'onboarding-1' && (
          <OnboardingStep1
            onNext={() => setScreenMode('onboarding-2')}
            onSkip={() => {
              setScreenMode('app');
              setActiveTab('atelier');
            }}
            onSignIn={() => {
              setScreenMode('app');
              setActiveTab('client');
            }}
          />
        )}

        {screenMode === 'onboarding-2' && (
          <OnboardingStep2
            onNext={() => setScreenMode('onboarding-3')}
            onBack={() => setScreenMode('onboarding-1')}
            onSkip={() => {
              setScreenMode('app');
              setActiveTab('atelier');
            }}
            onSignIn={() => {
              setScreenMode('app');
              setActiveTab('client');
            }}
          />
        )}

        {screenMode === 'onboarding-3' && (
          <OnboardingStep3
            onEnter={() => {
              setScreenMode('app');
              setActiveTab('atelier');
            }}
            onBack={() => setScreenMode('onboarding-2')}
            onSkip={() => {
              setScreenMode('app');
              setActiveTab('atelier');
            }}
            onSignIn={() => {
              setScreenMode('app');
              setActiveTab('client');
            }}
          />
        )}
      </Suspense>

      {/* 3. Main Application Mode */}
      {screenMode === 'app' && (
        <div className="relative w-full h-full flex-1 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {/* Tab 1: Atelier Home */}
            {activeTab === 'atelier' && (
              <motion.div
                key="tab-atelier"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <AtelierHomeView
                  currentReservation={currentReservation}
                  onBookClick={() => {
                    setActiveTab('book');
                    navigateBookingStep('services');
                  }}
                  onViewReservation={() => {
                    setActiveTab('my_bookings');
                  }}
                />
              </motion.div>
            )}

            {/* Tab 2: Booking Flow Steps */}
            {activeTab === 'book' && (
              <motion.div
                key="tab-book"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <div className="w-full flex justify-center overflow-hidden">
                  <AsyncErrorBoundary onReset={() => navigateBookingStep('services')}>
                    <AnimatePresence custom={bookingDirection} initial={false}>
                      {bookingStep === 'services' && (
                      <motion.div
                        key="book-step-services"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookServicesView
                          selectedService={selectedService}
                          onSelectService={(service) => setSelectedService(service)}
                          accoutrements={accoutrements}
                          onToggleAccoutrement={(id) => {
                            setAccoutrements((prev) =>
                              prev.map((item) =>
                                item.id === id ? { ...item, selected: !item.selected } : item
                              )
                            );
                          }}
                          onContinue={() => navigateBookingStep('preference')}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}

                    {bookingStep === 'preference' && currentEffectiveService && (
                      <motion.div
                        key="book-step-preference"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <Suspense fallback={<ViewLoadingFallback />}>
                          <BookPreferenceView
                            service={currentEffectiveService}
                            accoutrements={accoutrements}
                            preferredDay={selectedDay}
                            preferredTime={selectedTime}
                            onSetPreferredDay={(day) => setSelectedDay(day)}
                            onSetPreferredTime={(time) => setSelectedTime(time)}
                            onBack={() => navigateBookingStep('services')}
                            onContinue={(confirmedDay, confirmedTime) => {
                              if (!currentEffectiveService) return;
                              const effDay = confirmedDay !== undefined ? confirmedDay : selectedDay;
                              const effTime = confirmedTime || selectedTime;
                              setSelectedDay(effDay);
                              setPreferredTime(effTime);
                              setSelectedTime(effTime);

                              const totals = calculateBookingTotals(currentEffectiveService, accoutrements);
                              const availability = checkSlotAvailability(
                                effDay,
                                effTime,
                                totals.totalDuration,
                                appointments
                              );

                              const isExpired = isSlotExpired(effDay, effTime);

                              if (availability.isAvailable && !availability.isExpired && !isExpired) {
                                // Slot is available and open: skip confirmation and proceed directly to checkout!
                                setSkippedDateTimeConfirmation(true);
                                navigateBookingStep('checkout');
                              } else {
                                // Slot is expired, occupied or conflicting: show datetime confirmation & gap resolution page
                                setSkippedDateTimeConfirmation(false);
                                navigateBookingStep('datetime');
                              }
                            }}
                            onOpenProfile={() => setActiveTab('client')}
                          />
                        </Suspense>
                      </motion.div>
                    )}

                    {bookingStep === 'datetime' && currentEffectiveService && (
                      <motion.div
                        key="book-step-datetime"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <Suspense fallback={<ViewLoadingFallback />}>
                          <BookDateTimeView
                            service={currentEffectiveService}
                            selectedDay={selectedDay}
                            selectedTime={selectedTime}
                            preferredTime={preferredTime}
                            accoutrements={accoutrements}
                            onSelectDay={(day) => setSelectedDay(day)}
                            onSelectTime={(time) => setSelectedTime(time)}
                            onBackToPreference={() => navigateBookingStep('preference')}
                            onContinueToCheckout={() => {
                              setSkippedDateTimeConfirmation(false);
                              navigateBookingStep('checkout');
                            }}
                            onOpenProfile={() => setActiveTab('client')}
                          />
                        </Suspense>
                      </motion.div>
                    )}

                    {bookingStep === 'checkout' && currentEffectiveService && (
                      <motion.div
                        key="book-step-checkout"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <Suspense fallback={<ViewLoadingFallback />}>
                          <BookCheckoutView
                            service={currentEffectiveService}
                            selectedDay={selectedDay}
                            selectedTime={selectedTime}
                            accoutrements={accoutrements}
                            onBack={() => {
                              if (skippedDateTimeConfirmation) {
                                navigateBookingStep('preference');
                              } else {
                                navigateBookingStep('datetime');
                              }
                            }}
                            onConfirmBooking={(confirmedRes) => {
                              setCurrentReservation(confirmedRes);
                              navigateBookingStep('confirmed');
                            }}
                            onOpenProfile={() => setActiveTab('client')}
                          />
                        </Suspense>
                      </motion.div>
                    )}

                    {bookingStep === 'confirmed' && (
                      <motion.div
                        key="book-step-confirmed"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <Suspense fallback={<ViewLoadingFallback />}>
                          <BookConfirmedView
                            reservation={currentReservation}
                            onReturnHome={() => {
                              setActiveTab('atelier');
                              navigateBookingStep('services');
                            }}
                            onOpenProfile={() => setActiveTab('client')}
                          />
                        </Suspense>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AsyncErrorBoundary>
              </div>
            </motion.div>
            )}

            {/* Tab 3: My Bookings / Visits */}
            {(activeTab === 'my_bookings' || activeTab === 'visits') && (
              <motion.div
                key="tab-bookings"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <Suspense fallback={<ViewLoadingFallback />}>
                  <MyBookingsView
                    currentReservation={currentReservation}
                    onViewPass={() => {
                      setActiveTab('book');
                      navigateBookingStep('confirmed');
                    }}
                    onRebook={handleRebook}
                    onOpenProfile={() => setActiveTab('client')}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 4: Client Quarters / Profile */}
            {activeTab === 'client' && (
              <motion.div
                key="tab-client"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <Suspense fallback={<ViewLoadingFallback />}>
                  <ClientProfileView
                    onNavigateScreen={handleDirectNavigation}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Dock Navigation */}
          <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      )}

      {/* Admin Authentication Modal */}
      <Suspense fallback={null}>
        <AdminAuthModal isOpen={isAuthModalOpen} onClose={closeManagementAuth} />
      </Suspense>

      {/* Customer / Client Firebase Auth Modal (Google & Email) */}
      <Suspense fallback={null}>
        <AuthModal 
          isOpen={isClientAuthModalOpen} 
          onClose={closeClientAuthModal} 
          defaultMode={clientAuthMode} 
        />
      </Suspense>
    </main>
  );
}

export default function App() {
  return (
    <AtelierProvider>
      <AtelierAppContent />
    </AtelierProvider>
  );
}
