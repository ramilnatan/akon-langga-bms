import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Mail, MailOpen, RefreshCw } from 'lucide-react';
import type { ContactMessage } from '@/types/contact-message';

export function ContactMessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setMessages([]);
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const handleToggleRead = async (message: ContactMessage) => {
    setUpdatingId(message.id);

    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ is_read: !message.is_read })
      .eq('id', message.id);

    if (updateError) {
      toast({
        title: 'Could not update message',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
      setUpdatingId(null);
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, is_read: !message.is_read } : item,
      ),
    );

    setSelectedMessage((current) =>
      current?.id === message.id
        ? { ...current, is_read: !message.is_read }
        : current,
    );

    setUpdatingId(null);
  };

  const unreadCount = messages.filter((message) => !message.is_read).length;

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Contact Messages
            </h2>
            <Badge variant="secondary">{messages.length}</Badge>
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages submitted through the Contact Us form.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void fetchMessages()}
          className="rounded-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {messages.length === 0 && !error ? (
        <EmptyState
          title="No contact messages"
          description="Messages submitted through the Contact Us form will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 transition-colors sm:p-5 ${
                  message.is_read ? '' : 'bg-primary/5'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(message)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm ${
                          message.is_read
                            ? 'font-medium text-foreground'
                            : 'font-semibold text-foreground'
                        }`}
                      >
                        {message.name}
                      </span>
                      {!message.is_read && <Badge>Unread</Badge>}
                    </div>

                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {message.subject}
                    </p>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {message.email}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMessage(message)}
                      className="rounded-full"
                    >
                      View
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updatingId === message.id}
                      onClick={() => void handleToggleRead(message)}
                      className="rounded-full"
                      title={message.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {message.is_read ? (
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <MailOpen className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {message.is_read ? 'Mark as unread' : 'Mark as read'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={selectedMessage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedMessage.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedMessage.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedMessage.phone || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Received
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Message
                  </p>
                  <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-foreground">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => void handleToggleRead(selectedMessage)}
                    disabled={updatingId === selectedMessage.id}
                    className="rounded-full"
                  >
                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
