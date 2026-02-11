# Firebase to R2 Publishing - Quick Start

## 5-Minute Setup

### 1. Data in Admin Panel
- Login with admin credentials
- Add products with name + price
- Add categories with names
- Save all changes (goes to Firebase)

### 2. Validate Data
- Click "Validate Data" button
- Fix any RED errors
- Yellow warnings are optional
- Check validation panel

### 3. Publish to Live
- Click "Publish to Live" button
- Confirm in popup
- Wait for success message
- Check publish history

### 4. Users See Updates
- Home page loads R2 data
- Shop page loads R2 data
- Falls back to Firebase if needed
- 5-minute cache (auto refresh)

### 5. Monitor History
- Scroll to publish history panel
- View last 50 publishes
- Check success rate
- Clear if needed

## Validation Rules

**MUST HAVE (RED = Can't Publish):**
- ✓ At least 1 product
- ✓ At least 1 category
- ✓ Each product has name
- ✓ Each product has price

**SHOULD HAVE (YELLOW = Optional):**
- ✓ Product images
- ✓ Product descriptions
- ✓ Category images
- ✓ Products in categories

## What Gets Published

```
✓ Products (all fields)
✓ Categories
✓ Reviews
✓ Offers
✓ Carousel
✓ Sections
✓ Video content
✓ Navigation settings
✓ Tax settings
✓ Footer
✓ Policies
✓ All other settings
```

## Publishing Flow

```
Admin Saves → Firebase
               ↓
Click Publish → Validate Data
                    ↓
               Check Errors (fix if needed)
                    ↓
               Upload to R2
                    ↓
               Verify Success
                    ↓
Users Load ← R2 (or fallback to Firebase)
```

## Common Issues

| Problem | Fix |
|---------|-----|
| Can't publish | Click "Validate Data" - fix red errors |
| R2 error | Check R2 bucket is created in Cloudflare |
| Users don't see updates | Wait 5 min or clear browser cache |
| History shows failures | Check console logs for details |
| Validation slow | Fewer products = faster validation |

## Console Logs to Watch

```javascript
// Successful flow:
[ADMIN] Fetching Firebase data...
[ADMIN] Data collected: 2 sections with 45 products
[ADMIN] Starting publish process...
[ADMIN] Sending to R2...
[ADMIN] Publish successful!

// User loading data:
[R2] Fetching published data from R2...
[R2] Successfully fetched and parsed data in 234ms
[HOME] Published data loaded successfully
[HOME] Loaded 45 products
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Console | F12 |
| Search Logs | Ctrl+F |
| Clear Cache | Ctrl+Shift+Delete |
| Refresh Page | Ctrl+R |
| Hard Refresh | Ctrl+Shift+R |

## Key Metrics

| Metric | Expected |
|--------|----------|
| Validation Time | < 1 second |
| Upload Time | 200-300ms |
| Verify Time | 80-120ms |
| Cache Duration | 5 minutes |
| History Kept | Last 50 publishes |

## Success Checklist

- [ ] Admin panel loads without errors
- [ ] "Validate Data" button works
- [ ] Validation passes (no red errors)
- [ ] "Publish to Live" button works
- [ ] Publish succeeds (check history)
- [ ] Home page loads data
- [ ] Shop page loads data
- [ ] Console shows R2 logs
- [ ] Users see updated content
- [ ] History shows publish record

## Support Links

- **Full Guide:** `FIREBASE-TO-R2-GUIDE.md`
- **R2 Setup:** `R2-SIMPLE-SETUP.md`
- **Troubleshooting:** See full guide section
- **API Reference:** See full guide section

---

**Remember:** Validate before publish, check history after, watch console logs for debugging!
