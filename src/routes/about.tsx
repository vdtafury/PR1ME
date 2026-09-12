import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Truck, Clock, MapPin, ShoppingBag, ShieldCheck, RotateCcw } from "lucide-react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البراند وتفاصيل الشحن — PR1ME" },
      {
        name: "description",
        content: "تعرف على PR1ME: أزياء كاجوال عصرية في مصر، خامات قطنية عالية الجودة، شحن سريع ومعاينة قبل الدفع.",
      },
      { property: "og:title", content: "عن البراند — PR1ME" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-12 overflow-x-hidden">
      <div className="border-b border-[#E5E5E0] pb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9B89A]">
          ABOUT THE BRAND
        </span>
        <h1 className="mt-1 text-xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
          عن علامة {BRAND.name} للملابس الكاجوال
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#6B6B66]">
          انطلقت <strong className="text-[#0D0D0D]">PR1ME</strong> لتقديم ملابس كاجوال يومية تجمع بين أرقى الخامات القطنية والتصاميم العملية بأسعار عادلة. نؤمن بأن التسوق يجب أن يكون سلساً وموثوقاً، لذلك وفرنا طريقة الطلب المباشر عبر واتساب لتسريع تواصلك معنا بدون تعقيد، مع ميزة المعاينة والقياس قبل الدفع كاش عند الاستلام.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<ShoppingBag className="h-5 w-5 text-[#0D0D0D]" />}
          title="كيفية الشراء والطلب"
          desc="تصفح الكتالوج، اختر مقاسك ولونك، واضغط 'اطلب عبر واتساب' لتأكيد طلبك وتحديد عنوانك في دقائق."
        />
        <InfoCard
          icon={<Truck className="h-5 w-5 text-[#0D0D0D]" />}
          title="الشحن لجميع المحافظات"
          desc="توصيل سريع خلال 2 إلى 4 أيام عمل لكافة محافظات ومدن مصر، مع شحن مجاني للطلبات فوق 1,000 ج.م."
        />
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5 text-[#0D0D0D]" />}
          title="معاينة المنتج قبل الدفع"
          desc="نوفر لك راحة البال؛ يحق لك فتح الشحنة ومعاينتها والتأكد من المقاس والخامة بحضور المندوب قبل دفع ثمنها."
        />
        <InfoCard
          icon={<RotateCcw className="h-5 w-5 text-[#0D0D0D]" />}
          title="مرونة الاستبدال"
          desc="إذا كان المقاس غير ملائم، يمكنك طلب تبديل المقاس خلال 14 يوماً من استلام الشحنة بسهولة تامة."
        />
        <InfoCard
          icon={<MapPin className="h-5 w-5 text-[#0D0D0D]" />}
          title="المقر الرئيسي"
          desc={`${BRAND.location}`}
        />
        <InfoCard
          icon={<Clock className="h-5 w-5 text-[#0D0D0D]" />}
          title="مواعيد العمل والدعم"
          desc={`${BRAND.hours}`}
        />
      </div>

      <div className="mt-8 border border-[#E5E5E0] bg-white p-5 sm:p-8 text-center">
        <h3 className="text-base sm:text-lg font-bold text-[#0D0D0D]">هل لديك أي استفسار عن منتج أو مقاس؟</h3>
        <p className="mt-1 text-xs text-[#6B6B66]">
          فريق خدمة العملاء متاح للرد على تساؤلاتك ومساعدتك في اختيار القطعة والمقاس المناسب.
        </p>
        <a
          href={generalContactLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 bg-[#0D0D0D] px-6 py-2.5 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98"
        >
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <span>تواصل معنا على واتساب</span>
        </a>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 border border-[#E5E5E0] bg-white p-3.5 sm:p-4">
      <div className="mt-0.5 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-bold text-[#0D0D0D]">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-[#6B6B66]">{desc}</p>
      </div>
    </div>
  );
}
