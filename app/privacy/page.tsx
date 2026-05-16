import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy e condizioni promo tavoli | GotBun Riccione",
  description: "Informativa privacy e condizioni della promozione tavoli 2x1 GotBun Riccione.",
};

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <Link className="policy-back" href="/">
        Torna alla promo
      </Link>

      <section className="policy-hero">
        <p className="eyebrow">GotBun Riccione</p>
        <h1>Privacy e condizioni promo tavoli 2x1</h1>
        <p>
          Questa pagina spiega come vengono trattati i dati raccolti tramite la landing della promozione tavoli e
          quali condizioni regolano l&apos;utilizzo del coupon.
        </p>
      </section>

      <section className="policy-content" aria-label="Informativa privacy">
        <article>
          <h2>Dati raccolti</h2>
          <p>
            Per generare e inviare il coupon raccogliamo nome, email, numero di telefono, consenso privacy, eventuale
            consenso marketing, sorgente della campagna, codice coupon, data di generazione e data di scadenza.
          </p>
        </article>

        <article>
          <h2>Finalità del trattamento</h2>
          <p>
            I dati sono usati per generare un codice univoco, inviare il coupon via email e, quando disponibile,
            tramite WhatsApp, gestire l&apos;utilizzo in cassa e prevenire riutilizzi non autorizzati. Con consenso
            separato, i dati potranno essere usati per inviare offerte e comunicazioni promozionali future di GotBun.
          </p>
        </article>

        <article>
          <h2>Base giuridica</h2>
          <p>
            Il trattamento necessario all&apos;invio e alla gestione del coupon si basa sulla richiesta dell&apos;utente e sul
            consenso privacy espresso nel form. Le comunicazioni promozionali future sono inviate solo con consenso
            marketing facoltativo e revocabile.
          </p>
        </article>

        <article>
          <h2>Strumenti e destinatari</h2>
          <p>
            I dati possono essere trattati tramite strumenti di automazione, CRM, database operativo, provider email e
            servizi di messaggistica necessari all&apos;invio del coupon e alla gestione della campagna. L&apos;accesso ai dati è
            limitato ai soggetti coinvolti nell&apos;erogazione della promozione.
          </p>
        </article>

        <article>
          <h2>Conservazione</h2>
          <p>
            I dati legati al coupon sono conservati per il tempo necessario a gestire la promozione, verificare
            l&apos;utilizzo del codice e adempiere a eventuali obblighi amministrativi. I dati usati per marketing sono
            conservati fino a revoca del consenso o richiesta di cancellazione.
          </p>
        </article>

        <article>
          <h2>Diritti</h2>
          <p>
            Puoi chiedere accesso, rettifica, cancellazione, limitazione o opposizione al trattamento dei dati, oltre
            alla revoca dei consensi marketing. Per esercitare i diritti, contatta GotBun Riccione tramite i canali
            ufficiali del locale.
          </p>
        </article>
      </section>

      <section className="policy-content" aria-label="Condizioni promozione">
        <article>
          <h2>Condizioni della promo</h2>
          <ul>
            <li>Promozione valida da lunedì a giovedì, dalle 18:30 alle 22:30.</li>
            <li>Coupon utilizzabile solo in cassa presso GotBun Riccione, per consumazione sul posto.</li>
            <li>Non serve prenotazione: basta mostrare il QR o il codice scritto prima del pagamento.</li>
            <li>Ogni codice è personale, univoco e utilizzabile una sola volta.</li>
            <li>La promo non è cumulabile con altre offerte, sconti o convenzioni.</li>
            <li>GotBun può sospendere o modificare la promozione in caso di abusi, errori tecnici o necessità operative.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
