import React, { useState } from 'react';
import ProductCard from './ProductCard';

function Catalogo({ prodotti, onAggiungi, onRimuovi, carrello, onFocus }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState('Tutti');
  const [ricerca, setRicerca] = useState('');

  const categorie = ['Tutti', ...new Set(prodotti.map(p => p.categoria))];

  function aggiornaRicerca(evento) {
    setRicerca(evento.target.value);
  }

  //Filtraggio dei prodotti in base alla scelta
  const prodottiDaMostrare = prodotti.filter(function(p) {
    const matchCategoria = categoriaAttiva === 'Tutti' || p.categoria === categoriaAttiva;
    const matchNome = p.nome.toLowerCase().includes(ricerca.toLowerCase());
    return matchCategoria && matchNome;
  });

  return (
    <div className="catalogo-layout">
      {/* SIDEBAR SINISTRA */}
      <aside className="sidebar">
        <h3>Categorie</h3>
        <ul>
          {categorie.map(cat => (
            <li 
              key={cat} 
              className={categoriaAttiva === cat ? 'active' : ''}
              onClick={() => setCategoriaAttiva(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </aside>

      {/* GRIGLIA PRODOTTI DESTRA */}
      <section className="main-content">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cerca un prodotto..." 
            value={ricerca} 
            onChange={aggiornaRicerca} 
          />
        </div>
        <h1 className="catalogo-titolo">{categoriaAttiva}</h1>
        <div className="product-grid">
          {prodottiDaMostrare.map((item) => (
            <ProductCard key={item.id} prodotto={item} onAggiungi={onAggiungi} onRimuovi={onRimuovi} nelCarrello={carrello.find(c => c.id === item.id)} onFocus={onFocus} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;