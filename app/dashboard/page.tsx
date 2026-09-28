import { auth } from '../auth';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardClient from './dashboard-client';
import type { Session } from 'next-auth';

export const metadata = {
  title: 'Outlook Mail Summarizer - Dashboard',
  description: 'Your AI-powered email summary',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const demoModeCookie = cookieStore.get('demo-mode');
  const demoModeFromCookie = demoModeCookie?.value === 'true';

  // Demo mode if any of the required env vars are missing (original check)
  const demoModeFromEnv =
    !process.env.AZURE_AD_CLIENT_ID ||
    !process.env.GOOGLE_GEMINI_API_KEY ||
    !process.env.UPSTASH_REDIS_REST_URL;

  const demoMode = demoModeFromCookie || demoModeFromEnv;

  const session = await auth();

  let sessionToPass: Session | null = session;
  if (!session && demoMode) {
    // Provide a mock session for demo mode
    // Extend the Session type to include what we need for demo
    sessionToPass = {
      user: {
        name: 'Demo User',
        email: 'demo@example.com',
        image: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as Session;
  }

  if (!sessionToPass) {
    return notFound();
  }

  return <DashboardClient session={sessionToPass} />;
}