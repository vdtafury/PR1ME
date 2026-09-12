import { MessageCircle } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={generalContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل على واتساب"
      className="group fixed bottom-5 left-5 z-40 flex items-center gap-2 border border-emerald-500/40 bg-emerald-600 px-3.5 py-2.5 text-white shadow-lg transition-colors hover:bg-emerald-500"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline text-xs font-bold">
        تحدث معنا واتساب
      </span>
    </a>
  );
}
