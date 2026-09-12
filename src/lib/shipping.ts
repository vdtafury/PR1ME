export interface ShippingRate {
  governorate: string;
  fee: number;
}

export const FREE_SHIPPING_THRESHOLD = 1000;

export const SHIPPING_RATES: Record<string, number> = {
  "القاهرة": 50,
  "الجيزة": 50,
  "الإسكندرية": 60,
  "القليوبية": 60,
  "الدقهلية": 65,
  "الشرقية": 65,
  "الغربية": 65,
  "المنوفية": 65,
  "البحيرة": 65,
  "الإسماعيلية": 65,
  "السويس": 65,
  "بورسعيد": 65,
  "دمياط": 65,
  "كفر الشيخ": 65,
  "الفيوم": 70,
  "بني سويف": 70,
  "المنيا": 75,
  "أسيوط": 75,
  "سوهاج": 75,
  "قنا": 80,
  "الأقصر": 80,
  "أسوان": 85,
  "البحر الأحمر": 90,
  "مطروح": 90,
};

export const ALL_GOVERNORATES = Object.keys(SHIPPING_RATES);

/**
 * Calculates shipping fee based on governorate and subtotal.
 * If subtotal >= FREE_SHIPPING_THRESHOLD, returns 0.
 */
export function getShippingFee(governorate: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_RATES[governorate] ?? 60;
}

/**
 * Generates a unique, branded, short order tracking code.
 * Example: PR1-8429
 */
export function generateOrderCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PR1-${randomNum}`;
}
