const ProductCard = ({ prodotto, onAggiungi, onRimuovi, nelCarrello, onFocus }) => {
  function gestisciClickCard() {
    //console.log("Cliccata la card intera!"); // Debug: guarda la console (F12)
    onFocus(prodotto);
  }
  function gestisciAggiungi(e) {
    e.stopPropagation(); 
    //console.log("Cliccato solo il tasto +"); 
    onAggiungi(prodotto);
  }
  function gestisciRimuovi(e) {
    e.stopPropagation(); 
    //console.log("Cliccato solo il tasto -");
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
    <div className="card" onClick={gestisciClickCard} style={{ cursor: 'pointer' }}>
      {/* Immagine*/}
      <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        {prodotto.imgUrl ? (
          <img src={prodotto.imgUrl} alt={prodotto.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '3rem' }}>📦</span>
        )}
      </div>

      {/*Informazioni Prodotto*/}
      <h3>{prodotto.nome}</h3>
      <p style={{ color: '#444', fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>
        {prodotto.descrizione}
      </p>
      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0d47a1', margin: '10px 0' }}>
        {Number(prodotto.prezzo).toFixed(2)}€
      </p>
      
      {/*SEZIONE CONTROLLI*/}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '15px', 
        backgroundColor: '#f8f9fa', 
        padding: '10px', 
        borderRadius: '8px' 
      }}>
        {/*Tasto Rimuovi*/}
        <button 
          onClick={gestisciRimuovi} 
          className="btn-rimuovi"
          style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          disabled={quantita === 0} 
        >
          -
        </button>

        {/*Quantità*/}
        <span style={{ 
          minWidth: '20px', 
          textAlign: 'center', 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          color: quantita > 0 ? '#2e7d32' : '#999' 
        }}>
          {quantita}
        </span>

        {/*Tasto Aggiungi*/}
        <button 
          onClick={gestisciAggiungi}
          className="btn-aggiungi"
          style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          +
        </button>
      </div>

      {quantita > 0 && (
        <div style={{ fontSize: '0.75rem', color: '#2e7d32', marginTop: '5px', fontWeight: '500' }}>
          Già nel carrello
        </div>
      )}
    </div>
  );
};

export default ProductCard;