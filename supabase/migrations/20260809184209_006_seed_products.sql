/*
# Seed initial product data for AKON LANGGA

1. Data
- Inserts 8 initial products across Herbal Coffee and Natural Skincare categories.
- All products are published=true and active=true with stock.
- Uses ON CONFLICT DO NOTHING for idempotency on slug.

2. Notes
- Prices in Philippine Peso (PHP).
- Sale prices set on select products.
*/

INSERT INTO public.products (name, slug, description, price, sale_price, stock, category, published, active) VALUES
('Herbal Coffee Blend', 'herbal-coffee-blend',
 'A rich, aromatic blend of handpicked herbs for daily wellness. Crafted in small batches for maximum freshness.',
 249.00, NULL, 50, 'Herbal Coffee', true, true),
('Mindful Mornings Coffee', 'mindful-mornings-coffee',
 'Start your day with intention. This premium herbal coffee blend supports energy and balance.',
 299.00, 249.00, 35, 'Herbal Coffee', true, true),
('Rose Glow Handmade Soap', 'rose-glow-handmade-soap',
 'Gentle botanical soap infused with rose extracts. Cleanses and nourishes for a radiant complexion.',
 129.00, NULL, 60, 'Natural Skincare', true, true),
('Lavender Calm Soap', 'lavender-calm-soap',
 'Handmade lavender soap that soothes the senses while gently cleansing the skin.',
 139.00, NULL, 40, 'Natural Skincare', true, true),
('Botanical Skincare Set', 'botanical-skincare-set',
 'A curated trio of handmade skincare for a radiant complexion. Includes soap, serum, and moisturizer.',
 399.00, 349.00, 25, 'Natural Skincare', true, true),
('Honey Oat Soap Bar', 'honey-oat-soap-bar',
 'Nourishing handmade soap with natural honey and oats. Gently exfoliates and moisturizes.',
 119.00, NULL, 45, 'Natural Skincare', true, true),
('Wellness Morning Ritual', 'wellness-morning-ritual',
 'Complete wellness bundle: herbal coffee plus rose glow soap for your morning self-care routine.',
 369.00, 299.00, 30, 'Bundles', true, true),
('Glow & Care Bundle', 'glow-and-care-bundle',
 'A complete set of handmade soaps and botanical skincare essentials for head-to-toe care.',
 499.00, 399.00, 20, 'Bundles', true, true)
ON CONFLICT (slug) DO NOTHING;
