# Firebase Rules Fix - 5 Minute Solution

## The Problem
Admin gets "Failed to save navigation settings" because `navigation_settings` path is not in Firebase Rules.

## The Solution (Copy-Paste)

### Step 1: Open Firebase Console
- Go to: https://console.firebase.google.com/
- Select your project
- Click: **Realtime Database** → **Rules** tab

### Step 2: Replace All Rules
1. Delete everything in the Rules editor
2. Copy ALL of this and paste:

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "admin_settings": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.email === 'gokul.offl.08@gmail.com'",
      "full_locked": {
        ".validate": "!newData.exists() || newData.isBoolean()"
      },
      "feature_locks": {
        ".validate": "!newData.exists() || newData.hasChildren()"
      }
    },

    "navigation_settings": {
      ".read": true,
      ".write": "auth != null && auth.token.email === 'gokul.offl.08@gmail.com'",
      ".validate": "newData.isObject() || !newData.exists()",
      "background": { ".validate": "!newData.exists() || newData.isString()" },
      "text": { ".validate": "!newData.exists() || newData.isString()" },
      "activeTab": { ".validate": "!newData.exists() || newData.isString()" },
      "inactiveButton": { ".validate": "!newData.exists() || newData.isString()" },
      "borderRadius": { ".validate": "!newData.exists() || newData.isString()" },
      "buttonSize": { ".validate": "!newData.exists() || newData.isString()" },
      "themeMode": { ".validate": "!newData.exists() || newData.isString()" },
      "buttonLabels": {
        ".validate": "!newData.exists() || newData.isObject()",
        "home": { ".validate": "!newData.exists() || newData.isString()" },
        "shop": { ".validate": "!newData.exists() || newData.isString()" },
        "search": { ".validate": "!newData.exists() || newData.isString()" },
        "cart": { ".validate": "!newData.exists() || newData.isString()" },
        "myOrders": { ".validate": "!newData.exists() || newData.isString()" },
        "login": { ".validate": "!newData.exists() || newData.isString()" },
        "signOut": { ".validate": "!newData.exists() || newData.isString()" },
        "admin": { ".validate": "!newData.exists() || newData.isString()" }
      },
      "$other": { ".validate": false }
    },

    "products": {
      ".read": true,
      ".indexOn": ["category_id", "featured", "best_selling", "might_you_like", "createdAt", "in_stock"],
      "$productId": {
        ".write": "auth != null",
        ".validate": "(!data.exists() && newData.hasChildren(['name', 'description', 'price', 'image_url', 'in_stock', 'createdAt']) && (newData.hasChild('category_id') || newData.hasChild('category_ids'))) || (data.exists() && newData.hasChild('name') && newData.hasChild('description') && newData.hasChild('price') && newData.hasChild('image_url') && newData.hasChild('in_stock') && newData.hasChild('createdAt') && (newData.hasChild('category_id') || newData.hasChild('category_ids')))",
        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 200" },
        "slug": { ".validate": "!newData.exists() || newData.isString()" },
        "description": { ".validate": "newData.isString() && newData.val().length <= 1000" },
        "price": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "compare_at_price": { ".validate": "!newData.exists() || (newData.isNumber() && newData.val() >= 0) || newData.val() === null" },
        "image_url": { ".validate": "newData.isString() && newData.val().matches(/^https?:.+/)" },
        "gallery_images": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "video_url": { ".validate": "!newData.exists() || newData.isString()" },
        "category_id": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length > 0)" },
        "category_ids": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "in_stock": { ".validate": "newData.isBoolean()" },
        "featured": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "best_selling": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "might_you_like": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "sizes": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "colors": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "default_size": { ".validate": "!newData.exists() || newData.isString()" },
        "default_color": { ".validate": "!newData.exists() || newData.isString()" },
        "size_pricing": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "try_on_enabled": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "try_on_image_url": { ".validate": "!newData.exists() || newData.isString()" },
        "hairclip_type": { ".validate": "!newData.exists() || (newData.isString() && (newData.val() === 'side' || newData.val() === 'top' || newData.val() === 'back' || newData.val() === 'headband' || newData.val() === 'full'))" },
        "availableColors": { ".validate": "!newData.exists() || newData.hasChildren()" },
        "createdAt": { ".validate": "newData.isString()" },
        "$other": { ".validate": false }
      }
    },

    "categories": {
      ".read": true,
      ".indexOn": ["name"],
      "$categoryId": {
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['name', 'description', 'image_url'])",
        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100" },
        "description": { ".validate": "newData.isString() && newData.val().length <= 500" },
        "image_url": { ".validate": "newData.isString() && newData.val().matches(/^https?:.+/)" },
        "featured": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "new_arrival": { ".validate": "!newData.exists() || newData.isBoolean()" },
        "bg_color": { ".validate": "!newData.exists() || newData.isString()" },
        "$other": { ".validate": false }
      }
    },

    "carousel_images": {
      ".read": true,
      ".write": "auth != null"
    },

    "carousel_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "reviews": {
      ".read": true,
      ".write": "auth != null"
    },

    "offers": {
      ".read": true,
      ".write": "auth != null"
    },

    "site_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "homepage_sections": {
      ".read": true,
      ".write": "auth != null"
    },

    "info_sections": {
      ".read": true,
      ".write": "auth != null"
    },

    "marquee_sections": {
      ".read": true,
      ".write": "auth != null"
    },

    "video_sections": {
      ".read": true,
      ".write": "auth != null"
    },

    "video_section_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "video_overlay_sections": {
      ".read": true,
      ".write": "auth != null"
    },

    "video_overlay_items": {
      ".read": true,
      ".write": "auth != null"
    },

    "default_sections_visibility": {
      ".read": true,
      ".write": "auth != null"
    },

    "card_designs": {
      ".read": true,
      ".write": "auth != null"
    },

    "coupons": {
      ".read": true,
      ".write": "auth != null"
    },

    "try_on_models": {
      ".read": true,
      ".write": "auth != null"
    },

    "tax_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "footer_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "footer_config": {
      ".read": true,
      ".write": "auth != null"
    },

    "policies": {
      ".read": true,
      ".write": "auth != null"
    },

    "settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "bill_settings": {
      ".read": true,
      ".write": "auth != null"
    },

    "social_links": {
      ".read": true,
      ".write": "auth != null"
    },

    "site_content": {
      ".read": true,
      ".write": "auth != null"
    },

    "admins": {
      ".read": "auth != null",
      ".write": "auth != null"
    },

    "super_admins": {
      ".read": "auth != null",
      ".write": "auth != null"
    },

    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    },

    "users": {
      ".read": "auth != null && $uid === auth.uid",
      ".write": "auth != null && $uid === auth.uid"
    },

    "published_data": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Step 3: Publish
1. Click the blue **"Publish"** button in bottom-right
2. Confirm when prompted
3. Wait for green checkmark

### Step 4: Test
1. Go to Admin → Navigation
2. Change a color
3. Click "Save Changes"
4. Should see: "Navigation settings saved successfully!"
5. Refresh page - color should stay (not revert)

## Done!

Navigation settings now:
- Save without errors
- Persist when reloading
- Publish to users correctly

