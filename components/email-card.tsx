import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, Eye, EyeOff, UserPlus, Mail } from 'lucide-react';

interface EmailCardProps {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  receivedDateTime: string; // ISO string
  body: {
    content: string;
    contentType: 'text' | 'html';
  };
  isRead: boolean;
  importance: 'low' | 'normal' | 'high';
  summary: string;
}

export default function EmailCard({
  id,
  subject,
  sender,
  receivedDateTime,
  body,
  isRead,
  importance,
  summary,
}: EmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(receivedDateTime), { addSuffix: true });

  const getImportanceBadge = (importance: EmailCardProps['importance']) => {
    switch (importance) {
      case 'high':
        return <Badge variant="destructive">High Importance</Badge>;
      case 'normal':
        return <Badge>Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Importance</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  // Truncate body for preview
  const getBodyPreview = (body: string, maxLength: number = 100) => {
    // Remove HTML tags
    const clean = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    if (clean.length <= maxLength) return clean;
    return clean.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className="border-none hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex items-start space-x-4 pb-4">
        <Avatar className="h-10 w-10 shrink-0">
          {sender.email ? (
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name)}&background=random`} alt={sender.name} />
          ) : (
            <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className={`${isRead ? 'text-gray-600' : 'text-gray-900 dark:text-white'} font-semibold text-lg`}>
              {subject}
            </CardTitle>
            <Badge variant="outline" className={`${isRead ? 'bg-gray-200' : 'bg-blue-500 text-white'} text-xs`}>
              {!isRead && 'New'}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <UserPlus className="h-3 w-3" />
              {sender.name}
            </span>
            <span>{formattedDate}</span>
            {getImportanceBadge(importance)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {summary}
        </p>
        {!isExpanded && (
          <Button variant="ghost" size="xs" onClick={() => setIsExpanded(true)}>
            <ChevronDown className="h-3 w-3" /> View full email
          </Button>
        )}
        {isExpanded && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>From:</strong> {sender.name} ({sender.email})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Received:</strong> {new Date(receivedDateTime).toLocaleString()}
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: body.contentType === 'html' ? body.content : body.content.replace(/\n/g, '<br/>')
              }}
              className="prose prose-sm max-w-none"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            // Mark as read/unread
            // In a real app, this would update the server
            console.log('Toggle read status');
          }}
        >
          {isRead ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
          <span className="ml-1">{isRead ? 'Mark as unread' : 'Mark as read'}</span>
        </Button>
        <Button variant="ghost" size="xs">
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}