export interface MockEmail {
  id: string
  subject: string
  sender: {
    name: string
    email: string
  }
  receivedDateTime: string
  body: {
    content: string
    contentType: 'text' | 'html'
  }
  isRead: boolean
  importance: 'low' | 'normal' | 'high'
}

export const mockEmails: MockEmail[] = [
  {
    id: '1',
    subject: 'Project Update: Q3 Milestones',
    sender: {
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com'
    },
    receivedDateTime: '2026-09-28T10:30:00Z',
    body: {
      content: `Hi team,

I wanted to share an update on our Q3 milestones. We've made significant progress on the frontend redesign, with 80% of the UI components now complete. The API team has finished the user management endpoints and is moving on to payment processing.

Key accomplishments:
- Completed user authentication flow
- Finished product catalog UI
- Integrated with Stripe for payment processing
- Started work on admin dashboard

Next steps:
- Complete payment processing integration (EOD tomorrow)
- Begin QA testing for user flows
- Prepare for stakeholder review on Friday

Let me know if you have any questions.

Best,
Sarah`,
      contentType: 'text'
    },
    isRead: false,
    importance: 'high'
  },
  {
    id: '2',
    subject: 'Team Lunch Tomorrow at 12:30 PM',
    sender: {
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@example.com'
    },
    receivedDateTime: '2026-09-28T09:15:00Z',
    body: {
      content: `Hey everyone,

Just a reminder about our team lunch tomorrow at 12:30 PM in the cafeteria. We'll be having pizza and salad. Please let me know if you have any dietary restrictions.

Looking forward to catching up!

Michael`,
      contentType: 'text'
    },
    isRead: true,
    importance: 'normal'
  },
  {
    id: '3',
    subject: 'Your Monthly Newsletter - September 2026',
    sender: {
      name: 'TechNews Daily',
      email: 'newsletter@technews.example.com'
    },
    receivedDateTime: '2026-09-27T16:45:00Z',
    body: {
      content: `<h1>TechNews Daily - September Edition</h1>
<p>Welcome to your monthly digest of the latest technology news and trends.</p>
<h2>Featured Articles:</h2>
<ul>
  <li><a href="https://technews.example.com/ai-breakthrough">Breakthrough in AI Language Models</a></li>
  <li><a href="https://technews.example.com/quantum-computing">Quantum Computing Advances</a></li>
  <li><a href="https://technews.example.com/cybersecurity-update">Latest Cybersecurity Threats</a></li>
</ul>
<p>Don't forget to follow us on social media for real-time updates!</p>`,
      contentType: 'html'
    },
    isRead: false,
    importance: 'low'
  },
  {
    id: '4',
    subject: 'Urgent: Server Maintenance Tonight',
    sender: {
      name: 'IT Operations',
      email: 'it-ops@example.com'
    },
    receivedDateTime: '2026-09-28T14:22:00Z',
    body: {
      content: `ATTENTION: All users

Please be advised that we will be performing critical server maintenance tonight from 2:00 AM to 4:00 AM EST. During this window, all internal systems will be unavailable.

Please save your work and log out before the maintenance begins.

If you experience any issues after the maintenance window, please contact the IT helpdesk.

Thank you for your cooperation.

IT Operations Team`,
      contentType: 'text'
    },
    isRead: false,
    importance: 'high'
  },
  {
    id: '5',
    subject: 'Feedback on Your Recent Presentation',
    sender: {
      name: 'Jessica Wang',
      email: 'jessica.wang@example.com'
    },
    receivedDateTime: '2026-09-27T11:20:00Z',
    body: {
      content: `Hi Alex,

I wanted to give you some feedback on your presentation yesterday at the all-hands meeting. I thought you did an excellent job explaining the new features clearly and concisely. The slides were well-designed and easy to follow.

A few minor suggestions:
1. Consider adding more real-world examples to illustrate the benefits
2. The Q&A section could be structured to allow more audience participation
3. Some of the technical details might be too advanced for non-technical stakeholders

Overall, great job! I look forward to seeing the final version in next week's release.

Best,
Jessica`,
      contentType: 'text'
    },
    isRead: true,
    importance: 'normal'
  }
];
