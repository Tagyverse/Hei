# Quick R2 Storage Setup for Production

Your site is deployed but R2 storage is showing mock/false data because the R2 bucket binding is not configured in Cloudflare.

## 5-Minute Setup Steps

### Step 1: Create R2 Bucket (2 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **R2** in the left sidebar
3. Click **"Create bucket"** button
4. Enter bucket name: **`pixie-blooms-images`** (exactly this name)
5. Click **"Create bucket"**

### Step 2: Bind R2 to Your Pages Project (3 minutes)

1. Go to **Workers & Pages** in the left sidebar
2. Click on your project (likely named **pixieblooms** or **pixieblooms3**)
3. Click the **"Settings"** tab at the top
4. Scroll down to find **"Functions"** section
5. Find **"R2 bucket bindings"** subsection
6. Click **"Add binding"** button
7. Enter:
   - **Variable name**: `R2_BUCKET` (MUST be exactly this, case-sensitive)
   - **R2 bucket**: Select `pixie-blooms-images` from dropdown
8. Click **"Save"**

### Step 3: Redeploy (1 minute)

1. Go to the **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Retry deployment"**
5. Wait for deployment to complete (usually 30-60 seconds)

### Step 4: Test It Works

1. Go to your site's admin panel
2. Navigate to the **R2 Gallery Manager** section
3. The yellow warning should be gone
4. Try uploading an image
5. You should see it appear in the gallery!

## Troubleshooting

### Still seeing "R2 Storage Not Connected"?

**Problem**: The binding name doesn't match
**Solution**: Go back to Step 2 and make sure the variable name is exactly `R2_BUCKET` (all caps, with underscore)

### Getting "Bucket not found" error?

**Problem**: The bucket name doesn't match what's in wrangler.toml
**Solution**: Make sure you created the bucket with the exact name `pixie-blooms-images` (with hyphens, not underscores)

### Deployment failed?

**Problem**: Maybe a build error unrelated to R2
**Solution**: Check the deployment logs. The R2 binding won't cause build failures.

## What Changed?

- Your code was already correct
- The `wrangler.toml` file already has the right configuration
- The only missing piece was creating the actual R2 bucket and binding it in the Cloudflare Dashboard
- Once bound, all R2 functions will automatically start working

## Verifying It's Working

After completing the setup, you can verify in browser console:

```javascript
// Test upload
const formData = new FormData();
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = async (e) => {
  formData.append('file', e.target.files[0]);
  const response = await fetch('/api/r2-upload', { method: 'POST', body: formData });
  console.log(await response.json());
};
input.click();
```

If it works, you'll see a JSON response with `url`, `fileName`, `size`, and `type` fields.

## Need More Help?

See the detailed guide: **R2-ANALYTICS-SETUP.md**

Or check these common issues:
- Make sure you're logged into the correct Cloudflare account
- Make sure you selected the correct Pages project
- Make sure the binding was saved (you should see it listed in the Functions section)
- Make sure you redeployed after adding the binding
