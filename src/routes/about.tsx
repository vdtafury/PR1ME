import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Truck, Clock, MapPin, ShoppingBag, ShieldCheck, RefreshCw, Award } from "lucide-react";
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="border-b border-border/60 pb-6">
        <span className="text-xs font-bold text-whatsapp uppercase tracking-wider">قصتنا ورؤيتنا</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          عن علامة {BRAND.name} للملابس الكاجوال
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          انطلقت <strong className="text-foreground">PR1ME</strong> بهدف تقديم أزياء كاجوال عصرية تجمع بين أرقى الخامات القطنية والتصاميم اليومية الأنيقة بأسعار عادلة تناسب الجميع في مصر. نؤمن بأن التسوق يجب أن يكون تجربة سهلة وسريعة وموثوقة، لذلك صممنا طريقة الطلب المباشر عبر واتساب لتسريع تواصلك معنا بدون تعقيد، مع ميزة المعاينة قبل الدفع كاش عند الاستلام.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <InfoCard
          icon={<ShoppingBag className="h-6 w-6 text-whatsapp" />}
          title="كيفية الشراء والطلب"
          desc="تصفح الكتالوج، اختر مقاسك ولونك المفضل، واضغط 'اطلب عبر واتساب' لتأكيد طلبك وتحديد عنوانك في دقائق."
        />
        <InfoCard
          icon={<Truck className="h-6 w-6 text-whatsapp" />}
          title="الشحن لجميع المحافظات"
          desc="توصيل سريع خلال 2 إلى 4 أيام عمل لكافة محافظات ومدن مصر، مع شحن مجاني للطلبات التي تتجاوز 1,000 ج.م."
        />
        <InfoCard
          icon={<ShieldCheck className="h-6 w-6 text-whatsapp" />}
          title="معاينة المنتج قبل الدفع"
          desc="نوفر لك راحة البال التامة؛ يحق لك فتح الشحنة ومعاينتها والتأكد من المقاس والخامة بحضور المندوب قبل دفع ثمنها."
        />
        <InfoCard
          icon={<RefreshCw className="h-6 w-6 text-whatsapp" />}
          title="مرونة الاستبدال والاسترجاع"
          desc="إذا كان المقاس غير ملائم، يمكنك طلب تبديل المقاس خلال 14 يوماً من استلام الشحنة بسهولة تامة."
        />
        <InfoCard
          icon={<MapPin className="h-6 w-6 text-whatsapp" />}
          title="الموقع والشحن"
          desc={`${BRAND.location}`}
        />
        <InfoCard
          icon={<Clock className="h-6 w-6 text-whatsapp" />}
          title="مواعيد العمل والدعم"
          desc={`${BRAND.hours}`}
        />
      </div>

      <div className="mt-12 rounded-3xl border border-border/70 bg-card/60 p-8 text-center sm:p-10 backdrop-blur-sm">
        <h3 className="text-xl font-black text-foreground">هل لديك أي استفسار أو اقتراح؟</h3>
        <p className="mt-2 text-sm text-muted-foreground">فريق خدمة العملاء متاح للإجابة على جميع تساؤلاتك ومساعدتك في اختيار ما يناسبك.</p>
        <a
          href={generalContactLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-whatsapp px-8 py-3.5 text-sm font-bold text-whatsapp-foreground shadow-lg shadow-whatsapp/25 transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
          <span>تواصل معنا فوراً على واتساب</span>
        </a>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-transform hover:-translate-y-1">
      <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-muted/60">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

