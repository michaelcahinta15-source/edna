'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LucideIcon, Mail, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';

const Logo = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
    <Mail className="h-5 w-5" />
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('microsoft-entra-id', { redirectTo: '/dashboard' });
    } catch (err) {
      setError('Failed to sign in with Microsoft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    // For demo, we'll just redirect to dashboard
    // In a production app, you would use NextAuth credentials or a mock auth
    // For simplicity, we'll just set a session and redirect
    // But since we are using NextAuth, we can't easily set a session without a provider
    // So we'll use a mock auth by setting a cookie or using a different approach
    // For now, we'll just show a toast or redirect to dashboard with a demo flag
    // We'll implement a simple demo login that just goes to dashboard
    // In a real app, you would have a credentials provider in NextAuth
    // Since we are not implementing a credentials provider, we'll simulate by checking if email is demo
    if (email === 'demo@example.com' && password === 'password') {
      // We would normally set a session here, but for simplicity we'll just redirect
      // and rely on the demo mode in the dashboard to show mock data
      // We'll set a flag in localStorage to indicate demo mode
      localStorage.setItem('demo-mode', 'true');
      // Also set a cookie for the server to check
      document.cookie = "demo-mode=true; path=/";
      window.location.href = '/dashboard';
    } else {
      setError('Invalid demo credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Outlook Mail Summarizer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            AI-powered email summarization for your Outlook inbox
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleDemoLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </div>
        </form>

        <Button
          onClick={handleMicrosoftLogin}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          {isLoading ? 'Signing in...' : (
            <>
              <ShieldCheck className="mr-3 h-4 w-4" />
              Sign in with Microsoft
            </>
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Demo credentials: <span className="font-medium">demo@example.com</span> / <span className="font-medium">password</span>
        </p>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Running in{' '}
          {!process.env.AZURE_AD_CLIENT_ID || !process.env.GOOGLE_GEMINI_API_KEY || !process.env.UPSTASH_REDIS_REST_URL
            ? <span className="font-medium text-red-600">demo mode</span>
            : <span className="font-medium text-green-600">connected mode</span>
          }
        </p>
      </div>
    </div>
  );
}
