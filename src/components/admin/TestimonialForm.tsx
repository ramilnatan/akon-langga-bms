import { useState } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './ImageUpload';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TestimonialForm({ testimonial, onClose, onSaved }: TestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>(
    testimonial 
      ? { ...testimonial, photo_url: testimonial.photo_url ?? '' }
      : {
          customer_name: '',
          photo_url: '',
          rating: 5,
          comment: '',
          display_order: 1,
          active: true,
        }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (testimonial) {
      const { error } = await supabase
        .from('testimonials')
        .update({
          customer_name: formData.customer_name ?? '',
          photo_url: formData.photo_url || null,
          rating: formData.rating ?? 5,
          comment: formData.comment ?? '',
          display_order: formData.display_order ?? 1,
          active: formData.active ?? true,
        })
        .eq('id', testimonial.id);

      if (error) {
        toast({ title: 'Error updating testimonial', variant: 'destructive' });
      } else {
        toast({ title: 'Testimonial updated' });
        onSaved();
      }
    } else {
      const { error } = await supabase.from('testimonials').insert([
        {
          customer_name: formData.customer_name ?? '',
          photo_url: formData.photo_url || null,
          rating: formData.rating ?? 5,
          comment: formData.comment ?? '',
          display_order: formData.display_order ?? 1,
          active: formData.active ?? true,
        },
      ]);

      if (error) {
        toast({ title: 'Error creating testimonial', variant: 'destructive' });
      } else {
        toast({ title: 'Testimonial created' });
        onSaved();
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer Name</Label>
            <Input
              value={formData.customer_name || ''}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>
          <div>
            <ImageUpload
              label="Customer Photo"
              url={formData.photo_url ?? ''}
              onUrlChange={(url) => setFormData({ ...formData, photo_url: url })}
              storagePath="testimonials"
            />
          </div>
          <div>
            <Label>Rating (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={formData.rating ?? 5}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>Comment</Label>
            <Textarea
              value={formData.comment || ''}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.display_order ?? 1}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.active ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
