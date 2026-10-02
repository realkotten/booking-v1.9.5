/**
 * Mobile Haptic Feedback Utilities using standard Web Vibration API (navigator.vibrate).
 * Provides subtle, tactile physical feedback across mobile devices during the booking flow.
 */

export type HapticFeedbackType = 
  | 'light' 
  | 'selection' 
  | 'medium' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'toggle';

/**
 * Safely triggers vibration on supported mobile devices.
 * Gracefully ignores unsupported environments, desktop browsers, or restricted contexts.
 */
export function triggerHaptic(type: HapticFeedbackType = 'light'): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
      return false;
    }

    switch (type) {
      case 'light':
        return navigator.vibrate(10);
      case 'selection':
      case 'toggle':
        return navigator.vibrate(14);
      case 'medium':
        return navigator.vibrate(28);
      case 'success':
        // High-end double pulsation for successful confirmation
        return navigator.vibrate([25, 45, 35]);
      case 'warning':
      case 'error':
        // Distinct alert buzz
        return navigator.vibrate([40, 60, 40]);
      default:
        return navigator.vibrate(12);
    }
  } catch (err) {
    // Silently capture any permissions policy or environment restrictions
    console.debug('Haptic feedback ignored:', err);
    return false;
  }
}

/** Convenience helper for quick light tap (chip, item, button tap) */
export const hapticLight = () => triggerHaptic('light');

/** Convenience helper for item selection (service card, date chip, time slot) */
export const hapticSelection = () => triggerHaptic('selection');

/** Convenience helper for step progression (next button, continue) */
export const hapticStepAdvance = () => triggerHaptic('medium');

/** Convenience helper for appointment creation confirmation */
export const hapticSuccess = () => triggerHaptic('success');

/** Convenience helper for validation or conflict alerts */
export const hapticWarning = () => triggerHaptic('warning');

/** Convenience helper for error feedback */
export const hapticError = () => triggerHaptic('error');
