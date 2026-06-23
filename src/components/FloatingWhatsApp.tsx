import { MessageCircle } from "lucide-react";
import { generalContactLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={generalContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
