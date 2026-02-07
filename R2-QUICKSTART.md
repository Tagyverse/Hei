# R2 Storage Quick Start

## Your R2 is Not Working Because...

The R2 bucket `pixie-blooms-images` needs to be created in your Cloudflare account.

Your `wrangler.toml` is configured correctly with the binding, but **the bucket doesn't exist yet**.

## How Are You Deploying?

### Option A: Deploying with Wrangler CLI

If you run: `wrangler pages deploy dist`

**Setup Steps:**

```bash
# 1. Create the R2 bucket
wrangler r2 bucket create pixie-blooms-images

# 2. Build your project
npm run build

# 3. Deploy (bindings apply automatically)
wrangler pages deploy dist --project-name=pixieblooms3
```

✅ **Done!** R2 will work immediately.

See **WRANGLER-DEPLOYMENT.md** for complete instructions.

---

### Option B: Deploying via Git (GitHub, GitLab, etc.)

If you push to git and Cloudflare auto-deploys:

**Setup Steps:**

1. **Create R2 bucket** (one-time):
   ```bash
   wrangler r2 bucket create pixie-blooms-images
   ```

2. **Add binding in Dashboard** (one-time):
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Your Project → Settings → Functions
   - Add R2 bucket binding:
     - Variable name: `R2_BUCKET`
     - Bucket: `pixie-blooms-images`
   - Save

3. **Redeploy**:
   - Push to git OR click "Retry deployment" in Dashboard

✅ **Done!** R2 will work on next deployment.

See **R2-SIMPLE-SETUP.md** for detailed instructions with screenshots.

---

## Quick Test

After setup, verify R2 is working:

```bash
# Test upload (replace URL with your site)
curl -X POST https://your-site.pages.dev/api/r2-upload \
  -F "file=@test.png"

# Should return JSON with url, fileName, size, type
```

Or visit your admin panel → R2 Gallery Manager and try uploading an image.

---

## Which Method Should I Use?

**Use Wrangler CLI if:**
- ✅ You want automatic binding setup
- ✅ You deploy manually from your machine
- ✅ You want local dev with R2 (`npm run dev:wrangler`)

**Use Git Deployment if:**
- ✅ You want automatic deployments on git push
- ✅ Your team needs to deploy without Wrangler access
- ✅ You use CI/CD pipelines

Both methods work - choose what fits your workflow!

---

## Current Configuration Status

Your `wrangler.toml` has:

✅ **R2 Bucket Name**: `pixie-blooms-images` (configured)
✅ **R2 Binding**: `R2_BUCKET` (configured)
✅ **KV Namespace ID**: `0dda27b31bd74ba98f4d87614079b11c` (configured)
❓ **R2 Bucket**: Not verified to exist

**Next Step**: Create the R2 bucket using one of the methods above.

---

## Still Not Working?

Check these:

1. **Bucket doesn't exist**:
   ```bash
   # List your buckets
   wrangler r2 bucket list

   # If pixie-blooms-images is missing, create it:
   wrangler r2 bucket create pixie-blooms-images
   ```

2. **Wrong deployment method**:
   - If deploying via git, bindings must be set in Dashboard
   - If using wrangler, ensure you deploy with `wrangler pages deploy`

3. **Binding not applied**:
   - Check Dashboard → Your Project → Settings → Functions
   - Should see R2_BUCKET listed under "R2 bucket bindings"

4. **Old deployment cached**:
   - Force redeploy
   - Clear browser cache
   - Try in incognito window

Need more help? See the full guides:
- **WRANGLER-DEPLOYMENT.md** - Complete wrangler CLI setup
- **R2-SIMPLE-SETUP.md** - Dashboard-based setup
- **R2-ANALYTICS-SETUP.md** - Detailed troubleshooting
