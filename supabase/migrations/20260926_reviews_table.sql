-- Reviews Table Migration for PR1ME E-Commerce
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  governorate TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified_buyer BOOLEAN NOT NULL DEFAULT false,
  order_code TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read approved reviews" ON public.reviews 
  FOR SELECT TO anon, authenticated 
  USING (is_approved = true OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can submit review" ON public.reviews 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins manage reviews" ON public.reviews 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(),'admin')) 
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Indexes for fast product lookup and sorting
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
