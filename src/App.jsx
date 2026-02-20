import { prodotti } from './magazzino'
import './App.css' // Teniamo il CSS per ora per non avere tutto disordinato

function App() {
  return (
    <div className="container">
      <h1>🛠️ Ferramenta PWA</h1>
      <p>Catalogo Prodotti</p>
      
      <div className="product-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {prodotti.map((item) => (
          <div key={item.id} className="card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', width: '250px' }}>
            <img src={item.immagine} alt={item.nome} style={{ width: '100%', borderRadius: '5px' }} />
            <h3>{item.nome}</h3>
            <p>{item.descrizione}</p>
            <p><strong>Prezzo: {item.prezzo}€</strong></p>
            <p>Disponibili: {item.magazzino}</p>
            <button>Aggiungi al carrello</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App