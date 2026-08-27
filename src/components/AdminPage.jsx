import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const AdminPage = ({ mostraAlert, onProdottoCreato, emailUtenteCorrente }) => {
  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);

  const [ordini, setOrdini] = useState([]);
  const [caricamentoOrdini, setCaricamentoOrdini] = useState(true);

  const [utenti, setUtenti] = useState([]);
  const [caricamentoUtenti, setCaricamentoUtenti] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "ordini"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaOrdini = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrdini(listaOrdini);
      setCaricamentoOrdini(false);
    }, (error) => {
      mostraAlert("Errore nel recupero degli ordini!", error);
      setCaricamentoOrdini(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "utenti"), (querySnapshot) => {
      const listaUtenti = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUtenti(listaUtenti);
      setCaricamentoUtenti(false);
    }, (error) => {
      mostraAlert("Errore nel recupero degli utenti!", error);
      setCaricamentoUtenti(false);
    });
    return () => unsubscribe();
  }, []);

  async function gestisciInvioForm(e) {
    e.preventDefault();

    if (!nome || !prezzo || !categoria) {
      mostraAlert("❌ Nome, prezzo e categoria sono obbligatori.");
      return;
    }

    setSalvataggioInCorso(true);
    try {
      const nuovoProdotto = {
        nome,
        descrizione,
        prezzo: Number(prezzo),
        categoria,
        imgUrl
      };

      const docRef = await addDoc(collection(db, "prodotti"), nuovoProdotto);

      if (onProdottoCreato) {
        onProdottoCreato({ id: docRef.id, ...nuovoProdotto });
      }

      mostraAlert("✅ Prodotto \""+ nome+ "\" aggiunto al catalogo!");

      setNome('');
      setDescrizione('');
      setPrezzo('');
      setCategoria('');
      setImgUrl('');
    } catch (error) {
      mostraAlert("❌ Errore nell'aggiunta del prodotto!", error);
    } finally {
      setSalvataggioInCorso(false);
    }
  }

  async function cambiaRuolo(emailUtente, ruoloAttuale) {
    const nuovoRuolo = ruoloAttuale === 'admin' ? 'cliente' : 'admin';

    if (emailUtente === emailUtenteCorrente && nuovoRuolo === 'cliente') {
      const conferma = window.confirm(
        "Stai per toglierti i permessi di admin. Non vedrai più questa pagina fino a un nuovo intervento manuale su Firestore. Continuare?"
      );
      if (!conferma) return;
    }

    try {
      await updateDoc(doc(db, "utenti", emailUtente), { ruolo: nuovoRuolo });
      mostraAlert(`✅ ${emailUtente} ora è "${nuovoRuolo}".`);
    } catch (error) {
      mostraAlert("❌ Errore nell'aggiornamento del ruolo!", error);
    }
  }

  const totaleIncassato = ordini.reduce((somma, ordine) => somma + (ordine.totale || 0), 0);

  return (
    <div className="focus-container">
      <h1>Area Venditore</h1>

      {/*Gestione utenti (sinistra) + Aggiungi prodotto (destra)*/}
      <div className="admin-row">

        {/* GESTIONE UTENTI */}
        <section className="admin-card">
          <h2>Gestione utenti ({utenti.length})</h2>

          {caricamentoUtenti ? (
            <p className="text-muted">Caricamento utenti...</p>
          ) : utenti.length === 0 ? (
            <p className="text-muted">Nessun utente registrato.</p>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Ruolo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {utenti.map((utente) => (
                    <tr key={utente.id}>
                      <td>
                        {utente.email || utente.id}
                        {utente.id === emailUtenteCorrente && (
                          <span className="badge-you"> (tu)</span>
                        )}
                      </td>
                      <td>
                        <span className={utente.ruolo === 'admin' ? 'badge-admin' : 'badge-cliente'}>
                          {utente.ruolo || 'cliente'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => cambiaRuolo(utente.id, utente.ruolo)}
                          className={utente.ruolo === 'admin' ? 'btn-admin-danger' : 'btn-admin-secondary'}
                        >
                          {utente.ruolo === 'admin' ? 'Rendi cliente' : 'Rendi admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FORM NUOVO PRODOTTO */}
        <section className="admin-card">
          <h2>Aggiungi nuovo prodotto</h2>
          <form onSubmit={gestisciInvioForm} className="admin-form">
            <input
              className="admin-input"
              type="text"
              placeholder="Nome prodotto *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <textarea
              className="admin-input"
              style={{ resize: 'vertical' }}
              placeholder="Descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={3}
            />
            <input
              className="admin-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Prezzo (€) *"
              value={prezzo}
              onChange={(e) => setPrezzo(e.target.value)}
              required
            />
            <input
              className="admin-input"
              type="text"
              placeholder="Categoria *"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            />
            <input
              className="admin-input"
              type="text"
              placeholder="URL immagine (opzionale)"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
            />
            <button type="submit" disabled={salvataggioInCorso} className="btn-admin-primary">
              {salvataggioInCorso ? 'Salvataggio...' : 'Aggiungi prodotto'}
            </button>
          </form>
        </section>
      </div>

      {/*storico vendite*/}
      <section className="admin-card-full">
        <h2>
          Vendite ({ordini.length} ordini — totale {totaleIncassato.toFixed(2)}€)
        </h2>

        {caricamentoOrdini ? (
          <p className="text-muted">Caricamento ordini...</p>
        ) : ordini.length === 0 ? (
          <p className="text-muted">Nessun ordine ancora registrato.</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Prodotti</th>
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {ordini.map((ordine) => (
                  <tr key={ordine.id}>
                    <td>
                      {ordine.data && ordine.data.toDate
                        ? ordine.data.toDate().toLocaleString('it-IT')
                        : '—'}
                    </td>
                    <td>{ordine.email}</td>
                    <td>
                      {(ordine.items || []).length > 0
                        ? ordine.items.map(item => `${item.nome} x${item.quantita}`).join(', ')
                        : '—'}
                    </td>
                    <td className="totale">
                      {Number(ordine.totale).toFixed(2)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
