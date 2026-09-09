import { StoreSettings } from '../types/settings';

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 'default',
  store_name: 'AKON LANGGA',
  tagline: 'Nourish from Within, Glow on the Outside.',
  logo_url: null,
  favicon_url: null,
  primary_phone: '+63 000 000 0000',
  email: 'hello@akonlangga.com',
  facebook_url: null,
  messenger_url: null,
  whatsapp: null,
  address: 'Tacloban City, Philippines',
  business_hours: 'Mon-Sat: 9am-6pm',
  currency: 'PHP',
  seo_title: 'AKON LANGGA | Organic Wellness',
  seo_description: 'An organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials.',
  seo_keywords: 'organic, wellness, herbal coffee, skincare',
  og_image_url: null,
  shipping_fee: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
