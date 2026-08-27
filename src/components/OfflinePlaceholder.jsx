function OfflinePlaceholder() {
  return (
    <div className="offline-page">
      <div className="offline-card">
        <img
          src="/offline.png"
          alt="Dispositivo offline"
          className="offline-img"
          onError={(e) => {
            e.target.style.display = 'none';
            document.getElementById('backup-emoji-react').style.display = 'block';
          }}
        />
        <div id="backup-emoji-react" className="offline-emoji">🔌</div>
        <h1 className="offline-title">Sei offline</h1>
        <p className="offline-text">
          La connessione internet non è disponibile. Controlla la tua rete per continuare a sfogliare il catalogo della ferramenta.
        </p>
        <button className="btn-offline-retry" onClick={() => window.location.reload()}>
          Riprova
        </button>
      </div>
    </div>
  );
}

export default OfflinePlaceholder;
