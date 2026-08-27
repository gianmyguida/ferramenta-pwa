const ProductCard = ({ prodotto, onAggiungi, onRimuovi, nelCarrello, onFocus }) => {
  function gestisciClickCard() {
    onFocus(prodotto);
  }
  function gestisciAggiungi(e) {
    e.stopPropagation();
    onAggiungi(prodotto);
  }
  function gestisciRimuovi(e) {
    e.stopPropagation();
    onRimuovi(prodotto.id);
  }

  let quantita
  if (nelCarrello !== undefined) {
    quantita = nelCarrello.quantita;
  }
  else{
    quantita = 0
  }
  return (
    <div className="card" onClick={gestisciClickCard}>
      {/*immagine*/}
      <div className="card-img-box">
        {prodotto.imgUrl ? (
          <img src={prodotto.imgUrl} alt={prodotto.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span className="card-img-placeholder">📦</span>
        )}
      </div>

      {/*informazioni prodotto*/}
      <h3>{prodotto.nome}</h3>
      <p className="card-description">
        {prodotto.descrizione}
      </p>
      <p className="card-price">
        {Number(prodotto.prezzo).toFixed(2)}€
      </p>

      {/*sezione controlli*/}
      <div className="card-controls">
        {/*tasto rimuovi*/}
        <button
          onClick={gestisciRimuovi}
          className="btn-rimuovi"
          disabled={quantita === 0}
        >
          -
        </button>

        {/*quantità*/}
        <span className={`card-qty ${quantita > 0 ? 'active' : ''}`}>
          {quantita}
        </span>

        {/*tasto aggiungi*/}
        <button
          onClick={gestisciAggiungi}
          className="btn-aggiungi"
        >
          +
        </button>
      </div>

      {quantita > 0 && (
        <div className="card-in-cart-badge">
          Già nel carrello
        </div>
      )}
    </div>
  );
};

export default ProductCard;
