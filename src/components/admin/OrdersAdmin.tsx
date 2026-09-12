import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Phone,
  MessageCircle,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/whatsapp";
import { toast } from "sonner";

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  "جديد": { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/30" },
  "تم التأكيد": { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/30" },
  "قيد الشحن": { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/30" },
  "تم التسليم": { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/30" },
  "ملغي": { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-500/30" },
};

const ALL_STATUSES: OrderStatus[] = ["جديد", "تم التأكيد", "قيد الشحن", "تم التسليم", "ملغي"];

export function OrdersAdmin() {
  const qc = useQueryClient();
  const [searchTerm, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: orders = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch orders from Supabase:", error.message);
        throw error;
      }
      return (data as Order[]) || [];
    },
    refetchInterval: 20000, // auto-refresh every 20s
  });

  // Calculate quick metrics
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => o.status === "جديد").length;
  const inProgressCount = orders.filter((o) => o.status === "تم التأكيد" || o.status === "قيد الشحن").length;
  const totalDeliveredRevenue = orders
    .filter((o) => o.status === "تم التسليم")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalGrossRevenue = orders
    .filter((o) => o.status !== "ملغي")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesStatus;

    const matchesSearch =
      order.order_code?.toLowerCase().includes(term) ||
      order.customer_name?.toLowerCase().includes(term) ||
      order.phone?.includes(term) ||
      order.governorate?.toLowerCase().includes(term) ||
      order.address?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success(`تم تغيير حالة الطلب إلى "${newStatus}"`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء تحديث حالة الطلب");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string, orderCode: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الطلب رقم #${orderCode} نهائياً؟`)) {
      return;
    }

    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;

      toast.success(`تم حذف الطلب #${orderCode} بنجاح`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء حذف الطلب");
    }
  };

  // Helper for direct WhatsApp customer link
  const getCustomerWhatsAppUrl = (order: Order) => {
    let cleanPhone = order.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "2" + cleanPhone;
    } else if (!cleanPhone.startsWith("20")) {
      cleanPhone = "20" + cleanPhone;
    }
    const msg = `مرحباً أ/ ${order.customer_name}، نتواصل معك من براند PR1ME بخصوص طلبك رقم #${order.order_code}..`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-border bg-card p-4 rounded-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>إجمالي الطلبات</span>
            <Package className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-foreground">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-muted-foreground">كافة الأوردرات المسجلة</span>
        </div>

        <div className="border border-border bg-card p-4 rounded-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>طلبات جديدة</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-amber-700">
            {newOrdersCount}
          </p>
          <span className="text-[11px] text-muted-foreground">بانتظار التأكيد مع العميل</span>
        </div>

        <div className="border border-border bg-card p-4 rounded-xs">
          <div className="flex items-center justify-between text-purple-700 text-xs font-semibold">
            <span>قيد التنفيذ / الشحن</span>
            <Truck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-purple-700">
            {inProgressCount}
          </p>
          <span className="text-[11px] text-muted-foreground">مع شركة الشحن والمندوب</span>
        </div>

        <div className="border border-border bg-card p-4 rounded-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>إجمالي المبيعات النشطة</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-700">
            {formatPrice(totalGrossRevenue)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            المُسلم منها: {formatPrice(totalDeliveredRevenue)}
          </span>
        </div>
      </div>

      {/* Database Setup Notice if table error */}
      {error && (
        <div className="border border-amber-500/40 bg-amber-500/10 p-4 rounded-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <FileText className="h-4 w-4" />
            <span>تنبيه تفعيل جدول الطلبات في Supabase:</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            لم يتم العثور على جدول <code className="font-mono bg-white px-1">orders</code> في Supabase بعد.
            يرجى فتح رابط{" "}
            <a
              href="https://supabase.com/dashboard/project/qgdjamllserirocgqpux/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-bold"
            >
              Supabase SQL Editor
            </a>{" "}
            وتشغيل ملف الـ Migration المجهز في{" "}
            <code className="font-mono bg-white px-1">supabase/migrations/20260913_orders_table.sql</code>.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 touch-scroll overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition-colors ${
              statusFilter === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            الكل ({totalOrdersCount})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition-colors ${
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-xs border border-border bg-card pr-8 pl-3 text-xs focus:border-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="grid h-9 w-9 place-items-center rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground text-xs">
          <RefreshCw className="h-6 w-6 animate-spin mb-2" />
          <span>جاري تحميل الطلبات...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-dashed border-border bg-card p-12 text-center rounded-xs">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground">لا توجد طلبات مطابقة</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "جرّب تغيير فلاتر البحث أو تصفيرها."
              : "ستظهر الطلبات الجديدة هنا فور قيام العملاء بتأكيد الشراء."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_COLORS[order.status] || STATUS_COLORS["جديد"];
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="border border-border bg-card p-4 rounded-xs shadow-xs hover:border-foreground/40 transition-all space-y-3"
              >
                {/* Order Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm bg-foreground text-background px-2 py-0.5 rounded-xs">
                      #{order.order_code}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(order.created_at).toLocaleString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">الحالة:</span>
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`h-8 px-2.5 text-xs font-bold border rounded-xs cursor-pointer focus:outline-none ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id, order.order_code)}
                      className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-rose-600 rounded-xs hover:bg-rose-50 transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Info & Address */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  <div className="md:col-span-4 space-y-1">
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <span>{order.customer_name}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${order.phone}`}
                        className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-xs font-mono font-bold hover:text-foreground text-[#0D0D0D]"
                        title="اتصال هاتفي"
                      >
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{order.phone}</span>
                      </a>

                      <a
                        href={getCustomerWhatsAppUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-600/10 text-emerald-700 border border-emerald-600/20 px-2 py-1 rounded-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                        title="محادثة واتساب"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>واتساب</span>
                      </a>
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-1 text-muted-foreground">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">{order.governorate}:</strong>{" "}
                        <span>{order.address}</span>
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-[11px] text-muted-foreground bg-muted/50 p-1.5 rounded-xs mt-1">
                        <strong>ملاحظات:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Pricing Summary */}
                  <div className="md:col-span-3 border-r border-border pr-3 flex flex-col justify-center space-y-0.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>المنتجات:</span>
                      <span className="font-mono">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>الشحن:</span>
                      <span className="font-mono">
                        {order.shipping_fee === 0 ? "مجاني" : formatPrice(order.shipping_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-foreground pt-1 border-t border-border">
                      <span>الإجمالي:</span>
                      <span className="font-mono text-sm">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="border-t border-border pt-2">
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Array.isArray(order.items) &&
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 border border-border bg-background px-2 py-1 rounded-xs"
                        >
                          <span className="font-bold text-foreground">{item.title}</span>
                          <span className="font-mono bg-muted px-1 rounded-xs">x{item.quantity}</span>
                          {item.selectedSize && (
                            <span className="font-mono text-muted-foreground">
                              [{item.selectedSize}]
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-muted-foreground">({item.selectedColor})</span>
                          )}
                          <span className="font-mono font-bold text-foreground mr-1">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
