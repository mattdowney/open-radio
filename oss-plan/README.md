# MD Radio → Open Source Radio 🎵

## Overview
This document outlines the comprehensive plan to transform MD Radio from a personal project into a production-ready, open source radio application that others can use, learn from, and contribute to.

## Current State Assessment

### ✅ Strengths
- **Solid Architecture**: Well-structured Next.js 14 app with TypeScript
- **Modern React Patterns**: Context API + useReducer for state management
- **Clean Code**: No debug code, proper error handling, strong typing
- **Beautiful UI**: Gorgeous vinyl record visualization with detailed CSS
- **Working Features**: YouTube integration, real-time listener count, track queuing

### ⚠️ Issues to Address
- **Personal Branding**: Hardcoded references to "Matt Downey" throughout
- **Component Organization**: Inconsistent structure and naming
- **Duplicate Code**: Two YouTube service implementations
- **Unused Dependencies**: 7+ packages not being used
- **Missing Tests**: Zero test coverage
- **No Documentation**: Limited setup instructions for contributors

### 🚫 Blockers for OSS
- **Private Files**: .cursorrules, personal task lists exposed
- **Hardcoded Config**: Playlist ID, branding embedded in components
- **No License**: Missing proper open source license
- **No Contributor Guidelines**: No guidance for community contributions

## 5-Phase Roadmap

### [Phase 1: Clean Up & Reorganize](./phase-1-cleanup.md) 🧹
**Timeline: 1-2 days**
- Remove unused dependencies and personal files
- Consolidate duplicate code
- Reorganize component structure
- Make app configurable

### [Phase 2: Documentation & Community](./phase-2-documentation.md) 📚
**Timeline: 1-2 days**  
- Add LICENSE and contributor guidelines
- Create comprehensive README with screenshots
- Set up issue templates and community standards
- Document architecture and setup process

### [Phase 3: Code Quality](./phase-3-quality.md) ⚡
**Timeline: 2-3 days**
- Add linting and formatting rules
- Set up basic test coverage
- Create CI/CD pipeline
- Add error monitoring

### [Phase 4: Extensibility](./phase-4-extensibility.md) 🔧
**Timeline: 3-4 days**
- Create plugin/theme system
- Abstract playlist providers
- Make UI components themeable
- Add configuration options

### [Phase 5: Launch Preparation](./phase-5-launch.md) 🚀
**Timeline: 1-2 days**
- Set up demo deployment
- Create marketing materials
- Prepare announcements
- Launch community spaces

## Quick Wins Checklist
See [quick-wins.md](./quick-wins.md) for immediate actionable items that can be done before phases begin.

## Success Criteria

### Technical Goals
- [ ] Zero breaking changes for existing users
- [ ] 90%+ test coverage on critical paths
- [ ] Lighthouse score 95+ on all metrics
- [ ] Support for multiple playlist providers
- [ ] Configurable theming system

### Community Goals
- [ ] 50+ GitHub stars in first month
- [ ] 5+ external contributors in first quarter
- [ ] Featured in awesome-nextjs or similar lists
- [ ] Clear path for new contributors to get started

### Long-term Vision
Transform this into the go-to open source solution for creating beautiful, customizable radio applications with modern web technologies.

## Getting Started
1. Review the current assessment above
2. Start with [Quick Wins](./quick-wins.md) for immediate improvements
3. Follow phases sequentially, tracking progress in each phase file
4. Test thoroughly between phases to avoid regression

## Timeline Summary
- **Quick Wins**: Half day
- **Total Phases**: 8-12 days of focused work
- **Launch Ready**: 2 weeks from start

---

*Last updated: September 2025*