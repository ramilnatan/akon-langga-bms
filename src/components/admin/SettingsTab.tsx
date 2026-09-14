import { useState } from 'react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { supabase } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ImageUpload } from './ImageUpload';

export function SettingsTab() {
  const { settings, refreshSettings } = useStoreSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    store_name: settings.store_name ?? '',
    tagline: settings.tagline ?? '',
    logo_url: settings.logo_url ?? '',
    favicon_url: settings.favicon_url ?? '',
    primary_phone: settings.primary_phone ?? '',
    email: settings.email ?? '',
    facebook_url: settings.facebook_url ?? '',
    messenger_url: settings.messenger_url ?? '',
    whatsapp: settings.whatsapp ?? '',
    address: settings.address ?? '',
    business_hours: settings.business_hours ?? '',
    currency: settings.currency ?? '',
    seo_title: settings.seo_title ?? '',
    seo_description: settings.seo_description ?? '',
    seo_keywords: settings.seo_keywords ?? '',
    og_image_url: settings.og_image_url ?? '',
    shipping_fee: settings.shipping_fee?.toString() ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (name: string, url: string) => {
    setFormData((prev) => ({ ...prev, [name]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          ...formData,
          shipping_fee: formData.shipping_fee.trim() === '' ? null : parseFloat(formData.shipping_fee),
        })
        .eq('id', settings.id);

      if (error) throw error;

      await refreshSettings();
      toast({ title: 'Settings saved successfully' });
    } catch (err: any) {
      toast({ title: 'Failed to save settings', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-heading text-lg font-semibold">Store & Branding</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="store_name">Store Name</Label>
              <Input id="store_name" name="store_name" value={formData.store_name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" value={formData.tagline} onChange={handleChange} />
            </div>
            <ImageUpload 
              label="Store Logo" 
              url={formData.logo_url} 
              onUrlChange={(url) => handleImageChange('logo_url', url)} 
              storagePath="store/logo" 
            />
            <ImageUpload 
              label="Favicon" 
              url={formData.favicon_url} 
              onUrlChange={(url) => handleImageChange('favicon_url', url)} 
              storagePath="store/favicon" 
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-heading text-lg font-semibold">Contact</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="primary_phone">Phone</Label>
              <Input id="primary_phone" name="primary_phone" value={formData.primary_phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="business_hours">Business Hours</Label>
              <Input id="business_hours" name="business_hours" value={formData.business_hours} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-heading text-lg font-semibold">Social / Messaging</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input id="facebook_url" name="facebook_url" value={formData.facebook_url} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="messenger_url">Messenger URL</Label>
              <Input id="messenger_url" name="messenger_url" value={formData.messenger_url} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-heading text-lg font-semibold">Business Info</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" value={formData.currency} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="shipping_fee">Shipping Fee</Label>
              <Input id="shipping_fee" name="shipping_fee" type="number" step="0.01" value={formData.shipping_fee} onChange={handleChange} />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-semibold">SEO</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input id="seo_title" name="seo_title" value={formData.seo_title} onChange={handleChange} />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea id="seo_description" name="seo_description" value={formData.seo_description} onChange={handleChange} />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="seo_keywords">SEO Keywords</Label>
            <Input id="seo_keywords" name="seo_keywords" value={formData.seo_keywords} onChange={handleChange} />
          </div>
          <div className="lg:col-span-2">
            <ImageUpload 
              label="Open Graph Image" 
              url={formData.og_image_url} 
              onUrlChange={(url) => handleImageChange('og_image_url', url)} 
              storagePath="store/og" 
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="rounded-full shadow-soft" disabled={saving}>
          {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
