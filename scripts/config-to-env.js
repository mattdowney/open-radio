#!/usr/bin/env node

/**
 * Convert config.json to environment variables
 * This script reads config.json and outputs environment variables
 * that can be used in .env.local or deployment platforms
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'config.json');

if (!fs.existsSync(configPath)) {
  console.error(
    '❌ config.json not found. Please check that the config.json file exists in your project root.'
  );
  process.exit(1);
}

try {
  const configFile = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configFile);

  console.log('# Generated from config.json');
  console.log('# Add these to your .env.local file or deployment platform\n');

  // App configuration
  if (config.app) {
    if (config.app.name) {
      console.log(`NEXT_PUBLIC_APP_NAME="${config.app.name}"`);
    }
    if (config.app.description) {
      console.log(`NEXT_PUBLIC_APP_DESCRIPTION="${config.app.description}"`);
    }
    if (config.app.url) {
      console.log(`NEXT_PUBLIC_APP_URL="${config.app.url}"`);
    }
  }

  // Branding configuration
  if (config.branding) {
    console.log(`NEXT_PUBLIC_BRANDING_ENABLED=${config.branding.enabled ? 'true' : 'false'}`);
    if (config.branding.logoUrl) {
      console.log(`NEXT_PUBLIC_BRANDING_LOGO_URL="${config.branding.logoUrl}"`);
    }
    if (config.branding.linkUrl) {
      console.log(`NEXT_PUBLIC_BRANDING_LINK_URL="${config.branding.linkUrl}"`);
    }
  }

  // Features configuration
  if (config.features) {
    console.log(`NEXT_PUBLIC_ANALYTICS_ENABLED=${config.features.analytics ? 'true' : 'false'}`);
    console.log(`NEXT_PUBLIC_FIREBASE_ENABLED=${config.features.firebase ? 'true' : 'false'}`);
  }

  // Social media configuration
  if (config.social) {
    if (config.social.ogImageUrl) {
      console.log(`NEXT_PUBLIC_OG_IMAGE_URL="${config.social.ogImageUrl}"`);
    }
    if (config.social.twitterImageUrl) {
      console.log(`NEXT_PUBLIC_TWITTER_IMAGE_URL="${config.social.twitterImageUrl}"`);
    }
  }

  console.log('\n# To use these variables:');
  console.log('# 1. Copy the output above to your .env.local file');
  console.log('# 2. Or pipe this output directly: node scripts/config-to-env.js >> .env.local');
  console.log('# 3. Add your API keys and credentials manually to .env.local');
  console.log('# 4. Restart your development server: npm run dev');
  console.log(
    '\n# Note: YouTube API keys and Firebase credentials should be added manually to .env.local'
  );
} catch (error) {
  console.error('❌ Error reading config.json:', error.message);
  console.error('Please check that your config.json file is valid JSON.');
  process.exit(1);
}
