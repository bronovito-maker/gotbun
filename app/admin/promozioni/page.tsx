import { getPromotions } from "@/lib/db";
import AdminPromotionsClient from "@/app/admin/promozioni/AdminPromotionsClient";

export const metadata = {
  title: "Gestione Promozioni - GotBun Admin",
};

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <AdminPromotionsClient initialPromotions={promotions} />
  );
}
