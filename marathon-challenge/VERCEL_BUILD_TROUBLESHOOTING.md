# Vercel Build Troubleshooting Guide

## Common Build Failures & Solutions

### 1. Check Build Logs
Go to Vercel Dashboard → Your Project → Deployments → Click on failed deployment → View Build Logs

### 2. Common Issues:

#### A. Missing Environment Variables
**Error:** `Missing SUPABASE_URL environment variable` or similar
**Fix:** 
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all required variables:
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `STRAVA_REDIRECT_URI`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_BASE_URL`

#### B. TypeScript Errors
**Error:** `Type error: Type 'X' is not assignable to type 'Y'`
**Fix:** 
- Run `npm run build` locally to see errors
- Fix type errors before pushing

#### C. ESLint Errors
**Error:** `Failed to compile` with ESLint warnings
**Fix:**
- Run `npm run lint` locally
- Fix all ESLint errors
- Or temporarily set `ignoreDuringBuilds: true` in next.config.js

#### D. Module Resolution Errors
**Error:** `Module not found: Can't resolve '@/lib/...'`
**Fix:**
- Ensure `baseUrl: "."` is in tsconfig.json ✅ (Already fixed)
- Ensure Root Directory in Vercel is set to `marathon-challenge`

#### E. Rive Animation Errors
**Error:** `useRive` hook errors or SSR issues
**Fix:**
- All Rive components should use `'use client'` directive ✅ (Already fixed)
- Use dynamic imports for Rive components ✅ (Already fixed)

### 3. Quick Fixes to Try:

#### Option 1: Temporarily Ignore Build Errors (for debugging)
In `next.config.js`:
```js
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
```

#### Option 2: Check Root Directory
Vercel Dashboard → Settings → General → Root Directory
Should be: `marathon-challenge`

#### Option 3: Clear Build Cache
Vercel Dashboard → Settings → General → Clear Build Cache

### 4. Verify Local Build Works
```bash
cd marathon-challenge
npm install
npm run build
```

If local build fails, fix those errors first!

### 5. Check Node.js Version
Vercel Dashboard → Settings → General → Node.js Version
Should be: `18.x` or `20.x`


