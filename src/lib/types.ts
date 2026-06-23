export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  product_code: string | null;
  category_id: string | null;
  tags: string[];
  sizes: string[];
  colors: string[];
  main_image: string | null;
  gallery_images: string[];
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  badge_text: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}
