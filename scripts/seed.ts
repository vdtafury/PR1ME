import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load credentials from .env
const envContent = fs.readFileSync(".env", "utf8");
const getEnvVar = (name: string) => {
  const match = envContent.match(new RegExp(`^${name}=(?:"([^"]*)"|'([^']*)'|([^\\s#]*))`, "m"));
  return match ? (match[1] || match[2] || match[3]) : null;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") || getEnvVar("SUPABASE_PUBLISHABLE_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key not found in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "mohamed@gmail.com";
const ADMIN_PASSWORD = "1234567890";

async function main() {
  console.log("🌱 Starting database seeding script...");
  console.log(`Connecting to: ${supabaseUrl}`);

  let session: any = null;

  // 1. Try to log in first
  console.log(`🔑 Attempting to log in as ${ADMIN_EMAIL}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (signInError) {
    console.log(`⚠️ Sign in failed: ${signInError.message}. Trying to sign up...`);
    
    // 2. Try to sign up if sign in failed
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signUpError) {
      console.error("❌ Sign up failed:", signUpError.message);
      console.log("\n💡 Make sure you have created the user in the Supabase Dashboard, or disabled 'Confirm email' under Auth > Providers > Email.");
      process.exit(1);
    }

    console.log("✅ Sign up successful!");
    session = signUpData.session;
    
    if (!session) {
      console.log("ℹ️ User created, but email confirmation is active. Retrying sign in...");
      // Try signing in again just in case auto-confirm was turned on
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      if (retrySignInError) {
        console.error("❌ Cannot log in: Email confirmation is required. Please confirm the email or uncheck 'Confirm email' in Supabase dashboard.");
        process.exit(1);
      }
      session = retrySignInData.session;
    }
  } else {
    console.log("✅ Logged in successfully!");
    session = signInData.session;
  }

  if (!session) {
    console.error("❌ Failed to establish authenticated session.");
    process.exit(1);
  }

  // Set up authenticated client with session access token
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });

  console.log("🛡️ Authenticated as Admin. Seeding tables...");

  // --- Seed Categories ---
  console.log("\n🔹 Seeding Categories...");
  const categories = [
    { name: "T-Shirts", slug: "t-shirts", sort_order: 1, image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80" },
    { name: "Hoodies", slug: "hoodies", sort_order: 2, image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80" },
    { name: "Pants", slug: "pants", sort_order: 3, image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80" },
    { name: "Accessories", slug: "accessories", sort_order: 4, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" },
    { name: "Shoes", slug: "shoes", sort_order: 5, image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80" },
    { name: "Jackets", slug: "jackets", sort_order: 6, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80" },
    { name: "Activewear", slug: "activewear", sort_order: 7, image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const { data, error } = await authClient
      .from("categories")
      .upsert(cat, { onConflict: "slug" })
      .select();

    if (error) {
      console.error(`❌ Failed to seed category ${cat.name}:`, error.message);
    } else if (data && data[0]) {
      console.log(`✅ Category seeded: ${cat.name}`);
      categoryMap[cat.slug] = data[0].id;
    }
  }

  // --- Seed Products ---
  console.log("\n🔹 Seeding Products...");
  const products = [
    {
      title: "Classic Cotton Tee",
      slug: "classic-cotton-tee",
      short_description: "100% premium cotton everyday t-shirt.",
      description: "A timeless classic crafted from soft, breathable premium cotton. Tailored fit, double-needle stitching, and pre-shrunk to keep its shape through countless washes.",
      price: 250,
      original_price: 320,
      product_code: "TS-001",
      category_id: categoryMap["t-shirts"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Gray", "Navy"],
      main_image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      gallery_images: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
      ],
      is_available: true,
      is_featured: true,
      sort_order: 1,
    },
    {
      title: "Vintage Graphic Tee",
      slug: "vintage-graphic-tee",
      short_description: "Retro vibes graphic t-shirt.",
      description: "Express your style with this retro-inspired graphic tee. Relaxed fit, heavyweight cotton feel, perfect for layering or wearing standalone.",
      price: 280,
      original_price: null,
      product_code: "TS-002",
      category_id: categoryMap["t-shirts"],
      sizes: ["M", "L", "XL"],
      colors: ["Black", "Beige"],
      main_image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 2,
    },
    {
      title: "Over-sized Streetwear Hoodie",
      slug: "oversized-streetwear-hoodie",
      short_description: "Heavyweight drop-shoulder street hoodie.",
      description: "Comfort meets style. Our oversized hoodie features drop shoulders, a thick double-lined hood, and a spacious kangaroo pocket. Made from warm fleece lining.",
      price: 490,
      original_price: 600,
      product_code: "HD-001",
      category_id: categoryMap["hoodies"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Gray", "Black", "Olive"],
      main_image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
      gallery_images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80"
      ],
      is_available: true,
      is_featured: true,
      sort_order: 3,
    },
    {
      title: "Cosy Fleece Pullover",
      slug: "cosy-fleece-pullover",
      short_description: "Ultra-soft polar fleece pullover.",
      description: "Keep warm in style with this polar fleece pullover. Features a snap-button collar, adjustable hem drawstrings, and zippered hand pockets.",
      price: 420,
      original_price: 480,
      product_code: "HD-002",
      category_id: categoryMap["hoodies"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige", "Navy", "Brown"],
      main_image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 4,
    },
    {
      title: "Cargo Utility Joggers",
      slug: "cargo-utility-joggers",
      short_description: "Functional cargo pants with elastic cuffs.",
      description: "Designed for utility and movement. Features multi-pocket layout, lightweight water-resistant stretch fabric, and comfortable elastic waistband.",
      price: 390,
      original_price: 450,
      product_code: "PT-001",
      category_id: categoryMap["pants"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Black", "Olive", "Gray"],
      main_image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: true,
      sort_order: 5,
    },
    {
      title: "Slim Fit Denim Jeans",
      slug: "slim-fit-denim-jeans",
      short_description: "Classic stretch-denim slim jeans.",
      description: "Crafted from durable mid-weight denim with a touch of elastane for stretch and comfort. Classic 5-pocket styling and custom metal hardware.",
      price: 450,
      original_price: null,
      product_code: "PT-002",
      category_id: categoryMap["pants"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Navy", "Black"],
      main_image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 6,
    },
    {
      title: "Minimalist Leather Belt",
      slug: "minimalist-leather-belt",
      short_description: "100% genuine leather belt with metallic buckle.",
      description: "Complete your outfit with this sleek genuine leather belt. Features a matte metal pin buckle and clean, unstitched edges for a minimalist look.",
      price: 150,
      original_price: 200,
      product_code: "AC-001",
      category_id: categoryMap["accessories"],
      sizes: ["One Size"],
      colors: ["Black", "Brown"],
      main_image: "https://images.unsplash.com/photo-1624222247344-550fb8ec5519?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 7,
    },
    {
      title: "Urban Street Sneakers",
      slug: "urban-street-sneakers",
      short_description: "Comfortable and stylish low-top sneakers.",
      description: "Step out in comfort. Featuring breathable knit mesh uppers, responsive cushioning midsoles, and durable rubber outsoles for everyday wear.",
      price: 850,
      original_price: 1100,
      product_code: "SH-001",
      category_id: categoryMap["shoes"],
      sizes: ["40", "41", "42", "43", "44"],
      colors: ["White", "Black", "Grey"],
      main_image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: true,
      sort_order: 8,
    },
    {
      title: "Classic Canvas Loafers",
      slug: "classic-canvas-loafers",
      short_description: "Easy slip-on casual loafers.",
      description: "Lightweight, breathable canvas fabric with memory foam insoles. Perfect slip-on shoes for casual outings and warm weather.",
      price: 520,
      original_price: 600,
      product_code: "SH-002",
      category_id: categoryMap["shoes"],
      sizes: ["41", "42", "43", "44"],
      colors: ["Blue", "Beige"],
      main_image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 9,
    },
    {
      title: "Windbreaker Utility Jacket",
      slug: "windbreaker-utility-jacket",
      short_description: "Water-resistant windbreaker with multiple pockets.",
      description: "Stay protected against the elements. Made from lightweight ripstop nylon. Adjustable cuffs, drawstring hood, and water-repellent zippers.",
      price: 750,
      original_price: 900,
      product_code: "JK-001",
      category_id: categoryMap["jackets"],
      sizes: ["M", "L", "XL"],
      colors: ["Olive", "Black"],
      main_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: true,
      sort_order: 10,
    },
    {
      title: "Classic Leather Biker Jacket",
      slug: "classic-leather-biker-jacket",
      short_description: "100% premium cowhide leather jacket.",
      description: "An iconic silhouette crafted from heavy, supple cowhide leather. Finished with asymmetrical metal zippers, snap-down lapels, and quilted lining.",
      price: 1450,
      original_price: 1800,
      product_code: "JK-002",
      category_id: categoryMap["jackets"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black"],
      main_image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 11,
    },
    {
      title: "Performance Gym Tee",
      slug: "performance-gym-tee",
      short_description: "Breathable and stretchable training shirt.",
      description: "Engineered for high performance. Moisture-wicking technology keeps you dry, while flatlock seams prevent chafing during heavy workouts.",
      price: 290,
      original_price: null,
      product_code: "AW-001",
      category_id: categoryMap["activewear"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Navy", "Red", "Grey"],
      main_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 12,
    },
    {
      title: "Dry-Fit Training Shorts",
      slug: "dry-fit-training-shorts",
      short_description: "Lightweight training shorts with side slits.",
      description: "Move freely. Features an elastic waistband with internal drawcord, side zipper pockets for keys/phone, and breathable mesh inserts.",
      price: 320,
      original_price: 380,
      product_code: "AW-002",
      category_id: categoryMap["activewear"],
      sizes: ["M", "L", "XL"],
      colors: ["Black", "Charcoal"],
      main_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      gallery_images: [],
      is_available: true,
      is_featured: false,
      sort_order: 13,
    },
  ];

  for (const prod of products) {
    const { error } = await authClient
      .from("products")
      .upsert(prod, { onConflict: "slug" });

    if (error) {
      console.error(`❌ Failed to seed product ${prod.title}:`, error.message);
    } else {
      console.log(`✅ Product seeded: ${prod.title}`);
    }
  }

  // --- Seed Offers ---
  console.log("\n🔹 Seeding Offers...");
  const offers = [
    {
      title: "Summer Essentials Sale",
      description: "Get up to 25% off on all T-Shirts and lightweight summer basics. Limited time only.",
      image_url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1200&auto=format&fit=crop&q=80",
      badge_text: "SALE",
      link_url: "/products?category=t-shirts",
      is_active: true,
      sort_order: 1,
    },
    {
      title: "Cozy Fleece Bundle Deal",
      description: "Buy any Hoodie or Pullover, and get 50% off any pair of joggers. Discount applied at checkout.",
      image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80",
      badge_text: "BUNDLE",
      link_url: "/offers",
      is_active: true,
      sort_order: 2,
    },
  ];

  for (const offer of offers) {
    const { data: existing, error: fetchError } = await authClient
      .from("offers")
      .select("id")
      .eq("title", offer.title)
      .maybeSingle();

    if (fetchError) {
      console.error(`❌ Failed to check existing offer ${offer.title}:`, fetchError.message);
      continue;
    }

    if (existing) {
      const { error } = await authClient
        .from("offers")
        .update(offer)
        .eq("id", existing.id);

      if (error) {
        console.error(`❌ Failed to update offer ${offer.title}:`, error.message);
      } else {
        console.log(`✅ Offer updated: ${offer.title}`);
      }
    } else {
      const { error } = await authClient
        .from("offers")
        .insert(offer);

      if (error) {
        console.error(`❌ Failed to insert offer ${offer.title}:`, error.message);
      } else {
        console.log(`✅ Offer inserted: ${offer.title}`);
      }
    }
  }

  console.log("\n🌱 Seeding completed successfully!");
}

main().catch((e) => {
  console.error("❌ Unexpected seeding error:", e);
});
