import { useState } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TestimonialSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function TestimonialSubmissionForm({
  open,
  onOpenChange,
}: TestimonialSubmissionFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setCustomerName('');
    setRating('5');
    setComment('');
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitting) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const handlePhotoChange = (file: File | undefined) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid image type',
        description: 'Please choose a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: 'Image is too large',
        description: 'Please choose an image smaller than 5 MB.',
        variant: 'destructive',
      });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = customerName.trim();
    const trimmedComment = comment.trim();
    const numericRating = Number(rating);

    if (!trimmedName) {
      toast({
        title: 'Name is required',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedComment) {
      toast({
        title: 'Experience is required',
        description: 'Please share your experience with AKON LANGGA.',
        variant: 'destructive',
      });
      return;
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      toast({
        title: 'Invalid rating',
        description: 'Please select a rating from 1 to 5.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    let photoUrl: string | null = null;
    let uploadedPhotoPath: string | null = null;

    try {
      if (photoFile) {
        const fileExtension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `testimonials/${crypto.randomUUID()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from('testimonial-images')
          .upload(filePath, photoFile, {
            contentType: photoFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPhotoPath = filePath;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from('testimonial-images')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('testimonials').insert([
        {
          customer_name: trimmedName,
          photo_url: photoUrl,
          rating: numericRating,
          comment: trimmedComment,
          active: false,
        },
      ]);

      if (insertError) {
        if (uploadedPhotoPath) {
          await supabase.storage
            .from('testimonial-images')
            .remove([uploadedPhotoPath]);
        }

        throw insertError;
      }

      toast({
        title: 'Thank you for sharing!',
        description:
          'Your experience has been submitted and will be reviewed before appearing on our website.',
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Testimonial submission error:', error);

      toast({
        title: 'Unable to submit testimonial',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="testimonial-name">Your Name</Label>
            <Input
              id="testimonial-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="testimonial-rating">Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger id="testimonial-rating">
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">★★★★★ — Excellent</SelectItem>
                <SelectItem value="4">★★★★☆ — Very Good</SelectItem>
                <SelectItem value="3">★★★☆☆ — Good</SelectItem>
                <SelectItem value="2">★★☆☆☆ — Fair</SelectItem>
                <SelectItem value="1">★☆☆☆☆ — Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="testimonial-comment">Your Experience</Label>
            <Textarea
              id="testimonial-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with AKON LANGGA..."
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="testimonial-photo">Photo (Optional)</Label>
            <Input
              id="testimonial-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
              disabled={submitting}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, or WebP. Maximum 5 MB.
            </p>

            {photoPreview && (
              <div className="mt-3">
                <img
                  src={photoPreview}
                  alt="Selected testimonial preview"
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Your experience will be reviewed before it appears on our website.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Experience'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
