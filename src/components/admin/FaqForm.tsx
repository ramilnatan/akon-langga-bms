import { useState, useEffect } from 'react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import type { Faq } from '@/types';
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

interface FaqFormProps {
  faq?: Faq | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function FaqForm({
  faq,
  open,
  onOpenChange,
  onSaved,
}: FaqFormProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
    display_order: faq?.display_order ?? 0,
    active: faq?.active ?? true,
  });

  useEffect(() => {
    if (open) {
      setForm({
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        display_order: faq?.display_order ?? 0,
        active: faq?.active ?? true,
      });
    }
  }, [open, faq]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.question.trim()) {
      toast.error('Please enter a question.');
      return;
    }

    if (!form.answer.trim()) {
      toast.error('Please enter an answer.');
      return;
    }

    setLoading(true);

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      display_order: Number(form.display_order),
      active: form.active,
    };

    try {
      if (faq) {
        const { error } = await supabase
          .from('faq')
          .update(payload)
          .eq('id', faq.id);

        if (error) {
          throw error;
        }

        toast.success('FAQ updated successfully.');
      } else {
        const { error } = await supabase
          .from('faq')
          .insert([payload]);

        if (error) {
          throw error;
        }

        toast.success('FAQ created successfully.');
      }

      onSaved();
    } catch (error) {
      console.error('[FaqForm] Save failed:', error);
      toast.error(
        faq
          ? 'Failed to update FAQ.'
          : 'Failed to create FAQ.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {faq ? 'Edit FAQ' : 'Add FAQ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faq-question">Question</Label>
            <Input
              id="faq-question"
              value={form.question}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  question: event.target.value,
                }))
              }
              placeholder="e.g. What is your return policy?"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-answer">Answer</Label>
            <Textarea
              id="faq-answer"
              value={form.answer}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  answer: event.target.value,
                }))
              }
              placeholder="e.g. We accept returns within 30 days."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-display-order">
              Display Order
            </Label>
            <Input
              id="faq-display-order"
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
              <Label htmlFor="faq-active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Set if this FAQ is visible to users.
              </p>
            </div>

            <Switch
              id="faq-active"
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : faq
                  ? 'Update FAQ'
                  : 'Add FAQ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
