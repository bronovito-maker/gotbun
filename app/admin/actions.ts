"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin, checkAuth } from "@/lib/auth";
import { getMenu, getPromotions, MenuItem, Promotion } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// State structure for form actions
export interface ActionState {
  success: boolean;
  error?: string;
}

function normalizeImageBaseName(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "item"
  );
}

async function uploadMenuImageToSupabase(base64Data: string, itemName: string): Promise<string> {
  const base64Content = base64Data.split(";base64,").pop();
  if (!base64Content) throw new Error("Dati immagine non validi.");

  const supabaseAdmin = getSupabaseAdmin();
  const fileBuffer = Buffer.from(base64Content, "base64");
  const fileName = `${normalizeImageBaseName(itemName)}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.webp`;
  const objectPath = `menu/${fileName}`;
  const bucketName = process.env.SUPABASE_MENU_IMAGES_BUCKET || "menu-images";

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(objectPath, fileBuffer, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw new Error(`Upload immagine fallito: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error("Impossibile ottenere URL pubblico dell'immagine.");
  }

  return data.publicUrl;
}

// 1. Auth Actions
export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.trim()) {
    return { success: false, error: "Email non valida." };
  }

  if (typeof password !== "string" || !password.trim()) {
    return { success: false, error: "Password non valida." };
  }

  const rememberMe = String(formData.get("rememberMe") || "") === "on";
  const success = await loginAdmin(email, password, rememberMe);
  if (success) {
    redirect("/admin");
  } else {
    return { success: false, error: "Credenziali non valide o utente non autorizzato." };
  }
}

export async function logoutAction(): Promise<void> {
  await logoutAdmin();
  redirect("/admin-login");
}

// Helper to assert authentication
async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    throw new Error("Non autorizzato. Sessione scaduta.");
  }
}

// 2. Menu Item Actions
export async function updateMenuItemAction(
  categoryId: string,
  originalName: string,
  updatedItem: MenuItem
): Promise<ActionState> {
  try {
    await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const menu = await getMenu();
    const sourceCategory = menu.find((c) => c.id === categoryId);
    const sourceItem = sourceCategory?.items.find((item) => item.name === originalName);
    if (!sourceCategory || !sourceItem?.id) return { success: false, error: "Piatto non trovato." };

    // Process image base64 if upload happened
    let imageUrl = updatedItem.image;
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      imageUrl = await uploadMenuImageToSupabase(imageUrl, updatedItem.name);
    }

    const targetCategoryId = categoryId;
    const targetCategory = menu.find((c) => c.id === targetCategoryId);
    const pillLabel = updatedItem.tag?.trim();
    let pillId: string | null = null;

    if (pillLabel) {
      const slug = pillLabel
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50) || "pill";

      pillId = slug;
      await supabaseAdmin
        .from("pills")
        .upsert({
          id: slug,
          label: pillLabel,
          color_class: "pill-neutral",
          icon: "🏷️",
        });
    }

    const { error } = await supabaseAdmin
      .from("menu_items")
      .update({
        name: updatedItem.name.trim(),
        price: Number(updatedItem.price),
        description: updatedItem.description.trim(),
        image_url: imageUrl || null,
        category_id: targetCategoryId,
        pill_id: pillId,
        is_popular: updatedItem.isPopular === true,
        is_available: updatedItem.isAvailable !== false,
        position: sourceItem.position ?? targetCategory?.items.length ?? 1,
      })
      .eq("id", sourceItem.id);

    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/promo");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function addMenuItemAction(
  categoryId: string,
  newItem: MenuItem
): Promise<ActionState> {
  try {
    await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const menu = await getMenu();
    const category = menu.find((c) => c.id === categoryId);
    if (!category) return { success: false, error: "Categoria non trovata." };
    if (category.items.some((item) => item.name.toLowerCase() === newItem.name.toLowerCase())) {
      return { success: false, error: "Un piatto con questo nome esiste già in questa categoria." };
    }

    // Process image base64 if upload happened
    let imageUrl = newItem.image;
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      imageUrl = await uploadMenuImageToSupabase(imageUrl, newItem.name);
    }

    const pillLabel = newItem.tag?.trim();
    let pillId: string | null = null;
    if (pillLabel) {
      const slug = pillLabel
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50) || "pill";
      pillId = slug;
      await supabaseAdmin
        .from("pills")
        .upsert({ id: slug, label: pillLabel, color_class: "pill-neutral", icon: "🏷️" });
    }

    const nextPosition = (category.items.reduce((m, i) => Math.max(m, i.position ?? 0), 0) || 0) + 1;
    const { error } = await supabaseAdmin.from("menu_items").insert({
      name: newItem.name.trim(),
      price: Number(newItem.price),
      description: newItem.description.trim(),
      image_url: imageUrl || null,
      category_id: categoryId,
      pill_id: pillId,
      is_popular: newItem.isPopular === true,
      is_available: newItem.isAvailable !== false,
      position: nextPosition,
    });
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/promo");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function deleteMenuItemAction(
  categoryId: string,
  itemName: string
): Promise<ActionState> {
  try {
    await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const menu = await getMenu();
    const category = menu.find((c) => c.id === categoryId);
    const item = category?.items.find((i) => i.name === itemName);
    if (!category || !item?.id) return { success: false, error: "Piatto non trovato." };

    const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", item.id);
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/promo");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

function slugifyCategoryId(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "categoria"
  );
}

export async function createCategoryAction(label: string, icon: string): Promise<ActionState> {
  try {
    await requireAuth();
    const cleanLabel = label.trim();
    if (!cleanLabel) return { success: false, error: "Nome categoria obbligatorio." };

    const supabaseAdmin = getSupabaseAdmin();
    const { data: categories, error: readError } = await supabaseAdmin
      .from("categories")
      .select("id,label,position")
      .order("position", { ascending: true });

    if (readError) return { success: false, error: `Errore Supabase: ${readError.message}` };

    const baseId = slugifyCategoryId(cleanLabel);
    const existingIds = new Set((categories || []).map((c: { id: string }) => c.id));
    let nextId = baseId;
    let attempt = 2;
    while (existingIds.has(nextId)) {
      nextId = `${baseId}_${attempt++}`;
    }

    const nextPosition =
      ((categories || []).reduce((max: number, c: { position: number | null }) => Math.max(max, Number(c.position || 0)), 0) || 0) + 1;

    const { error } = await supabaseAdmin.from("categories").insert({
      id: nextId,
      label: cleanLabel,
      icon: (icon || "🍔").trim() || "🍔",
      position: nextPosition,
    });
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function updateCategoryAction(categoryId: string, label: string, icon: string): Promise<ActionState> {
  try {
    await requireAuth();
    if (!categoryId) return { success: false, error: "Categoria non valida." };
    const cleanLabel = label.trim();
    if (!cleanLabel) return { success: false, error: "Nome categoria obbligatorio." };

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("categories")
      .update({
        label: cleanLabel,
        icon: (icon || "🍔").trim() || "🍔",
      })
      .eq("id", categoryId);

    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  try {
    await requireAuth();
    if (!categoryId) return { success: false, error: "Categoria non valida." };
    const supabaseAdmin = getSupabaseAdmin();

    const { count, error: countError } = await supabaseAdmin
      .from("menu_items")
      .select("id", { head: true, count: "exact" })
      .eq("category_id", categoryId);
    if (countError) return { success: false, error: `Errore Supabase: ${countError.message}` };
    if ((count || 0) > 0) {
      return { success: false, error: "Sposta o elimina prima i piatti presenti in questa categoria." };
    }

    const { error } = await supabaseAdmin.from("categories").delete().eq("id", categoryId);
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function reorderCategoriesAction(orderedCategoryIds: string[]): Promise<ActionState> {
  try {
    await requireAuth();
    if (!Array.isArray(orderedCategoryIds) || orderedCategoryIds.length === 0) {
      return { success: false, error: "Ordine categorie non valido." };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const updates = orderedCategoryIds.map((id, index) => ({
      id,
      position: index + 1,
    }));

    const { error } = await supabaseAdmin.from("categories").upsert(updates, { onConflict: "id" });
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

// 3. Promotion Actions
export async function togglePromotionAction(
  promoId: string,
  isActive: boolean
): Promise<ActionState> {
  try {
    await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("promotions").update({ is_active: isActive }).eq("key", promoId);
    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/");
    revalidatePath("/promo");
    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/promozioni");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}

export async function updatePromotionAction(
  promoId: string,
  updatedPromo: Partial<Omit<Promotion, "id">>
): Promise<ActionState> {
  try {
    await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const existing = (await getPromotions()).find((p) => p.id === promoId);
    if (!existing) return { success: false, error: "Promozione non trovata." };

    const settings = {
      description: updatedPromo.description ?? existing.description ?? "",
      conditions: updatedPromo.conditions ?? existing.conditions ?? "",
      code: updatedPromo.code ?? existing.code ?? "",
      minSpend:
        updatedPromo.minSpend !== undefined
          ? Number(updatedPromo.minSpend)
          : existing.minSpend ?? null,
    };

    const { error } = await supabaseAdmin
      .from("promotions")
      .update({
        name: updatedPromo.name ?? existing.name,
        settings,
      })
      .eq("key", promoId);

    if (error) return { success: false, error: `Errore Supabase: ${error.message}` };

    revalidatePath("/");
    revalidatePath("/promo");
    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/promozioni");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}
