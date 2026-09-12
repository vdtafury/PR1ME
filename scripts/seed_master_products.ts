import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const getEnvVar = (name: string) => {
  const match = envContent.match(new RegExp(`^${name}=(?:"([^"]*)"|'([^']*)'|([^\\s#]*))`, "m"));
  return match ? (match[1] || match[2] || match[3]) : null;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL");
const supabaseKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY") || getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") || getEnvVar("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching categories...");
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr || !cats) {
    console.error("Failed to fetch categories:", catErr);
    process.exit(1);
  }

  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  console.log("Categories mapped:", catMap);

  const CDN_BASE = `${supabaseUrl}/storage/v1/object/public/catalog/brand-assets/products`;

  const products = [
    {
      title: "PR1ME Signature Ultra-Light Puffer Jacket",
      slug: "pr1me-signature-ultra-light-puffer-jacket",
      short_description: "جاكيت بافر فائق الخفة ومقاوم للرياح مع غطاء رأس زعبوط متكامل وتطريز PR1ME التكتيكي على الصدر. تصميم خفيف ودافئ لحرية الحركة دائماً.",
      description: "صُمم ليكون الدرع الأساسي لموسم الشتاء. صُنع من نايلون ميكرو-ريبستوب عازل للرياح والأمطار الخفيفة، مع حشوة عزل حراري خفيفة الوزن تمنحك أقصى درجات الدفء دون أي وزن إضافي. يتميز بقصة كلاسيكية مريحة مع غطاء رأس زعبوط مدمج، سحابات تكتيكية مقاومة للماء، وجيوب جانبية مخفية ببطانة صوفية دافئة. تفاصيل شعار PR1ME باللون الأسود على الصدر والياقة الخلفية تعزز الهوية البصرية الصامتة والأنيقة.\n\n• عزل حراري فائق الخفة\n• قماش خارجي كاره للماء ومقاوم للتمزق\n• أساور مطاطية تحافظ على الدفء\n• شعار PR1ME تكتيكي ناعم الملمس\n• صنع في مصر وفق أعلى معايير الجودة العالمية",
      price: 1450,
      original_price: 1950,
      product_code: "PR1-JK-001",
      category_id: catMap["jackets"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["أسود", "رمادي"],
      main_image: `${CDN_BASE}/puffer/cover-front.jpg`,
      gallery_images: [
        `${CDN_BASE}/puffer/cover-back.jpg`,
        `${CDN_BASE}/puffer/look-side.jpg`,
        `${CDN_BASE}/puffer/campaign-poster.jpg`
      ],
      tags: ["Colder Stories", "Puffer", "Winter 2026", "Outerwear", "Featured"],
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      title: "PR1ME Heavyweight 380 GSM Oversized Hoodie — Sand",
      slug: "pr1me-heavyweight-380gsm-oversized-hoodie-sand",
      short_description: "هودي أوفرسايز من القطن المصري الفاخر 380 GSM ببطانة لوب باك دافئة، وتطريز عالي الكثافة لشعار PR1ME وشعار 'WEAR YOUR STORY'.",
      description: "قطعة أساسية تجسد فلسفة PR1ME في الراحة والمتانة المعمارية. مغزول من قطن مصري 100% عالي الكثافة (380 GSM) مع معالجة سيليكونية تمنع الانكماش وتضمن ملمساً فاخراً يدوم لسنوات. يتميز بقصة دروب شولدر واسعة، غطاء رأس مزدوج الطبقات يقف بثبات دون الحاجة لأربطة، وتطريز خلفي نافر يوثق 'PR1ME / WEAR YOUR STORY • CAIRO 2026'.\n\n• قطن مصري 100% منسوج 380 GSM\n• قماش مصبوغ مسبقاً بثبات ألوان فائق\n• خياطة مزدوجة معززة في مناطق الضغط\n• تطريز عالي الدقة على الصدر والظهر\n• جيب كنغر أمامي مخفي الحواف",
      price: 950,
      original_price: 1250,
      product_code: "PR1-HD-001",
      category_id: catMap["hoodies"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["بيج", "أسود", "زيتي"],
      main_image: `${CDN_BASE}/hoodie/front.jpg`,
      gallery_images: [
        `${CDN_BASE}/hoodie/back.jpg`,
        `${CDN_BASE}/hoodie/lifestyle.jpg`
      ],
      tags: ["Heavyweight", "Cairo 2026", "Hoodie", "Essentials", "Featured"],
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      title: "PR1ME Egyptian Cotton 260 GSM Boxy Tee — Off-White",
      slug: "pr1me-egyptian-cotton-260gsm-boxy-tee-offwhite",
      short_description: "تيشيرت بوكسي بوزن 260 GSM من أنقى خيوط القطن المصري مع ياقة مضلعة سميكة وطبعة PR1ME التيبوغرافية بالسيليكون البارز.",
      description: "إعادة تعريف للتيشيرت اليومي من منظور ستريتوير عالمي. صُنعت هذه التيشيرت من ألياف القطن المصري طويل التيلة بوزن 260 GSM لتمنحك قواماً هندسياً مستقلاً يسقط بانسيابية على الجسد دون ترهل. تتميز بياقة مضلعة عريضة (1.25 بوصة) مصممة للحفاظ على شكلها حتى بعد مئات الغسلات، مع طبعة شعار PR1ME التكتيكية على الصدر وشعار 'CAIRO STREETWEAR • 2026' على الحاشية السفلية.\n\n• 100% قطن مصري ممشط فائق النعومة (260 GSM)\n• قصة بوكسي دروب شولدر مريحة\n• معالجة حيوية ضد الوبر والانكماش\n• شريط رقبة داخلي ناعم لحماية الجلد\n• إنتاج محدود محفور برقم الدفعة",
      price: 490,
      original_price: 650,
      product_code: "PR1-TS-001",
      category_id: catMap["t-shirts"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["أبيض", "أسود", "رمادي"],
      main_image: `${CDN_BASE}/tshirt/front.jpg`,
      gallery_images: [
        `${CDN_BASE}/tshirt/lifestyle.jpg`
      ],
      tags: ["Origins", "Cairo Streetwear", "Boxy Tee", "Heavy Cotton", "Featured"],
      is_available: true,
      is_featured: true,
      sort_order: 3
    },
    {
      title: "PR1ME Tactical Utilitarian Cargo Pants — Charcoal",
      slug: "pr1me-tactical-utilitarian-cargo-pants-charcoal",
      short_description: "بنطال كارجو ستريتوير بـ 6 جيوب هندسية، نسيج قطن تويل متين مقاوم للتآكل، وحلقات باراكورد مع شارة PR1ME المطاطية.",
      description: "توازن مثالي بين الوظيفية التكتيكية وجماليات الشارع الحديثة. منسوج من قطن التويل الثقيل المقاوم للتمزق مع نسبة مرونة خفيفة تسمح بحرية حركة مطلقة في بيئة المدينة. يتميز بجيوب كارجو ثلاثية الأبعاد بأزرار ضغط خفية، حزام خصر مرن قابل للتعديل بحبال سحب داخلية، وحاشية كاحل قابلة للتضييق للتحكم في شكل البنطال فوق السنيكرز.\n\n• قماش قطن تويل ثقيل (Cotton Twill 320 GSM)\n• جيوب كارجو هندسية مع تقسيمات داخلية للهاتف والمفاتيح\n• شارة مطاطية مدمجة لشعار PR1ME باللون الأسود المطفي\n• حلقات تعليق تكتيكية متوافقة مع إكسسوارات الماركة\n• قصة عصرية تناسب مختلف الأنشطة اليومية",
      price: 890,
      original_price: 1150,
      product_code: "PR1-PT-001",
      category_id: catMap["pants"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["رمادي", "أسود", "زيتي"],
      main_image: `${CDN_BASE}/cargo/front.jpg`,
      gallery_images: [
        `${CDN_BASE}/cargo/lifestyle.jpg`
      ],
      tags: ["Tactical", "Monochrome", "Cargo", "Utilitarian", "Featured"],
      is_available: true,
      is_featured: true,
      sort_order: 4
    },
    {
      title: "PR1ME Ballistic Nylon Crossbody Utility Bag",
      slug: "pr1me-ballistic-nylon-crossbody-utility-bag",
      short_description: "حقيبة كروس تكتيكية مصنوعة من نايلون باليستي 1000D المقاوم للماء والخدش، مزودة بإبزيم سريع الفتح وأشرطة مولي المعيارية.",
      description: "حقيبة المدينة اليومية المصممة لحمل مستلزماتك الأساسية بأمان وأناقة صامتة. مصنوعة من قماش نايلون باليستي فائق المقاومة للماء، مع سحابات YKK محكمة ضد تسرب السوائل. تحتوي على حجرة رئيسية مبطنة للشاشات الصغيرة، وجيوب شبكية داخلية لتنظيم الكروت والشواحن، وحزام كتف عريض قابل للتعديل ومزود بإبزيم تكتيكي معدني سريع الفتح.\n\n• نايلون باليستي 1000D كاره للماء ومقاوم للتمزق\n• سحابات محكمة مانعة لدخول الماء والغبار\n• إبزيم أمان تكتيكي قوي مع شعار PR1ME بالليزر\n• حزام كتف نايلون مبطن مريح لساعات طويلة\n• شعار PR1ME مطاطي منقوش بتصميم معاصر",
      price: 420,
      original_price: 550,
      product_code: "PR1-AC-001",
      category_id: catMap["accessories"],
      sizes: ["One Size"],
      colors: ["أسود"],
      main_image: `${CDN_BASE}/bag/front.jpg`,
      gallery_images: [
        `${CDN_BASE}/bag/lifestyle.jpg`
      ],
      tags: ["Gear", "Accessories", "Waterproof", "Tactical", "Featured"],
      is_available: true,
      is_featured: true,
      sort_order: 5
    }
  ];

  console.log(`Inserting ${products.length} flagship PR1ME products...`);

  for (const p of products) {
    const { data, error } = await supabase
      .from("products")
      .upsert(p, { onConflict: "slug" })
      .select();

    if (error) {
      console.error(`Failed to insert ${p.title}:`, error.message);
    } else {
      console.log(`Inserted ${p.title}`);
    }
  }

  console.log("Seeding complete!");
}

run().catch(console.error);
