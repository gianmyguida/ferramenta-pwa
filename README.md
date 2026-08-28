# Ferramenta PWA — Guida al Fai da Te

E-commerce PWA per la vendita di articoli da ferramenta, sviluppato con React (frontend) e Node.js/Express (backend), Firebase (autenticazione + database) e Stripe (pagamenti).

## Funzionalità

- **Frontend**: React + Vite, PWA con Service Worker custom (offline fallback, notifiche push)
- **Backend**: Node.js + Express (gestione sessioni di pagamento Stripe e invio notifiche push)
- **Database**: Firebase Firestore
- **Autenticazione**: Firebase Auth (login Google)
- **Pagamenti**: Stripe Checkout
- **Notifiche**: Web Push (VAPID)

Il progetto è organizzato come **monorepo**: frontend nella root, backend nella sottocartella `src/backend/`.

## Configurazione

1. Clonare il repository
2. Incollare il file `.env` allegato nella mail, nella **root** del progetto (stessa cartella di `package.json`).

## Avvio del progetto

**Prima esecuzione** (installazione dipendenze del progetto; creazione build; avvio di frontend+backend):

```bash
npm run start:full
```

**Esecuzioni successive** (avvio rapido):

```bash
npm start
```

L'app sarà disponibile su `http://localhost:4173`, con il backend in ascolto sulla porta `4242`.

## Credenziali di test

Il login avviene tramite **Google OAuth**: è sufficiente accedere con un qualsiasi account Google per usare l'app come cliente (catalogo, carrello, acquisto).

Per testare l'**Area Venditore** (gestione prodotti, storico vendite, gestione ruoli utente) è necessario il ruolo `admin`, assegnato manualmente su Firestore(o nel pannello admin). Per testare questa funzione, vi ho allegato nella mail, una mail provvisoria con un account admin.

## Funzionalità principali

- Catalogo prodotti con ricerca e filtro per categoria
- Carrello persistente per utente (Firestore)
- Pagamento tramite API Stripe Checkout
- Autenticazione Google
- PWA installabile, con pagina di fallback offline
- Notifiche push sugli aggiornamenti dell'ordine (post acquisto)
- Area venditore: aggiunta prodotti, storico vendite, gestione ruoli utenti

## Note

- Il pagamento è configurato in modalità test di Stripe. Per i test si può usare il numero carta `4242 4242 4242 4242`, data di scadenza futura e CVC a piacere.
