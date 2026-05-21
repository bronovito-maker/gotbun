# 🛡️ Guida & Prompt per Migrazione Backend Admin a Supabase Auth

Questa guida documenta i passi necessari per dismettere l'autenticazione statica locale (`gotbun_admin_session`) ed integrare **Supabase Auth** con controllo di ruolo **Admin** per la gestione del menu e delle promozioni di GotBun Riccione.

---

## 1. Configurazione su Supabase (SQL Editor)

Le policy RLS in `supabase/004_menu_admin_schema.sql` verificano il ruolo tramite la funzione `public.is_admin()`, che esegue questo controllo:
```sql
select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
```

Per creare un utente amministratore e assegnargli questo ruolo, esegui il seguente script nell'**SQL Editor** di Supabase:

```sql
-- 1. Abilita l'estensione pgcrypto se non presente
create extension if not exists pgcrypto;

-- 2. Inserisci l'utente admin in auth.users
-- Sostituisci 'TUA_PASSWORD_SICURA' con la password reale dell'admin
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gotbunriccione.it', -- Email fissa per l'admin
  crypt('TUA_PASSWORD_SICURA', gen_salt('bf')), -- Password cifrata con bcrypt
  now(),
  null,
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}', -- Role impostato ad 'admin'
  '{"name": "Admin GotBun"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) on conflict (email) do update
set 
  raw_app_meta_data = jsonb_set(coalesce(auth.users.raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"'),
  encrypted_password = crypt('TUA_PASSWORD_SICURA', gen_salt('bf')),
  updated_at = now();
```

---

## 2. Modifiche al Codice Sorgente

Ecco i file da modificare e come ristrutturarli per una sicurezza a livello professionale.

### A. Aggiornamento del Middleware in `proxy.ts`
Dobbiamo sostituire il controllo del cookie locale con l'autenticazione reale di Supabase.

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  // 1. Aggiorna la sessione di Supabase (gestisce il refresh automatico dei cookie)
  const sessionResponse = await updateSession(request);
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin-login";

  // Se è una rotta admin, verifichiamo la sessione e il ruolo dell'utente su Supabase
  if (isAdminRoute && !isAdminLogin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    
    // Inizializza un client temporaneo nel middleware per leggere la sessione
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.app_metadata?.role === "admin";

    if (!user || !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      const redirectResponse = NextResponse.redirect(url);
      
      // Preserva i cookie aggiornati durante il reindirizzamento
      sessionResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  }

  // Rewrite per il sottodominio della promo
  if (host === "promo.gotbunriccione.it" && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/promo";
    return NextResponse.rewrite(url, sessionResponse);
  }

  return sessionResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### B. Aggiornamento di `lib/auth.ts`
Implementiamo il login e logout tramite Supabase Auth. Per mantenere l'esperienza utente pulita (richiedendo solo la password nel form), possiamo impostare l'email dell'admin internamente.

```typescript
// lib/auth.ts
import { createClient } from "@/utils/supabase/server";

export async function loginAdmin(password: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const email = "admin@gotbunriccione.it"; // Email fissa per il gestore

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error("Login fallito:", error?.message);
      return false;
    }

    // Controlla se ha il ruolo admin nei metadati
    const isAdmin = data.user.app_metadata?.role === "admin";
    if (!isAdmin) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Errore imprevisto nel login:", err);
    return false;
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user && user.app_metadata?.role === "admin";
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Errore nel logout:", err);
  }
}
```

### C. Aggiornamento di `app/admin/actions.ts`
Ora che l'utente è autenticato tramite Supabase Auth su un client standard (`createClient`), non abbiamo più bisogno di usare la chiave `service_role` (tramite `getSupabaseAdmin()`) per bypassare le policy RLS! Possiamo usare il client di sessione che rispetta le regole RLS impostate nel database.

> [!NOTE]
> L'upload dell'immagine nel bucket storage di Supabase continuerà a utilizzare `getSupabaseAdmin()` o necessiterà di apposite policy di storage per gli utenti autenticati nel bucket `menu-images`. Se il bucket ha policy pubbliche/anonime di lettura e admin di scrittura, possiamo configurarlo in Supabase Storage o mantenere `getSupabaseAdmin()` solo per l'upload e il client standard per le modifiche al database.

Sostituire le chiamate a `getSupabaseAdmin()` in `updateMenuItemAction`, `addMenuItemAction`, `deleteMenuItemAction` e `togglePromotionAction` con:
```typescript
const supabase = await createClient(); // al posto di const supabaseAdmin = getSupabaseAdmin();
```

---

# 🤖 PROMPT DA COPIARE NELL'AGENTE PER ESEGUIRE IL LAVORO

Copia ed incolla il seguente testo in un nuovo prompt per far eseguire la migrazione in automatico:

```text
Agisci come un esperto Next.js 16 e Supabase Engineer. Dobbiamo migrare l'autenticazione del nostro Backend Admin (attualmente gestita con password statica e cookie locale in `lib/auth.ts`) a Supabase Auth, sfruttando le policy RLS attive sul database (ruolo 'admin' in app_metadata).

Ecco i file chiave coinvolti nel progetto:
- `lib/auth.ts`: gestisce la sessione e il login (da migrare a Supabase Auth).
- `proxy.ts`: middleware che controlla l'accesso alle rotte `/admin` (da aggiornare per verificare il ruolo dell'utente su Supabase).
- `app/admin/actions.ts`: Server Actions per la gestione di menu e promozioni (da aggiornare per usare il client autenticato standard al posto del service role client, sfruttando le RLS).
- `lib/db.ts` ed eventuali import ad esso legati: risolvi anche il problema di compilazione "Can't resolve '@/lib/db'" modificando gli import di questo file con path relativi (es. `../../lib/db` o `../lib/db`) in `app/admin/actions.ts`, `app/admin/page.tsx` e `app/admin/menu/page.tsx`.

### Requisiti di implementazione:
1. Mantieni l'interfaccia di login con il solo campo "Password". In `lib/auth.ts`, esegui `supabase.auth.signInWithPassword` usando l'email fissa 'admin@gotbunriccione.it' e la password inserita dall'utente.
2. In `proxy.ts`, recupera l'utente autenticato tramite `supabase.auth.getUser()` e valida che `user.app_metadata.role === 'admin'`. Se non è valido o assente, reindirizza a `/admin-login`.
3. In `app/admin/actions.ts`, sostituisci l'uso di `getSupabaseAdmin()` con il client standard ottenuto tramite `await createClient()` per l'inserimento, aggiornamento ed eliminazione dei menu e delle promozioni. Questo assicura il corretto funzionamento delle policy RLS. Mantieni l'uso di `getSupabaseAdmin()` esclusivamente per la funzione `uploadMenuImageToSupabase` se necessario a bypassare le policy di storage, o documenta le policy necessarie.
4. Esegui un refactoring pulito, mantieni la gestione degli errori con blocchi try/catch e restituisci messaggi chiari all'utente in conformità con l'Antigravity Quality Gate.
5. Testa la build con `npm run build` e assicurati che non vi siano errori di compilazione relativi all'import `@/lib/db` o all'autenticazione.
```
