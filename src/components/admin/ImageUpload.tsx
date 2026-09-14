import { useState } from 'react';
import { supabase } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

interface ImageUploadProps {
  label: string;
  url: string;
  onUrlChange: (url: string) => void;
  storagePath: string; // e.g., 'store/logo'
}

export function ImageUpload({ label, url, onUrlChange, storagePath }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5 MB.', variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${storagePath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      onUrlChange(data.publicUrl);
      toast({ title: 'Image uploaded successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Storage upload failed', { Bucket: 'product-images', Path: storagePath, error });
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {url && (
        <div className="mb-2">
          <img src={url} alt={label} className="h-20 w-auto rounded border border-border" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {url && (
          <Button type="button" variant="outline" onClick={() => onUrlChange('')}>
            Clear
          </Button>
        )}
      </div>
      {uploading && <LoadingSpinner size="sm" />}
    </div>
  );
}
