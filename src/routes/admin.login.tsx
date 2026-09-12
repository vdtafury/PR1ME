import { createFileRoute } from '@tanstack/react-router'
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
