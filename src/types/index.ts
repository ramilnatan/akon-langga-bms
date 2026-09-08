export * from './navigation';

export interface Product {
  id: string;
  category_id: string;
  brand: string | null;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  short_description: string | null;
  full_description: string | null;
  ingredients: string | null;
  benefits: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  low_stock_alert: number | null;
  weight: number | null;
  featured_image_url: string | null;
  published: boolean;
  featured: boolean;
  active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  unit: string | null;
}

export interface CartSession {
  session_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  regular_price: number;
  bundle_price: number;
  discount_percentage: number | null;
  image_url: string | null;
  badge: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  bundle_items?: BundleItem[];
  items?: BundleItem[];
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  featured_image_url: string | null;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string | null;
  bundle_id: string | null;
  quantity: number;
  created_at: string;
  item_type: 'product' | 'bundle';
  product: CartProduct | null;
  bundle: Bundle | null;
}

export type CartItemWithProduct = CartItem;

export interface Order {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_fee: number;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}


export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}

export interface SalesSummary {
  total_orders: number;
  total_sales: number;
  average_order_value: number;
}

export interface ProductSales {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_sales: number;
  order_line_count: number;
}

export interface OrderStatusRow {
  status: string;
  order_count: number;
  total_sales: number;
}

export type UserRole = 'customer' | 'admin';

export interface Profile {
  auth_user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}


export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  featured: boolean;
  display_order: number;
  active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

