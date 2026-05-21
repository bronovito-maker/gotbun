import { createClient } from "@/utils/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <main style={{ padding: "24px", color: "#fffaf0", background: "#111", minHeight: "100vh" }}>
      <h1>Supabase Connection Test</h1>
      <p>Client initialized correctly.</p>
      <p>Auth user: {user ? user.email ?? user.id : "anonymous"}</p>
      <p>Auth error: {error ? error.message : "none"}</p>
    </main>
  );
}
