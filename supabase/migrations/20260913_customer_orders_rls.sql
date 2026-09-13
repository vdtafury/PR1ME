-- Customer RLS Policy & Guest Order Tracking Function for PR1ME

-- 1. Allow authenticated users to read their own orders by phone number
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users read own orders by phone'
  ) THEN
    CREATE POLICY "Users read own orders by phone" ON public.orders
      FOR SELECT TO authenticated
      USING (
        phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
        OR REPLACE(phone, ' ', '') = REPLACE((auth.jwt() -> 'user_metadata' ->> 'phone'), ' ', '')
        OR public.has_role(auth.uid(), 'admin')
      );
  END IF;
END $$;

-- 2. Allow guest tracking by exact order_code and matching phone number
CREATE OR REPLACE FUNCTION public.track_guest_order(p_code TEXT, p_phone TEXT)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.orders 
  WHERE (order_code = p_code OR order_code = '#' || p_code)
    AND (
      phone = p_phone 
      OR REPLACE(phone, ' ', '') = REPLACE(p_phone, ' ', '')
      OR phone LIKE '%' || RIGHT(REPLACE(p_phone, ' ', ''), 10)
    )
  LIMIT 1;
$$;

-- Grant permissions to execute the guest tracking function
GRANT EXECUTE ON FUNCTION public.track_guest_order(TEXT, TEXT) TO anon, authenticated, service_role;
