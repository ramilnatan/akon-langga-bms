export interface HeroSlide {
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  button_url: string | null;
  button_style: string;
  opens_in_new_tab: boolean;
  image_url: string | null;
  product_id: string | null;
  bundle_id: string | null;
  display_order: number;
  published: boolean;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
