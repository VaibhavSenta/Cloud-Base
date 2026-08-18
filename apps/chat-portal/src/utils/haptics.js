/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
/**
 * Unified Haptic Feedback utility simulating iOS Taptic Engine feedback.
 */
export const triggerHaptic = {
  selection: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  },
  success: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15, 60, 15]);
    }
  },
  warning: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 80, 15]);
    }
  },
  error: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15, 40, 15, 40, 35]);
    }
  },
  impact: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(25);
    }
  }
};
