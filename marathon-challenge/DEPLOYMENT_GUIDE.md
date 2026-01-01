# Vercel Deployment Guide

Your project is already linked to Vercel! Here are the steps to deploy:

## Option 1: Deploy via Vercel Dashboard (Recommended - Easiest)

Since your project is already on GitHub (`jerribydesign/MarathonChallenge`), this is the easiest method:

### Step 1: Connect GitHub Repository (if not already connected)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `jerribydesign/MarathonChallenge`
4. If already imported, skip to Step 2

### Step 2: Configure Project Settings
1. In your Vercel project dashboard, go to **Settings** → **General**
2. **IMPORTANT:** Set **Root Directory** to: `marathon-challenge`
   - This is critical! Your Next.js app is in a subdirectory, so Vercel needs to know where to find it
   - Click "Edit" next to Root Directory
   - Enter: `marathon-challenge`
   - Click "Save"
3. Set **Framework Preset** to: `Next.js` (should auto-detect)
4. Set **Node.js Version** to: `18.x` or `20.x`
5. After changing Root Directory, you **must redeploy** for changes to take effect

### Step 3: Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

```
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=https://your-project-name.vercel.app/api/strava/callback
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
```

**Important:** Replace `your-project-name` with your actual Vercel project name (check the URL in your Vercel dashboard).

### Step 4: Update Strava OAuth Settings
1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Find your application
3. Update **Authorization Callback Domain** to your Vercel domain
   - **Important:** Enter ONLY the domain name, NO `https://` and NO paths
   - Example: `marathon-challenge.vercel.app` ✅
   - Wrong: `https://marathon-challenge.vercel.app` ❌
4. Make sure `STRAVA_REDIRECT_URI` in Vercel matches: `https://your-project-name.vercel.app/api/strava/callback`
   - Note: The environment variable uses the full URL with `https://`, but the Strava field only wants the domain

### Step 5: Deploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment, or
3. Push a new commit to GitHub (Vercel will auto-deploy)

---

## Option 2: Deploy via Vercel CLI

If you prefer using the CLI:

### Step 1: Make sure you're logged in
```bash
vercel login
```

### Step 2: Deploy to production
```bash
cd marathon-challenge
vercel --prod
```

**Note:** If you get SSL certificate errors, try:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 vercel --prod
```
(Only use this if you're behind a corporate proxy)

---

## Option 3: Auto-Deploy from GitHub (Recommended for ongoing updates)

Once connected via Option 1, every push to your `main` branch will automatically deploy to Vercel!

1. Make sure your GitHub repo is connected in Vercel dashboard
2. Push your code:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```
3. Vercel will automatically build and deploy

---

## Verify Deployment

After deployment:
1. Check the deployment status in Vercel dashboard
2. Visit your deployment URL (e.g., `https://your-project-name.vercel.app`)
3. Test the Strava OAuth flow
4. Check the build logs if anything fails

---

## Troubleshooting

### Getting 404 Error?
- **Most common cause:** Root Directory not set correctly
  - Go to **Settings** → **General** → **Root Directory**
  - Must be set to: `marathon-challenge` (not blank or `/`)
  - After changing, click **Deployments** → **Redeploy**
- Check build logs to see if build succeeded
- Verify your `app/page.tsx` exists in the correct location

### Build Fails?
- Check **Deployments** → Click failed deployment → **View Build Logs**
- Common issues:
  - Missing environment variables → Add them in Settings
  - TypeScript errors → Fix locally first with `npm run build`
  - Root directory wrong → Set to `marathon-challenge` in Settings

### Environment Variables Not Working?
- Make sure they're set for **Production** environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Strava OAuth Not Working?
- Verify `STRAVA_REDIRECT_URI` matches your Vercel URL exactly
- Check Strava callback domain is set correctly
- Make sure you're using HTTPS (not HTTP)

---

## Quick Checklist

- [ ] Project connected to GitHub in Vercel
- [ ] Root directory set to `marathon-challenge`
- [ ] All environment variables added
- [ ] Strava OAuth callback domain updated
- [ ] Deployment successful
- [ ] Test OAuth flow works

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Check build logs in Vercel dashboard
- See `VERCEL_BUILD_TROUBLESHOOTING.md` for common issues

