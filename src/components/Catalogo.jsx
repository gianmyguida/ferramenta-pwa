import ProductCard from './ProductCard';
import React, { useState } from 'react';

function Catalogo({ prodotti, onAggiungi, onRimuovi, carrello, onFocus }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState('Tutti');
  const categorie = ['Tutti', ...new Set(prodotti.map(p => p.categoria))];

  // 2. Filtro i prodotti in base alla scelta
  const prodottiDaMostrare = categoriaAttiva === 'Tutti'
    ? prodotti
    : prodotti.filter(p => p.categoria === categoriaAttiva);

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