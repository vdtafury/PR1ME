
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
DROP POLICY IF EXISTS "Public read catalog" ON storage.objects;
CREATE POLICY "Public read catalog files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'catalog' AND name IS NOT NULL);
