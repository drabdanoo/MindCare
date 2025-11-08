// Simple i18n implementation for MindCare
const translations = {
  en: {},
  ar: {},
  ku: {},
};

let currentLanguage = localStorage.getItem('language') || 'ar'; // Default to Arabic

// Load translations
async function loadTranslations() {
  try {
    const languages = ['en', 'ar', 'ku'];
    for (const lang of languages) {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}`);
      translations[lang] = await response.json();
    }
  } catch (error) {
    // Translation loading failed, will use fallback keys
  }
}

// Get translation
export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    value = value?.[k];
  }

  if (!value) {
    // Fallback to English if translation not found
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }

  return value || key;
}

// Set language
export function setLanguage(lang) {
  if (['en', 'ar', 'ku'].includes(lang)) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr';
    updatePageTranslations();
    // Dispatch event for other listeners
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

// Get current language
export function getLanguage() {
  return currentLanguage;
}

// Update all translations on page
function updatePageTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation !== key) {
      el.textContent = translation;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation !== key) {
      el.placeholder = translation;
    }
  });

  document.querySelectorAll('[data-i18n-value]').forEach((el) => {
    const key = el.getAttribute('data-i18n-value');
    const translation = t(key);
    if (translation !== key) {
      el.value = translation;
    }
  });
}

// Initialize i18n
export async function initI18n() {
  await loadTranslations();
  setLanguage(currentLanguage);
  return currentLanguage;
}
