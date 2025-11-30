# 🔧 Code Improvements Plan

**Addressing minor observations from repository health check**

---

## 📋 Issues Identified

### 1. TypeScript `any` Types
- **Impact:** Reduces type safety
- **Priority:** Medium
- **Effort:** Low-Medium

### 2. Console Statements
- **Impact:** Should use proper logging
- **Priority:** Low
- **Effort:** Low

---

## 🎯 Improvement Strategy

### Phase 1: Replace `any` Types (High Priority)

#### Files to Update:
1. `src/core-runner.ts` - `statistics: any`
2. `src/types.ts` - Various `any` usages
3. `src/utils/output-generator.ts` - `artifacts: any`
4. Other utility files with `any` types

#### Approach:
- Replace `any` with proper interfaces/types
- Use `unknown` for truly unknown types
- Create specific types for API responses
- Use generics where appropriate

### Phase 2: Improve Logging (Low Priority)

#### Options:
1. **Keep console statements** (simplest)
   - Add log levels (debug, info, warn, error)
   - Wrap in utility functions

2. **Use Apify's logging** (recommended)
   - Already available via `Actor` SDK
   - Better for production
   - Structured logging

3. **Add logging library** (optional)
   - Winston, Pino, or similar
   - More features, but adds dependency

---

## 📝 Detailed Plan

### Step 1: Fix `any` Types

#### `src/core-runner.ts`
```typescript
// Before:
statistics: any;

// After:
statistics: StatisticsData;
```

#### `src/types.ts`
```typescript
// Before:
data?: any;
requestExample?: any;
responseExample?: any;

// After:
data?: Record<string, unknown>;
requestExample?: Record<string, unknown>;
responseExample?: Record<string, unknown>;
```

#### `src/utils/output-generator.ts`
```typescript
// Before:
artifacts: any;

// After:
artifacts: GeneratedArtifacts;
```

### Step 2: Improve Logging

#### Option A: Use Apify's Logging (Recommended)
```typescript
// Before:
console.log('Starting discovery...');
console.error('Error occurred');

// After:
Actor.log.info('Starting discovery...');
Actor.log.error('Error occurred');
```

#### Option B: Create Logging Utility
```typescript
// src/utils/logger.ts
export const logger = {
    info: (msg: string, data?: unknown) => {
        if (Actor.isAtHome()) {
            Actor.log.info(msg, data);
        } else {
            console.log(`[INFO] ${msg}`, data);
        }
    },
    error: (msg: string, error?: unknown) => {
        if (Actor.isAtHome()) {
            Actor.log.error(msg, error);
        } else {
            console.error(`[ERROR] ${msg}`, error);
        }
    },
    // ... other levels
};
```

---

## ✅ Implementation Checklist

### Type Safety Improvements
- [ ] Replace `statistics: any` with proper type
- [ ] Replace `artifacts: any` with proper type
- [ ] Replace `data?: any` with `Record<string, unknown>`
- [ ] Replace `requestExample?: any` with proper type
- [ ] Replace `responseExample?: any` with proper type
- [ ] Create `GeneratedArtifacts` interface
- [ ] Create `StatisticsData` interface
- [ ] Update all utility files

### Logging Improvements
- [ ] Create logging utility (`src/utils/logger.ts`)
- [ ] Replace `console.log` with `logger.info`
- [ ] Replace `console.error` with `logger.error`
- [ ] Replace `console.warn` with `logger.warn`
- [ ] Replace `console.debug` with `logger.debug`
- [ ] Test logging in both Apify and local environments

---

## 🚀 Quick Wins (Do First)

1. **Create proper types for statistics** (15 min)
2. **Create proper types for artifacts** (15 min)
3. **Replace `data?: any` with `Record<string, unknown>`** (10 min)
4. **Create logging utility** (20 min)
5. **Replace console statements in main.ts** (10 min)

**Total Time:** ~70 minutes

---

## 📊 Expected Benefits

### Type Safety:
- ✅ Better IDE autocomplete
- ✅ Catch errors at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring

### Logging:
- ✅ Structured logging in Apify
- ✅ Better debugging
- ✅ Log levels (filter by severity)
- ✅ Production-ready

---

## 🎯 Priority Order

1. **High Priority:**
   - Replace `any` types with proper interfaces
   - Create `StatisticsData` type
   - Create `GeneratedArtifacts` type

2. **Medium Priority:**
   - Replace `data?: any` with `Record<string, unknown>`
   - Create logging utility

3. **Low Priority:**
   - Replace all console statements
   - Add log levels
   - Consider logging library

---

**Ready to implement?** Let me know and I'll start fixing these issues! 🚀

