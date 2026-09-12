import { MessageCircle } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";
import { useMatchRoute } from "@tanstack/react-router";

export function FloatingWhatsApp() {
  const matchRoute = useMatchRoute();
  const isProductPage = Boolean(matchRoute({ to: "/products/$slug", fuzzy: true }));

  return (
    <a
      href={generalContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل على واتساب"
      className={`group fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-30 items-center gap-2 border border-[#E5E5E0] bg-[#0D0D0D] px-3.5 py-2.5 text-[#F7F7F5] shadow-lg transition-colors hover:bg-[#1F1F1F] active:scale-95 ${
        isProductPage ? "hidden md:flex" : "flex"
      }`}
    >
      <MessageCircle className="h-4 w-4 text-emerald-400" />
      <span className="hidden sm:inline text-xs font-bold">
        تحدث معنا واتساب
      </span>
    </a>
  );
}
