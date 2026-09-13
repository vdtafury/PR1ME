import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  XCircle,
  LogOut,
  ExternalLink,
  ShoppingBag,
  Loader2,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { normalizePhone, phonesMatch } from "@/lib/phone";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  component: CustomerAccountPage,
  head: () => ({
    meta: [
      { title: "حسابي وطلباتي — PR1ME" },
      { name: "description", content: "إدارة ومتابعة جميع طلباتك السابقة والحالية في PR1ME." },
    ],
  }),
});

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; step: number }
> = {
  جديد: {
    label: "تم الاستلام — قيد المراجعة",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/30",
    step: 1,
  },
  "تم التأكيد": {
    label: "تم التأكيد — جاري التجهيز",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/30",
    step: 2,
  },
  "قيد الشحن": {
    label: "قيد الشحن مع المندوب",
    bg: "bg-purple-500/10",
    text: "text-purple-700",
    border: "border-purple-500/30",
    step: 3,
  },
  "تم التسليم": {
    label: "تم التسليم بنجاح",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/30",
    step: 4,
  },
  ملغي: {
    label: "تم الإلغاء",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/30",
    step: 0,
  },
};

function CustomerAccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/account/login" });
      } else {
        setSession(data.session);
      }
      setLoadingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        navigate({ to: "/account/login" });
      } else {
        setSession(newSession);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  const userPhone = session?.user?.user_metadata?.phone || "";
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "عميلنا العزيز";
  const userEmail = session?.user?.email || "";

  // Fetch orders linked to this customer's phone
  const { data: orders = [], isLoading: loadingOrders, refetch } = useQuery({
    queryKey: ["customer-orders", userPhone],
    enabled: !!userPhone,
    queryFn: async () => {
      const cleanPhone = normalizePhone(userPhone);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch customer orders:", error.message);
        return [];
      }

      // Filter by normalized phone match
      const matchingOrders = (data as Order[]).filter((o) => phonesMatch(o.phone, cleanPhone));
      return matchingOrders;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/" });
  };

  if (loadingSession) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#F7F7F5]">
        <Loader2 className="h-6 w-6 animate-spin text-[#0D0D0D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-8 sm:py-12" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        {/* Customer Profile Banner */}
        <div className="border border-[#E5E5E0] bg-white p-5 sm:p-6 shadow-xs rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-[#0D0D0D] text-[#F7F7F5] font-black text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0D0D0D]">
                  أهلاً بك، {userName}
                </h1>
                <span className="rounded-xs bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                  حساب عميل نشط
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B6B66]">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3" />
                  {userPhone || "غير مسجل"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {userEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5E5E0]">
            <Link
              to="/track"
              className="inline-flex items-center gap-1.5 border border-[#E5E5E0] bg-[#F7F7F5] px-3.5 py-2 text-xs font-bold text-[#0D0D0D] hover:bg-white transition-colors rounded-xs"
            >
              <Package className="h-3.5 w-3.5" />
              <span>تتبع سريع</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-[#E5E5E0] px-3.5 py-2 text-xs font-bold text-[#8B2E2E] hover:bg-rose-50 transition-colors rounded-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0D0D0D]">
                طلباتي السابقة والحالية
              </h2>
              <span className="rounded-full bg-[#0D0D0D] text-[#F7F7F5] px-2 py-0.5 text-xs font-bold font-mono">
                {orders.length}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 text-xs text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
              title="تحديث الطلبات"
            >
              <RefreshCw className="h-3 w-3" />
              <span>تحديث</span>
            </button>
          </div>

          {loadingOrders ? (
            <div className="border border-[#E5E5E0] bg-white p-12 text-center rounded-xs">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0D0D0D]" />
              <span className="mt-2 block text-xs text-[#6B6B66]">جاري تحميل سجل طلباتك...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-[#E5E5E0] bg-white p-10 sm:p-14 text-center rounded-xs shadow-xs space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F7F5] text-[#6B6B66]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#0D0D0D]">لا توجد طلبات مسجلة بهذا الرقم حتى الآن</h3>
              <p className="text-xs text-[#6B6B66] max-w-sm mx-auto leading-relaxed">
                أي طلب تقوم به برقم هاتفك <strong>{userPhone}</strong> سيظهر هنا تلقائياً لمتابعة خط سيره وحالته.
              </p>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-[#0D0D0D] px-5 py-2.5 text-xs font-bold text-[#F7F7F5] hover:bg-[#1F1F1F] transition-colors rounded-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>تصفح تشكيلة PR1ME الآن</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG["جديد"];
                const isCancelled = order.status === "ملغي";

                return (
                  <div
                    key={order.id}
                    className="border border-[#E5E5E0] bg-white rounded-xs overflow-hidden shadow-xs hover:border-[#0D0D0D]/40 transition-colors"
                  >
                    {/* Order Header */}
                    <div className="border-b border-[#E5E5E0] p-4 bg-[#F7F7F5] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm sm:text-base font-black text-[#0D0D0D]">
                          #{order.order_code}
                        </span>
                        <span
                          className={`rounded-xs border px-2.5 py-0.5 text-[11px] font-bold ${config.bg} ${config.text} ${config.border}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6B6B66]">
                        <span>
                          {new Date(order.created_at).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-black text-sm text-[#0D0D0D]">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Live Status Stepper */}
                      {!isCancelled && (
                        <div className="bg-[#F7F7F5] p-3 border border-[#E5E5E0] rounded-xs">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B6B66] mb-2">
                            <span>مسار الشحنة:</span>
                            <span className="text-[#0D0D0D]">{order.status}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            {[
                              { label: "تم الاستلام", step: 1 },
                              { label: "تم التأكيد", step: 2 },
                              { label: "قيد الشحن", step: 3 },
                              { label: "تم التسليم", step: 4 },
                            ].map((s) => {
                              const active = config.step >= s.step;
                              return (
                                <div key={s.step} className="space-y-1">
                                  <div
                                    className={`h-1.5 w-full rounded-full transition-colors ${
                                      active ? "bg-emerald-500" : "bg-[#E5E5E0]"
                                    }`}
                                  />
                                  <span
                                    className={`text-[9px] sm:text-[10px] block truncate ${
                                      active ? "font-bold text-[#0D0D0D]" : "text-[#6B6B66]"
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-[#E5E5E0]/60 last:border-0"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="font-bold text-[#0D0D0D] block line-clamp-1">
                                {item.title}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-[#6B6B66] mt-0.5">
                                <span>الكمية: {item.quantity}</span>
                                {item.selectedSize && <span>• مقاس: {item.selectedSize}</span>}
                                {item.selectedColor && <span>• لون: {item.selectedColor}</span>}
                              </div>
                            </div>
                            <span className="font-mono font-bold text-[#0D0D0D] flex-shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Address & Actions */}
                      <div className="pt-2 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-[#6B6B66]">
                          التوصيل إلى: <strong className="text-[#0D0D0D]">{order.governorate}</strong> — {order.address}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/track"
                            search={{ code: order.order_code, phone: order.phone }}
                            className="inline-flex items-center gap-1 border border-[#E5E5E0] bg-[#F7F7F5] px-3 py-1.5 font-bold text-[#0D0D0D] hover:bg-white transition-colors rounded-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>تتبع بالتفصيل</span>
                          </Link>
                          <a
                            href={generalContactLink(`مرحباً PR1ME، بخصوص طلبي #${order.order_code}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 border border-[#E5E5E0] px-3 py-1.5 font-bold text-[#0D0D0D] hover:bg-[#F7F7F5] transition-colors rounded-xs"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>الدعم</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
