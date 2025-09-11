import { getConfig, getConfigSync } from './configReader';

let appConfigCache: any = null;

export function getAppConfigSync() {
  if (appConfigCache) {
    return appConfigCache;
  }

  const config = getConfigSync();

  appConfigCache = {
    name: config.app.name,
    description: config.app.description,
    url: config.app.url,
    enableAnalytics: config.features.analytics,
    enableFirebase: config.features.firebase,
    branding: {
      enabled: config.branding.enabled,
      logoUrl: config.branding.logoUrl,
      linkUrl: config.branding.linkUrl,
    },
    ui: {
      listenerText: config.ui.listenerText,
      liveText: config.ui.liveText,
      themeDrawerBackground: config.ui.themeDrawerBackground,
    },
  };

  return appConfigCache;
}

export async function getAppConfig() {
  const config = await getConfig();

  // Update cache with file-loaded config
  appConfigCache = {
    name: config.app.name,
    description: config.app.description,
    url: config.app.url,
    enableAnalytics: config.features.analytics,
    enableFirebase: config.features.firebase,
    branding: {
      enabled: config.branding.enabled,
      logoUrl: config.branding.logoUrl,
      linkUrl: config.branding.linkUrl,
    },
    ui: {
      listenerText: config.ui.listenerText,
      liveText: config.ui.liveText,
      themeDrawerBackground: config.ui.themeDrawerBackground,
    },
  };

  return appConfigCache;
}

// Legacy export for backwards compatibility
export const appConfig = getAppConfigSync();
