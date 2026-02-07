# ⚡ Quick Setup Checklist

## The Issue
Your R2 uploads aren't working because the Cloudflare resources (R2 bucket & KV namespace) haven't been created yet.

## Quick Fix (5 minutes)

### 1. Create R2 Bucket
- Go to: https://dash.cloudflare.com → **R2**
- Click **"Create bucket"**
- Name: `pixieblooms-images`
- Click **"Create bucket"**

### 2. Create KV Namespace
- Go to: https://dash.cloudflare.com → **Workers & Pages** → **KV**
- Click **"Create namespace"**
- Name: `pixieblooms-analytics`
- Click **"Add"**

### 3. Bind Them to Your Project
- Go to: **Workers & Pages** → **pixieblooms3** → **Settings** → **Functions**

**Add R2 Binding:**
- Find "R2 bucket bindings" → **"Add binding"**
- Variable name: `R2_BUCKET`
- R2 bucket: `pixieblooms-images`
- Save

**Add KV Binding:**
- Find "KV namespace bindings" → **"Add binding"**
- Variable name: `ANALYTICS_KV`
- KV namespace: `pixieblooms-analytics`
- Save

### 4. Redeploy
- Go to **"Deployments"** tab
- Click **"Retry deployment"**

### 5. Test
Open browser console on your site:
```javascript
// Test R2 upload
const formData = new FormData();
const blob = new Blob(['test'], { type: 'image/png' });
formData.append('file', blob, 'test.png');

fetch('/api/r2-upload', {
  method: 'POST',
  body: formData
}).then(r => r.json()).then(console.log);
```

✅ Should return: `{ url: "/api/r2-image?key=...", ... }`

---

## That's It!

The code is already fixed. You just need to create the Cloudflare resources and bind them.

For detailed troubleshooting, see: **R2-ANALYTICS-SETUP.md**
