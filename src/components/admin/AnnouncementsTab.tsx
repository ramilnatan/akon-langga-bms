import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Megaphone } from 'lucide-react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import type { Announcement } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnnouncementForm } from './AnnouncementForm';

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[AnnouncementsTab] Failed to load announcements:', error);
      toast.error('Failed to load announcements.');
      setLoading(false);
      return;
    }

    setAnnouncements(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) {
      return;
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', deletingAnnouncement.id);

    if (error) {
      console.error('[AnnouncementsTab] Delete failed:', error);
      toast.error('Failed to delete announcement.');
      return;
    }

    toast.success('Announcement deleted successfully.');
    setDeletingAnnouncement(null);
    fetchAnnouncements();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
    fetchAnnouncements();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Manage the announcement bar messages shown across the storefront.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">No announcements yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first announcement for the storefront.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{announcement.title}</h3>

                    <Badge variant={announcement.active ? 'default' : 'secondary'}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </Badge>

                    <Badge variant="outline">
                      Order {announcement.display_order}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {announcement.message}
                  </p>

                  {(announcement.start_date || announcement.end_date) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {announcement.start_date ?? 'No start date'}
                      {' → '}
                      {announcement.end_date ?? 'No end date'}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingAnnouncement(announcement)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onClose={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold">Delete Announcement?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will permanently delete "
                  {deletingAnnouncement.title}".
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeletingAnnouncement(null)}
                >
                  Cancel
                </Button>

                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}