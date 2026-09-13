import { useState, useEffect } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import type { HeroSlide } from '@/types/hero';

export function HeroSlideForm({ slide, onClose, onSaved }: { slide: HeroSlide | null; onClose: () => void; onSaved: () => void }) {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [bundles, setBundles] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(slide?.image_url ?? null);

  const [form, setForm] = useState({
    badge: slide?.badge ?? '',
    title: slide?.title ?? '',
    subtitle: slide?.subtitle ?? '',
    description: slide?.description ?? '',
    button_text: slide?.button_text ?? '',
    button_url: slide?.button_url ?? '',
    button_style: slide?.button_style ?? 'primary',
    opens_in_new_tab: slide?.opens_in_new_tab ?? false,
    image_url: slide?.image_url ?? '',
    product_id: slide?.product_id ?? '',
    bundle_id: slide?.bundle_id ?? '',
    display_order: slide?.display_order?.toString() ?? '1',
    published: slide?.published ?? false,
    active: slide?.active ?? true,
    start_date: slide?.start_date ? slide.start_date.split('T')[0] : '',
    end_date: slide?.end_date ? slide.end_date.split('T')[0] : '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [pRes, bRes] = await Promise.all([
        supabase.from('products').select('id, name'),
        supabase.from('bundles').select('id, name')
      ]);

      if (pRes.error) toast({ title: 'Error loading products', description: pRes.error.message, variant: 'destructive' });
      if (bRes.error) toast({ title: 'Error loading bundles', description: bRes.error.message, variant: 'destructive' });

      setProducts(pRes.data ?? []);
      setBundles(bRes.data ?? []);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5 MB.', variant: 'destructive' });
      return;
    }

    if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }

    const displayOrder = parseInt(form.display_order);
    if (isNaN(displayOrder) || displayOrder < 1) {
      toast({ title: 'Invalid Display Order', description: 'Display order must be a number at least 1', variant: 'destructive' });
      return;
    }

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date cannot be earlier than start date.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    let imageUrl = form.image_url;

    const payload = {
      ...form,
      image_url: imageUrl,
      product_id: form.product_id || null,
      bundle_id: form.bundle_id || null,
      display_order: displayOrder,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (slide) {
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
          const fileName = `heroes/${slide.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          payload.image_url = publicUrl;
        } catch (err: any) {
          console.error('[HeroSlideForm] Image upload failed:', err);
          toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase.from('hero_slides').update(payload).eq('id', slide.id);
      if (error) {
        toast({ title: 'Error updating slide', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from('hero_slides').insert(payload).select('id').single();
      if (error) {
        toast({ title: 'Error creating slide', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }

      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
          const fileName = `heroes/${data.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);

          const { error: updateError } = await supabase
            .from('hero_slides')
            .update({ image_url: publicUrl })
            .eq('id', data.id);

          if (updateError) throw updateError;
        } catch (err: any) {
          console.error('[HeroSlideForm] Image upload/update failed:', err);
          toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
          setSaving(false);
          return;
        }
      }
    }

    setSaving(false);
    toast({ title: slide ? 'Slide updated' : 'Slide created' });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{slide ? 'Edit Hero Slide' : 'Add Hero Slide'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Badge</Label><Input name="badge" value={form.badge} onChange={handleChange} /></div>
          <div><Label>Title *</Label><Input name="title" value={form.title} onChange={handleChange} required /></div>
          <div><Label>Subtitle</Label><Input name="subtitle" value={form.subtitle} onChange={handleChange} /></div>
          <div><Label>Description</Label><Textarea name="description" value={form.description} onChange={handleChange} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Button Text</Label><Input name="button_text" value={form.button_text} onChange={handleChange} /></div>
            <div><Label>Button URL</Label><Input name="button_url" value={form.button_url} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Button Style</Label>
              <Select value={form.button_style} onValueChange={v => setForm(f => ({ ...f, button_style: v }))}>
                <SelectTrigger><SelectValue placeholder="Primary" /></SelectTrigger>
                <SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="secondary">Secondary</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Display Order *</Label><Input type="number" name="display_order" value={form.display_order} onChange={handleChange} min="1" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start Date</Label><Input type="date" name="start_date" value={form.start_date} onChange={handleChange} /></div>
            <div><Label>End Date</Label><Input type="date" name="end_date" value={form.end_date} onChange={handleChange} /></div>
          </div>
          <div>
            <Label>Image</Label>
            <div className="mt-1.5 flex flex-col gap-3">
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedFile(null); if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>Clear</Button>
                </div>
              ) : (
                <Button variant="outline" asChild><label>Choose Image<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} /></label></Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Product</Label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v === 'null' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="null">None</SelectItem>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Bundle</Label>
              <Select value={form.bundle_id} onValueChange={v => setForm(f => ({ ...f, bundle_id: v === 'null' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="null">None</SelectItem>{bundles.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="opens_in_new_tab" checked={form.opens_in_new_tab} onChange={handleChange} /> New Tab</label>
          </div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? <LoadingSpinner size="sm" /> : 'Save'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
