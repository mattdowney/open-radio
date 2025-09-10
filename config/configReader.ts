/**
 * Configuration reader that loads from config.json with environment variable overrides
 * Environment variables take precedence to work well with deployment platforms
 */

interface ConfigFile {
  app: {
    name: string;
    description: string;
    url: string;
  };
  branding: {
    enabled: boolean;
    logoUrl: string;
    linkUrl: string;
  };
  features: {
    analytics: boolean;
    firebase: boolean;
  };
  ui: {
    listenerText: string;
    liveText: string;
  };
  social: {
    ogImageUrl: string;
    twitterImageUrl: string;
  };
}

let configCache: ConfigFile | null = null;
let fileConfigCache: Partial<ConfigFile> | null = null;

/**
 * Load configuration from config.json file (server-side only)
 */
async function loadConfigFromFile(): Promise<Partial<ConfigFile>> {
  if (fileConfigCache !== null) {
    return fileConfigCache;
  }

  // Only load file on server side
  if (typeof window === 'undefined') {
    try {
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const configPath = join(process.cwd(), 'config.json');
      const configFile = readFileSync(configPath, 'utf-8');
      fileConfigCache = JSON.parse(configFile);
      return fileConfigCache!;
    } catch (error) {
      console.warn('Could not load config.json, using defaults:', error);
      fileConfigCache = {};
      return fileConfigCache;
    }
  }

  // Client-side: return empty config (rely on env vars or defaults)
  fileConfigCache = {};
  return fileConfigCache;
}

/**
 * Get configuration synchronously (client-side safe)
 * Uses environment variables with defaults
 */
export function getConfigSync(): ConfigFile {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  // Build config from environment variables with defaults
  const config: ConfigFile = {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Open Radio',
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A beautiful radio experience',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://openradio.dev',
    },
    branding: {
      enabled: process.env.NEXT_PUBLIC_BRANDING_ENABLED !== 'false',
      logoUrl: process.env.NEXT_PUBLIC_BRANDING_LOGO_URL || '/logo.svg',
      linkUrl: process.env.NEXT_PUBLIC_BRANDING_LINK_URL || '',
    },
    features: {
      analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      firebase: process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'true',
    },
    ui: {
      listenerText: process.env.NEXT_PUBLIC_LISTENER_TEXT || 'vibing',
      liveText: process.env.NEXT_PUBLIC_LIVE_TEXT || 'LIVE',
    },
    social: {
      ogImageUrl: process.env.NEXT_PUBLIC_OG_IMAGE_URL || '/og-image.png',
      twitterImageUrl: process.env.NEXT_PUBLIC_TWITTER_IMAGE_URL || '/og-image.png',
    },
  };

  // Cache the config
  configCache = config;

  return config;
}

/**
 * Get configuration with the following precedence:
 * 1. Environment variables (highest priority)
 * 2. config.json file (server-side only)
 * 3. Hardcoded defaults (lowest priority)
 */
export async function getConfig(): Promise<ConfigFile> {
  // Load base config from file (server-side only)
  const fileConfig = await loadConfigFromFile();

  // Build config with environment variable overrides and file config
  const config: ConfigFile = {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || fileConfig.app?.name || 'Open Radio',
      description:
        process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
        fileConfig.app?.description ||
        'A beautiful radio experience',
      url: process.env.NEXT_PUBLIC_APP_URL || fileConfig.app?.url || 'https://openradio.dev',
    },
    branding: {
      enabled:
        process.env.NEXT_PUBLIC_BRANDING_ENABLED !== 'false' &&
        (fileConfig.branding?.enabled ?? true),
      logoUrl:
        process.env.NEXT_PUBLIC_BRANDING_LOGO_URL || fileConfig.branding?.logoUrl || '/logo.svg',
      linkUrl: process.env.NEXT_PUBLIC_BRANDING_LINK_URL || fileConfig.branding?.linkUrl || '',
    },
    features: {
      analytics:
        process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' ||
        (fileConfig.features?.analytics ?? false),
      firebase:
        process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'true' ||
        (fileConfig.features?.firebase ?? false),
    },
    ui: {
      listenerText:
        process.env.NEXT_PUBLIC_LISTENER_TEXT || fileConfig.ui?.listenerText || 'vibing',
      liveText: process.env.NEXT_PUBLIC_LIVE_TEXT || fileConfig.ui?.liveText || 'LIVE',
    },
    social: {
      ogImageUrl:
        process.env.NEXT_PUBLIC_OG_IMAGE_URL || fileConfig.social?.ogImageUrl || '/og-image.png',
      twitterImageUrl:
        process.env.NEXT_PUBLIC_TWITTER_IMAGE_URL ||
        fileConfig.social?.twitterImageUrl ||
        '/og-image.png',
    },
  };

  // Update the cache with the file-loaded config
  configCache = config;

  return config;
}
