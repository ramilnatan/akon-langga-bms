export * from './navigation';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  image_url: string | null;
  category: string | null;
  published: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartSession {
  session_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface CartItemWithProduct extends Omit<CartItem, 'product'> {
  product: CartProduct;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
