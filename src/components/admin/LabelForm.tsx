import { useState, useEffect } from 'react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import { Label as LabelType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Gift, Leaf, Sparkles, Star, Tag } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
  gift: Gift,
  tag: Tag,
};

interface LabelFormProps {
  label: LabelType | null;
  onClose: () => void;
  onSaved: () => void;
}

export function LabelForm({ label, onClose, onSaved }: LabelFormProps) {
  const [loading, setLoading] = useState(false);
  const [slugChanged, setSlugChanged] = useState(false);

  const [form, setForm] = useState({
    name: label?.name ?? '',
    slug: label?.slug ?? '',
    description: label?.description ?? '',
    background_color: label?.background_color ?? '#000000',
    text_color: label?.text_color ?? '#ffffff',
    badge_style: label?.badge_style ?? 'filled',
    icon: label?.icon ?? 'star',
    display_order: label?.display_order?.toString() ?? '0',
    active: label?.active ?? true,
  });

  useEffect(() => {
    if (label) {
      setForm({
        name: label.name,
        slug: label.slug,
        description: label.description ?? '',
        background_color: label.background_color,
        text_color: label.text_color,
        badge_style: label.badge_style,
        icon: label.icon ?? 'star',
        display_order: label.display_order?.toString() ?? '0',
        active: label.active,
      });
      setSlugChanged(true);
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        background_color: '#000000',
        text_color: '#ffffff',
        badge_style: 'filled',
        icon: 'star',
        display_order: '0',
        active: true,
      });
      setSlugChanged(false);
    }
  }, [label]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'name' && !label && !slugChanged) {
        next.slug = generateSlug(value);
      }
      if (field === 'slug') {
        setSlugChanged(true);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim() || !form.background_color.trim() || !form.text_color.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      background_color: form.background_color.trim(),
      text_color: form.text_color.trim(),
      badge_style: form.badge_style,
      icon: form.icon,

      display_order: parseInt(form.display_order) || 0,
      active: form.active,
    };

    try {
      if (label) {
        const { error } = await supabase
          .from('labels')
          .update(payload)
          .eq('id', label.id);
        if (error) throw error;
        toast.success('Label updated successfully.');
      } else {
        const { error } = await supabase.from('labels').insert([payload]);
        if (error) throw error;
        toast.success('Label created successfully.');
      }
      onSaved();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save label.');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = iconMap[form.icon] || Star;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label ? 'Edit Label' : 'Add Label'}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex items-center justify-center p-4 border rounded bg-gray-50">
          <div
            className="px-3 py-1 rounded flex items-center gap-1.5 font-medium"
            style={{ backgroundColor: form.background_color, color: form.text_color }}
          >
            <SelectedIcon className="w-4 h-4" />
            {form.name || 'Label Preview'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input type="color" value={form.background_color} onChange={(e) => handleChange('background_color', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input type="color" value={form.text_color} onChange={(e) => handleChange('text_color', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge Style</Label>
              <Select value={form.badge_style} onValueChange={(val) => handleChange('badge_style', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">Filled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(val) => handleChange('icon', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(iconMap).map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={form.display_order} onChange={(e) => handleChange('display_order', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
              />
              <Label>Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
