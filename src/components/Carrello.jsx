import ProductCard from './ProductCard';

const Carrello = ({ carrello, onAggiungi, onRimuovi, onFocus, tornaAllaHome, onAcquista }) => {
  
  async function gestisciClickAcquisto() {
    if (carrello.length === 0) return;
    await onAcquista(); 
  }

  let totale = 0;
  carrello.forEach(item => {
    totale += item.prezzo * (item.quantita || 1);
  });

  return (
    <div className="carrello-page">
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button onClick={tornaAllaHome} style={{ cursor: 'pointer', padding: '10px' }}>
          ← Torna al Catalogo
        </button>
        <h1>Il Tuo Carrello</h1>
      </div>

      {carrello.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Il tuo carrello è deserto... 🏜️</p>
      ) : (
        <>
          <div className="product-grid">
            {carrello.map((item) => (
              <ProductCard 
                key={item.id} 
                prodotto={item} 
                onAggiungi={onAggiungi}
                onRimuovi={onRimuovi}
                nelCarrello={item}
                onFocus= {onFocus} 
              />
            ))}
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            borderTop: '2px solid #ffffff', 
            textAlign: 'right' 
          }}>
            <h2 style = {{color: '#ffffff'}}>Totale: {totale.toFixed(2)}€</h2>
            <button style={{ 
              backgroundColor: '#ffffff', 
              color: '#007bffff', 
              padding: '10px 20px', 
              fontSize: '1.1rem',
              borderRadius: '5px'
            }}
            onClick={gestisciClickAcquisto}>
              Procedi al Pagamento
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrello;