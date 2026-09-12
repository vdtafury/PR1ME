/**
 * Resolves any image URL to a fast, reliable local path.
 * Maps any external Supabase catalog URLs or outdated Unsplash links
 * to local high-speed Vercel Edge paths to guarantee 100% reliability
 * on mobile data networks (Vodafone, Orange, WE, Etisalat).
 */
export function resolveImageUrl(
  url: string | null | undefined,
  fallback: string = "/brand/hero-cairo-streetwear.jpg"
): string {
  if (!url) return fallback;

  // Already a local path
  if (url.startsWith("/")) return url;

  // Convert Supabase storage catalog URLs to local assets
  if (url.includes("/catalog/brand-assets/")) {
    const parts = url.split("/catalog/brand-assets/");
    if (parts[1]) {
      return `/${parts[1]}`;
    }
  }

  // Convert old Unsplash URLs to brand assets
  if (url.includes("unsplash.com")) {
    if (url.includes("549298916") || url.includes("shoes")) {
      return "/categories/accessories.jpg";
    }
    if (url.includes("517838277") || url.includes("activewear")) {
      return "/categories/hoodies.jpg";
    }
    return fallback;
  }

  return url;
}
