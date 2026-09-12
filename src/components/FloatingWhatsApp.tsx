import { MessageCircle } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={generalContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تحدث معنا على واتساب"
      className="group fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-full bg-whatsapp p-3 text-whatsapp-foreground shadow-xl shadow-whatsapp/25 transition-all duration-300 hover:scale-105 hover:bg-whatsapp-hover hover:shadow-2xl hover:shadow-whatsapp/35 active:scale-95"
    >
      <div className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75"></span>
        <MessageCircle className="relative h-6 w-6" />
      </div>
      <span className="hidden sm:inline pl-1 pr-3 text-xs font-bold tracking-wide">
        تحدث معنا واتساب
      </span>
    </a>
  );
}

