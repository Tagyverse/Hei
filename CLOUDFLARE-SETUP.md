# Cloudflare Pages Setup - Fixing "DOCTYPE" Error

## Problem
When testing the Gemini AI API key, you're getting an error like "unexpected token <DOCTYPE" instead of a JSON response.

## Root Cause
The `/api/ai-assistant` endpoint is returning the HTML index page instead of the API function response. This means Cloudflare Pages is not properly routing API requests to the Functions.

## Solution: Redeploy with Functions

### Step 1: Verify Local Structure
Ensure your project has this structure:
```
project-root/
├── functions/
│   └── api/
│       ├── ai-assistant.js
│       └── (other function files)
├── dist/
│   ├── index.html
│   └── _redirects
├── package.json
└── wrangler.toml
```

### Step 2: Redeploy to Cloudflare Pages

#### Option A: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard** → Workers & Pages → Your Project

2. **Check Current Deployment:**
   - Click on your latest deployment
   - Look for "Functions" section
   - If you don't see functions like `/api/ai-assistant`, they weren't deployed

3. **Trigger a New Deployment:**
   - Go to "Deployments" tab
   - Click "Create deployment" or "Retry deployment"
   - Or push a new commit to trigger automatic deployment

4. **Verify Functions are Deployed:**
   - After deployment completes, click on the deployment
   - Go to "Functions" tab
   - You should see:
     - `/api/ai-assistant`
     - `/api/create-payment-session`
     - `/api/payment-webhook`
     - `/api/verify-payment`

#### Option B: Using Wrangler CLI

```bash
# Install wrangler if you haven't
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy (make sure you're in the project root)
wrangler pages deploy . --project-name=your-project-name
```

### Step 3: Test the API

After redeployment, test in your browser console:

```javascript
// Replace with your actual domain
fetch('https://your-site.pages.dev/api/ai-assistant')
  .then(r => r.json())
  .then(d => console.log(d))

// Should return: {"status":"AI Assistant API is online"}
```

Or use curl:
```bash
curl https://your-site.pages.dev/api/ai-assistant
```

### Step 4: Test Gemini API in Admin Panel

Once the API returns JSON (not HTML):
1. Go to Admin Panel
2. Navigate to "AI Marketing Assistant"
3. Click "Settings" tab
4. Enter your Gemini API key
5. Click "Test API Key"
6. You should see: "✅ API Key Test Successful!"

---

## Why This Happens

Cloudflare Pages needs both:
1. The `dist` folder (your built frontend)
2. The `functions` folder (your API endpoints)

If only `dist` is deployed:
- All routes (including `/api/*`) → return `index.html`
- This is why you get HTML/DOCTYPE instead of JSON

When `functions` folder is properly deployed:
- `/api/*` routes → handled by functions (returns JSON)
- Everything else → handled by SPA (returns HTML)

---

## Troubleshooting

### Still Getting DOCTYPE Error?

**Check 1: Functions Tab in Cloudflare**
- Go to your deployment in Cloudflare Dashboard
- Check "Functions" tab
- If empty = functions not deployed

**Check 2: Build Settings**
- Build command: `npm run build`
- Build output directory: `dist` (NOT `/dist`)
- Root directory: (leave empty)

**Check 3: Git Repository**
- Ensure `functions/` folder is committed to git
- Check `.gitignore` doesn't exclude `functions/`

**Check 4: Function Files**
- Must be `.js` files (TypeScript files are source only)
- The build script compiles `.ts` → `.js`
- Run `npm run build:functions` to verify

### Manual Verification

Run locally with Wrangler:
```bash
npm run dev:wrangler
```

Then test:
```bash
curl http://localhost:8788/api/ai-assistant
```

If this works locally but not on live server, the issue is definitely with deployment.

---

## Quick Fix Checklist

- [ ] Run `npm run build` (this compiles functions)
- [ ] Verify `functions/api/ai-assistant.js` exists
- [ ] Commit and push to git (if deploying from git)
- [ ] Trigger new deployment on Cloudflare Pages
- [ ] Check "Functions" tab shows your functions
- [ ] Test API endpoint returns JSON
- [ ] Test API key in admin panel

---

Need help? Check the build logs in Cloudflare Pages Dashboard for errors during function compilation.
