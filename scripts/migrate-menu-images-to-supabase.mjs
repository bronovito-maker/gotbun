import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const LOCAL_IMAGES_DIR = path.join(ROOT, "public", "Menu piatti Got Bun");
const BUCKET = process.env.SUPABASE_MENU_IMAGES_BUCKET || "menu-images";
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnvFile(content) {
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function toStorageSafeName(fileName) {
  const base = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.toLowerCase();
}

async function main() {
  const envRaw = await fs.readFile(ENV_PATH, "utf8");
  loadEnvFile(envRaw);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const localFiles = await fs.readdir(LOCAL_IMAGES_DIR);
  const localByName = new Map(localFiles.map((f) => [f.toLowerCase(), f]));

  const { data: rows, error } = await supabase
    .from("menu_items")
    .select("id,name,image_url")
    .not("image_url", "is", null);

  if (error) throw new Error(`Read menu_items failed: ${error.message}`);

  const targetRows = (rows || []).filter((row) => {
    const img = String(row.image_url || "");
    return img.startsWith("/Menu piatti Got Bun/");
  });

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of targetRows) {
    const imageUrl = String(row.image_url || "");
    const fileNameInDb = imageUrl.replace("/Menu piatti Got Bun/", "");
    const localFile = localByName.get(fileNameInDb.toLowerCase());
    if (!localFile) {
      console.warn(`SKIP missing local file for ${row.name}: ${fileNameInDb}`);
      skipped += 1;
      continue;
    }

    const absPath = path.join(LOCAL_IMAGES_DIR, localFile);
    const bytes = await fs.readFile(absPath);
    const ext = path.extname(localFile).toLowerCase();
    const mimeType = ext === ".webp" ? "image/webp" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    const storageName = toStorageSafeName(localFile);
    const objectPath = `menu/${storageName}`;

    if (!DRY_RUN) {
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
        contentType: mimeType,
        upsert: true,
        cacheControl: "31536000",
      });
      if (upErr) {
        console.warn(`SKIP upload failed for ${row.name}: ${upErr.message}`);
        skipped += 1;
        continue;
      }
    }

    uploaded += 1;

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      console.warn(`SKIP no public URL for ${row.name}`);
      skipped += 1;
      continue;
    }

    if (!DRY_RUN) {
      const { error: updateErr } = await supabase
        .from("menu_items")
        .update({ image_url: publicUrl })
        .eq("id", row.id);

      if (updateErr) {
        console.warn(`SKIP update failed for ${row.name}: ${updateErr.message}`);
        skipped += 1;
        continue;
      }
    }

    updated += 1;
    console.log(`${DRY_RUN ? "DRY" : "OK"} ${row.name} -> ${objectPath}`);
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        scanned: targetRows.length,
        uploaded,
        updated,
        skipped,
        bucket: BUCKET,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
