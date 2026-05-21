# GotBun Riccione

Sito leggero e operativo per GotBun Riccione.

Il progetto oggi gestisce due esperienze nello stesso codice:

- **Sito principale** su `gotbunriccione.it`: home istituzionale, menu, ordini online, promo e info locale.
- **Landing promo 2x1** su `promo.gotbunriccione.it`: raccolta lead, generazione coupon QR, invio dati a n8n/Brevo/Airtable e redemption in cassa.

## Stack

- Next.js `16.2.6` con App Router e Turbopack
- React `19.2.6`
- TypeScript `6.0.3`
- ESLint `9.39.4` con `eslint-config-next`
- CSS globale custom in `app/globals.css`
- API route server-side `POST /api/claim-coupon`
- n8n per automazioni coupon, email, Airtable e redemption
- Brevo per email transazionali
- Airtable come database operativo coupon/lead
- Nessun database interno all'app

> Nota: ESLint 10 esiste, ma il progetto resta su ESLint 9.39.x perché è la linea compatibile con i plugin usati da `eslint-config-next` 16.

## Comandi

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

Durante lo sviluppo apri:

```text
http://localhost:3000
```

## Route e domini

| Dominio/route | Scopo |
| --- | --- |
| `https://gotbunriccione.it/` | Sito principale GotBun Riccione |
| `https://www.gotbunriccione.it/` | Alias del sito principale |
| `https://promo.gotbunriccione.it/` | Landing promo 2x1 |
| `/promo` | Route interna della landing promo |
| `/privacy` | Privacy policy e condizioni promo |
| `/redeem` | Fallback locale se manca il webhook di redemption |
| `/api/claim-coupon` | API interna per generare coupon e inviare payload a n8n |

`proxy.ts` mantiene la separazione tra dominio principale e promo:

```text
Host promo.gotbunriccione.it + path /
-> rewrite interno a /promo
```

L'utente continua a vedere `promo.gotbunriccione.it`, mentre il sito principale usa `/`.

## Link esterni operativi

| Servizio | URL |
| --- | --- |
| Menu e ordini DISH Order | `https://gotbun.order.app.hd.digital/menus` |
| Sito vetrina DISH | `https://gotbunriccione.eatbu.com` |
| Landing promo pubblica | `https://promo.gotbunriccione.it` |

Il menu e gli ordini restano su DISH Order. Il sito principale su Vercel deve linkare sempre il menu ufficiale, senza provare a replicare checkout o catalogo.

## Struttura progetto

```text
app/
├── api/
│   └── claim-coupon/
│       └── route.ts          # Generazione coupon, QR, payload n8n
├── admin-login/
│   └── page.tsx              # Form di accesso admin (Supabase Auth)
├── admin/
│   ├── actions.ts            # Server Actions per menu e promozioni
│   ├── admin.css             # Stile ad hoc ad alta specificità per l'Admin
│   ├── layout.tsx            # Sidebar e layout pannello amministrativo
│   ├── page.tsx              # Dashboard con statistiche generali
│   ├── menu/
│   │   ├── page.tsx          # Gestione piatti (Server Component)
│   │   └── AdminMenuClient.tsx # Componente interattivo listino e categorie
│   └── promozioni/
│       ├── page.tsx          # Configurazione promozioni (Server Component)
│       └── AdminPromotionsClient.tsx # Toggles per attivazione promozioni e testi
├── privacy/
│   └── page.tsx              # Privacy e condizioni promo
├── promo/
│   └── page.tsx              # Landing promo 2x1 con form
├── redeem/
│   └── page.tsx              # Fallback redemption locale
├── error.tsx                 # Error boundary
├── globals.css               # Design system e stili di entrambe le esperienze
├── icon.svg                  # Favicon
├── layout.tsx                # Metadata e root layout
└── page.tsx                  # Sito principale (gotbunriccione.it)

lib/
├── auth.ts                   # Gestione autenticazione (Supabase Auth client-side)
├── coupon.ts                 # Codice coupon, token redemption, date helper
├── db.ts                     # Connessione e helper database Supabase
└── validation.ts             # Validazione server-side form coupon

utils/
└── supabase/                 # Configurazione client, server e middleware SSR
    ├── client.ts
    ├── middleware.ts
    └── server.ts

proxy.ts                      # Rewrite host promo -> /promo, controllo autorizzazioni admin
gotbun.json                   # Workflow n8n lead/coupon/email
gotbun-redeem.json            # Workflow n8n redemption in cassa
docs/
├── brand-copy.md             # Brand identity e stile copy
└── supabase-admin-setup.md   # Guida installazione Supabase & RLS
```

## Variabili ambiente

Parti da `.env.example`:

```bash
cp .env.example .env.local
```

Variabili:

```env
N8N_WEBHOOK_URL="https://primary-production-b2af.up.railway.app/webhook/gotbun-coupon"
N8N_REDEEM_WEBHOOK_URL="https://primary-production-b2af.up.railway.app/webhook/gotbun-redeem"
QR_IMAGE_BASE_URL=""
```

Uso:

- `N8N_WEBHOOK_URL`: riceve il lead e crea il coupon nel workflow principale.
- `N8N_REDEEM_WEBHOOK_URL`: finisce nel QR e viene aperta quando il titolare scansiona il coupon.
- `QR_IMAGE_BASE_URL`: opzionale. Se vuoto, usa `api.qrserver.com` con QR 420x420.

In produzione `N8N_REDEEM_WEBHOOK_URL` deve essere configurato. Il fallback `/redeem` serve solo a non rompere lo sviluppo locale.

## Flusso coupon

```text
promo.gotbunriccione.it
-> form cliente
-> POST /api/claim-coupon
-> validazione server-side
-> generazione coupon GOTBUN-2X1-XXXXXX
-> generazione redeem token sicuro
-> redeemUrl con code + token
-> QR image URL
-> payload a n8n
-> Airtable + Brevo
-> email con QR e codice fallback
```

Payload inviato a n8n:

```json
{
  "event": "coupon_claimed",
  "brand": "GotBun Riccione",
  "name": "Martina",
  "email": "martina@example.com",
  "phone": "+393331234567",
  "privacyConsent": true,
  "marketingConsent": true,
  "couponCode": "GOTBUN-2X1-ABC123",
  "redeemToken": "token-sicuro",
  "redeemUrl": "https://primary-production-b2af.up.railway.app/webhook/gotbun-redeem?code=GOTBUN-2X1-ABC123&token=token-sicuro",
  "qrContent": "https://primary-production-b2af.up.railway.app/webhook/gotbun-redeem?code=GOTBUN-2X1-ABC123&token=token-sicuro",
  "qrImageUrl": "https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=...",
  "status": "Active",
  "couponType": "2x1",
  "redemptionMode": "in_store",
  "usageLimit": 1,
  "promoDays": "lunedi-giovedi",
  "promoHours": "18:30-22:30",
  "createdAt": "2026-05-16T10:00:00.000Z",
  "expiresAt": "2026-05-30T10:00:00.000Z",
  "source": "instagram",
  "campaign": "gotbun_tavoli_2x1"
}
```

## Workflow n8n

### `gotbun.json`

Workflow principale:

```text
Webhook gotbun-coupon
-> normalizzazione lead/coupon
-> Airtable lead/coupon
-> contatto Brevo
-> email transazionale con QR
```

Template Brevo richiesto:

```text
name
couponCode
qrImageUrl
redeemUrl
expiresAt
```

Campi Airtable essenziali:

```text
Name
Email
Phone
Coupon Code
Redeem Token
Redeem URL
QR Content
QR Image URL
Status
Usage Limit
Redeem Attempts
Redeemed At
Redeemed By
Privacy Consent
Marketing Consent
Brand
Source
Campaign
Created At
Expires At
```

`Status` è una single select con valori:

```text
Active
Email Sent
Redeemed
Expired
Invalid
```

### `gotbun-redeem.json`

Workflow cassa:

```text
QR scan
-> pagina PIN cassa
-> verifica code + token in Airtable
-> verifica status, scadenza e finestra promo
-> update Status = Redeemed
-> Redeemed At in formato italiano
-> pagina finale per il titolare
```

Il QR non deve segnare automaticamente il coupon come usato da qualsiasi telefono. Serve il PIN cassa.

Configurare su n8n/Railway:

```env
GOTBUN_REDEEM_PIN="PIN_SCELTO"
```

## Promo 2x1

Regole attuali:

- Valida dal lunedì al giovedì
- Dalle 18:30 alle 22:30
- Solo in locale
- Senza prenotazione
- Consumazione al tavolo
- QR/codice da mostrare in cassa prima di pagare
- Codice personale, univoco, utilizzabile una sola volta
- Non cumulabile

## DNS e deploy

Deployment consigliato su Vercel.

Domini da collegare al progetto:

```text
gotbunriccione.it
www.gotbunriccione.it
promo.gotbunriccione.it
```

DNS indicativi:

```text
@      A      76.76.21.21
www    CNAME  cname.vercel-dns.com
promo  CNAME  valore specifico fornito da Vercel
```

Non modificare record email, Brevo, DKIM, DMARC o MX quando si aggiorna il sito.

## Qualità e verifica

Prima di consegnare modifiche:

```bash
npm run lint
npm run build
```

Controlli minimi:

- `/` carica la home principale.
- `/promo` carica il form coupon.
- `Host: promo.gotbunriccione.it` su `/` riscrive a `/promo`.
- Il form coupon genera QR, codice fallback e invia payload a n8n quando la variabile è configurata.
- La promo non deve essere rotta da modifiche alla home principale.

## Documentazione collegata

- [Brand identity e copy](docs/brand-copy.md)
- [Workflow Brevo](brevo_workflow_docs.md)
- `gotbun.json`
- `gotbun-redeem.json`
