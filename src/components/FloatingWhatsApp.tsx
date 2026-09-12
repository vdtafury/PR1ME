import { MessageCircle } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={generalContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل على واتساب"
      className="group fixed bottom-5 left-5 z-40 flex items-center gap-2 border border-[#E5E5E0] bg-[#0D0D0D] px-3.5 py-2.5 text-[#F7F7F5] shadow-lg transition-colors hover:bg-[#1F1F1F]"
    >
      <MessageCircle className="h-4 w-4 text-emerald-400" />
      <span className="hidden sm:inline text-xs font-bold">
        تحدث معنا واتساب
      </span>
    </a>
  );
}
