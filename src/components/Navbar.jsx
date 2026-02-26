import { useState, useEffect } from 'react'; 
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

const Navbar = ({ conteggioCarrello, setPagina }) => {
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
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0 20px', 
      backgroundColor: '#ffffff', 
      color: '#007bff', 
      height: '60px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
      position: 'sticky', 
      top: 0,
      zIndex: 1000
    }}>
      {/*LOGO*/}
      <div 
        onClick={() => setPagina('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '1.5rem' }}>🛠️</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
          GUIDA AL FAI DA TE
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        
        {/* ICONA CARRELLO*/}
        <div 
          onClick={() => setPagina('carrello')} 
          style={{ position: 'relative', cursor: 'pointer', fontSize: '1.4rem' }}
        >
          🛒
          {conteggioCarrello > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              backgroundColor: '#ff4757',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {conteggioCarrello}
            </span>
          )}
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#333', fontWeight: '500' }}>
              Ciao, {user.displayName ? user.displayName.split(' ')[0] : 'Utente'}
            </span>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: 'transparent', 
                color: '#007bff', 
                border: '1px solid #007bff', 
                padding: '8px 15px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Esci
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Accedi
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;