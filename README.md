# GotBun Riccione Promo Tavoli 2x1

Mini landing page promozionale per raccogliere lead, generare un coupon dinamico 2x1 per consumazione sul posto e inviare i dati a un webhook n8n per email/WhatsApp automation.

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
campaign=gotbun_tavoli_2x1
```

## Configurazione webhook n8n

Crea un file `.env.local` partendo da `.env.example`:

```bash
cp .env.example .env.local
```

Imposta il webhook n8n:

```env
N8N_WEBHOOK_URL="https://your-n8n-domain.com/webhook/gotbun-coupon"
N8N_REDEEM_WEBHOOK_URL="https://your-n8n-domain.com/webhook/gotbun-redeem"
```

Se `N8N_REDEEM_WEBHOOK_URL` non è configurato, il QR viene generato verso `/redeem` sul dominio corrente: utile solo come fallback di sviluppo. In produzione deve puntare al webhook di redemption n8n.

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
QR Content
QR Image URL
Redeem URL
Redeem Token
Coupon Type
Redemption Mode
Usage Limit
Promo Days
Promo Hours
Status
Redeemed At
Redeemed By
Redeem Attempts
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
{{ params.qrContent }}
{{ params.qrImageUrl }}
{{ params.redeemUrl }}
{{ params.expiresAt }}
{{ params.promoDays }}
{{ params.promoHours }}
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
  "redeemToken": "N6J0xF0bI_1nMe6TwCx3b6b8",
  "redeemUrl": "https://your-n8n-domain.com/webhook/gotbun-redeem?code=GOTBUN-2X1-ABC123&token=N6J0xF0bI_1nMe6TwCx3b6b8",
  "qrContent": "https://your-n8n-domain.com/webhook/gotbun-redeem?code=GOTBUN-2X1-ABC123&token=N6J0xF0bI_1nMe6TwCx3b6b8",
  "qrImageUrl": "https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=...",
  "status": "Active",
  "couponType": "2x1",
  "redemptionMode": "in_store",
  "usageLimit": 1,
  "promoDays": "lunedi-giovedi",
  "promoHours": "18:30-22:30",
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
  "qrContent": "https://your-n8n-domain.com/webhook/gotbun-redeem?code=GOTBUN-2X1-ABC123&token=...",
  "qrImageUrl": "https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=...",
  "expiresAt": "2026-05-28T20:30:00.000Z",
  "redemptionMode": "in_store",
  "promoDays": "lunedi-giovedi",
  "promoHours": "18:30-22:30",
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
landing -> form -> coupon dinamico -> webhook n8n -> CRM/database/email/WhatsApp automation -> QR in cassa
```

Non include e-commerce, pagamenti o database interno. L'uso singolo del codice va gestito nel sistema collegato a n8n, per esempio Airtable/CRM con stato "redeemed".

## Redemption in cassa

Il QR deve contenere `qrContent`, cioe la `redeemUrl` con `code` e `token`. Il workflow n8n di redemption deve:

1. Ricevere `GET /webhook/gotbun-redeem?code=...&token=...`.
2. Cercare in Airtable un record con lo stesso `Coupon Code` e `Redeem Token`.
3. Rifiutare il coupon se `Status` e gia `Redeemed`, se e scaduto o se la promo non e attiva in quel giorno/orario.
4. Se valido, aggiornare `Status = Redeemed`, `Redeemed At = now`, `Redeemed By = cassa`, `Redeem Attempts = Redeem Attempts + 1`.
5. Rispondere con una pagina HTML chiara per il titolare: valido, gia usato, scaduto, fuori orario o non trovato.
