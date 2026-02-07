# Cloudflare R2 & Analytics Setup Guide

## ⚠️ IMPORTANT: Why R2 Isn't Working

Your `wrangler.toml` has **placeholder IDs** that must be replaced with **real Cloudflare resource IDs**:

```toml
# ❌ CURRENT (Won't work)
[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "analytics_kv_namespace"  # ← This is a placeholder!

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pixieblooms-images"  # ← Must create this bucket first!
```

You need to:
1. Create the actual resources in Cloudflare Dashboard
2. Get the real IDs
3. Update wrangler.toml OR bind them in the dashboard

---

## Option 1: Setup via Cloudflare Dashboard (Recommended - Easier)

### Step 1: Create R2 Bucket

1. **Go to Cloudflare Dashboard** → **R2**
2. Click **"Create bucket"**
3. **Bucket name**: `pixieblooms-images` (or choose your own)
4. Click **"Create bucket"**
5. **Keep the bucket name** - you'll need it!

### Step 2: Create KV Namespace for Analytics

1. **Go to Cloudflare Dashboard** → **Workers & Pages** → **KV**
2. Click **"Create namespace"**
3. **Namespace name**: `pixieblooms-analytics` (or choose your own)
4. Click **"Add"**
5. **Copy the Namespace ID** that appears (e.g., `1234567890abcdef`)

### Step 3: Bind R2 & KV to Your Pages Project

1. **Go to**: **Workers & Pages** → **Your project** (`pixieblooms3`)
2. Click **"Settings"** tab
3. Scroll to **"Functions"** section

#### Add R2 Bucket Binding:
1. Find **"R2 bucket bindings"**
2. Click **"Add binding"**
3. **Variable name**: `R2_BUCKET` (exactly this!)
4. **R2 bucket**: Select `pixieblooms-images` from dropdown
5. Click **"Save"**

#### Add KV Namespace Binding:
1. Find **"KV namespace bindings"**
2. Click **"Add binding"**
3. **Variable name**: `ANALYTICS_KV` (exactly this!)
4. **KV namespace**: Select your analytics namespace from dropdown
5. Click **"Save"**

### Step 4: Redeploy

1. Go to **"Deployments"** tab
2. Click **"Retry deployment"** on the latest deployment
3. Or push a new commit to trigger deployment

### Step 5: Test

Test R2 upload in your browser console:
```javascript
const formData = new FormData();
const blob = new Blob(['test'], { type: 'image/png' });
formData.append('file', blob, 'test.png');

fetch('/api/r2-upload', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(d => console.log(d));
```

You should see: `{ url: "/api/r2-image?key=...", fileName: "...", ... }`

---

## Option 2: Setup via Wrangler CLI (Advanced)

### Step 1: Install & Login to Wrangler

```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create R2 Bucket

```bash
# Create production bucket
wrangler r2 bucket create pixieblooms-images

# Create preview bucket (for local dev)
wrangler r2 bucket create pixieblooms-images-preview
```

### Step 3: Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create "ANALYTICS_KV"

# This will output something like:
# { binding = "ANALYTICS_KV", id = "abc123..." }
```

### Step 4: Update wrangler.toml

Replace the placeholder ID with the real ID from Step 3:

```toml
[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "abc123..."  # ← Use the REAL ID from the command output
```

The R2 bucket names should be correct already:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pixieblooms-images"
preview_bucket_name = "pixieblooms-images-preview"
```

### Step 5: Deploy

```bash
npm run build
wrangler pages deploy dist --project-name=pixieblooms3
```

---

## Common Issues & Fixes

### Issue: "R2_BUCKET is undefined"
**Cause**: Binding not set up in Cloudflare Dashboard
**Fix**: Follow Step 3 in Option 1 above

### Issue: "Cannot read property 'put' of undefined"
**Cause**: Binding name mismatch
**Fix**: Variable name MUST be exactly `R2_BUCKET` (case-sensitive)

### Issue: "KV namespace not found"
**Cause**: KV namespace doesn't exist or wrong ID
**Fix**: Create KV namespace and bind it with exact name `ANALYTICS_KV`

### Issue: "Bucket not found"
**Cause**: R2 bucket doesn't exist
**Fix**: Create R2 bucket with name `pixieblooms-images`

---

## Verifying Setup

### Check R2 is Working:
```bash
curl -X POST https://your-site.pages.dev/api/r2-upload \
  -F "file=@test.png"
```

Should return JSON with `url` field.

### Check Analytics is Working:
```bash
curl -X POST https://your-site.pages.dev/api/track-view \
  -H "Content-Type: application/json" \
  -d '{"page":"test"}'
```

Should return: `{"success": true}`

### Check in Cloudflare Dashboard:

**R2 Objects:**
1. Go to **R2** → **pixieblooms-images**
2. You should see uploaded images in `images/` folder

**KV Data:**
1. Go to **KV** → Your analytics namespace
2. Click **"View"**
3. You should see keys like `views:2024-01-24`

---

## Current Configuration Status

Your `wrangler.toml` currently has:

✅ **Environment variables** - Configured
✅ **R2 bucket name** - Configured (`pixieblooms-images`)
❌ **KV namespace ID** - Using placeholder `analytics_kv_namespace`
❌ **Actual resources** - Not created in Cloudflare yet

**Next Steps:**
1. Choose Option 1 (Dashboard) or Option 2 (CLI)
2. Create the actual R2 bucket and KV namespace
3. Bind them to your Pages project
4. Redeploy
5. Test the endpoints

---

## Need Help?

If you're still getting errors after following these steps, check:
1. **Cloudflare Pages Dashboard** → Settings → Functions → Check bindings are listed
2. **Latest deployment** → Functions tab → Check functions are deployed
3. **Browser console** → Network tab → See the actual error response

The TypeScript code is already fixed - you just need to set up the Cloudflare resources!
