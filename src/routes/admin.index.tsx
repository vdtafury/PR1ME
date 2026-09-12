import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product, Offer } from "@/lib/types";
import { BRAND, formatPrice } from "@/lib/whatsapp";

import { AdminLoginForm } from "@/components/AdminLoginForm";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — PR1ME" }, { name: "robots", content: "noindex" }] }),
});

type Tab = "products" | "categories" | "offers";

function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("products");

  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setHasSession(false);
        setIsAdmin(false);
        setReady(true);
        return;
      }

      setHasSession(true);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);

      const admin = !!roles?.some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setReady(true);
      if (!admin) {
        toast.error("You are not an admin. Contact the site owner.");
      }
    } catch (err) {
      console.error(err);
      setReady(true);
    }
  };

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setHasSession(false);
    setIsAdmin(false);
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F7F5]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#0D0D0D]" />
          <span className="text-xs uppercase tracking-widest text-[#6B6B66]">Loading Admin...</span>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return <AdminLoginForm onLoginSuccess={checkAuth} />;
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-sm border border-[#E5E5E0] bg-white p-6 text-center shadow-xs">
          <h1 className="text-lg font-bold text-[#0D0D0D]">Not authorized</h1>
          <p className="mt-2 text-xs text-[#6B6B66]">
            This account does not have admin permissions to manage PR1ME.
          </p>
          <button
            onClick={logout}
            className="mt-4 w-full bg-[#0D0D0D] py-2.5 text-xs font-bold uppercase tracking-wider text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F]"
          >
            Sign out / Switch account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-extrabold">{BRAND.name}</Link>
            <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs font-bold uppercase">Admin</span>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex gap-2 border-b border-border">
          {(["products", "categories", "offers"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "products" && <ProductsAdmin />}
        {tab === "categories" && <CategoriesAdmin />}
        {tab === "offers" && <OffersAdmin />}
      </div>
    </div>
  );
}

/* ---------------- Products ---------------- */

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  async function toggleAvailable(p: Product) {
    const { error } = await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }
  async function remove(p: Product) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Products ({products.data?.length ?? 0})</h2>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3 hidden sm:table-cell">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.data?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.main_image && <img src={p.main_image} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.product_code || p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-bold">{formatPrice(p.price)}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${p.is_available ? "bg-whatsapp/15 text-whatsapp" : "bg-muted text-muted-foreground"}`}>
                    {p.is_available ? "Visible" : "Hidden"}
                  </span>
                  {p.is_featured && <span className="ml-1 rounded bg-foreground/10 px-2 py-0.5 text-xs font-semibold">Featured</span>}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn title={p.is_available ? "Hide" : "Show"} onClick={() => toggleAvailable(p)}>{p.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</IconBtn>
                    <IconBtn title="Edit" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Delete" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          categories={categories.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }}
        />
      )}
    </>
  );
}

function ProductEditor({ product, categories, onClose, onSaved }: { product: Partial<Product>; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Product>>({
    title: "", slug: "", short_description: "", description: "",
    price: 0, original_price: null, product_code: "",
    category_id: categories[0]?.id ?? null,
    sizes: [], colors: [], main_image: "", gallery_images: [],
    is_available: true, is_featured: false, sort_order: 0,
    ...product,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const images = ([form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[]);

  function set<K extends keyof Product>(k: K, v: any) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("catalog").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("catalog").getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) { toast.error(e.message); return null; }
  }

  function updateImages(nextImages: string[]) {
    setForm((f) => ({
      ...f,
      main_image: nextImages[0] || "",
      gallery_images: nextImages.slice(1),
    }));
  }

  async function handleUploadImages(files: FileList) {
    setUploading(true);
    const arr = Array.from(files);
    const urls: string[] = [];
    for (const file of arr) {
      const url = await uploadImage(file);
      if (url) {
        urls.push(url);
      }
    }
    if (urls.length) {
      const current = [form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[];
      updateImages([...current, ...urls]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    }
    setUploading(false);
  }

  function makeCover(index: number) {
    const current = [form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[];
    if (index <= 0 || index >= current.length) return;
    const copy = [...current];
    const target = copy[index];
    copy.splice(index, 1);
    copy.unshift(target);
    updateImages(copy);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    const current = [form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[];
    if (nextIndex < 0 || nextIndex >= current.length) return;
    const copy = [...current];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    updateImages(copy);
  }

  function deleteImage(index: number) {
    const current = [form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[];
    const copy = current.filter((_, i) => i !== index);
    updateImages(copy);
  }

  async function save() {
    setSaving(true);
    try {
      const slug = (form.slug || form.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload: any = {
        title: form.title, slug,
        short_description: form.short_description, description: form.description,
        price: Number(form.price ?? 0),
        original_price: form.original_price ? Number(form.original_price) : null,
        product_code: form.product_code || null,
        category_id: form.category_id || null,
        sizes: form.sizes ?? [], colors: form.colors ?? [],
        main_image: form.main_image || null,
        gallery_images: form.gallery_images ?? [],
        is_available: !!form.is_available, is_featured: !!form.is_featured,
        sort_order: Number(form.sort_order ?? 0),
      };
      const res = form.id
        ? await supabase.from("products").update(payload).eq("id", form.id)
        : await supabase.from("products").insert(payload);
      if (res.error) throw res.error;
      toast.success("Saved");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <Modal onClose={onClose} title={form.id ? "Edit product" : "New product"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title"><input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Slug (auto if empty)"><input className={inputCls} value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" /></Field>
        <Field label="Price"><input type="number" step="0.01" className={inputCls} value={form.price ?? 0} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Original price (for sale)"><input type="number" step="0.01" className={inputCls} value={form.original_price ?? ""} onChange={(e) => set("original_price", e.target.value || null)} /></Field>
        <Field label="Product code"><input className={inputCls} value={form.product_code ?? ""} onChange={(e) => set("product_code", e.target.value)} /></Field>
        <Field label="Category">
          <select className={inputCls} value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Sizes (select multiple)" className="sm:col-span-2">
          <SizesPicker value={form.sizes ?? []} onChange={(v) => set("sizes", v)} />
        </Field>
        <Field label="Colors (select multiple)" className="sm:col-span-2">
          <ColorsPicker value={form.colors ?? []} onChange={(v) => set("colors", v)} />
        </Field>
        <Field label="Short description" className="sm:col-span-2"><input className={inputCls} value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} /></Field>
        <Field label="Description" className="sm:col-span-2"><textarea rows={4} className={inputCls} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="sm:col-span-2 border-t border-border pt-4 mt-2">
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">Product Images (Upload multiple, select Cover, and arrange)</span>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {images.map((src, i) => {
              const isCover = i === 0;
              const allImagesLength = images.length;
              return (
                <div key={i} className="group relative flex flex-col items-center rounded-lg border border-border bg-muted overflow-hidden aspect-square">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    {isCover ? (
                      <span className="rounded bg-whatsapp px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-sm">Cover</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeCover(i)}
                        className="rounded bg-background/80 hover:bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase shadow-sm backdrop-blur"
                      >
                        Make Cover
                      </button>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => deleteImage(i)}
                    className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-destructive/90 text-destructive-foreground text-xs hover:bg-destructive shadow-sm"
                  >
                    ×
                  </button>

                  <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveImage(i, -1)}
                      className="text-white text-[10px] font-bold px-1 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    >
                      ← Left
                    </button>
                    <button
                      type="button"
                      disabled={i === allImagesLength - 1}
                      onClick={() => moveImage(i, 1)}
                      className="text-white text-[10px] font-bold px-1 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    >
                      Right →
                    </button>
                  </div>
                </div>
              );
            })}

            <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background aspect-square cursor-pointer hover:bg-muted hover:border-foreground/30 transition-all p-2">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="mt-1 text-[11px] text-muted-foreground text-center">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-1 text-xs font-bold text-center">Upload Images</span>
                  <span className="text-[10px] text-muted-foreground text-center">Select multiple</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && files.length) {
                        await handleUploadImages(files);
                        e.target.value = "";
                      }
                    }}
                  />
                </>
              )}
            </label>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Or paste an image URL directly here to add..."
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const url = target.value.trim();
                  if (url) {
                    const current = [form.main_image, ...(form.gallery_images ?? [])].filter(Boolean) as string[];
                    updateImages([...current, url]);
                    target.value = "";
                    toast.success("Image URL added");
                  }
                }
              }}
            />
          </div>
        </div>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order ?? 0} onChange={(e) => set("sort_order", e.target.value)} /></Field>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_available} onChange={(e) => set("is_available", e.target.checked)} /> Visible</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

  const q = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Categories ({q.data?.length ?? 0})</h2>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" /> New</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {q.data?.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            {c.image_url ? <img src={c.image_url} alt="" className="h-14 w-14 rounded object-cover" /> : <div className="h-14 w-14 rounded bg-muted" />}
            <div className="flex-1">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug}</div>
            </div>
            <IconBtn title="Edit" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></IconBtn>
            <IconBtn title="Delete" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></IconBtn>
          </div>
        ))}
      </div>
      {editing && <CategoryEditor cat={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-categories"] }); }} />}
    </>
  );
}

function CategoryEditor({ cat, onClose, onSaved }: { cat: Partial<Category>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Category>>({ name: "", slug: "", image_url: "", sort_order: 0, ...cat });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      const slug = (form.slug || form.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!form.name) throw new Error("Name is required");
      const payload = { name: form.name, slug, image_url: form.image_url || null, sort_order: Number(form.sort_order ?? 0) };
      const res = form.id
        ? await supabase.from("categories").update(payload).eq("id", form.id)
        : await supabase.from("categories").insert(payload);
      if (res.error) throw res.error;
      toast.success("Saved");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }
  return (
    <Modal title={form.id ? "Edit category" : "New category"} onClose={onClose}>
      <div className="grid gap-3">
        <Field label="Name"><input className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Slug (auto if empty)"><input className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label="Image URL"><input className={inputCls} value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </Modal>
  );
}

/* ---------------- Offers ---------------- */

function OffersAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Offer> | null>(null);
  const q = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("sort_order");
      if (error) throw error;
      return data as Offer[];
    },
  });
  async function toggle(o: Offer) {
    const { error } = await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  }
  async function remove(o: Offer) {
    if (!confirm(`Delete "${o.title}"?`)) return;
    const { error } = await supabase.from("offers").delete().eq("id", o.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  }
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Offers ({q.data?.length ?? 0})</h2>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" /> New</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.map((o) => (
          <div key={o.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
            {o.image_url ? <img src={o.image_url} alt="" className="h-20 w-32 rounded object-cover" /> : <div className="h-20 w-32 rounded bg-muted" />}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold">{o.title}</div>
                {o.badge_text && <span className="rounded bg-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase">{o.badge_text}</span>}
              </div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{o.description}</div>
              <div className="mt-2 flex gap-1">
                <IconBtn title={o.is_active ? "Disable" : "Enable"} onClick={() => toggle(o)}>{o.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</IconBtn>
                <IconBtn title="Edit" onClick={() => setEditing(o)}><Pencil className="h-4 w-4" /></IconBtn>
                <IconBtn title="Delete" onClick={() => remove(o)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <OfferEditor offer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-offers"] }); }} />}
    </>
  );
}

function OfferEditor({ offer, onClose, onSaved }: { offer: Partial<Offer>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Offer>>({ title: "", description: "", image_url: "", link_url: "", badge_text: "", is_active: true, sort_order: 0, ...offer });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      if (!form.title) throw new Error("Title is required");
      const payload = {
        title: form.title, description: form.description ?? null, image_url: form.image_url || null,
        link_url: form.link_url || null, badge_text: form.badge_text || null,
        is_active: !!form.is_active, sort_order: Number(form.sort_order ?? 0),
      };
      const res = form.id
        ? await supabase.from("offers").update(payload).eq("id", form.id)
        : await supabase.from("offers").insert(payload);
      if (res.error) throw res.error;
      toast.success("Saved");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }
  return (
    <Modal title={form.id ? "Edit offer" : "New offer"} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2"><input className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><textarea rows={3} className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Image URL"><input className={inputCls} value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
        <Field label="Link URL (optional)"><input className={inputCls} value={form.link_url ?? ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} /></Field>
        <Field label="Badge text (e.g. SALE)"><input className={inputCls} value={form.badge_text ?? ""} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} /></Field>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </Modal>
  );
}

/* ---------------- Shared bits ---------------- */

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return <button title={title} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background hover:bg-muted">{children}</button>;
}

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "One Size"];

function SizesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const all = Array.from(new Set([...SIZE_PRESETS, ...value]));
  function toggle(s: string) {
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  }
  function addCustom() {
    const s = custom.trim();
    if (!s) return;
    if (!value.includes(s)) onChange([...value, s]);
    setCustom("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((s) => {
          const on = value.includes(s);
          return (
            <button type="button" key={s} onClick={() => toggle(s)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
              {s}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input className={inputCls} placeholder="Add custom size…" value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
        <button type="button" onClick={addCustom} className="rounded-md border border-border bg-background px-3 text-sm font-semibold hover:bg-muted">Add</button>
      </div>
      {value.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Selected: {value.join(", ")}</p>
      )}
    </div>
  );
}

const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#9ca3af" },
  { name: "Beige", hex: "#e7d3b1" },
  { name: "Brown", hex: "#7c4a2d" },
  { name: "Red", hex: "#dc2626" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Green", hex: "#16a34a" },
  { name: "Olive", hex: "#6b7a3a" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Purple", hex: "#7c3aed" },
];

function ColorsPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const presetNames = COLOR_PRESETS.map((c) => c.name);
  const extras = value.filter((v) => !presetNames.includes(v));
  function toggle(s: string) {
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  }
  function addCustom() {
    const s = custom.trim();
    if (!s) return;
    if (!value.includes(s)) onChange([...value, s]);
    setCustom("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((c) => {
          const on = value.includes(c.name);
          return (
            <button type="button" key={c.name} onClick={() => toggle(c.name)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${on ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-muted"}`}>
              <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
              {c.name}
            </button>
          );
        })}
        {extras.map((s) => (
          <button type="button" key={s} onClick={() => toggle(s)}
            className="rounded-md border border-primary bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">
            {s} ✕
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input className={inputCls} placeholder="Add custom color…" value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
        <button type="button" onClick={addCustom} className="rounded-md border border-border bg-background px-3 text-sm font-semibold hover:bg-muted">Add</button>
      </div>
      {value.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Selected: {value.join(", ")}</p>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-extrabold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
