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
      <div className="carrello-header">
        <button onClick={tornaAllaHome}>
          ← Torna al Catalogo
        </button>
        <h1>Il Tuo Carrello</h1>
      </div>

      {carrello.length === 0 ? (
        <p className="empty-cart-text">Il tuo carrello è deserto...</p>
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
                onFocus={onFocus}
              />
            ))}
          </div>

          <div className="carrello-summary">
            <h2>Totale: {totale.toFixed(2)}€</h2>
            <button className="btn-checkout" onClick={gestisciClickAcquisto}>
              Procedi al Pagamento
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrello;
