export const BRAND = {
  name: "PR1ME",
  tagline: "Affordable casual fashion. Delivered fast.",
  whatsappNumber: "201095189259", // no +, country code first
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  facebook: "https://facebook.com",
  hours: "Sat – Thu, 10:00 AM – 10:00 PM",
  location: "Cairo, Egypt — Nationwide shipping",
};

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${BRAND.whatsappNumber}?text=${text}`;
}

export interface OrderItem {
  color: string | null;
  size: string | null;
  quantity: number;
}

export function productOrderLink(opts: {
  title: string;
  code?: string | null;
  price?: number | null;
  url?: string;
  items: OrderItem[];
}) {
  const lines = [
    `Hello ${BRAND.name}, I would like to order:`,
    `- Product: ${opts.title}`,
  ];
  if (opts.code) lines.push(`- Code: ${opts.code}`);
  
  lines.push("");
  lines.push("Order Details:");
  
  let totalQty = 0;
  opts.items.forEach((item) => {
    const specs: string[] = [];
    if (item.color) specs.push(`Color: ${item.color}`);
    if (item.size) specs.push(`Size: ${item.size}`);
    const specStr = specs.length > 0 ? ` (${specs.join(", ")})` : "";
    lines.push(`• ${item.quantity}x${specStr}`);
    totalQty += item.quantity;
  });
  
  lines.push("");
  lines.push(`- Total Quantity: ${totalQty}`);
  
  if (opts.price != null) {
    lines.push(`- Price per unit: ${formatPrice(opts.price)}`);
    lines.push(`- Total Price: ${formatPrice(Number(opts.price) * totalQty)}`);
  }
  if (opts.url) lines.push(`- Link: ${opts.url}`);
  
  return whatsappLink(lines.join("\n"));
}

export function generalContactLink(extra?: string) {
  return whatsappLink(
    extra ?? `Hello ${BRAND.name}, I have a question about your products.`
  );
}

export function formatPrice(n: number | string | null | undefined) {
  if (n == null) return "";
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(v)) return "";
  return `EGP ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
