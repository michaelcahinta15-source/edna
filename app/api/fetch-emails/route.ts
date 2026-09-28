import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Client } from '@microsoft/microsoft-graph-client';
import { upstashService } from '@/lib/upstash';
import { geminiService } from '@/lib/gemini';
import { mockEmails } from '@/lib/mock-emails';

interface GraphMessage {
  id: string;
  subject: string;
  sender: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  body: {
    contentType: string;
    content: string;
  };
  isRead: boolean;
  importance: string; // low, normal, high
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request });
    const accessToken = token?.accessToken as string | undefined;

    // Check if we are in demo mode (no credentials or demo flag)
    const demoModeBasedOnEnv =
      !process.env.AZURE_AD_CLIENT_ID ||
      !process.env.GOOGLE_GEMINI_API_KEY ||
      !process.env.UPSTASH_REDIS_REST_URL;

    let messages: GraphMessage[] = [];

    if (demoModeBasedOnEnv) {
      // Use mock emails
      messages = mockEmails.map((email) => ({
        id: email.id,
        subject: email.subject,
        sender: {
          emailAddress: {
            name: email.sender.name,
            address: email.sender.email,
          },
        },
        receivedDateTime: email.receivedDateTime,
        body: {
          contentType: email.body.contentType === 'text' ? 'text' : 'html',
          content: email.body.content,
        },
        isRead: email.isRead,
        importance: email.importance,
      }));
    } else {
      // Fetch real emails from Microsoft Graph
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      // Get the latest 20 emails
      const graphResponse = await client
        .api('/me/messages')
        .top(20)
        .select('id,subject,sender,receivedDateTime,body,isRead,importance')
        .orderby('receivedDateTime DESC')
        .get();

      messages = graphResponse.value;
    }

    // Process emails: summarize and cache
    const processedEmails = await Promise.all(
      messages.map(async (message) => {
        // Check cache for summary
        const cacheKey = `email-summary:${message.id}`;
        let summary = await upstashService.get<string>(cacheKey);

        if (!summary) {
          // Generate summary using Gemini
          summary = await geminiService.summarizeEmail(message.body.content);
          // Cache the summary for 1 hour
          await upstashService.set(cacheKey, summary, { ttl: 3600 });
        }

        return {
          id: message.id,
          subject: message.subject,
          sender: {
            name: message.sender.emailAddress.name,
            email: message.sender.emailAddress.address,
          },
          receivedDateTime: message.receivedDateTime,
          body: {
            content: message.body.content,
            contentType: message.body.contentType as 'text' | 'html',
          },
          isRead: message.isRead,
          importance: message.importance.toLowerCase() as 'low' | 'normal' | 'high',
          summary,
        };
      })
    );

    return NextResponse.json(processedEmails);
  } catch (error: any) {
    console.error('Error in fetch-emails API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}