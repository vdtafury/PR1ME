import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from "@/integrations/supabase/client"
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin login — PR1ME" }, { name: "robots", content: "noindex" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  return <AdminLoginForm onLoginSuccess={() => navigate({ to: "/admin" })} />;
}
