import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/whatsapp";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

interface AdminLoginFormProps {
  onLoginSuccess?: () => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created successfully. Please sign in.");
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back to PR1ME Admin.");
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/admin";
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#F7F7F5] px-4 py-8">
      <div className="w-full max-w-md border border-[#E5E5E0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9B89A]">
              PR1ME MANAGEMENT
            </span>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#0D0D0D]">
              {mode === "login" ? "Admin Portal Login" : "Create Admin Account"}
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B66] transition-colors hover:text-[#0D0D0D]"
          >
            <span>Storefront</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#6B6B66]">
          {mode === "login"
            ? "Sign in to manage products, categories, inventory, and campaign offers."
            : "Register your administrative credentials for PR1ME storefront operations."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#0D0D0D]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B66]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pr1me.com"
                autoComplete="email"
                className="w-full border border-[#E5E5E0] bg-[#F7F7F5] px-3.5 py-2.5 text-xs text-[#0D0D0D] outline-none transition-colors focus:border-[#0D0D0D] focus:bg-white pr-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#0D0D0D]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B66]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full border border-[#E5E5E0] bg-[#F7F7F5] px-3.5 py-2.5 text-xs text-[#0D0D0D] outline-none transition-colors focus:border-[#0D0D0D] focus:bg-white pr-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 bg-[#0D0D0D] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#F7F7F5]" />
                <span>Authenticating...</span>
              </>
            ) : mode === "login" ? (
              "Sign In to Dashboard"
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-[#E5E5E0] pt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-xs font-semibold text-[#6B6B66] underline underline-offset-4 transition-colors hover:text-[#0D0D0D]"
          >
            {mode === "login"
              ? "Need to register a new admin account? Create one"
              : "Already have an admin account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
