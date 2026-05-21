import { getMenu } from "@/lib/db";
import AdminMenuClient from "@/app/admin/menu/AdminMenuClient";

export const metadata = {
  title: "Gestione Menu - GotBun Admin",
};

export default async function AdminMenuPage() {
  const menu = await getMenu();

  return (
    <AdminMenuClient initialMenu={menu} />
  );
}
