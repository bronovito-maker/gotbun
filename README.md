# GotBun Riccione Coupon 2x1

Mini landing page promozionale per raccogliere lead, generare un coupon dinamico 2x1 e inviare i dati a un webhook n8n.

## Stack

- Next.js App Router
- TypeScript
- React
- CSS globale custom
- API route interna `POST /api/claim-coupon`
- Invio server-side a webhook n8n
- Nessun database interno

## Installazione

```bash
npm install
```

## Avvio in locale

```bash
npm run dev
```

Poi apri:

```text
http://localhost:3000
```

Puoi simulare sorgente e campagna con query params:

```text
http://localhost:3000?source=instagram&campaign=2x1_maggio
```

Se i parametri non sono presenti, la landing usa:

```text
source=landing
campaign=gotbun_2x1
```

## Configurazione webhook n8n

Crea un file `.env.local` partendo da `.env.example`:

```bash
cp .env.example .env.local
```

Imposta il webhook n8n:

```env
N8N_WEBHOOK_URL="https://your-n8n-domain.com/webhook/gotbun-coupon"
```

Se `N8N_WEBHOOK_URL` non è configurato, la demo continua a funzionare: il coupon viene generato e la risposta contiene `webhookSent: false`.

## Configurazione workflow n8n

Il file `gotbun.json` contiene il workflow pronto da importare in n8n.

Prima di attivarlo:

1. Nel nodo `Create Airtable Lead`, sostituisci `app_REPLACE_WITH_AIRTABLE_BASE_ID` con l'ID della base Airtable.
2. Nel nodo `Create Airtable Lead`, sostituisci `tbl_REPLACE_WITH_AIRTABLE_TABLE_ID` con l'ID della tabella Airtable.
3. Nel nodo `Send Brevo Coupon Email`, sostituisci `REPLACE_WITH_BREVO_TEMPLATE_ID` con l'ID del template transazionale Brevo.
4. Seleziona le credenziali Airtable e Brevo direttamente dai rispettivi nodi.
5. Imposta in `.env.local` o su Vercel la URL di produzione del webhook n8n:

```env
N8N_WEBHOOK_URL="https://your-n8n-domain.com/webhook/gotbun-coupon"
```

La tabella Airtable deve avere queste colonne:

```text
Name
Email
Phone
Coupon Code
Coupon Type
Brand
Source
Campaign
Privacy Consent
Marketing Consent
Created At
Expires At
```

Nel template transazionale Brevo puoi usare questi parametri:

```text
{{ params.name }}
{{ params.couponCode }}
{{ params.expiresAt }}
{{ params.officialOrderUrl }}
```

Nel contatto Brevo il workflow valorizza gli attributi `FIRSTNAME`, `SMS`, `COUPON`, `SOURCE` e `CAMPAIGN`: creali in Brevo o rinominali nel nodo `Create Brevo Contact`.

## Payload inviato a n8n

Quando il webhook è configurato, l'API invia un payload come questo:

```json
{
  "event": "coupon_claimed",
  "brand": "GotBun Riccione",
  "name": "Martina",
  "email": "martina@example.com",
  "phone": "3331234567",
  "privacyConsent": true,
  "marketingConsent": true,
  "couponCode": "GOTBUN-2X1-ABC123",
  "couponType": "2x1",
  "createdAt": "2026-05-14T20:30:00.000Z",
  "expiresAt": "2026-05-28T20:30:00.000Z",
  "source": "instagram",
  "campaign": "2x1_maggio"
}
```

## Test con curl

Con server locale attivo:

```bash
curl -X POST http://localhost:3000/api/claim-coupon \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Martina",
    "email": "martina@example.com",
    "phone": "3331234567",
    "privacyConsent": true,
    "marketingConsent": true,
    "source": "instagram",
    "campaign": "2x1_maggio"
  }'
```

Risposta attesa:

```json
{
  "success": true,
  "couponCode": "GOTBUN-2X1-ABC123",
  "expiresAt": "2026-05-28T20:30:00.000Z",
  "officialOrderUrl": "https://gotbun.it",
  "webhookSent": false
}
```

## Deploy su Vercel

1. Collega il repository a Vercel.
2. Imposta la variabile ambiente `N8N_WEBHOOK_URL` nelle Project Settings.
3. Esegui deploy con impostazioni standard Next.js.
4. Testa la landing con una URL tracciata, per esempio `/ ?source=instagram&campaign=2x1_maggio` senza lo spazio.

## Note MVP

Questa demo copre il flusso:

```text
landing -> form -> coupon dinamico -> webhook n8n -> CRM/database/email automation
```

Non include e-commerce, pagamenti, integrazione WhatsApp, Manychat o database interno.
