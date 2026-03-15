import { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore'; // Funzioni per leggere i dati
import { loadStripe } from '@stripe/stripe-js';

import Carrello from './components/Carrello';
import Navbar from './components/Navbar'; 
import ProductCard from './components/ProductCard'; 
import ProductFocus from './components/ProductFocus';
import Catalogo from './components/catalogo';
import './App.css';

const stripePromise = loadStripe('pk_test_51TBIqPKeG5HP76xbXwBdcX4DPbf6dJdTUjG13ZtoaIzEMg4Ap5s5b5ajSDTq8ILvceLuEeyrbxG83HKQHrXE5dWk00K5Z1X1jt');

function App() {
  const [prodotti, setProdotti] = useState([]); // Stato iniziale: lista vuota
  const [loading, setLoading] = useState(true); // Stato per il caricamento
  const [carrello, setCarrello] = useState([]); // Stato per gli elementi nel carrello
  const [user, setUser] = useState(null); // Stato per l'utente loggato
  const [paginaAttiva, setPaginaAttiva] = useState('home'); // Stato per cambiare pagina
  const [prodottoFocus, setProdottoFocus] = useState(null); // Stato per def il focus sul prodotto
  const [messaggio, setMessaggio] = useState(''); //Stato per notificare un messaggio all'utente

  //PAGAMENTO CON SUCCESSO
  useEffect(function() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('success') === 'true' && user) {
        finalizzaAcquisto();
    }
  }, [user]);

  //LOG UTENTE
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  //GET PRODOTTI DAL DATABASE
  useEffect(() => {
    const fetchProdotti = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "prodotti"));
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
      const docRef = doc(db, "carrelli", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setCarrello(docSnap.data().items || []);
        } else {
          setCarrello([]);
        }
      });
      return () => unsubscribe();
    } else {
      setCarrello([]); 
    }
  }, [user]);


  function apriFocus(prodotto){
    setProdottoFocus(prodotto);
    setPaginaAttiva('focus'); 
  };

  function mostraAlert(testo, err= "") {
    console.log(testo+ " " + err)
    setMessaggio(testo);
    setTimeout(function() {
      setMessaggio('');
    }, 3000);
  }

  async function acquista() {
    try {
      const response = await fetch('http://localhost:4242/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrello: carrello }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        mostraAlert("❌ Errore nella creazione della sessione di pagamento.");
      }
    } catch (error) {
      mostraAlert("❌ Errore durante il pagamento.", error);
    }
  }

  async function finalizzaAcquisto() {
    try {
        const carrelloRef = doc(db, "carrelli", user.uid);
        await setDoc(carrelloRef, { items: [] });
        window.history.replaceState({}, document.title, "/");

        mostraAlert("💰 Pagamento confermato! Il tuo ordine è in preparazione.");
        setPaginaAttiva('home');
    } catch (error) {
      mostraAlert("Errore nel reset del carrello", error);
    }
  } 


  //FUNZIONE PER AGGIUNGERE PROD AL CARRELLO
 const aggiungiAlCarrello = async (prodotto) => {
    if (user === null) {
      mostraAlert("Devi accedere per aggiungere prodotti!");
      return;
    }
    let nuovoCarrello = [...carrello];

    const indice = nuovoCarrello.findIndex(item => item.id === prodotto.id);
    const nomeDaMostrare = prodotto.nome; 

    if (indice !== -1) {
      nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita + 1;
    } else {
      const prodottoConQuantita = { ...prodotto, quantita: 1 };
      nuovoCarrello.push(prodottoConQuantita);
    }

    try {
      const carrelloRef = doc(db, "carrelli", user.uid);
      await setDoc(carrelloRef, { items: nuovoCarrello });
      
      // Ora usiamo la variabile sicura
      mostraAlert("✅ " + nomeDaMostrare + " aggiunto al carrello!");
    } catch (error) {
      mostraAlert("Errore nel salvataggio!", error);
    }
  };

  const rimuoviDalCarrello = async (idProdotto) => {
    let nuovoCarrello = [...carrello];
    const indice = nuovoCarrello.findIndex(item => item.id === idProdotto);

    if (indice !== -1) {
      const nomeProdotto = nuovoCarrello[indice].nome; 

      if (nuovoCarrello[indice].quantita > 1) {
        nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita - 1;
      } else {
        nuovoCarrello.splice(indice, 1);
      }

      try {
        const carrelloRef = doc(db, "carrelli", user.uid);
        await setDoc(carrelloRef, { items: nuovoCarrello });

        mostraAlert("🗑️ " + nomeProdotto + " rimosso dal carrello.");
      } catch (error) {
        mostraAlert("Errore nel salvataggio!", error);
      }
    }
  };

  return (
    <div>
      <Navbar 
        conteggioCarrello={carrello.length} 
        setPagina={setPaginaAttiva} 
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
          <ProductFocus prodotto={prodottoFocus} tornaIndietro={() => setPaginaAttiva('home')} onAggiungi={aggiungiAlCarrello} />
        )}
      </main>
    </div>
  );
}

export default App;