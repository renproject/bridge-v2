/**
 * The bundles here are configured so that each locale only requires loading a single webpack chunk.
 */

const bundles = {
  // @ts-ignore
  de: () => import(/* webpackChunkName: "de" */ "./locales/de-DE.json"),
  en: () => import(/* webpackChunkName: "en" */ "./locales/en.json"),
  es: () => import(/* webpackChunkName: "es" */ "./locales/es-ES.json"),
  pt: () => import(/* webpackChunkName: "pt" */ "./locales/pt-PT.json"),
  zh: () => import(/* webpackChunkName: "zh" */ "./locales/zh-CN.json"),
  ru: () => import(/* webpackChunkName: "ru" */ "./locales/ru-RU.json"),
};

// generate whitelist for i18next
export const availableLocales = Object.keys(bundles);
export const enabledLocales = ["en"];

export const nativeLanguageNames: Record<string, string> = {
  en: "English",
  de: "Deutsh",
  pt: "Português",
  es: "Español",
  ru: "русский",
  fe: "Française",
  pl: "Polski",
  zh: "中国人",
};

export default bundles as Record<string, any>;
