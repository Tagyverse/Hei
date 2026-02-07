# Maintenance Mode Guide

## Overview

Your site now has a smart maintenance mode system that allows you to show a maintenance page to regular visitors while still allowing admin access via a special URL parameter.

## Default Behavior

### Maintenance Mode is ON by Default

When users visit your site normally, they will see:

**Maintenance Page Message:**
- "Site Under Update"
- "Due to heavy server load, our site is currently being updated"
- Update duration: 12-24 hours minimum, 24-48 hours maximum
- Contact information for urgent assistance

### Which Pages Show Maintenance?

**Default (without bypass):**
- `/` (Home page) → Shows maintenance page
- `/admin` (Admin panel) → Shows maintenance page
- `/shop` → Shows maintenance page
- All other pages → Show maintenance page

## Admin Bypass Feature

### How to Access Site During Maintenance

Add `?admin=true` to any URL to bypass maintenance mode:

**Examples:**

1. **Access Home Page:**
   ```
   https://yoursite.com/?admin=true
   ```
   Shows the actual home page, not maintenance

2. **Access Admin Panel:**
   ```
   https://yoursite.com/admin?admin=true
   ```
   Shows the admin panel, not maintenance

3. **Access Shop:**
   ```
   https://yoursite.com/shop?admin=true
   ```
   Shows the shop page, not maintenance

4. **Access Any Page:**
   ```
   https://yoursite.com/[any-page]?admin=true
   ```
   Shows the actual page, not maintenance

## URL Behavior Summary

| URL | Shows |
|-----|-------|
| `/` | Maintenance Page (no timer) |
| `/?admin=true` | Home Page |
| `/admin` | Maintenance Page (WITH 15-hour countdown timer) |
| `/admin?admin=true` | Admin Panel |
| `/shop` | Maintenance Page (no timer) |
| `/shop?admin=true` | Shop Page |
| `/checkout` | Maintenance Page (no timer) |
| `/checkout?admin=true` | Checkout Page |

## How to Turn OFF Maintenance Mode

If you want to disable maintenance mode completely, you have two options:

### Option 1: Change Default State (Recommended)

Edit `/src/App.tsx` and change line 98:

**Current (Maintenance ON):**
```typescript
const [maintenanceMode, setMaintenanceMode] = useState(true);
```

**Change to (Maintenance OFF):**
```typescript
const [maintenanceMode, setMaintenanceMode] = useState(false);
```

Then rebuild:
```bash
npm run build
```

### Option 2: Use Firebase Admin Panel

1. Access admin panel: `https://yoursite.com/admin?admin=true`
2. Go to Maintenance Manager section
3. Toggle maintenance mode OFF
4. All visitors will now see the normal site

## Technical Details

### How It Works

1. **Initial State:**
   - `maintenanceMode` starts as `true` (line 98 in App.tsx)
   - Firebase settings can override this

2. **Bypass Check:**
   - Function `checkAdminBypass()` checks for `?admin=true` parameter
   - Returns true if parameter exists, false otherwise

3. **Display Logic:**
   ```typescript
   if (maintenanceMode && !checkAdminBypass() && appReady) {
     return <Maintenance />;
   }
   ```

   This means:
   - If maintenance is ON
   - AND admin bypass is NOT active
   - AND app is ready
   - THEN show maintenance page

### Code Location

**App.tsx Changes:**
- Line 98: Default maintenance state set to `true`
- Line 107-109: `checkAdminBypass()` function added
- Line 246: Bypass check added to maintenance condition

**Maintenance.tsx Changes:**
- Updated heading: "Site Under Update"
- Added server load message
- Added time duration (12-24 hours, 24-48 hours)
- Added admin hint at bottom

## Testing Scenarios

### Scenario 1: Regular User Visits Home
1. User goes to `https://yoursite.com`
2. Sees maintenance page WITHOUT countdown timer
3. Sees simple message: "Please wait patiently..."
4. Cannot access any pages

### Scenario 2: Regular User Visits Admin Route
1. User goes to `https://yoursite.com/admin` (no bypass)
2. Sees maintenance page WITH 15-hour countdown timer
3. Timer counts down from 15:00:00
4. Sees message: "Server will try to update new pack..."
5. Sees admin hint about `?admin=true` at bottom

### Scenario 3: Admin Bypasses Home
1. Admin goes to `https://yoursite.com/?admin=true`
2. Sees normal home page (no maintenance)
3. Can navigate freely
4. Can shop normally

### Scenario 4: Admin Bypasses Admin Panel
1. Admin goes to `https://yoursite.com/admin?admin=true`
2. Directly loads admin panel (no maintenance)
3. Can manage site normally
4. Can toggle maintenance mode

### Scenario 5: Timer Countdown on Admin Route
1. Someone visits `https://yoursite.com/admin`
2. Sees timer at 15:00:00
3. Waits 10 minutes
4. Timer now shows 14:50:00
5. Timer continues counting down live

### Scenario 6: Turning Off Maintenance
1. Admin accesses panel with `?admin=true`
2. Disables maintenance in Maintenance Manager
3. All users can now access site normally
4. No countdown timer, no maintenance page
5. No need for `?admin=true` anymore

## User Communication

### Message Shown to Visitors

**For Regular Users (Home Page):**
- **Main Heading:** "Site Under Update"
- **Sub-heading:** "Due to heavy server load, our site is currently being updated."
- **Message:** "Please wait patiently while we optimize our servers and update the site to serve you better."
- **NO countdown timer shown**
- **NO admin hint shown**

**For Admin Route (`/admin` without bypass):**
- **Main Heading:** "Site Under Update"
- **Sub-heading:** "Due to heavy server load, our site is currently being updated."
- **Countdown Timer:** Shows live countdown starting from 15 hours (format: HH:MM:SS)
- **Timer Label:** "Time Remaining (Estimated)"
- **Message:** "Server will try to update new pack within the estimated time. We're trying our best to bring the site back online as quickly as possible."
- **Admin Hint:** "Admin: Access with ?admin=true parameter" (shown at bottom)

## Countdown Timer (Admin Route Only)

### How It Works

When someone visits `/admin` (without `?admin=true` bypass), they see a live countdown timer:

- **Starting Time:** 15 hours (15:00:00)
- **Updates:** Every second in real-time
- **Format:** HH:MM:SS (e.g., 14:59:23)
- **Display:** Large yellow numbers in monospace font
- **Purpose:** Shows estimated time until server update completion

### Timer Behavior

- Timer starts at 15 hours when page loads
- Counts down: 15:00:00 → 14:59:59 → 14:59:58 → ... → 00:00:00
- Stops at 00:00:00 (doesn't go negative)
- Resets to 15:00:00 if page is refreshed

### Why Only Admin Route?

- **Regular users** (home page) don't need technical countdown details
- **Admin users** viewing `/admin` get precise timing information
- Creates distinction between general maintenance message and technical status

## Benefits

### For Clients/Regular Users
- Clear communication about site status
- Expected update duration
- Contact information for urgent needs
- Professional appearance

### For Admins
- Can access site anytime with `?admin=true`
- Can manage and test during maintenance
- Can update content before site goes live
- Can monitor orders and analytics

### For You
- Complete control over site visibility
- No need to redeploy to toggle maintenance
- Can work on site without client interference
- Professional maintenance handling

## Quick Reference Commands

**Build project:**
```bash
npm run build
```

**Deploy to production:**
```bash
wrangler pages deploy dist --project-name=pixieblooms
```

**Access admin during maintenance:**
```
https://yoursite.com/admin?admin=true
```

**Turn maintenance OFF permanently:**
Edit `/src/App.tsx` line 98, change `true` to `false`, then rebuild.

## Important Notes

1. The `?admin=true` parameter must be present in the URL for bypass to work
2. Maintenance state can also be controlled via Firebase in Admin panel
3. If Firebase maintenance is OFF, site works normally regardless of code default
4. The bypass works for ALL pages, not just admin
5. Users won't know about `?admin=true` unless you tell them

Your maintenance system is now ready to use!
