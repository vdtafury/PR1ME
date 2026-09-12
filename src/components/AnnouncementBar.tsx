import { Truck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AnnouncementBar() {
  return (
    <div className="relative z-40 bg-[#0D0D0D] py-2 text-[11px] text-[#F7F7F5]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Right side in RTL: Shipping announcement */}
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-[#F7F7F5]" />
          <span className="font-medium">
            شحن مجاني للطلبات فوق 1000 جنيه داخل مصر
          </span>
        </div>

        {/* Left side in RTL: Tracking & Help */}
        <div className="flex items-center gap-3 text-white/80">
          <Link to="/about" className="hover:text-white transition-colors">
            تتبع طلبك
          </Link>
          <span className="text-white/40">|</span>
          <Link to="/about" className="hover:text-white transition-colors">
            المساعدة
          </Link>
        </div>
      </div>
    </div>
  );
}
