function ProductFocus({ prodotto, tornaIndietro, onAggiungi }) {
  
  function gestisciAggiungi() {
    onAggiungi(prodotto); //da fixare
    console.log("aggiungo prodotto");
  }

  return (
    <div className="focus-container">
      <button className="btn-back" onClick={tornaIndietro}>
        ← Torna al catalogo
      </button>

      <div className="focus-card">
        <div className="focus-left">
          {prodotto.imgUrl ? (
            <img src={prodotto.imgUrl} alt={prodotto.nome} className="focus-img" loading="lazy"  />
          ) : (
            <div className="focus-placeholder">📦</div>
          )}
        </div>

        <div className="focus-right">
          <h1 className="focus-title">{prodotto.nome}</h1>
          
          <p className="focus-price">{Number(prodotto.prezzo).toFixed(2)}€</p>
          
          <div className="focus-description-box">
            <h4>Dettagli Prodotto</h4>
            <p>{prodotto.descrizione}</p>
          </div>

          <button className="btn-focus-add" onClick={gestisciAggiungi}>
            Aggiungi al Carrello
          </button>

          <div className="focus-extra-info">
            <p>🚚 Spedizione veloce</p>
            <p>🛡️ Pagamento sicuro</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFocus;