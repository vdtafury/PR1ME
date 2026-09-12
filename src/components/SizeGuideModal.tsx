import { X, Ruler, MessageCircle, Check } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  categorySlug?: string | null;
}

export function SizeGuideModal({
  isOpen,
  onClose,
  productTitle,
  categorySlug,
}: SizeGuideModalProps) {
  const [mounted, setMounted] = useState(false);
  const isPants = categorySlug === "pants" || productTitle?.toLowerCase().includes("pant") || productTitle?.toLowerCase().includes("cargo") || productTitle?.includes("بنطلون") || productTitle?.includes("كارغو");
  const [tab, setTab] = useState<"tops" | "pants">(isPants ? "pants" : "tops");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPants) {
      setTab("pants");
    } else {
      setTab("tops");
    }
  }, [isPants]);

  // Keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body & html scroll
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] pointer-events-auto select-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Container */}
      <div className="fixed inset-0 z-10 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative flex w-full max-h-[90dvh] sm:max-w-lg flex-col rounded-t-xl sm:rounded-xs border-t sm:border border-[#E5E5E0] bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 overscroll-contain"
          role="dialog"
          aria-modal="true"
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="sm:hidden flex justify-center pt-2 pb-1 bg-white rounded-t-xl">
            <div className="h-1 w-10 rounded-full bg-[#E5E5E0]" />
          </div>

          {/* Fixed Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-[#E5E5E0] px-4 py-3 sm:px-6 sm:py-4 bg-white">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xs bg-[#F7F7F5] border border-[#E5E5E0] text-[#0D0D0D]">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0D0D0D]">
                  دليل مقاسات وأوزان PR1ME
                </h3>
                <p className="text-[10px] text-[#6B6B66]">قياسات معمارية دقيقة وقصات مريحة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xs text-[#6B6B66] hover:text-[#0D0D0D] hover:bg-[#F7F7F5] transition-colors"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex-shrink-0 border-b border-[#E5E5E0] bg-[#F7F7F5] px-4 py-2 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("tops")}
              className={`flex-1 min-h-[38px] text-xs font-bold transition-all ${
                tab === "tops"
                  ? "bg-[#0D0D0D] text-[#F7F7F5] shadow-xs"
                  : "bg-white text-[#6B6B66] hover:text-[#0D0D0D] border border-[#E5E5E0]"
              }`}
            >
              الملابس العلوية (هودي / تيشيرت)
            </button>
            <button
              type="button"
              onClick={() => setTab("pants")}
              className={`flex-1 min-h-[38px] text-xs font-bold transition-all ${
                tab === "pants"
                  ? "bg-[#0D0D0D] text-[#F7F7F5] shadow-xs"
                  : "bg-white text-[#6B6B66] hover:text-[#0D0D0D] border border-[#E5E5E0]"
              }`}
            >
              البنطلونات والكارغو
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            {tab === "tops" ? (
              <div className="overflow-hidden border border-[#E5E5E0] rounded-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F7F7F5] text-[#0D0D0D] font-bold border-b border-[#E5E5E0]">
                    <tr>
                      <th className="px-3 py-2.5">المقاس</th>
                      <th className="px-3 py-2.5">الوزن المناسب</th>
                      <th className="px-3 py-2.5">عرض الصدر</th>
                      <th className="px-3 py-2.5">الطول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0] font-sans">
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">M</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">60 - 72 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">52 - 54 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">71 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors bg-[#F7F7F5]/20">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">L</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">73 - 84 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">55 - 57 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">73 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">XL</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">85 - 96 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">58 - 60 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">75 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors bg-[#F7F7F5]/20">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">XXL</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">97 - 110 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">61 - 64 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">77 سم</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-hidden border border-[#E5E5E0] rounded-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F7F7F5] text-[#0D0D0D] font-bold border-b border-[#E5E5E0]">
                    <tr>
                      <th className="px-3 py-2.5">المقاس</th>
                      <th className="px-3 py-2.5">الوزن المناسب</th>
                      <th className="px-3 py-2.5">محيط الخصر</th>
                      <th className="px-3 py-2.5">طول البنطلون</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0] font-sans">
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">M (30-32)</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">60 - 72 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">76 - 82 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">100 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors bg-[#F7F7F5]/20">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">L (32-34)</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">73 - 84 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">82 - 88 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">102 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">XL (34-36)</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">85 - 96 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">88 - 94 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">104 سم</td>
                    </tr>
                    <tr className="hover:bg-[#F7F7F5]/50 transition-colors bg-[#F7F7F5]/20">
                      <td className="px-3 py-2.5 font-mono font-black text-[#0D0D0D]">XXL (36-38)</td>
                      <td className="px-3 py-2.5 text-[#6B6B66]">97 - 110 كجم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">94 - 100 سم</td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#0D0D0D]">106 سم</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Practical Sizing Tips */}
            <div className="space-y-2 text-xs border border-[#E5E5E0] bg-[#F7F7F5] p-3.5 rounded-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D]">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>ضمان المعاينة والتجربة قبل الدفع:</span>
              </div>
              <p className="text-[11px] text-[#6B6B66] leading-relaxed pr-5">
                مندوب التوصيل بينتظرك لمعاينة الشحنة وقياس القطعة بنفسك قبل استلامها، ومعاك 14 يوم للاستبدال المجاني للمقاس لو احتجت!
              </p>
              <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between">
                <span className="text-[11px] text-[#0D0D0D] font-semibold">محتار بين مقاسين؟</span>
                <a
                  href={generalContactLink(`مرحباً PR1ME، أحتاج مساعدة في اختيار المقاس المناسب لـ ${productTitle || "المنتج"}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>اسأل خبير المقاسات عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Dismiss Button */}
          <div className="flex-shrink-0 border-t border-[#E5E5E0] p-3.5 sm:p-4 bg-white pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[46px] bg-[#0D0D0D] text-white text-xs font-bold rounded-xs hover:bg-[#1F1F1F] active:scale-98 transition-all"
            >
              فهمت، العودة للمنتج
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
