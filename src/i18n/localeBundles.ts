/**
 * The bundles here are configured so that each locale only requires loading a single webpack chunk.
 */

const bundles = {
  // @ts-ignore
  en: () => import(/* webpackChunkName: "en" */ "./locales/en.json"),
  de: () => import(/* webpackChunkName: "es" */ "./locales/de.json"),
  // zh: () => import(/* webpackChunkName: "zh" */ './locales/zh.json'),
};

// generate whitelist for i18next
export const availableLocales = Object.keys(bundles);

export const nativeLanguageNames: Record<string, string> = {
  en: "English",
  de: "Deutsh",
};

export default bundles as Record<string, any>;
