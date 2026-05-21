const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  const email = "admin@gotbunriccione.it";
  const password = "weksug-hEzmo3-jurpiv";

  console.log(`Checking/Creating admin user: ${email}...`);

  // Trova tutti gli utenti
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    console.log(`User ${email} already exists with ID: ${existingUser.id}. Updating...`);
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: password,
      app_metadata: {
        ...existingUser.app_metadata,
        role: "admin"
      },
      user_metadata: {
        ...existingUser.user_metadata,
        name: "Admin GotBun"
      },
      email_confirm: true
    });

    if (error) {
      console.error("Error updating user:", error.message);
      process.exit(1);
    }
    console.log("Admin user updated successfully!");
  } else {
    console.log(`User ${email} does not exist. Creating new...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: {
        role: "admin"
      },
      user_metadata: {
        name: "Admin GotBun"
      },
      email_confirm: true
    });

    if (error) {
      console.error("Error creating user:", error.message);
      process.exit(1);
    }
    console.log("Admin user created successfully!");
  }
}

main().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
