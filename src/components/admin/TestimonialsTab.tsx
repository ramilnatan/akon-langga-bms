import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { TestimonialForm } from './TestimonialForm';
import type { Testimonial } from '@/types/testimonial';
import { Badge } from '@/components/ui/badge';

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      setError('Could not load testimonials.');
    } else {
      setTestimonials(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', deleting.id);
    if (error) {
      toast({ title: 'Could not delete testimonial', variant: 'destructive' });
      return;
    }
    toast({ title: 'Testimonial deleted' });
    setDeleting(null);
    fetchTestimonials();
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Testimonials ({testimonials.length})</h2>
        <Button className="rounded-full shadow-soft" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {testimonials.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No testimonials" description="Add your first testimonial to display on the homepage." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {t.photo_url && <img src={t.photo_url} alt={t.customer_name} className="w-8 h-8 rounded-full object-cover" />}
                        {t.customer_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{t.rating} / 5</td>
                    <td className="px-4 py-3 text-sm text-foreground">{t.display_order}</td>
                    <td className="px-4 py-3">
                      {t.active ? <Badge className="bg-success/15 text-success text-xs">Active</Badge> : <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => { setEditing(t); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-destructive" onClick={() => setDeleting(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <TestimonialForm
          testimonial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchTestimonials(); }}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Testimonial?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this testimonial?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
