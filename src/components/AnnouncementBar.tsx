import { Truck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AnnouncementBar() {
  return (
    <div className="relative z-40 bg-[#0D0D0D] py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-[#F7F7F5]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Right side in RTL: Shipping announcement */}
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F7F7F5] flex-shrink-0" />
          <span className="font-medium truncate">
            شحن مجاني للطلبات فوق 1000 ج.م داخل مصر
          </span>
        </div>

        {/* Left side in RTL: Tracking & Help */}
        <div className="flex items-center gap-2 sm:gap-3 text-white/80 flex-shrink-0">
          <Link to="/about" className="hover:text-white transition-colors">
            تتبع طلبك
          </Link>
          <span className="text-white/40 hidden sm:inline">|</span>
          <Link to="/about" className="hover:text-white transition-colors hidden sm:inline">
            المساعدة
          </Link>
        </div>
      </div>
    </div>
  );
}
