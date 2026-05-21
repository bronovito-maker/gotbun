import { createClient } from "@/utils/supabase/server";

export interface MenuItem {
  id?: string;
  name: string;
  price: number;
  description: string;
  tag?: string;
  isPopular?: boolean;
  isAvailable?: boolean;
  image?: string;
  position?: number;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  position?: number;
  items: MenuItem[];
}

export interface Promotion {
  id: string;
  name: string;
  isActive: boolean;
  description: string;
  conditions: string;
  code?: string;
  minSpend?: number;
}

type RowCategory = {
  id: string;
  label: string;
  icon: string;
  position: number;
};

type RowMenuItem = {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  is_popular: boolean;
  is_available: boolean;
  position: number;
  pills?: { label: string | null } | Array<{ label: string | null }> | null;
};

type RowPromotion = {
  key: string;
  name: string;
  is_active: boolean;
  settings: {
    description?: string;
    conditions?: string;
    code?: string;
    minSpend?: number;
  } | null;
};

export async function getMenu(): Promise<MenuCategory[]> {
  const supabase = await createClient();

  const [{ data: categories, error: catErr }, { data: menuItems, error: itemsErr }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,label,icon,position")
      .order("position", { ascending: true }),
    supabase
      .from("menu_items")
      .select("id,name,price,description,image_url,category_id,is_popular,is_available,position,pills(label)")
      .order("position", { ascending: true }),
  ]);

  if (catErr || itemsErr) {
    console.error("Errore lettura menu da Supabase:", catErr?.message || itemsErr?.message);
    return [];
  }

  const grouped = new Map<string, MenuItem[]>();
  for (const row of (menuItems || []) as RowMenuItem[]) {
    const pillLabel = Array.isArray(row.pills) ? row.pills[0]?.label : row.pills?.label;
    const item: MenuItem = {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      description: row.description || "",
      image: row.image_url || undefined,
      tag: pillLabel || undefined,
      isPopular: row.is_popular,
      isAvailable: row.is_available,
      position: row.position,
    };

    const arr = grouped.get(row.category_id) || [];
    arr.push(item);
    grouped.set(row.category_id, arr);
  }

  return ((categories || []) as RowCategory[]).map((cat) => ({
    id: cat.id,
    label: cat.label,
    icon: cat.icon,
    position: cat.position,
    items: grouped.get(cat.id) || [],
  }));
}

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("key,name,is_active,settings")
    .order("key", { ascending: true });

  if (error) {
    console.error("Errore lettura promozioni da Supabase:", error.message);
    return [];
  }

  return ((data || []) as RowPromotion[]).map((row) => ({
    id: row.key,
    name: row.name,
    isActive: row.is_active,
    description: row.settings?.description || "",
    conditions: row.settings?.conditions || "",
    code: row.settings?.code,
    minSpend: typeof row.settings?.minSpend === "number" ? row.settings.minSpend : undefined,
  }));
}
