'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  LogOut,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import EmailCard from '@/components/email-card';
import DashboardSkeleton from '@/components/dashboard-skeleton';
import { toast } from 'sonner';
import { mockEmails } from '@/lib/mock-emails';
import type { Session } from 'next-auth';

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredEmails, setFilteredEmails] = useState<any[]>([]);

  const userEmail = session.user?.email ?? '';

  // Truncate text to create a summary (used for demo mode fallback)
  const truncateSummary = (body: string, maxLength: number = 100): string => {
    // Remove HTML tags
    const cleanBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

    // Truncate to maxLength and add ellipsis if needed
    if (cleanBody.length <= maxLength) {
      return cleanBody;
    }

    return cleanBody.substring(0, maxLength).trim() + '...';
  };

  // Helper to check if we're in demo mode (safe for SSR)
  const isDemoMode = () => {
    // Check if we're in the browser (localStorage is only available in browser)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo-mode') === 'true' ||
        !process.env.AZURE_AD_CLIENT_ID || !process.env.GOOGLE_GEMINI_API_KEY || !process.env.UPSTASH_REDIS_REST_URL;
    }
    // During SSR, check only environment variables
    return !process.env.AZURE_AD_CLIENT_ID || !process.env.GOOGLE_GEMINI_API_KEY || !process.env.UPSTASH_REDIS_REST_URL;
  };

  // Fetch emails when the component mounts or when search term changes
  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, we would call our API route to fetch emails from Microsoft Graph
        // For now, we'll use mock emails if we are in demo mode, or try to fetch from API
        const demoMode = isDemoMode();

        let fetchedEmails: any[] = [];
        if (demoMode) {
          // Use mock emails and generate summaries (truncation fallback)
          fetchedEmails = mockEmails.map((email) => ({
            ...email,
            summary: truncateSummary(email.body.content, 100),
          }));
        } else {
          // Call API route to fetch real emails
          const res = await fetch('/api/fetch-emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
          if (!res.ok) {
            throw new Error('Failed to fetch emails');
          }
          fetchedEmails = await res.json();
        }

        setEmails(fetchedEmails);
        setFilteredEmails(fetchedEmails); // Initially show all
      } catch (err) {
        console.error('Error fetching emails:', err);
        setError('Failed to load emails. Please try again.');
        setFilteredEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []); // We'll also run when searchTerm changes? We'll do filtering separately

  // Filter emails based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmails(emails);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = emails.filter((email: any) =>
      email.subject.toLowerCase().includes(lowerSearchTerm) ||
      email.sender.name.toLowerCase().includes(lowerSearchTerm) ||
      email.sender.email.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredEmails(filtered);
  }, [searchTerm, emails]);

  const handleFetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, we would call our API route to fetch emails from Microsoft Graph
      // For now, we'll use mock emails if we are in demo mode, or try to fetch from API
      const demoMode = isDemoMode();

      let fetchedEmails: any[] = [];
      if (demoMode) {
        // Use mock emails and generate summaries (truncation fallback)
        fetchedEmails = mockEmails.map((email) => ({
          ...email,
          summary: truncateSummary(email.body.content, 100),
        }));
      } else {
        // Call API route to fetch real emails
        const res = await fetch('/api/fetch-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          throw new Error('Failed to fetch emails');
        }
        fetchedEmails = await res.json();
      }

      setEmails(fetchedEmails);
      setFilteredEmails(fetchedEmails); // Initially show all
      toast.success('Emails fetched successfully');
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch emails. Please try again.');
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const userImage = session.user?.image;
  const avatar = userImage ? (
    <AvatarImage src={userImage} alt={session.user?.name ?? ''} />
  ) : (
    <AvatarFallback>
      {session.user?.name?.charAt(0) ?? 'U'}
    </AvatarFallback>
  );

  const demoModeForBanner = isDemoMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                  Outlook Mail Summarizer
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-10 w-10 rounded-md bg-accent p-0">
                    <Avatar className="h-10 w-10">
                      {avatar}
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg text-left dark:border-gray-600 dark:bg-gray-800">
                    <DropdownMenuItem onClick={() => {}}>
                      <span className="flex items-center space-x-3">
                        <UserPlus className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <span className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      // Sign out
                      await fetch('/api/auth/signout', { method: 'POST' });
                      window.location.href = '/';
                    }}>
                      <span className="flex items-center space-x-3">
                        <LogOut className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sign out</span>
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mt-10">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your Inbox Summary
            </h1>
            <div className="mt-4 flex max-w-xl items-center justify-between">
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-xs"
              />
              <Button
                variant="outline"
                onClick={handleFetchEmails}
                disabled={loading}
              >
                {loading ? 'Fetching...' : 'Fetch Emails'}
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {loading && emails.length === 0 ? (
              <div className="text-center py-12">
                <DashboardSkeleton />
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No emails found. Try adjusting your search or fetching again.
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredEmails.map((email: any) => (
                      <EmailCard
                        key={email.id}
                        id={email.id}
                        subject={email.subject}
                        sender={email.sender}
                        receivedDateTime={email.receivedDateTime}
                        body={email.body}
                        isRead={email.isRead}
                        importance={email.importance}
                        summary={email.summary}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Demo mode banner */}
      {demoModeForBanner ? (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 z-50">
          Running in demo mode. Connect your Outlook account to see real emails.
        </div>
      ) : null}
    </div>
  );
}