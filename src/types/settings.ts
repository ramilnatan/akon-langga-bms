export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_phone: string | null;
  email: string | null;
  facebook_url: string | null;
  messenger_url: string | null;
  whatsapp: string | null;
  address: string | null;
  business_hours: string | null;
  currency: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image_url: string | null;
  shipping_fee: number;
  created_at: string;
  updated_at: string;
}
