import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Old Supabase credentials (Source)
const OLD_URL = "https://nkeboqdsiktlvoxlikkj.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZWJvcWRzaXt0bHZveGxpa2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjU4NDQsImV4cCI6MjA5NTQwMTg0NH0.xCxetC3MEZXXi1t5w-uvLxVpGOopiN9CWfOHvcHSCUM";

async function main() {
  console.log("🚀 Starting data & storage migration from old Supabase to new...");

  // Load new credentials from .env
  const envContent = fs.readFileSync(".env", "utf8");
  const getEnvVar = (name: string) => {
    const match = envContent.match(new RegExp(`^${name}=(?:"([^"]*)"|'([^']*)'|([^\\s#]*))`, "m"));
    return match ? (match[1] || match[2] || match[3]) : null;
  };

  const newUrl = getEnvVar("SUPABASE_URL");
  let newServiceRole = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

  if (!newUrl) {
    console.error("❌ SUPABASE_URL not found in .env file.");
    process.exit(1);
  }

  if (!newServiceRole || newServiceRole === "your-service-role-key") {
    console.log("\n⚠️  SUPABASE_SERVICE_ROLE_KEY is not configured in your .env file.");
    console.log("Please paste your new project's service_role key (you can find it in Supabase > Settings > API):");
    
    // Read from stdin
    const buffer = Buffer.alloc(1024);
    const n = fs.readSync(0, buffer, 0, 1024, null);
    newServiceRole = buffer.toString("utf8", 0, n).trim();

    if (!newServiceRole) {
      console.error("❌ Service role key is required to write data.");
      process.exit(1);
    }
  }

  const oldClient = createClient(OLD_URL, OLD_ANON_KEY);
  const newClient = createClient(newUrl, newServiceRole, {
    auth: { persistSession: false }
  });

  console.log(`\nConnected:`);
  console.log(`- Source: ${OLD_URL}`);
  console.log(`- Target: ${newUrl}\n`);

  // Helper to download and upload files
  const transferFile = async (oldFileUrl: string): Promise<string> => {
    if (!oldFileUrl || !oldFileUrl.includes("/storage/v1/object/public/catalog/")) {
      return oldFileUrl; // Not a storage file
    }

    try {
      // Extract file path from URL
      const pathParts = oldFileUrl.split("/storage/v1/object/public/catalog/");
      const filePath = decodeURIComponent(pathParts[1]);

      console.log(`   📦 Downloading file: ${filePath}`);
      const response = await fetch(oldFileUrl);
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`   📤 Uploading file: ${filePath}`);
      const { error: uploadError } = await newClient.storage
        .from("catalog")
        .upload(filePath, buffer, {
          contentType: blob.type || "image/jpeg",
          upsert: true
        });

      if (uploadError) {
        console.error(`   ⚠️ Failed to upload ${filePath}:`, uploadError.message);
        return oldFileUrl; // Fallback to old URL if upload fails
      }

      // Generate new URL
      const { data } = newClient.storage.from("catalog").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e: any) {
      console.error(`   ⚠️ Failed to transfer file ${oldFileUrl}:`, e.message);
      return oldFileUrl;
    }
  };

  // Helper to rewrite image fields in objects
  const processImageUrls = async (obj: any, fields: string[]) => {
    const copy = { ...obj };
    for (const field of fields) {
      if (Array.isArray(copy[field])) {
        const nextArray = [];
        for (const url of copy[field]) {
          nextArray.push(await transferFile(url));
        }
        copy[field] = nextArray;
      } else if (copy[field]) {
        copy[field] = await transferFile(copy[field]);
      }
    }
    return copy;
  };

  // --- 1. Migrate Categories ---
  console.log("----------------------------------------");
  console.log("🔹 Migrating Categories...");
  const { data: categories, error: catError } = await oldClient
    .from("categories")
    .select("*");

  if (catError) {
    console.error("❌ Failed to fetch categories:", catError.message);
    process.exit(1);
  }

  console.log(`Found ${categories.length} categories.`);
  for (const cat of categories) {
    console.log(`• Processing category: ${cat.name}`);
    const updatedCat = await processImageUrls(cat, ["image_url"]);
    
    const { error: insertError } = await newClient
      .from("categories")
      .upsert(updatedCat);

    if (insertError) {
      console.error(`  ❌ Failed to insert category ${cat.name}:`, insertError.message);
    } else {
      console.log(`  ✅ Successfully migrated: ${cat.name}`);
    }
  }

  // --- 2. Migrate Products ---
  console.log("----------------------------------------");
  console.log("🔹 Migrating Products...");
  const { data: products, error: prodError } = await oldClient
    .from("products")
    .select("*");

  if (prodError) {
    console.error("❌ Failed to fetch products:", prodError.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products.`);
  for (const prod of products) {
    console.log(`• Processing product: ${prod.title}`);
    const updatedProd = await processImageUrls(prod, ["main_image", "gallery_images"]);
    
    const { error: insertError } = await newClient
      .from("products")
      .upsert(updatedProd);

    if (insertError) {
      console.error(`  ❌ Failed to insert product ${prod.title}:`, insertError.message);
    } else {
      console.log(`  ✅ Successfully migrated: ${prod.title}`);
    }
  }

  // --- 3. Migrate Offers ---
  console.log("----------------------------------------");
  console.log("🔹 Migrating Offers...");
  const { data: offers, error: offerError } = await oldClient
    .from("offers")
    .select("*");

  if (offerError) {
    console.error("❌ Failed to fetch offers:", offerError.message);
    process.exit(1);
  }

  console.log(`Found ${offers.length} offers.`);
  for (const offer of offers) {
    console.log(`• Processing offer: ${offer.title}`);
    const updatedOffer = await processImageUrls(offer, ["image_url"]);
    
    const { error: insertError } = await newClient
      .from("offers")
      .upsert(updatedOffer);

    if (insertError) {
      console.error(`  ❌ Failed to insert offer ${offer.title}:`, insertError.message);
    } else {
      console.log(`  ✅ Successfully migrated: ${offer.title}`);
    }
  }

  console.log("----------------------------------------");
  console.log("🎉 Migration completed successfully!");
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
});
