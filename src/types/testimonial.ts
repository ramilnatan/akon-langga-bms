export interface Testimonial {
  id: string;
  customer_name: string;
  photo_url: string | null;
  rating: number;
  comment: string;
  display_order: number;
  active: boolean;
  created_at: string;
}
