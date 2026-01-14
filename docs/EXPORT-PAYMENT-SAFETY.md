# Export & Payment Safety System

> **Critical System Document** - Ensures payment flow integrity
> Last Updated: 2025-01-14
> Status: 🟢 CRITICAL FIXES COMPLETED

## Executive Summary

This document tracks the export and payment flow safety system for Waymarker. The goal is to ensure that when a customer pays for a poster or sculpture export, they receive **exactly** what they purchased - not a stale, outdated, or incorrect design.

---

## Current Issues (Priority Order)

### 🔴 CRITICAL - Must Fix Before Production

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| BUG-001 | **Stale Config on Checkout** | User pays for old design, gets wrong export | ✅ FIXED |
| BUG-002 | **Auto-Export Race Condition** | Export never triggers after payment | ✅ FIXED |
| BUG-003 | **Map Version Mismatch** | User edits map after purchase, download loads wrong version | ✅ FIXED |
| BUG-008 | **Stripe Metadata Size Limit** | Full config exceeds 500 char limit, checkout fails | ✅ FIXED |

### 🟠 HIGH - Should Fix

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| BUG-004 | **Loading Tiles Infinite Loop** | Export hangs showing only frame, not map | ✅ FIXED |
| BUG-005 | **3D Mode Switch Failures** | Switching between 3D terrain/poster causes issues | 🟠 Monitoring |
| BUG-006 | **Minimal Metadata Storage** | Only resolutionKey stored, not full config | ✅ FIXED |

### 🟡 MEDIUM - Should Improve

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| BUG-007 | **Sculpture Auto-Trigger Complexity** | Ref/state mixing could cause edge case failures | 🟡 Not Fixed |

---

## Fixes Implemented (2025-01-14)

### BUG-001: Stale Config on Checkout ✅

**Solution:** Added `getCurrentConfig` and `getSculptureConfig` props to `ExportOptionsModal`. These functions return the CURRENT config from the editor state at the moment of checkout, not a stale closure value.

**Files Modified:**
- `frontend/components/controls/ExportOptionsModal.tsx` - Added fresh config getter props
- `frontend/components/controls/ExportButton.tsx` - Passed config getters through
- `frontend/components/layout/PosterEditor.tsx` - Passed `() => config` and `() => sculptureConfig`

### BUG-002: Auto-Export Race Condition ✅

**Solution:** Added 15-second timeout fallback for poster auto-export. If `mapIsIdle` is not triggered within 15 seconds, the export proceeds anyway with a warning to the user.

**Files Modified:**
- `frontend/components/layout/PosterEditor.tsx` - Added `autoExportStartTimeRef` and `AUTO_EXPORT_TIMEOUT_MS`

### BUG-003: Map Version Mismatch ✅

**Solution:** Full config snapshot is now stored in the `orders` table. On paid download, the config is loaded from sessionStorage (populated by the download API) instead of from the map database.

**Files Modified:**
- `frontend/supabase/migrations/013_add_config_snapshot_to_orders.sql` - Added config_snapshot columns
- `frontend/types/database.ts` - Updated orders table types
- `frontend/lib/actions/orders.ts` - Store and retrieve config snapshots
- `frontend/app/api/export/download/route.ts` - Return config snapshot in response
- `frontend/app/export/success/ExportDownloadClient.tsx` - Store snapshot in sessionStorage
- `frontend/components/layout/PosterEditor.tsx` - Load from sessionStorage when `hasPaidSnapshot=true`

### BUG-004: Loading Tiles Timeout ✅

**Solution:** Added timeout fallback in auto-export flow. The `exportCanvas.ts` already had timeouts (5s for stability, 15s for idle). The new PosterEditor timeout provides user feedback when tiles don't load.

**Files Modified:**
- `frontend/components/layout/PosterEditor.tsx` - Added timeout with user warning

### BUG-006: Full Metadata Storage ✅

**Solution:** Full `PosterConfig` and `SculptureConfig` snapshots are now stored in the `orders.config_snapshot` and `orders.sculpture_config_snapshot` columns, with SHA256 hash for integrity verification.

### BUG-008: Stripe Metadata Size Limit ✅

**Root Cause:** Stripe metadata values have a 500 character limit. The full config snapshot was 15,000+ characters, causing checkout to fail.

**Solution:** Create a "pending order" in the database BEFORE Stripe checkout. The pending order stores the full config snapshot. Only the order ID (36 chars) is passed to Stripe metadata. When payment succeeds, the webhook completes the pending order.

**Flow:**

1. User clicks "Purchase" → `createPendingOrder()` stores full config → returns `orderId`
2. Checkout session created with `pendingOrderId` in metadata (not full config)
3. Payment succeeds → webhook calls `completePendingOrder()` with email/amount
4. If checkout expires → webhook marks pending order as "failed"

**Files Modified:**

- `frontend/lib/actions/orders.ts` - Added `createPendingOrder()`, `completePendingOrder()`, `getPendingOrder()`
- `frontend/app/api/stripe/create-checkout/route.ts` - Create pending order before checkout, pass only orderId
- `frontend/app/api/stripe/webhook/route.ts` - Complete pending order on success, mark failed on expiry

---

## Architecture Overview

### Current Flow (Problematic)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CURRENT PURCHASE FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

User Designs Poster
       │
       ▼
Opens Export Modal ◄──── config passed as PROP (snapshot in time)
       │
       ▼
Clicks "Purchase" ────► onSaveMap() ────► Uses config from CLOSURE
       │                                        │
       │                                        ▼
       │                               ⚠️ PROBLEM: May be STALE
       │                                        │
       ▼                                        ▼
Stripe Checkout ◄───────────────────── mapId + minimal metadata
       │
       ▼
Success Page ────► Creates Order with mapId
       │
       ▼
Download Link ────► /create?mapId=XXX&autoExport=true
       │
       ▼
Editor Loads Map ────► getMapById(mapId)
       │                     │
       │                     ▼
       │           ⚠️ PROBLEM: Loads CURRENT version,
       │              not PURCHASED version (if user edited)
       ▼
Auto-Export Triggers
       │
       ▼
⚠️ PROBLEM: Race condition if map not idle
```

### Target Flow (Fixed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FIXED PURCHASE FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

User Designs Poster
       │
       ▼
Opens Export Modal
       │
       ▼
Clicks "Purchase"
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SAFETY CHECKPOINT 1: Capture Config Snapshot             │
│ - Get CURRENT config from editor state (not closure)     │
│ - Create immutable snapshot with timestamp               │
│ - Hash config for verification                           │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Save Map as "Purchase Snapshot" ────► returns mapId + snapshotId
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SAFETY CHECKPOINT 2: Full Metadata Storage               │
│ - Store FULL config in order metadata                    │
│ - Store snapshotId reference                             │
│ - Store config hash for integrity check                  │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Stripe Checkout ◄─── mapId + snapshotId + configHash
       │
       ▼
Success Page
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SAFETY CHECKPOINT 3: Order Creation                      │
│ - Store full config snapshot in order record             │
│ - Link to specific map version (snapshotId)              │
│ - Store export parameters                                │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Download Link ────► /create?orderId=XXX&autoExport=true
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SAFETY CHECKPOINT 4: Config Restoration                  │
│ - Load config FROM ORDER, not from map                   │
│ - Verify config hash matches                             │
│ - Use stored snapshot, ignore current map state          │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Editor Loads with Purchased Config
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SAFETY CHECKPOINT 5: Export Trigger                      │
│ - Wait for map tiles to fully load (with timeout)        │
│ - Verify config matches expected                         │
│ - Fallback if tiles fail after timeout                   │
└──────────────────────────────────────────────────────────┘
       │
       ▼
Export Success ✅
```

---

## Detailed Bug Analysis

### BUG-001: Stale Config on Checkout

**Location:** `components/controls/ExportOptionsModal.tsx` lines 136-175

**Root Cause:**
```typescript
// PROBLEM: config is a prop, captured at render time
export function ExportOptionsModal({
  config,      // ← Prop, not live state
  onSaveMap    // ← Callback with closure over old config
}: ExportOptionsModalProps) {

  const handleCheckout = async () => {
    // This uses whatever config was in the closure when
    // onSaveMap was created, NOT the current editor state
    currentMapId = await onSaveMap();
  }
}
```

**Fix:**
```typescript
// SOLUTION: Pass current config getter, not static value
export function ExportOptionsModal({
  getCurrentConfig,  // ← Function that returns CURRENT config
  onSaveMap
}: ExportOptionsModalProps) {

  const handleCheckout = async () => {
    // Get fresh config right before saving
    const freshConfig = getCurrentConfig();
    currentMapId = await onSaveMap(freshConfig);
  }
}
```

### BUG-002: Auto-Export Race Condition

**Location:** `components/layout/PosterEditor.tsx` lines 267-290

**Root Cause:**
```typescript
useEffect(() => {
  if (!pendingAutoExport || !currentMapId || isLoadingMap || isExporting) return;

  if (pendingAutoExport.mode === 'poster') {
    if (!mapIsIdle) return;  // ← Early return, effect may not re-run

    const posterTimeout = setTimeout(() => {
      handleExport(pendingAutoExport.resolution);
    }, 500);
  }
}, [pendingAutoExport, currentMapId, isLoadingMap, isExporting, mapIsIdle]);
```

**Fix:**
```typescript
// SOLUTION: Use separate effect for waiting + add timeout fallback
useEffect(() => {
  if (!pendingAutoExport || !currentMapId || isLoadingMap || isExporting) return;
  if (pendingAutoExport.mode !== 'poster') return;

  let exportTimeout: NodeJS.Timeout;
  let maxWaitTimeout: NodeJS.Timeout;

  const triggerExport = () => {
    clearTimeout(exportTimeout);
    clearTimeout(maxWaitTimeout);
    handleExport(pendingAutoExport.resolution);
  };

  if (mapIsIdle) {
    // Map ready, export after short delay
    exportTimeout = setTimeout(triggerExport, 500);
  } else {
    // Map loading, wait up to 30 seconds then force export
    maxWaitTimeout = setTimeout(() => {
      console.warn('Map tiles timeout - proceeding with export');
      triggerExport();
    }, 30000);
  }

  return () => {
    clearTimeout(exportTimeout);
    clearTimeout(maxWaitTimeout);
  };
}, [pendingAutoExport, currentMapId, isLoadingMap, isExporting, mapIsIdle]);
```

### BUG-003: Map Version Mismatch

**Root Cause:** Map is stored as single record, no versioning. User can edit after purchase.

**Fix:** Store full config snapshot in the `orders` table:

```sql
-- Migration: Add config snapshot to orders
ALTER TABLE orders ADD COLUMN config_snapshot JSONB;
ALTER TABLE orders ADD COLUMN config_hash TEXT;
```

```typescript
// On purchase: Store full config
const order = await createOrder({
  user_id: userId,
  map_id: mapId,
  config_snapshot: currentConfig,  // ← Full snapshot
  config_hash: hashConfig(currentConfig),
  // ... other fields
});

// On download: Use stored config, not current map
const { config_snapshot } = await getOrder(orderId);
// Load editor with config_snapshot, not map.config
```

### BUG-004: Loading Tiles Infinite Loop

**Root Cause:** `mapIsIdle` callback from MapLibre may never fire if tiles fail to load.

**Fix:** Add timeout and error handling:

```typescript
// Add to PosterEditor
const [tileLoadError, setTileLoadError] = useState(false);
const tileTimeoutRef = useRef<NodeJS.Timeout>();

// When map starts loading, set timeout
useEffect(() => {
  if (!mapIsIdle && pendingAutoExport) {
    tileTimeoutRef.current = setTimeout(() => {
      console.error('Tile loading timeout');
      setTileLoadError(true);
      // Force proceed with available tiles
    }, 30000);
  }

  return () => {
    if (tileTimeoutRef.current) {
      clearTimeout(tileTimeoutRef.current);
    }
  };
}, [mapIsIdle, pendingAutoExport]);

// In export logic
if (tileLoadError) {
  // Show warning but proceed with export
  toast.warning('Some tiles may not have loaded');
}
```

---

## Implementation Checklist

### Phase 1: Critical Fixes (Must Complete)

- [ ] **1.1** Fix stale config in ExportOptionsModal
  - [ ] Add `getCurrentConfig` prop to modal
  - [ ] Update PosterEditor to pass config getter
  - [ ] Test: Create poster → Open modal → Edit poster → Buy → Verify correct design

- [ ] **1.2** Fix auto-export race condition
  - [ ] Add timeout fallback for mapIsIdle
  - [ ] Add proper cleanup for timeouts
  - [ ] Test: Buy poster → Redirect → Verify export triggers

- [ ] **1.3** Add config snapshot to orders
  - [ ] Create migration for orders table
  - [ ] Update order creation to store full config
  - [ ] Update download flow to use order config
  - [ ] Test: Buy → Edit map → Download → Verify original design

### Phase 2: High Priority Fixes

- [ ] **2.1** Fix tile loading timeout
  - [ ] Add timeout mechanism for tile loading
  - [ ] Add error state and user feedback
  - [ ] Test: Disable network → Export → Verify graceful failure

- [ ] **2.2** Fix 3D mode switching
  - [ ] Audit state management on mode switch
  - [ ] Add transition guards
  - [ ] Test: Create 3D → Switch to poster → Export → Verify

- [ ] **2.3** Store full metadata in Stripe
  - [ ] Increase metadata storage
  - [ ] Store config hash for verification
  - [ ] Test: Verify Stripe dashboard shows correct info

### Phase 3: Improvements

- [ ] **3.1** Simplify sculpture auto-trigger
  - [ ] Refactor to use single state machine
  - [ ] Remove ref/state mixing
  - [ ] Test: Buy sculpture → Verify auto-export

---

## Testing Protocol

### Pre-Release Checklist

Run through these scenarios before any production deployment:

#### Scenario 1: Basic Poster Purchase
1. Create simple poster (no route)
2. Open export modal
3. Select paid resolution
4. Complete purchase
5. Download and verify design matches

**Expected:** Downloaded PNG matches design at step 2

#### Scenario 2: Route Poster Purchase
1. Create poster with GPX route
2. Customize route style (color, width)
3. Purchase and download
4. Verify route appears correctly

**Expected:** Route styling preserved in download

#### Scenario 3: Edit After Modal Open
1. Create poster design A
2. Open export modal
3. Close modal, change to design B
4. Re-open modal and purchase
5. Download and verify

**Expected:** Downloaded PNG should be design B

#### Scenario 4: Edit After Purchase
1. Create and purchase design A
2. Before downloading, edit to design B
3. Download using email link
4. Verify downloaded design

**Expected:** Downloaded PNG should be design A (purchased version)

#### Scenario 5: 3D Terrain + Route
1. Enable 3D terrain
2. Add GPX route
3. Enable 3D buildings
4. Purchase and download
5. Verify all elements present

**Expected:** All 3D elements and route visible

#### Scenario 6: Network Issues
1. Create poster design
2. Throttle network to "Slow 3G"
3. Attempt purchase and download
4. Verify graceful handling

**Expected:** User sees loading states, eventual success or clear error

#### Scenario 7: Sculpture Export
1. Upload GPX route
2. Switch to sculpture mode
3. Configure sculpture options
4. Purchase and download STL
5. Verify STL contains route

**Expected:** Valid STL file with route data

---

## Monitoring & Alerts

### Key Metrics to Track

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| Export success rate | < 95% | Investigate failures |
| Auto-export trigger time | > 30s | Check tile loading |
| Config mismatch rate | > 0% | Critical bug |
| Order/download ratio | < 90% | Users not downloading |

### Logging Requirements

Add structured logging for:
```typescript
// On checkout
logger.info('checkout_initiated', {
  mapId,
  configHash: hashConfig(config),
  timestamp: Date.now(),
});

// On order creation
logger.info('order_created', {
  orderId,
  mapId,
  configHash,
  snapshotStored: !!config_snapshot,
});

// On auto-export
logger.info('auto_export_triggered', {
  orderId,
  mapId,
  waitTime: Date.now() - startTime,
  tilesLoaded: mapIsIdle,
});

// On export complete
logger.info('export_complete', {
  orderId,
  mapId,
  success: true,
  exportTime: duration,
});
```

---

## Rollback Plan

If critical issues are discovered post-deployment:

1. **Immediate:** Disable auto-export redirect
   - Edit success page to show manual download instructions
   - Users can still download via email link

2. **Short-term:** Revert to previous version
   - Keep order records intact
   - Process manual export requests

3. **Recovery:** Fix and re-deploy
   - Apply fixes
   - Test thoroughly
   - Re-enable auto-export

---

## Appendix: File Reference

| File | Purpose | Key Functions |
|------|---------|---------------|
| `ExportOptionsModal.tsx` | Export selection UI | `handleCheckout()` |
| `SculptureExportModal.tsx` | Sculpture export UI | `handleExportInternal()` |
| `ExportButton.tsx` | Export orchestration | Modal state management |
| `PosterEditor.tsx` | Main editor state | `handleAutoSaveForExport()`, auto-export effect |
| `create-checkout/route.ts` | Stripe session | Creates checkout with metadata |
| `success/page.tsx` | Post-payment | Creates order, shows download |
| `download/route.ts` | Download validation | Validates token, returns mapId |
| `orders.ts` | Order CRUD | `createOrder()`, `getOrderBySessionId()` |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-01-14 | Initial document created | Claude |
