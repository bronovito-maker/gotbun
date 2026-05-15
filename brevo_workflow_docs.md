# GotBun Riccione - Flusso Email Brevo (API)

Questo documento descrive come è strutturato attualmente l'invio delle email (Coupon 2x1) tramite l'API di Brevo, bypassando la necessità di utilizzare il Model Context Protocol (MCP).

## 1. Architettura Generale

L'invio dell'email promozionale si basa su **Template Transazionali** (SMTP) preconfigurati su Brevo, che vengono triggerati tramite le API REST di Brevo (es. via webhooks tramite n8n o direttamente da Next.js).

*   **Piattaforma:** Brevo (ex Sendinblue)
*   **Tipo di Email:** Email Transazionale (SMTP)
*   **Template ID in uso:** `1` ("Coupon Dinamico 2x1")
*   **Metodo di invio:** Chiamata HTTP `POST /v3/smtp/email`

---

## 2. Parametri Dinamici (Variabili del Template)

Il template Brevo (ID 1) è stato progettato per ricevere 4 variabili dinamiche essenziali. Quando si invia l'email tramite API, questi valori devono essere passati nell'oggetto `params`:

| Variabile nel Template | Chiave API | Descrizione | Esempio |
| :--- | :--- | :--- | :--- |
| `{{ params.name }}` | `name` | Nome del cliente (usato per il saluto iniziale) | `"Bruno"` |
| `{{ params.couponCode }}` | `couponCode` | Il codice sconto univoco 2x1 | `"GOTBUN-2X1-DEMO01"` |
| `{{ params.expiresAt }}` | `expiresAt` | Data limite per l'utilizzo in cassa | `"28/05/2026"` |
| `{{ params.officialOrderUrl }}` | `officialOrderUrl` | Link ufficiale per il delivery/asporto | `"https://gotbun.order.app.hd.digital/menus"` |

*Nota: All'interno dell'HTML del template è presente un fallback. Se `officialOrderUrl` non viene passato, il bottone reindirizzerà automaticamente a `https://gotbun.order.app.hd.digital/menus`.*

---

## 3. Invio tramite API: Esempi di Integrazione

Per inviare un'email a un cliente applicando il template grafico che abbiamo realizzato, è sufficiente eseguire una chiamata POST all'endpoint transazionale.

### Esempio in Node.js / Next.js (Fetch API)

```javascript
const sendBrevoEmail = async () => {
  const apiKey = "IL_TUO_BREVO_API_KEY"; // Da mettere in .env (es. BREVO_API_KEY)
  
  const payload = {
    // Destinatari
    to: [{ email: "cliente@example.com", name: "Mario Rossi" }],
    // Associa il design
    templateId: 1, 
    // Variabili per l'HTML
    params: {
      name: "Mario",
      couponCode: "GOTBUN-2X1-XYZ",
      expiresAt: "31 Dicembre 2026",
      officialOrderUrl: "https://gotbun.order.app.hd.digital/menus"
    }
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if(response.ok) {
    const data = await response.json();
    console.log("Email inviata! Message ID:", data.messageId);
  }
};
```

### Esempio in cURL (Terminale)

```bash
curl --request POST \
  --url https://api.brevo.com/v3/smtp/email \
  --header 'accept: application/json' \
  --header 'api-key: IL_TUO_BREVO_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
    "to": [{"email": "cliente@example.com", "name": "Mario Rossi"}],
    "templateId": 1,
    "params": {
      "name": "Mario",
      "couponCode": "GOTBUN-2X1-XYZ",
      "expiresAt": "31 Dicembre 2026",
      "officialOrderUrl": "https://gotbun.order.app.hd.digital/menus"
    }
}'
```

---

## 4. Gestione tramite n8n (Flusso Consigliato)

Nel caso in cui tu stia gestendo il routing dei lead tramite n8n (come definito nel file `gotbun.json`), l'invio avviene in modo "no-code" ma sfruttando esattamente lo stesso endpoint API.

**Configurazione del Nodo Brevo su n8n (`Send Brevo Coupon Email`):**
1. **Risorsa:** `Email`
2. **Operazione:** `Send`
3. **Template ID:** `1`
4. **Destinatario (`To`):** Mappato dinamicamente (es. `{{$json.email}}`)
5. **Dynamic Data (Params):** Qui avviene il mapping esatto dei dati passati dal payload iniziale di Next.js:
   - `name` ➔ `{{$json.name}}`
   - `couponCode` ➔ `{{$json.couponCode}}`
   - `expiresAt` ➔ `{{$json.expiresAt}}`
   - `officialOrderUrl` ➔ `{{$json.officialOrderUrl}}`

Essendo questa l'infrastruttura, il template grafico su Brevo rimane completamente disaccoppiato dall'app: puoi cambiare i colori o i testi direttamente via script API (come abbiamo fatto per aggiornare il template) senza mai dover riavviare n8n o la codebase Next.js.
