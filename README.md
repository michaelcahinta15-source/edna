# Outlook Mail Summarizer

A production-ready web app that summarizes your Outlook emails using AI, built with Next.js 15 and deployed on Vercel Hobby (free tier).

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript (strict mode)
- **UI**: Tailwind CSS + shadcn/ui components + Lucide icons
- **Auth**: NextAuth.js (Auth.js) v5 with Microsoft Entra ID provider (Outlook)
- **Email API**: Microsoft Graph API (@microsoft/microsoft-graph-client) — free for personal outlook.com accounts
- **AI Summarization**: Google Gemini API via @google/generative-ai (gemini-1.5-flash) — FREE tier
- **Cache**: Upstash Redis free tier (@upstash/redis) with localStorage fallback
- **Deployment**: Vercel Hobby (free)

## Zero-Cost Constraints

- ✅ All services used have a permanent free tier
- ❌ No paid APIs (Anthropic Claude, OpenAI, etc.)
- ❌ No Vercel KV (now paid) — using Upstash Redis instead
- ✅ Graceful fallback to truncation-based summary if Gemini free tier is exceeded
- ✅ Works with free personal Microsoft accounts (outlook.com, hotmail.com, live.com) — no Azure paid subscription required

## Free Tier Limits

| Service | Free Tier Limits |
|---------|------------------|
| Google Gemini (gemini-1.5-flash) | 15 requests/minute, 1,500 requests/day |
| Upstash Redis | 10,000 commands/day |
| Vercel (Hobby) | 100 GB bandwidth/month, 100 GB-hours compute/month |

## Local Setup

### Prerequisites

- Node.js 20+ installed
- Git installed
- Accounts for the free services (see below)

### 1. Clone the repository

```bash
git clone <repository-url>
cd edna
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then fill in the values:

```env
# NextAuth
AZURE_AD_CLIENT_ID=your_azure_ad_client_id
AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret
AZURE_AD_TENANT_ID=common  # Important: use "common" for personal accounts
NEXTAUTH_SECRET=your_nextauth_secret  # Generate with: openssl rand -hex 32
NEXTAUTH_URL=http://localhost:4000  # IMPORTANT: must be http://localhost:4000 for dev

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

### 4. Get API Keys and Credentials

#### Azure AD (Microsoft Entra ID) for Outlook

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Fill in:
   - **Name**: Outlook Mail Summarizer
   - **Supported account types**: Select **"Personal Microsoft accounts"** (or "All Microsoft account users")
   - **Redirect URI**: `http://localhost:4000/api/auth/callback/microsoft-entra-id`
4. Click **Register**
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** > **New client secret**
   - Add a description and set expiration
   - Copy the **Value** (you won't see it again!)
7. In `.env.local`:
   - `AZURE_AD_CLIENT_ID` = Application (client) ID
   - `AZURE_AD_CLIENT_SECRET` = Value from step 6
   - `AZURE_AD_TENANT_ID` = Directory (tenant) ID (use "common" for personal accounts)

#### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API key** > **Create API key in new project**
4. Copy the API key
5. In `.env.local`: `GOOGLE_GEMINI_API_KEY=your_api_key`

#### Upstash Redis

1. Go to [Upstash](https://upstash.com/) and sign up (free tier available)
2. Create a new Redis database
3. Select the database and go to **Settings** > **REST API**
4. Copy the **REST URL** and **REST Token**
5. In `.env.local`:
   - `UPSTASH_REDIS_REST_URL=your_rest_url`
   - `UPSTASH_REDIS_REST_TOKEN=your_rest_token`

### 5. Generate NextAuth Secret

Run the following command to generate a secret:

```bash
openssl rand -hex 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in `.env.local`.

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:4000** (not 3000!).

> **Important**: The app is configured to run on port 4000 to avoid conflicts with other tools. All documentation assumes port 4000.

### 7. Demo Mode

If you don't want to set up the external services, the app includes a demo mode:
- Leave the Azure AD, Google Gemini, and Upstash Redis fields empty in `.env.local`
- The app will use mock emails and a simple truncation-based summary
- A banner will indicate you're running in demo mode

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up (free tier available)
2. Click **New Project** > **Import Git Repository**
3. Select your repository
4. Configure the project:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Root Directory**: `/` (if your app is at the repo root)
5. Click **Deploy**

### 3. Set Environment Variables in Vercel

In your Vercel project dashboard:
1. Go to **Settings** > **Environment Variables**
2. Add the same variables as in `.env.local` (except `NEXTAUTH_URL`)
3. For `NEXTAUTH_URL`, set it to your Vercel deployment URL (e.g., `https://outlook-mail-summarizer.vercel.app`)
4. Make sure to add all variables from `.env.local.example`

### 4. Update Azure AD Redirect URI

After deploying to Vercel, you need to add the production redirect URI to your Azure App Registration:
1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to your app registration > **Authentication**
3. Under **Redirect URIs**, add:
   - `https://your-vercel-app.vercel.app/api/auth/callback/microsoft-entra-id`
4. Click **Save**

## How It Works

1. **Authentication**: Users sign in with their Microsoft account via NextAuth and Microsoft Entra ID.
2. **Fetching Emails**: On the dashboard, clicking "Fetch Emails" calls `/api/fetch-emails`, which:
   - Uses the Microsoft Graph API to get the latest 20 emails from `/me/messages`
   - For each email, checks if a summary is cached in Upstash Redis
   - If not cached, generates a summary using Google Gemini API (gemini-1.5-flash)
   - Caches the summary in Upstash Redis for 1 hour (TTL=3600)
   - Returns the emails with summaries to the client
3. **Summarization**: The `/api/summarize` endpoint is used internally to generate and cache summaries.
4. **UI**: The dashboard displays emails in cards with:
   - Sender avatar and name
   - Relative timestamp (e.g., "2h ago")
   - Email subject
   - AI-generated summary (2-3 sentences)
   - Importance badge
   - Expandable view to see the full email

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth
│   │   │   └── [...nextauth]/route.ts
│   │   ├── fetch-emails/route.ts
│   │   └── summarize/route.ts
│   ├── dashboard/          # Dashboard page
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Login page
│   └── globals.css         # Tailwind + custom styles
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── email-card.tsx      # Email display component
│   └── dashboard-skeleton.tsx
├── lib/                    # Utilities and services
│   ├── gemini.ts           # Google Gemini service
│   ├── mock-emails.ts      # Demo mode emails
│   ├── upstash.ts          # Upstash Redis service
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── styles/                 # CSS (if any)
```

## Development Notes

- **Port 4000**: The app is explicitly configured to run on port 4000 to avoid conflicts. Change the `dev` and `start` scripts in `package.json` if you need a different port.
- **Dark Mode**: Uses `next-themes` with system preference as default.
- **Error Handling**: Includes error states, loading skeletons, and toast notifications.
- **Accessibility**: Proper labels, aria attributes, and keyboard navigation.
- **TypeScript**: Strict mode enabled for type safety.

## Troubleshooting

### "Invalid state" error during Microsoft login

- Ensure the redirect URI in Azure AD exactly matches: `http://localhost:4000/api/auth/callback/microsoft-entra-id` (for dev) or your Vercel URL (for prod)
- Make sure you're using the "Personal Microsoft accounts" option in Azure AD
- Clear cookies and try again

### Email fetching fails in production

- Verify the Vercel environment variables are set correctly
- Check that the Upstash Redis database is active (free tier may sleep)
- Ensure the Microsoft Graph API permissions are granted (though for personal accounts, delegated permissions are implied by sign-in)

### Gemini API rate limits

- The app will automatically fall back to truncation-based summary if Gemini API returns an error
- You'll see a console warning when this happens
- The free tier is generous for personal use (1,500 requests/day)

## License

MIT

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [NextAuth.js](https://next-auth.js.org/)
- [Microsoft Graph](https://learn.microsoft.com/en-us/graph/)
- [Google Gemini API](https://ai.google.dev/gemini-api)
- [Upstash Redis](https://upstash.com/redis)
- [Vercel](https://vercel.com/)