# Phase 1: Clean Up & Reorganize 🧹

## Objective
Transform the codebase from a personal project to a clean, organized foundation ready for open source contribution. Remove personal artifacts, eliminate dead code, and establish consistent patterns.

**Timeline:** 1-2 days  
**Priority:** CRITICAL (must complete before any other phases)

## Tasks

### 1. Remove Unused Dependencies
**Time Estimate:** 30 minutes

#### Dependencies to Remove:
- [ ] `gl-react` - WebGL library not used
- [ ] `gl-react-dom` - WebGL DOM library not used  
- [ ] `@react-three/fiber` - React Three.js renderer not used
- [ ] `@react-three/drei` - Three.js helpers not used
- [ ] `three` - 3D graphics library not used
- [ ] `@types/uuid` - Type definitions for unused UUID library
- [ ] `vercel` - CLI tool (should be dev dependency or removed)

#### Commands:
```bash
npm uninstall gl-react gl-react-dom @react-three/fiber @react-three/drei three @types/uuid vercel
npm audit
npm run build  # Verify nothing breaks
```

### 2. Remove Personal Files
**Time Estimate:** 15 minutes

#### Files to Delete:
- [ ] `.cursorrules` - Personal Cursor IDE configuration
- [ ] `md.radio-task-list.md` - Personal task tracking
- [ ] `tsconfig.tsbuildinfo` - Build artifact (should be in .gitignore)

#### Commands:
```bash
rm .cursorrules md.radio-task-list.md tsconfig.tsbuildinfo
echo "tsconfig.tsbuildinfo" >> .gitignore
```

### 3. Consolidate Duplicate YouTube Services
**Time Estimate:** 45 minutes

#### Current Issue:
- `app/lib/api/youtube.ts` - 146 lines, batch processing, caching
- `app/services/youtubeService.ts` - More comprehensive, better error handling

#### Action Plan:
- [ ] Analyze usage of both services across codebase
- [ ] Merge best features into `services/youtubeService.ts`
- [ ] Remove `app/lib/api/youtube.ts`  
- [ ] Update all imports to use consolidated service
- [ ] Test all YouTube functionality

#### Key Features to Preserve:
- Batch processing for API efficiency
- Comprehensive error handling
- Video details caching
- Title cleaning logic

### 4. Reorganize Component Structure
**Time Estimate:** 1 hour

#### Current Structure Issues:
```
app/components/
├── RadioApp.tsx          # Root level - confusing
├── RadioPlayer.tsx       # Root level - confusing  
├── layout/
├── media/
├── player/
└── ui/
```

#### Proposed New Structure:
```
app/components/
├── player/               # All player-related components
│   ├── RadioPlayer.tsx   # Main player component
│   ├── PlayerControls.tsx
│   ├── YouTubePlayerManager.tsx
│   └── VolumeControl.tsx
├── visualization/        # Visual components
│   ├── VinylRecord.tsx
│   ├── CompactDisc.tsx
│   └── AlbumCover.tsx
├── media/               # Media information display
│   ├── TrackInfo.tsx    # Rename from MarqueeTitle
│   ├── TrackRating.tsx
│   └── ListenerCount.tsx
├── layout/              # Layout components
│   ├── RadioLayout.tsx
│   └── MainContent.tsx
└── ui/                  # Reusable UI components
    ├── BlurredAlbumBackground.tsx
    ├── Badge.tsx
    ├── Loading.tsx
    ├── Skeleton.tsx
    └── ErrorBoundary.tsx
```

#### Migration Tasks:
- [ ] Move `RadioPlayer.tsx` to `player/` directory
- [ ] Create `visualization/` directory and move visual components
- [ ] Rename `MarqueeTitle.tsx` to `TrackInfo.tsx` for clarity
- [ ] Update all import statements
- [ ] Update `RadioApp.tsx` to have clearer component separation

### 5. Make App Configurable
**Time Estimate:** 45 minutes

#### Environment Configuration:
Add to `.env.local.example`:
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Open Radio
NEXT_PUBLIC_APP_DESCRIPTION=A beautiful open source radio application
NEXT_PUBLIC_DEFAULT_PLAYLIST_ID=PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx

# Branding
NEXT_PUBLIC_ENABLE_BRANDING=false
NEXT_PUBLIC_CUSTOM_TITLE=
NEXT_PUBLIC_CUSTOM_URL=
```

#### Code Changes:
- [ ] Replace hardcoded `PLAYLIST_ID` in `RadioPlayer.tsx`
- [ ] Make metadata in `layout.tsx` configurable
- [ ] Create `config/app.ts` for centralized configuration
- [ ] Add fallback values for missing environment variables

### 6. Fix File Naming Consistency
**Time Estimate:** 30 minutes

#### Current Inconsistencies:
- Some files use PascalCase, others use kebab-case
- Component files should be PascalCase
- Utility files should be kebab-case

#### Actions:
- [ ] Ensure all React components use PascalCase
- [ ] Ensure all utility/config files use kebab-case
- [ ] Update imports throughout codebase
- [ ] Verify build still works

### 7. Clean Up Imports and Dependencies
**Time Estimate:** 30 minutes

#### Tasks:
- [ ] Remove unused imports throughout codebase
- [ ] Use relative imports consistently (`@/` alias vs `../`)
- [ ] Remove any remaining references to removed dependencies
- [ ] Organize imports by: React, third-party, local

#### Tools:
```bash
# Find unused imports (if using VS Code)
# Use "Organize Imports" command on all files

# Check for unused variables
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
```

## Testing & Validation

### After Each Change:
- [ ] `npm run build` - Ensure app builds without errors
- [ ] `npm run dev` - Test in development mode
- [ ] Manual testing of core functionality:
  - [ ] Music plays correctly
  - [ ] Track queue advances
  - [ ] Volume controls work  
  - [ ] Listener count updates
  - [ ] Album art displays

### Final Validation:
- [ ] All imports resolve correctly
- [ ] No console errors in browser
- [ ] YouTube functionality works
- [ ] Firebase connection works
- [ ] App is configurable via environment variables

## Success Criteria
- [ ] Zero unused dependencies in package.json
- [ ] No personal files in repository
- [ ] Single YouTube service implementation
- [ ] Logical component organization
- [ ] App configuration through environment variables
- [ ] Consistent file naming throughout
- [ ] All functionality works as before

## Dependencies
None - this phase establishes the foundation for all other phases.

## Notes
- Back up current state before beginning major refactors
- Test thoroughly at each step to avoid accumulating issues
- Document any breaking changes for future reference
- Consider creating a commit after each major section for easy rollback