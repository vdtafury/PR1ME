import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, CheckCircle2, MessageSquarePlus, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ALL_GOVERNORATES } from "@/lib/shipping";
import type { Review } from "@/lib/types";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
}

export function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [governorate, setGovernorate] = useState(ALL_GOVERNORATES[0] || "القاهرة");
  const [comment, setComment] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real reviews from Supabase with fallback to localStorage
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        if (error) {
          // Fallback if table is not yet created in Supabase
          const local = localStorage.getItem(`pr1me_reviews_${productId}`);
          return local ? JSON.parse(local) : [];
        }

        return (data as Review[]) || [];
      } catch {
        const local = localStorage.getItem(`pr1me_reviews_${productId}`);
        return local ? JSON.parse(local) : [];
      }
    },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : null;

  // Rating distribution counts
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const ratingDescriptions: Record<number, string> = {
    1: "سيء جداً",
    2: "مقبول",
    3: "جيد",
    4: "جيد جداً",
    5: "ممتاز وخامة راقية",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("يرجى إدخال اسمك");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      toast.error("يرجى كتابة تعليق لا يقل عن 5 أحرف يوضح تجربتك مع المنتج");
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: crypto.randomUUID(),
      product_id: productId,
      customer_name: customerName.trim(),
      governorate,
      rating,
      comment: comment.trim(),
      order_code: orderCode.trim() || null,
      is_verified_buyer: !!orderCode.trim(),
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        customer_name: newReview.customer_name,
        governorate: newReview.governorate,
        rating: newReview.rating,
        comment: newReview.comment,
        order_code: newReview.order_code,
        is_verified_buyer: newReview.is_verified_buyer,
        is_approved: true,
      });

      if (error) {
        // Fallback to localStorage if table doesn't exist yet on remote
        const existing = localStorage.getItem(`pr1me_reviews_${productId}`);
        const parsed: Review[] = existing ? JSON.parse(existing) : [];
        const updated = [newReview, ...parsed];
        localStorage.setItem(`pr1me_reviews_${productId}`, JSON.stringify(updated));
      }

      // Optimistically update query cache
      queryClient.setQueryData<Review[]>(["reviews", productId], (old = []) => [
        newReview,
        ...old,
      ]);

      toast.success("شكراً لك! تم تسجيل ونشر تقييمك للمنتج بنجاح.");
      setComment("");
      setOrderCode("");
      setIsFormOpen(false);
    } catch {
      toast.error("حدث خطأ أثناء حفظ التقييم. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="reviews-section" className="mt-10 border-t border-[#E5E5E0] pt-8">
      {/* Header with Title and Overall Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0D0D0D]">
              آراء وتجارب العملاء الحقيقية
            </h2>
            <span className="rounded-full bg-[#F7F7F5] border border-[#E5E5E0] px-2 py-0.5 text-[11px] font-mono font-bold text-[#6B6B66]">
              {totalReviews} {totalReviews === 1 ? "تقييم" : "تقييمات"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6B6B66]">
            تقييمات فعلية من متسوقين حقيقيين بعد تجربة خامة ومقاس المنتج.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xs border border-[#0D0D0D] bg-white px-4 py-2 text-xs font-bold text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>{isFormOpen ? "إغلاق النموذج" : "أضف تقييمك للمنتج"}</span>
        </button>
      </div>

      {/* Write Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] p-4 sm:p-6 space-y-4 transition-all"
        >
          <div className="border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-bold text-[#0D0D0D]">
              تقييمك لمنتج: {productTitle}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#6B6B66]">
              رأيك الصادق يساعد المتسوقين الآخرين في اختيار المقاس والخامة المناسبة.
            </p>
          </div>

          {/* Interactive Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-[#0D0D0D] mb-1.5">
              درجة التقييم <span className="text-[#8B2E2E]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const active = hoverRating ? starVal <= hoverRating : starVal <= rating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`تقييم ${starVal} من 5`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-[#E5E5E0]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-[#0D0D0D] mr-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Customer Name and Governorate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                الاسم بالكامل <span className="text-[#8B2E2E]">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: أحمد عبد الله"
                className="w-full min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                المحافظة <span className="text-[#8B2E2E]">*</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-xs text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none transition-colors cursor-pointer"
              >
                {ALL_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
              تفاصيل تجربتك مع المنتج <span className="text-[#8B2E2E]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب انطباعك عن ملمس القطن، دقة المقاس، التقفيل، أو التوصيل..."
              className="w-full rounded-xs border border-[#E5E5E0] bg-white p-3 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
            />
          </div>

          {/* Optional Order Code for Verified Buyer Badge */}
          <div>
            <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
              كود الطلب (اختياري — للحصول على شارة مشتري موثق)
            </label>
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="مثال: PR1-8492"
              className="w-full min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-xs font-mono text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
            />
            <p className="mt-1 text-[10px] text-[#6B6B66]">
              إذا قمت بالطلب مسبقاً، أدخل كود الأوردر لتأكيد مراجعتك بشارة "مشتري موثق".
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xs bg-[#0D0D0D] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1F1F1F] transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? "جاري الإرسال..." : "نشر التقييم الآن"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-4 py-2.5 text-xs font-medium text-[#6B6B66] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Ratings Overview Summary Box */}
      {totalReviews > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xs border border-[#E5E5E0] bg-white p-5 sm:p-6">
          {/* Big Score Box */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-[#E5E5E0] pb-5 md:pb-0 md:pl-6 text-center">
            <span className="text-4xl sm:text-5xl font-black text-[#0D0D0D] font-mono">
              {averageRating}
            </span>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= Math.round(Number(averageRating));
                return (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      filled
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-[#E5E5E0]"
                    }`}
                  />
                );
              })}
            </div>
            <span className="mt-1.5 text-xs text-[#6B6B66]">
              متوسط تقييم {totalReviews} من العملاء
            </span>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
            {starCounts.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-14 font-mono font-medium text-[#0D0D0D]">
                  <span>{stars}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                </div>
                <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E5E5E0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D0D0D] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-left text-[11px] font-mono text-[#6B6B66]">
                  {count} ({percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Reviews List */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#6B6B66]">
            جاري تحميل التقييمات...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xs border border-dashed border-[#E5E5E0] bg-white p-8 text-center space-y-3">
            <User className="h-8 w-8 text-[#6B6B66] mx-auto opacity-50" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0D0D0D]">
                لا توجد تقييمات لهذا المنتج حتى الآن
              </h4>
              <p className="text-xs text-[#6B6B66] max-w-sm mx-auto">
                كن أول مشترٍ يشارك تجربته مع هذا الموديل وخامته لمساعدة المتسوقين الآخرين.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xs bg-[#0D0D0D] px-4 py-2 text-xs font-bold text-white hover:bg-[#1F1F1F] transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>اكتب أول تقييم للمنتج</span>
            </button>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xs border border-[#E5E5E0] bg-white p-4 sm:p-5 text-xs space-y-2 transition-shadow hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#0D0D0D] text-sm">
                    {rev.customer_name}
                  </span>
                  {rev.governorate && (
                    <span className="rounded-xs bg-[#F7F7F5] border border-[#E5E5E0] px-2 py-0.5 text-[10px] text-[#6B6B66]">
                      {rev.governorate}
                    </span>
                  )}
                  {rev.is_verified_buyer && (
                    <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>مشتري موثق</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#6B6B66] font-mono">
                  {formatDate(rev.created_at)}
                </span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= rev.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-[#E5E5E0]"
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="mt-1 text-xs text-[#262626] leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
