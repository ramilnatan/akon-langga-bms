import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { HeroSlideForm } from './HeroSlideForm';
import type { HeroSlide } from '@/types/hero';
import { Badge } from '@/components/ui/badge';

export function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      setError('Could not load hero slides.');
    } else {
      setSlides(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from('hero_slides').delete().eq('id', deleting.id);
    if (error) {
      toast({ title: 'Could not delete hero slide', variant: 'destructive' });
      return;
    }
    toast({ title: 'Hero slide deleted' });
    setDeleting(null);
    fetchSlides();
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Hero Slides ({slides.length})</h2>
        <Button className="rounded-full shadow-soft" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Hero Slide
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {slides.length === 0 ? (
        <EmptyState icon={<ImageIcon className="h-6 w-6" />} title="No hero slides" description="Add your first slide to display on the homepage." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Badge</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {slides.map((slide) => (
                  <tr key={slide.id}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{slide.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{slide.badge || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{slide.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {slide.published && <Badge variant="secondary" className="text-xs">Published</Badge>}
                        {slide.active ? <Badge className="bg-success/15 text-success text-xs">Active</Badge> : <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => { setEditing(slide); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-destructive" onClick={() => setDeleting(slide)}>
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
        <HeroSlideForm
          slide={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchSlides(); }}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Hero Slide?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this slide?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
