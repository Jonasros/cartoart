'use client';

import { showCookiePreferences } from '@/components/CookieConsent';

export function CookiePreferencesButton() {
  return (
    <button
      onClick={showCookiePreferences}
      className="mt-2 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-lg border border-stone-200 dark:border-stone-600 transition-colors"
    >
      Manage Cookie Preferences
    </button>
  );
}
