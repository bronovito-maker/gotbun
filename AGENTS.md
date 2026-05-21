# Project Agent Instructions

Queste istruzioni servono agli agenti che lavorano nel repository GotBun Riccione.

## Principio guida

Il progetto contiene due esperienze diverse nello stesso codice:

- `app/page.tsx`: sito principale per `gotbunriccione.it`.
- `app/promo/page.tsx`: landing promo 2x1 per `promo.gotbunriccione.it`.

Non confondere le due superfici. La promo è collegata a n8n, Brevo e Airtable: ogni modifica al form, al payload o al routing va trattata come potenzialmente delicata.

## Comandi

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

Stack attuale:

- Next.js `16.2.6`
- React `19.2.6`
- TypeScript `6.0.3`
- ESLint `9.39.4`
- App Router
- CSS globale custom
- Node.js runtime per `POST /api/claim-coupon`

## Architettura

```text
app/
├── page.tsx                 # Home istituzionale
├── promo/page.tsx           # Landing coupon 2x1
├── api/claim-coupon/route.ts
├── privacy/page.tsx
├── redeem/page.tsx
├── layout.tsx
└── globals.css

lib/
├── coupon.ts
└── validation.ts

proxy.ts                     # Host promo -> /promo
```

`proxy.ts` sostituisce il vecchio `middleware.ts`, come richiesto da Next 16.

Regola attuale:

```text
promo.gotbunriccione.it/
-> rewrite interno a /promo
```

## Domini e ruoli

| Dominio | Ruolo |
| --- | --- |
| `gotbunriccione.it` | sito principale |
| `www.gotbunriccione.it` | alias sito principale |
| `promo.gotbunriccione.it` | landing promo 2x1 |
| `gotbun.order.app.hd.digital/menus` | menu e ordini ufficiali DISH Order |
| `gotbunriccione.eatbu.com` | sito vetrina DISH secondario |

Il sito principale deve rimandare a DISH Order per menu e ordini. Non implementare ordini proprietari in questo repo.

## Flusso promo

La promo raccoglie:

- nome
- email
- telefono WhatsApp obbligatorio
- consenso privacy obbligatorio
- consenso marketing facoltativo
- source/campaign da query string

`POST /api/claim-coupon`:

1. valida input con `lib/validation.ts`;
2. genera `couponCode` con prefisso `GOTBUN-2X1`;
3. genera `redeemToken`;
4. costruisce `redeemUrl`;
5. costruisce `qrImageUrl`;
6. invia payload a `N8N_WEBHOOK_URL`;
7. ritorna QR/codice fallback al client.

Variabili ambiente:

```env
N8N_WEBHOOK_URL=""
N8N_REDEEM_WEBHOOK_URL=""
QR_IMAGE_BASE_URL=""
```

In produzione `N8N_REDEEM_WEBHOOK_URL` deve puntare al workflow n8n redemption.

## n8n, Brevo, Airtable

File workflow:

- `gotbun.json`: lead/coupon/email.
- `gotbun-redeem.json`: redemption in cassa con PIN.

Brevo template richiede questi parametri:

```text
name
couponCode
qrImageUrl
redeemUrl
expiresAt
```

Airtable usa `Status = Active` per coupon appena creati.

Valori status:

```text
Active
Email Sent
Redeemed
Expired
Invalid
```

Non reintrodurre campi select problematici senza verificare Airtable, in particolare:

- `Promo Days`
- `Promo Hours`
- `Redemption Mode`

Questi valori possono restare nel payload n8n, ma non devono per forza essere mappati come select Airtable.

## Redemption in cassa

Il QR non deve marcare automaticamente il coupon come usato.

Flusso corretto:

```text
scan QR
-> pagina PIN cassa
-> verifica Coupon Code + Redeem Token
-> update Airtable Status = Redeemed
```

`Redeemed At` deve essere salvato in formato italiano leggibile, non come ISO con timezone USA.

## Design system

Stili in `app/globals.css`.

Palette attuale:

- sfondo scuro/carbone
- panna/bianco caldo per testo
- giallo senape/arancio per CTA
- verde come accento secondario

La home principale usa classi `main-*`.

La promo usa classi storiche:

- `page-shell`
- `hero-section`
- `form-card`
- `success-card`
- `promo-strip`

Quando modifichi una superficie, evita di rompere l'altra. Preferisci classi scoped per area (`main-*` per home).

## Brand e copy

Consulta sempre:

```text
docs/brand-copy.md
```

Sintesi:

- tono moderno, sensoriale, diretto, curato e accogliente;
- no posizionamento fast food/street food;
- focus su burger restaurant di livello;
- valorizzare Hamburger Nostrani con manzo a Km 0 (no smash burger);
- evidenziare artigianalità su falafel fatto in casa e pulled pork fatto in casa a lenta cottura;
- niente linguaggio corporate;
- CTA forti e brevi;
- copy chiaro sulle regole promo;
- parole concrete: piastra, crosticina, pane tostato, salse, addenta, ordina, scarica.

## Regole di modifica

- Usa `rg` per cercare file/testi.
- Usa `apply_patch` per modifiche manuali.
- Non cambiare workflow n8n JSON se il task riguarda solo UI/copy.
- Non cambiare variabili ambiente reali senza richiesta.
- Non rimuovere il PIN cassa dal flusso redeem.
- Non trasformare la promo in ordini online proprietari.
- Non sostituire `promo.gotbunriccione.it` con `/promo` nei copy pubblici: `/promo` è solo route interna.

## Verifiche prima di chiudere

```bash
npm run lint
npm run build
```

Controlli route:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/promo
curl -I -H 'Host: promo.gotbunriccione.it' http://localhost:3000/
```

Risultato atteso:

- `/` risponde 200;
- `/promo` risponde 200;
- host `promo.gotbunriccione.it` risponde 200 con rewrite a `/promo`.

## Commit

Usa conventional commits:

```text
feat:
fix:
docs:
refactor:
test:
chore:
```
