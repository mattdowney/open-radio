# Quick Wins Checklist ⚡

## Overview
These are immediate, low-effort improvements that can be made before starting the formal phases. Complete these first to avoid embarrassment and create a better foundation for the larger restructuring work.

**Timeline:** Half day  
**Priority:** CRITICAL (do these FIRST)

## Immediate Fixes (30 minutes)

### Remove Personal Files
- [ ] Delete `.cursorrules` (personal Cursor IDE config)
- [ ] Delete `md.radio-task-list.md` (personal task tracking)
- [ ] Delete `tsconfig.tsbuildinfo` (build artifact)
- [ ] Add `tsconfig.tsbuildinfo` to `.gitignore`

```bash
rm .cursorrules md.radio-task-list.md tsconfig.tsbuildinfo
echo "tsconfig.tsbuildinfo" >> .gitignore
```

### Package.json Updates
- [ ] Change `"private": true` to `"private": false`
- [ ] Update name to something generic like `"open-radio"`
- [ ] Update description to remove personal branding
- [ ] Add proper repository URL (when ready)
- [ ] Add keywords for discoverability

```json
{
  "name": "open-radio",
  "description": "A beautiful open source radio application built with Next.js",
  "private": false,
  "keywords": ["radio", "music", "nextjs", "react", "typescript", "youtube"]
}
```

### Environment Configuration
- [ ] Update `.env.local.example` with generic placeholders
- [ ] Remove any personal API keys or references
- [ ] Add comments explaining each environment variable
- [ ] Verify `.env.local` is in `.gitignore` (it should be)

## Branding Cleanup (45 minutes)

### Layout.tsx Metadata
- [ ] Replace "Matt Downey — Radio" with configurable app name
- [ ] Update description to be generic
- [ ] Replace personal URLs with configurable ones
- [ ] Update OpenGraph images to generic/placeholder images

```typescript
// Before:
title: 'Matt Downey — Radio'

// After:
title: process.env.NEXT_PUBLIC_APP_NAME || 'Open Radio'
```

### Remove Hardcoded Personal References
- [ ] Search codebase for "Matt Downey" and replace
- [ ] Search for "mattdowney.com" and make configurable
- [ ] Update any hardcoded personal social links
- [ ] Remove or generalize any personal branding

```bash
# Find all personal references
grep -r "Matt Downey" app/ --include="*.ts" --include="*.tsx"
grep -r "mattdowney" app/ --include="*.ts" --include="*.tsx"
```

## Configuration Improvements (30 minutes)

### Make Playlist Configurable
- [ ] Replace hardcoded `PLAYLIST_ID` in `RadioPlayer.tsx`
- [ ] Add `NEXT_PUBLIC_DEFAULT_PLAYLIST_ID` to environment variables
- [ ] Add fallback playlist ID for demo purposes

```typescript
// In RadioPlayer.tsx
const PLAYLIST_ID = process.env.NEXT_PUBLIC_DEFAULT_PLAYLIST_ID || 'PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx';
```

### Add Basic App Configuration
- [ ] Create simple config object for app settings
- [ ] Make app name configurable
- [ ] Add toggle for analytics (Vercel Analytics)
- [ ] Make Firebase features optional

```typescript
// config/app.ts
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Open Radio',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A beautiful radio experience',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableFirebase: process.env.NEXT_PUBLIC_ENABLE_FIREBASE === 'true',
};
```

## Documentation Quick Fixes (15 minutes)

### README Updates
- [ ] Remove personal references from current README
- [ ] Add note about work-in-progress open source transition
- [ ] Update setup instructions to be more generic
- [ ] Add placeholder for future comprehensive documentation

```markdown
# Open Radio 🎵

> **Note**: This project is currently transitioning to open source. 
> Comprehensive documentation and setup guides are coming soon!

A beautiful radio application built with Next.js, React, and TypeScript.

## Current Status
- ✅ Core functionality complete
- 🚧 Open source preparation in progress
- 📚 Documentation being enhanced
- 🎯 Community features planned

[Rest of existing README with personal references removed]
```

### Add Temporary Notices
- [ ] Add "work in progress" notice to main README
- [ ] Create placeholder LICENSE file
- [ ] Add basic CONTRIBUTING.md placeholder
- [ ] Update repository description on GitHub

## Code Quality Quick Wins (30 minutes)

### Remove Dead Code
- [ ] Check for any unused imports
- [ ] Remove any commented-out code
- [ ] Clean up any debug console.logs (if any found)
- [ ] Remove unused files or components

### Fix Obvious Issues
- [ ] Run `npm run lint` and fix any obvious issues
- [ ] Run `npm run build` and fix any build warnings
- [ ] Check for any TypeScript errors
- [ ] Verify all pages load correctly

```bash
npm run lint
npm run build
npm run type-check
```

## Security Quick Check (15 minutes)

### Verify No Secrets Exposed
- [ ] Double-check no API keys are hardcoded in source
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check that all sensitive config uses environment variables
- [ ] Review any external URLs or API calls

### Basic Security Headers
- [ ] Verify Next.js security headers are enabled
- [ ] Check that Firebase rules are not overly permissive
- [ ] Ensure CORS is properly configured

## Testing Quick Wins (15 minutes)

### Manual Testing
- [ ] Test basic playback functionality
- [ ] Verify track queue works
- [ ] Check volume controls
- [ ] Test responsive design on mobile
- [ ] Verify error boundaries work

### Environment Testing
- [ ] Test with empty/missing environment variables
- [ ] Verify graceful degradation when APIs are unavailable
- [ ] Test with different browsers

## Git & Repository Cleanup (15 minutes)

### Repository Settings
- [ ] Update repository description
- [ ] Add relevant topics/tags
- [ ] Enable issues and discussions (when ready)
- [ ] Set up basic repository structure

### Git History
- [ ] Consider if any sensitive commits need addressing
- [ ] Ensure `.env.local` was never committed
- [ ] Review recent commits for any personal information

### Branch Management
- [ ] Create this `oss` branch for OSS preparation work
- [ ] Plan merge strategy back to main
- [ ] Consider creating development branch structure

## Validation Checklist

After completing quick wins, verify:
- [ ] App builds without errors: `npm run build`
- [ ] App runs in development: `npm run dev`
- [ ] No personal references in public code
- [ ] All environment variables properly configured
- [ ] Basic functionality still works
- [ ] No obvious security issues
- [ ] Repository looks professional to external viewers

## Before Moving to Phase 1

### Final Checks:
- [ ] All quick wins completed and tested
- [ ] Repository ready for external viewing
- [ ] No embarrassing personal artifacts
- [ ] Basic functionality verified
- [ ] Ready to begin systematic restructuring

### Commit Strategy:
```bash
# Commit quick wins before starting Phase 1
git add .
git commit -m "Quick wins: Remove personal branding and prepare for OSS"
git push origin oss
```

## Notes
- These changes should be non-breaking
- Focus on removing embarrassing elements first
- Don't worry about perfection - Phase 1 will handle the systematic cleanup
- Test basic functionality after each section
- Document any issues discovered for Phase 1 planning

---

*Complete these quick wins before proceeding to Phase 1 for the best results.*