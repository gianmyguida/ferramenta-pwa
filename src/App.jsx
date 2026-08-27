import { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { collection, getDocs, doc, getDoc, setDoc, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'; // Funzioni per leggere i dati dal db
import { loadStripe } from '@stripe/stripe-js';


//IMPORTO COMPONENTI
import Carrello from './components/Carrello';
import Navbar from './components/Navbar'; 
import ProductCard from './components/ProductCard'; 
import ProductFocus from './components/ProductFocus';
import Catalogo from './components/catalogo';
import OfflinePlaceholder from './components/OfflinePlaceholder'; 
import AdminPage from './components/AdminPage'; 
import './App.css';

//INIZIO IL CARICAMENTO DELL'API DI STRIPE
const stripePromise = loadStripe('pk_test_51TBIqPKeG5HP76xbXwBdcX4DPbf6dJdTUjG13ZtoaIzEMg4Ap5s5b5ajSDTq8ILvceLuEeyrbxG83HKQHrXE5dWk00K5Z1X1jt');

// Chiave pubblica VAPID per le notifiche push
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
// Converte la chiave VAPID (base64 url-safe) nel formato richiesto da pushManager.subscribe
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


function App() {
  const [prodotti, setProdotti] = useState([]); //Stato iniziale: lista vuota
  const [loading, setLoading] = useState(true); //Stato per il caricamento
  const [carrello, setCarrello] = useState([]); //Stato per gli elementi nel carrello
  const [user, setUser] = useState(null); //Stato per l'utente loggato
  const [paginaAttiva, setPaginaAttiva] = useState('home'); //Stato per cambiare pagina
  const [prodottoFocus, setProdottoFocus] = useState(null); //Stato per def il focus sul prodotto
  const [messaggio, setMessaggio] = useState(''); //Stato per notificare un messaggio all'utente
  const [isOffline, setIsOffline] = useState(!navigator.onLine);  //Stato per placeholder offline
  const [ruolo, setRuolo] = useState('cliente'); //ruolo utente letto da Firestore ("cliente" o "admin")

  useEffect(() => {
      const vaiOnline = () => setIsOffline(false);
      const vaiOffline = () => setIsOffline(true);
  
      window.addEventListener('online', vaiOnline);
      window.addEventListener('offline', vaiOffline);
  
      return () => {
        window.removeEventListener('online', vaiOnline);
        window.removeEventListener('offline', vaiOffline);
      };
  }, []);

  //PAGAMENTO CON SUCCESSO
  useEffect(function() {
    //stripe inserisce nell'url la chiave 'success' se l'acquisto è andato a buon fine
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('success') === 'true' && user) {
        finalizzaAcquisto();
    }
  }, [user]); 

  //LOG UTENTE
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if(currentUser){
        try{
          const utenteRef= doc(db, "utenti", currentUser.email);
          const utenteSnap = await getDoc(utenteRef);

          if (utenteSnap.exists()) {
            // Utente già presente: leggiamo il suo ruolo così com'è (es. "admin" per te)
            setRuolo(utenteSnap.data().ruolo || 'cliente');
          } else {
            // Primo accesso in assoluto: creiamo il documento con ruolo di default "cliente"
            await setDoc(utenteRef, {
              ruolo: 'cliente',
            });
            setRuolo('cliente');
          }
        }catch(error){
          mostraAlert("Errore nel recupero del profilo utente!", error);
        }
      } else {
        setRuolo('cliente');
      }
    });
    return () => unsubscribe();
  }, []);

  //GET PRODOTTI DAL DATABASE
  useEffect(() => {
    const fetchProdotti = async () => {
      try {
        //attendo in modo asincrono di ottenere i dati dal db in cloud
        const querySnapshot = await getDocs(collection(db, "prodotti"));
        //trasformo l'oggetto in una lista(che è quella che poi utilizzo)
        const listaProdotti = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProdotti(listaProdotti);
        setLoading(false);
      } catch (error) {
        mostraAlert("Errore nel recupero prodotti!", error);
        setLoading(false);
      }
    };

    fetchProdotti();
  }, []);

  //SINCRONIZZA CARRELLO UTENTE DAL DATABASE
  useEffect(() => {
    if (user) {
      //salvo il riferimento al documento della collezione carrelli con "chiave primaria" l'id dell'utente
      const docRef = doc(db, "carrelli", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          //se esiste il carrello (e non è vuoto) riferito all'utente aggiorno lo UseState
          setCarrello(docSnap.data().items || []);
        } else {
          setCarrello([]);
        }
      });
      //uso unsubscribe() ovvero la chiusura del canale quando smonto il componente
      //per evitare di mantenere aperti più canali contemporanemante
      return () => unsubscribe();
    } else {
      setCarrello([]); 
    }
  }, [user]);


  function apriFocus(prodotto){
    setProdottoFocus(prodotto);
    setPaginaAttiva('focus');   //è utile x il rendering condizionale delle pagine
  };

  //aggiunge il prodotto appena creato dal venditore allo stato locale,
  //così il catalogo si aggiorna subito senza bisogno di ricaricare la pagina
  function aggiungiProdottoAlCatalogo(nuovoProdotto) {
    setProdotti(prev => [...prev, nuovoProdotto]);
  }

  function mostraAlert(testo, err= "") {
    console.log(testo+ " " + err)
    setMessaggio(testo);
    setTimeout(function() {
      setMessaggio('');
    }, 3000);
  }

  async function acquista() {
    try {
      //faccio una chiamata fetch(HTTP) al server Node
      const response = await fetch('http://localhost:4242/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //invio come corpo del messaggio HTTP tutto il mio carrello
        body: JSON.stringify({ carrello: carrello }),
      });

      //traduco in json l'oggetto restituito dalla POST
      const session = await response.json();

      if (session.url) {
        //se non ci sono stati problemi, reindirizzo l'utente sull'URL della pagine di pagamento di Stripe
        window.location.href = session.url;
      } else {
        mostraAlert("❌ Errore nella creazione della sessione di pagamento.");
      }
    } catch (error) {
      mostraAlert("❌ Errore durante il pagamento.", error);
    }
  }

  //sottoscrivo l'utente alle notifiche push e invio le notifiche programmate dal server
  async function avviaNotifichePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Le notifiche push non sono supportate su questo browser/dispositivo.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      let permesso = Notification.permission;
      if (permesso === 'default') {
        permesso = await Notification.requestPermission();
      }
      if (permesso !== 'granted') return;

      // Riusa una subscription già esistente, altrimenti ne crea una nuova
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await fetch('http://localhost:4242/simula-spedizione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
    } catch (error) {
      console.error('Errore avvio notifiche push di test:', error);
    }
  }

  async function finalizzaAcquisto() {
    try {
        //salvo il riferimento al documento della collezione carrelli con "chiave primaria" l'id dell'utente
        const carrelloRef = doc(db, "carrelli", user.uid);

        const carrelloSnap = await getDoc(carrelloRef);
        const itemsAcquistati = carrelloSnap.exists() ? (carrelloSnap.data().items || []) : [];

        //Calcolo il totale dell'ordine a partire dai dati appena letti
        const totaleOrdine = itemsAcquistati.reduce(
          (somma, item) => somma + item.prezzo * item.quantita,
          0
        );

        await addDoc(collection(db, "ordini"), {
          uid: user.uid,
          email: user.email,
          items: itemsAcquistati,
          totale: totaleOrdine,
          data: serverTimestamp()
        });

        //svuoto il carrello ad acquisto concluso
        await setDoc(carrelloRef, { items: [] });
        //pulisco l'URL del sito (tolgo il ?success=true che stripe mi aveva inserito x far
        //capire di aver terminato il pagamento con successo)
        window.history.replaceState({}, document.title, "/");

        mostraAlert("💰 Pagamento confermato! Il tuo ordine è in preparazione.");
        avviaNotifichePush();
        setPaginaAttiva('home');
    } catch (error) {
      mostraAlert("❌ Errore nel reset del carrello", error);
    }
  } 


  //FUNZIONE PER AGGIUNGERE PROD AL CARRELLO
 const aggiungiAlCarrello = async (prodotto) => {
    if (user === null) {
      mostraAlert("Devi accedere per aggiungere prodotti!");
      return;
    }
    //creo una copia del carrello(non posso cambiare direttamente lo stato)
    let nuovoCarrello = [...carrello];

    const indice = nuovoCarrello.findIndex(item => item.id === prodotto.id);
    const nomeProdotto = prodotto.nome; 

    if (indice !== -1) {
      nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita + 1;
    } else {
      //se il prodotto non è nel carrello, creo un oggetto formato dai dati del prodotto 
      //con l'aggiunta della quantità(=1) e successivamente lo inserisco nel carrello 
      const prodottoConQuantita = { ...prodotto, quantita: 1 };
      nuovoCarrello.push(prodottoConQuantita);
    }

    try {
      const carrelloRef = doc(db, "carrelli", user.uid);
      //sovrascrivo sul Firebase i dati del nuovo carrello dello specifico utente
      await setDoc(carrelloRef, { items: nuovoCarrello });
      mostraAlert("✅ " + nomeProdotto + " aggiunto al carrello!");
    } catch (error) {
      mostraAlert("❌ Errore nell'aggiunta al carrello!", error);
    }
  };

  const rimuoviDalCarrello = async (idProdotto) => {
    //creo una copia del carrello(non posso cambiare direttamente lo stato)
    let nuovoCarrello = [...carrello];
    const indice = nuovoCarrello.findIndex(item => item.id === idProdotto);

    if (indice !== -1) {
      const nomeProdotto = nuovoCarrello[indice].nome; 

      if (nuovoCarrello[indice].quantita > 1) {
        nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita - 1;
      } else {
        //elimino dal carrello un elemento (quello con indice specificato)
        nuovoCarrello.splice(indice, 1);
      }

      try {
        const carrelloRef = doc(db, "carrelli", user.uid);
        //sovrascrivo sul Firebase i dati del nuovo carrello dello specifico utente
        await setDoc(carrelloRef, { items: nuovoCarrello });
        mostraAlert("🗑️ " + nomeProdotto + " rimosso dal carrello.");
      } catch (error) {
        mostraAlert("Errore nel salvataggio!", error);
      }
    }
  };

  if(isOffline){
      return (
        <div>
          <Navbar 
            conteggioCarrello={carrello.length} 
            setPagina={setPaginaAttiva} 
            ruolo={ruolo}
          />
          <OfflinePlaceholder />
        </div>
      );
  }
  
  return (
    <div>
      <Navbar 
        conteggioCarrello={carrello.length} 
        setPagina={setPaginaAttiva} 
        ruolo={ruolo}
      /> 
      {messaggio && (
        <div className="custom-alert">
          {messaggio}
        </div>
      )}      
      <main className="container">
        {paginaAttiva === 'home' && (
          <Catalogo prodotti={prodotti} onAggiungi={aggiungiAlCarrello} onRimuovi={rimuoviDalCarrello} carrello={carrello} onFocus={apriFocus} />
        )}
        {paginaAttiva === 'carrello' && (
          <Carrello carrello={carrello} onAggiungi={aggiungiAlCarrello} onRimuovi={rimuoviDalCarrello} onFocus={apriFocus} tornaAllaHome={() => setPaginaAttiva('home')} onAcquista={acquista} />
        )}
        {paginaAttiva === 'focus' && (
          <ProductFocus prodotto={prodottoFocus} carrello={carrello} tornaIndietro={() => setPaginaAttiva('home')} onAggiungi={aggiungiAlCarrello} />
        )}
        {paginaAttiva === 'venditore' && ruolo === 'admin' && (
          <AdminPage
            mostraAlert={mostraAlert}
            onProdottoCreato={aggiungiProdottoAlCatalogo}
            emailUtenteCorrente={user ? user.email : null}
          />
        )}
      </main>
    </div>
  );
}

export default App;