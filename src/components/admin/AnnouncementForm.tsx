import { useState } from 'react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import type { Announcement } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}

const ICON_OPTIONS = ['Truck', 'Leaf', 'Heart', 'Star', 'Sparkles', 'Megaphone'];

export function AnnouncementForm({
  announcement,
  onClose,
  onSaved,
}: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: announcement?.title ?? '',
    message: announcement?.message ?? '',
    icon: announcement?.icon ?? 'Megaphone',
    display_order: announcement?.display_order ?? 0,
    active: announcement?.active ?? true,
    start_date: announcement?.start_date ?? '',
    end_date: announcement?.end_date ?? '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    if (!form.message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      icon: form.icon || null,
      display_order: Number(form.display_order),
      active: form.active,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      if (announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', announcement.id);

        if (error) {
          throw error;
        }

        toast.success('Announcement updated successfully.');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([payload]);

        if (error) {
          throw error;
        }

        toast.success('Announcement created successfully.');
      }

      onSaved();
    } catch (error) {
      console.error('[AnnouncementForm] Save failed:', error);
      toast.error(
        announcement
          ? 'Failed to update announcement.'
          : 'Failed to create announcement.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Add Announcement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Free Shipping"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-message">Message</Label>
            <Textarea
              id="announcement-message"
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="e.g. FREE SHIPPING OVER ₱1,500"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-icon">Icon</Label>
            <select
              id="announcement-icon"
              value={form.icon}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  icon: event.target.value,
                }))
              }
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-display-order">
              Display Order
            </Label>
            <Input
              id="announcement-display-order"
              type="number"
              min="0"
              value={form.display_order}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  display_order: Number(event.target.value),
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="announcement-active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this announcement when its date range is valid.
              </p>
            </div>

            <Switch
              id="announcement-active"
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  active: checked,
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-start-date">
                Start Date
              </Label>
              <Input
                id="announcement-start-date"
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_date: event.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-end-date">
                End Date
              </Label>
              <Input
                id="announcement-end-date"
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    end_date: event.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : announcement
                  ? 'Update Announcement'
                  : 'Add Announcement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}