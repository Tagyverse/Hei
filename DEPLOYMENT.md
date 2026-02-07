# Cloudflare Pages Deployment Instructions

## Important: Functions Folder Structure

For the AI Assistant and payment functions to work on Cloudflare Pages, you MUST ensure the `functions` folder is deployed at the root level alongside the `dist` folder.

### Deployment Structure

Your deployment should look like:
```
root/
├── dist/          (your built app)
│   ├── index.html
│   ├── assets/
│   └── _redirects
└── functions/     (your API endpoints)
    └── api/
        ├── ai-assistant.js
        ├── create-payment-session.js
        ├── payment-webhook.js
        └── verify-payment.js
```

### Cloudflare Pages Configuration

1. **Build Configuration:**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty or set to root)

2. **Important:** The `functions` folder must be at the project root level, NOT inside `dist`

3. **After Deployment:**
   - Cloudflare Pages automatically detects the `functions` folder
   - Routes like `/api/ai-assistant` will be handled by the functions
   - All other routes go to the SPA (Single Page Application)

### Testing the API

After deployment, test if functions are working:
```bash
# Test if API is online
curl https://your-site.pages.dev/api/ai-assistant

# Should return: {"status":"AI Assistant API is online"}
```

### Common Issues

**Issue: Getting HTML instead of JSON from `/api/*` endpoints**

**Solution:**
- Verify the `functions` folder exists at the root level during deployment
- Check Cloudflare Pages deployment logs to ensure functions were detected
- Look for message: "✨ Detected Functions in: functions"

**Issue: 404 on API endpoints**

**Solution:**
- Ensure function files are named correctly (ai-assistant.js, not ai-assistant.ts)
- Check that exports are using: `export { onRequestGet, onRequestPost, onRequestOptions }`
- Verify the _redirects file is: `/* /index.html 200`

### Verifying Functions are Deployed

In Cloudflare Pages Dashboard:
1. Go to your project
2. Click on the deployment
3. Check the "Functions" tab
4. You should see: `/api/ai-assistant`, `/api/create-payment-session`, etc.

If functions are not showing, the `functions` folder was not included in the deployment.

### Manual Deployment Steps

If using Wrangler CLI:
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=your-project-name

# Note: Wrangler automatically includes the functions folder from the project root
```

### Deployment from Git

If deploying from a Git repository:
1. Ensure both `dist` (after build) and `functions` folders are committed
2. Configure Cloudflare Pages to build and deploy from your repository
3. Cloudflare will run the build command and include the functions folder automatically
