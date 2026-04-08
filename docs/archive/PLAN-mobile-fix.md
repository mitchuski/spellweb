# Mobile & Side Panel Fix Plan

## Current Issues

### 1. SpellCeremony Fixed Dimensions
- **EVOKE_WIDTH = 800px** - wider than most mobile screens (375-428px)
- **EVOKE_HEIGHT = 500px** - may be too tall on landscape mobile
- **WAITING_WIDTH = 400px** - also exceeds mobile width
- Panel positioned with `left: 50%, transform: translateX(-50%)` but doesn't scale

### 2. NodeInspector Side Panel
- Fixed **width: 420px** - takes entire mobile screen
- Mobile CSS makes it `width: 100vw` but z-index/layering may conflict with new components
- Mobile action bar exists but may not be receiving correct props

### 3. Left-Side UI Elements (Inventories & Buttons)
- Blade inventories positioned with fixed `bottom` and `left: 16px`
- Witness Blade, ZK Blades, Constellations, Share Knowledge buttons all fixed positions
- On mobile, these may overlap with the ceremony panel or be off-screen

### 4. Legend Panel
- Fixed at `bottom: 16, right: 16/436`
- May overlap with ceremony panel on mobile
- Has `mobile-hide` class but position still calculated

### 5. WanderingOrbs
- Canvas fixed at `width/height` from dimensions state
- Should be hidden or adapted on mobile

---

## Fix Plan

### Phase 1: SpellCeremony Responsive
**File: `src/components/SpellCeremony.tsx`**

1. Add responsive width/height calculation:
```typescript
// Use window dimensions or props for responsive sizing
const maxWidth = Math.min(window.innerWidth - 32, EVOKE_WIDTH);
const maxHeight = Math.min(window.innerHeight - 200, EVOKE_HEIGHT);
const panelWidth = isCasting ? maxWidth : Math.min(window.innerWidth - 32, WAITING_WIDTH);
const panelHeight = isCasting ? maxHeight : WAITING_HEIGHT;
```

2. Add resize listener to update dimensions

3. Scale constellation mapping to fit responsive panel size

4. Add `mobile-ceremony` class for additional CSS overrides

### Phase 2: NodeInspector Mobile Improvements
**File: `src/components/NodeInspector.tsx`**

1. Add close-on-swipe gesture for mobile
2. Ensure mobile action bar props are correctly passed
3. Add touch-friendly button sizes (min 44x44px tap targets)
4. Consider slide-in animation from right on mobile

### Phase 3: Left Panel Mobile Layout
**File: `src/components/SpellWeb.tsx`**

1. Add `mobile-hide` class to:
   - Blade inventories (or move to bottom sheet)
   - Witness Blade button
   - ZK Blades button
   - Constellations button
   - Share Knowledge button

2. Create mobile bottom bar with essential actions:
   - Hamburger menu for full feature access
   - Quick access to active blade (if any)
   - Constellation count indicator

3. Alternative: Create slide-out drawer from left for all these controls

### Phase 4: Legend & Other Overlays
**File: `src/components/Legend.tsx`**

1. Already has `mobile-hide` - verify it works
2. Ensure z-index doesn't cause issues

**File: `src/components/WanderingOrbs.tsx`**

1. Add mobile detection and disable or simplify on small screens
2. Alternative: Scale orb canvas to viewport

### Phase 5: CSS Media Queries
**File: `src/index.css`**

Add/update rules:
```css
@media (max-width: 768px) {
  /* Hide ceremony panel extras */
  .ceremony-panel {
    max-width: calc(100vw - 32px) !important;
  }

  /* Hide wandering orbs on mobile */
  .wandering-orbs {
    display: none !important;
  }

  /* Left panel items - hide and use mobile drawer */
  .left-panel-item {
    display: none !important;
  }

  /* Bottom mobile bar */
  .mobile-bottom-bar {
    display: flex !important;
  }
}
```

---

## Implementation Order

1. **SpellCeremony responsive** - Most critical, currently breaks mobile
2. **Hide left panel items on mobile** - Quick win
3. **Create mobile bottom bar** - Essential for feature access
4. **NodeInspector touch improvements** - Better UX
5. **WanderingOrbs mobile handling** - Performance/visual
6. **Legend verification** - Should already work

---

## Testing Checklist

- [ ] iPhone SE (375px) portrait
- [ ] iPhone 14 (390px) portrait
- [ ] iPhone 14 Pro Max (430px) portrait
- [ ] iPad (768px) portrait
- [ ] Landscape orientations
- [ ] NodeInspector opens/closes cleanly
- [ ] Ceremony panel fits and is usable
- [ ] All features accessible via mobile UI
- [ ] No overlapping elements
- [ ] Touch targets are 44x44px minimum

---

## Notes

- Consider using CSS `clamp()` for fluid sizing
- May want to detect touch devices vs just screen size
- Performance: Disable complex animations on mobile
- Accessibility: Ensure mobile UI is screen-reader friendly
