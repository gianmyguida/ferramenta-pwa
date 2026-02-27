import { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore'; // Funzioni per leggere i dati

import Carrello from './components/Carrello';
import Navbar from './components/Navbar'; 
import ProductCard from './components/ProductCard'; 
import ProductFocus from './components/ProductFocus';
import Catalogo from './components/catalogo';
import './App.css';

function App() {
  const [prodotti, setProdotti] = useState([]); // Stato iniziale: lista vuota
  const [loading, setLoading] = useState(true); // Stato per il caricamento
  const [carrello, setCarrello] = useState([]); // Stato per gli elementi nel carrello
  const [user, setUser] = useState(null); // Stato per l'utente loggato
  const [paginaAttiva, setPaginaAttiva] = useState('home'); // Stato per cambiare pagina
  const [prodottoFocus, setProdottoFocus] = useState(null); // Stato per def il focus sul prodotto

  const apriFocus = (prodotto) => {
    setProdottoFocus(prodotto);
    setPaginaAttiva('focus'); 
  };

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
        console.error("Errore nel recupero prodotti:", error);
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

  //FUNZIONE PER AGGIUNGERE PROD AL CARRELLO
 const aggiungiAlCarrello = async (prodotto) => {
    if (user === null) {
      alert("Devi accedere per aggiungere prodotti!");
      return;
    }
    let nuovoCarrello = [...carrello];

    //Cerchiamo se il prodotto è già presente nel carrello
    const indice = nuovoCarrello.findIndex(item => item.id === prodotto.id);
    if (indice !== -1) {
      // SE ESISTE: aumentiamo la sua proprietà 'quantita'
      nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita + 1;
    } else {
      // SE NON ESISTE: aggiungiamo il prodotto nuovo e gli diamo quantita 1
      const prodottoConQuantita = { ...prodotto, quantita: 1 };
      nuovoCarrello.push(prodottoConQuantita);
    }

    // Aggiorno il database
    try {
      const carrelloRef = doc(db, "carrelli", user.uid);
      await setDoc(carrelloRef, { items: nuovoCarrello });
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
    }
  };

  //FUNZIONE PER RIMUOVE PROD DAL CARRELLO
  const rimuoviDalCarrello = async (idProdotto) => {
    let nuovoCarrello = [...carrello];
    const indice = nuovoCarrello.findIndex(item => item.id === idProdotto);

    if (indice !== -1) {
      if (nuovoCarrello[indice].quantita > 1) {
        nuovoCarrello[indice].quantita = nuovoCarrello[indice].quantita - 1;
      } else {
        nuovoCarrello.splice(indice, 1);
      }
    }

    // Aggiorno il database
    try {
      const carrelloRef = doc(db, "carrelli", user.uid);
      await setDoc(carrelloRef, { items: nuovoCarrello });
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
    }
  };


  return (
    <div>
      <Navbar 
        conteggioCarrello={carrello.length} 
        setPagina={setPaginaAttiva} 
      /> 
      
      <main className="container">
        {paginaAttiva === 'home' && (
          <Catalogo prodotti={prodotti} onAggiungi={aggiungiAlCarrello} onRimuovi={rimuoviDalCarrello} carrello={carrello} onFocus={apriFocus} />
        )}
        {paginaAttiva === 'carrello' && (
          <Carrello carrello={carrello} onAggiungi={aggiungiAlCarrello} onRimuovi={rimuoviDalCarrello} tornaAllaHome={() => setPaginaAttiva('home')} />
        )}
        {paginaAttiva === 'focus' && (
          <ProductFocus prodotto={prodottoFocus} tornaIndietro={() => setPaginaAttiva('home')} onAggiungi={aggiungiAlCarrello} />
        )}
      </main>
    </div>
  );
}

export default App;