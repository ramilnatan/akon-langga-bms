export const BRAND = {
  name: 'AKON LANGGA',
  tagline: 'Nourish from Within, Glow on the Outside.',
  description:
    'An organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials.',
  category: 'Organic Wellness · Herbal Coffee · Natural Handmade Skincare',
  email: 'hello@akonlangga.com',
  phone: '+63 000 000 0000',
  address: 'Tacloban City, Philippines',
  foundedYear: new Date().getFullYear(),
} as const;

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: 'instagram' as const },
  { label: 'Facebook', href: '#', icon: 'facebook' as const },
  { label: 'TikTok', href: '#', icon: 'tiktok' as const },
  { label: 'YouTube', href: '#', icon: 'youtube' as const },
];

export const PRIMARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Bundles', href: '/bundles' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

export const FOOTER_LINKS = {
  shop: [
    { label: 'Products', href: '/products' },
    { label: 'Bundles', href: '/bundles' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Admin', href: '/admin' },
  ],
};

export const COPYRIGHT = `© ${new Date().getFullYear()} AKON LANGGA. All rights reserved.`;
