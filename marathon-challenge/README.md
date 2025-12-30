# Marathon-a-Month Challenge

A production-ready web app that connects to Strava and tracks monthly running mileage. Users compete to reach 26.2 miles (marathon distance) each month, with a live leaderboard showing rankings.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **External API**: Strava API (OAuth + Activities)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Strava API application (create at https://www.strava.com/settings/api)

### 2. Install Dependencies

```bash
cd marathon-challenge
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the `marathon-challenge` directory:

```env
# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3003/api/strava/callback

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Node Environment
NODE_ENV=development
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql` to create the required tables:
   - `users` - Stores Strava OAuth tokens
   - `challenge_participants` - Tracks monthly mileage totals
   - `activities_cache` - Optional cache for activities

### 5. Configure Strava OAuth

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set the **Authorization Callback Domain** to `localhost` (for local dev) or your production domain
4. Copy the **Client ID** and **Client Secret** to your `.env.local`
5. Set `STRAVA_REDIRECT_URI` to match your callback URL

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

## Project Structure

```
marathon-challenge/
├── app/
│   ├── (public)/
│   │   └── page.tsx          # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard with progress & leaderboard
│   ├── api/
│   │   └── strava/
│   │       ├── auth/route.ts      # OAuth redirect
│   │       ├── callback/route.ts  # Token exchange
│   │       └── sync/route.ts      # Sync activities
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Leaderboard.tsx
│   ├── ProgressCard.tsx
│   └── SyncButton.tsx
├── lib/
│   ├── supabaseServer.ts     # Supabase client
│   ├── strava.ts             # Strava API wrapper
│   ├── dates.ts              # Date utilities
│   └── miles.ts              # Miles conversion
├── types/
│   └── strava.ts             # Strava API types
└── supabase/
    └── schema.sql            # Database schema
```

## Features

- **OAuth Integration**: Secure Strava authentication
- **Automatic Token Refresh**: Handles expired tokens automatically
- **Monthly Tracking**: Calculates total running miles for the current month
- **Progress Tracking**: Shows progress toward 26.2-mile goal
- **Leaderboard**: Ranks all participants by total miles
- **Smart Syncing**: Only syncs if last sync was >15 minutes ago (unless forced)
- **Mobile-Friendly**: Responsive design with Tailwind CSS

## Deployment to Vercel

**Production URL:** https://marathon-challenge.vercel.app

### Setup Steps:

1. Push your code to GitHub
2. Import the project in Vercel (or connect existing deployment)
3. Add all environment variables in Vercel dashboard:
   ```
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   STRAVA_REDIRECT_URI=https://marathon-challenge.vercel.app/api/strava/callback
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://marathon-challenge.vercel.app
   ```
4. **Update Strava OAuth Settings:**
   - Go to https://www.strava.com/settings/api
   - Update **Authorization Callback Domain** to: `marathon-challenge.vercel.app`
   - Make sure `STRAVA_REDIRECT_URI` matches: `https://marathon-challenge.vercel.app/api/strava/callback`
5. Redeploy your Vercel project to apply changes

## API Routes

### `GET /api/strava/auth`
Redirects user to Strava OAuth authorization page.

### `GET /api/strava/callback`
Handles OAuth callback, exchanges code for tokens, and creates/updates user in database.

### `POST /api/strava/sync`
Syncs Strava activities for a user and updates monthly mileage total.

**Request Body:**
```json
{
  "stravaAthleteId": "123456",
  "force": false
}
```

**Response:**
```json
{
  "message": "Sync completed successfully",
  "synced": true,
  "miles_total": 15.5,
  "activities_count": 8
}
```

## Notes

- The app uses cookies to maintain user session (strava_athlete_id)
- All Strava API calls are made server-side to keep secrets secure
- Timezone is set to America/Los_Angeles for month boundaries
- Only "Run" activities are counted toward mileage
- Distance is converted from meters to miles (1 mile = 1609.344 meters)

## Future Enhancements (Not in MVP)

- Strava Webhooks for real-time updates
- Multiple goal types
- Team challenges
- Activity feed
- Historical month tracking
