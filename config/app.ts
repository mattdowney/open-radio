export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Open Radio',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A beautiful radio experience',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://openradio.dev',
  enableAnalytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  enableFirebase: process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'true',
  branding: {
    enabled: process.env.NEXT_PUBLIC_BRANDING_ENABLED !== 'false', // Show by default
    logoUrl: process.env.NEXT_PUBLIC_BRANDING_LOGO_URL || '/logo.svg', // Default to built-in logo
    linkUrl: process.env.NEXT_PUBLIC_BRANDING_LINK_URL,
  },
};
