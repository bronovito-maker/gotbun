export const SITE_URL = "https://gotbunriccione.it";
export const PROMO_URL = "https://promo.gotbunriccione.it";
export const MENU_URL = "/menu";
export const DISH_ORDER_URL = "https://gotbun.order.app.hd.digital/menus";
export const DISH_URL = "https://gotbunriccione.eatbu.com";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=GotBun%20Riccione";

export const business = {
  name: "GotBun Riccione",
  description: "Burger restaurant a Riccione con hamburger nostrani a Km 0, pulled pork e falafel fatti in casa, menu online, ordini e promo 2x1.",
  phone: "+390541645598",
  displayPhone: "0541 645598",
  streetAddress: "Viale Emilia 40",
  postalCode: "47838",
  city: "Riccione",
  region: "RN",
  country: "IT",
  latitude: 44.0053,
  longitude: 12.6561,
  openingHours: "Mo-Su 18:30-22:45",
};

export const homeFaqs = [
  {
    question: "Dove si trova GotBun Riccione?",
    answer: "GotBun Riccione si trova in Viale Emilia 40, 47838 Riccione. Puoi aprire Maps dal sito e arrivare direttamente al locale.",
  },
  {
    question: "Quali sono gli orari di GotBun Riccione?",
    answer: "GotBun Riccione è aperto tutti i giorni dalle 18:30 alle 22:45 per cena, menu online e ordini.",
  },
  {
    question: "Come posso vedere il menu e ordinare online?",
    answer: "Il menu e gli ordini online passano dal canale ufficiale DISH Order di GotBun Riccione, raggiungibile dal pulsante Menu o Ordina online.",
  },
  {
    question: "GotBun Riccione ha una promo 2x1?",
    answer: "Sì. La promo 2x1 è valida dal lunedì al giovedì, 18:30-22:30, solo al tavolo: scarichi il coupon, mostri il QR in cassa e usi il codice una sola volta.",
  },
];

export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
