import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Lock, Mail, Phone, User, ArrowRight, CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone } from "@/lib/phone";
import { toast } from "sonner";

const searchSchema = z.object({
  tab: z.enum(["login", "register"]).optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/account/login")({
  validateSearch: searchSchema,
  component: AccountLoginPage,
  head: () => ({
    meta: [
      { title: "حسابي — تسجيل الدخول أو إنشاء حساب — PR1ME" },
      { name: "description", content: "سجل دخولك أو أنشئ حساباً جديداً في PR1ME لمتابعة وإدارة طلباتك وعناوين الشحن." },
    ],
  }),
});

function AccountLoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">(search.tab === "register" ? "register" : "login");

  // Form states
  const [name, setName] = useState(search.name || "");
  const [phone, setPhone] = useState(search.phone || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/account" });
      }
    });
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = normalizePhone(phone);
    if (!name.trim()) {
      toast.error("يرجى إدخال الاسم بالكامل");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("يرجى إدخال رقم هاتف صحيح (11 رقم)");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صالح");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: cleanPhone,
          },
        },
      });

      if (error) throw error;

      // Auto sign-in if session was not automatically established
      if (!data.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signInErr) {
          toast.success("تم إنشاء حسابك بنجاح! يرجى تسجيل الدخول.");
          setTab("login");
          setLoading(false);
          return;
        }
      }

      toast.success("تم إنشاء وتأكيد حسابك بنجاح! مرحباً بك في PR1ME.");
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message || "تعذر إنشاء الحساب، يرجى التأكد من البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      toast.success("تم تسجيل الدخول بنجاح.");
      navigate({ to: search.redirect || "/account" });
    } catch (err: any) {
      toast.error(err.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F7F5] py-10 sm:py-16" dir="rtl">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        {/* Post-Purchase Order Notice */}
        {search.code && (
          <div className="mb-6 border border-emerald-300/60 bg-emerald-50/70 p-4 rounded-xs text-xs text-emerald-950 flex items-start gap-3 shadow-xs">
            <PackageCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">
                تم تسجيل طلبك بنجاح #{search.code} 🎉
              </span>
              <p className="mt-0.5 leading-relaxed text-emerald-800">
                أنشئ كلمة مرور لحسابك الآن برقم هاتفك <strong>{search.phone}</strong> ليتم ربط هذا الطلب وجميع طلباتك السابقة بحسابك فوراً.
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="border border-[#E5E5E0] bg-white p-6 sm:p-8 shadow-xs rounded-xs">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-[#E5E5E0]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9B89A] block mb-1">
              PR1ME CUSTOMER PORTAL
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0D0D0D]">
              {tab === "login" ? "تسجيل الدخول إلى حسابك" : "إنشاء حساب عميل جديد"}
            </h1>
            <p className="mt-1 text-xs text-[#6B6B66]">
              {tab === "login"
                ? "سجل دخولك لمتابعة طلباتك وتحديثات الشحن"
                : "سجل حسابك لربط جميع طلباتك برقم هاتفك تلقائياً"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-[#F7F7F5] p-1 border border-[#E5E5E0] mb-6 text-xs font-bold rounded-xs">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`py-2 text-center rounded-xs transition-colors ${
                tab === "login"
                  ? "bg-[#0D0D0D] text-[#F7F7F5] shadow-xs"
                  : "text-[#6B6B66] hover:text-[#0D0D0D]"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`py-2 text-center rounded-xs transition-colors ${
                tab === "register"
                  ? "bg-[#0D0D0D] text-[#F7F7F5] shadow-xs"
                  : "text-[#6B6B66] hover:text-[#0D0D0D]"
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Form */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <Mail className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <Lock className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  الاسم بالكامل <span className="text-[#8B2E2E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد محمود"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <User className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  رقم الهاتف (الذي يربط طلباتك) <span className="text-[#8B2E2E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 font-mono text-sm font-bold text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <Phone className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-[#6B6B66] mt-1 block">
                  سيتم ربط أي طلب تم بهذا الرقم بحسابك فوراً.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  البريد الإلكتروني <span className="text-[#8B2E2E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <Mail className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D0D0D] mb-1">
                  كلمة المرور (6 خانات أو أكثر) <span className="text-[#8B2E2E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 pl-9 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                  />
                  <Lock className="h-4 w-4 text-[#6B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب وحفظ الطلبات"}</span>
              </button>
            </form>
          )}

          {/* Quick Track Link */}
          <div className="mt-6 pt-4 border-t border-[#E5E5E0] text-center">
            <Link
              to="/track"
              className="text-xs font-semibold text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
            >
              تريد تتبع طلب دون تسجيل الدخول؟ اضغط هنا 📦
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
