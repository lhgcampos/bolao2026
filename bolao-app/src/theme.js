export const THEME_PREFERENCE_KEY = 'bolao26_theme_preference';
export const THEME_PREFERENCE_OPTIONS = ['system', 'light', 'dark'];

export const normalizeThemePreference = (value) => (
  THEME_PREFERENCE_OPTIONS.includes(value) ? value : 'system'
);

export const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredThemePreference = () => {
  if (typeof window === 'undefined') return 'system';

  try {
    return normalizeThemePreference(window.localStorage.getItem(THEME_PREFERENCE_KEY));
  } catch {
    return 'system';
  }
};

export const resolveThemePreference = (preference, systemTheme = getSystemTheme()) => {
  const normalizedPreference = normalizeThemePreference(preference);
  return normalizedPreference === 'system' ? systemTheme : normalizedPreference;
};

export const applyThemeToDocument = (resolvedTheme) => {
  if (typeof document === 'undefined') return;

  const nextTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  if (document.body) {
    document.body.dataset.theme = nextTheme;
  }
};
