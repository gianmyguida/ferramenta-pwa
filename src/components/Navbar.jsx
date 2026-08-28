import { useState, useEffect } from 'react'; 
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

const Navbar = ({ conteggioCarrello, setPagina, ruolo }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Errore durante il login:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="navbar">
      {/*logo*/}
      <div onClick={() => setPagina('home')} className="navbar-logo">
        <img src="/logo.jpg" alt="Logo" className="navbar-logo-img" />
        <span className="navbar-brand">GUIDA AL FAI DA TE</span>
      </div>

      <div className="navbar-actions">
        {/*pulsante visibile solo per l'admin*/}
        {ruolo === 'admin' && (
          <>
            <button onClick={() => setPagina('venditore')} className="navbar-btn-outline">
              🧰 Area Venditore
            </button>
          </>
        )}

        {/*icona carrello*/}
        <div onClick={() => setPagina('carrello')} className="navbar-cart">
          🛒
          {conteggioCarrello > 0 && (
            <span className="navbar-cart-badge">{conteggioCarrello}</span>
          )}
        </div>

        {user ? (
          <div className="navbar-user">
            <span className="navbar-user-name">
              Ciao, {user.displayName ? user.displayName.split(' ')[0] : 'Utente'}
            </span>
            <button onClick={handleLogout} className="navbar-btn-outline">
              Esci
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="navbar-btn-primary">
            Accedi
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
