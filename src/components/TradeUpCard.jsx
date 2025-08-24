import React, { useState, useEffect } from 'react';
import { deleteCurrentTradeUp, updateCurrentTradeUp } from '../db';

function TradeUpCard({ trade, onDelete, onEdit }) {
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState(trade?.urls || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (trade?.urls) {
      setUrls(trade.urls);
    }
  }, [trade]);

  if (!trade) return null;

  const {
    id,
    name,
    collection,
    date,
    resultSkin,
    inputs = [],
    outputs = [],
    isStatTrak = false,
    totalInputPrice,
    avgOutputValue,
    profit,
    profitability
  } = trade;

  const handleDelete = async () => {
    await deleteCurrentTradeUp(id);
    alert('🗑️ Supprimé des trade-ups en cours');
    if (onDelete) onDelete();
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newUrl = urlInput.trim();
      if (!newUrl || urls.includes(newUrl)) return;

      const updatedUrls = [...urls, newUrl];
      try {
        await updateCurrentTradeUp(id, { ...trade, urls: updatedUrls });
        setUrls(updatedUrls);
        setUrlInput('');
        alert('🔗 URL enregistrée !');
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de l’URL :', err);
        alert('❌ Impossible d’enregistrer l’URL');
      }
    }
  };

  const handleUrlDelete = async (urlToDelete) => {
    const updatedUrls = urls.filter(u => u !== urlToDelete);
    try {
      await updateCurrentTradeUp(id, { ...trade, urls: updatedUrls });
      setUrls(updatedUrls);
      if (onEdit) onEdit(); // 🔁 recharge les données
    } catch (err) {
      console.error('Erreur lors de la suppression de l’URL :', err);
      alert('❌ Impossible de supprimer l’URL');
    }
  };

  // 🧪 Float moyen
  const validInputs = inputs.filter(skin => skin && skin.name);
  const averageFloat = validInputs.length > 0
    ? validInputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / validInputs.length
    : 0;

  return (
    <div style={{
      position: 'relative',
      border: '2px solid #241853',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: '#302d56',
      color: '#fff'
    }}>
      {/* 🗑️ Bouton Supprimer en haut à droite */}
      <button
        onClick={() => setConfirmDelete(true)}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: '#ff6b6b',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
        title="Supprimer ce trade-up"
      >
        🗑️
      </button>

      {/* ✅ Confirmation suppression */}
      {confirmDelete && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          zIndex: 10
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠️ Êtes-vous sûr de vouloir supprimer ce trade-up ?</p>
          <div>
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#ff6b6b',
                border: 'none',
                padding: '0.5rem 1rem',
                marginRight: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                backgroundColor: '#444',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              Non
            </button>
          </div>
        </div>
      )}

      {/* 📋 Contenu principal */}
      <h3>🎯 {name} {isStatTrak ? 'StatTrak™' : ''}</h3>
      <p><strong>📦 Collection:</strong> {collection}</p>
      <p><strong>📅 Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>🎯 Résultat:</strong> {resultSkin?.name ?? '—'}</p>

      <p>💰 <strong>Coût total :</strong> {totalInputPrice} €</p>
      <p>📈 <strong>Valeur moyenne de sortie :</strong> {avgOutputValue} €</p>
      <p>💸 <strong>Profit estimé :</strong> {profit} €</p>
      <p style={{ color: profitability >= 0 ? 'limegreen' : 'orangered' }}>
        📊 <strong>Rentabilité :</strong> {profitability}%
      </p>
      <p><strong>🧪 Float moyen:</strong> {averageFloat.toFixed(4)}</p>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#aaa' }}>
        ✅ Prix mis à jour selon le marché
      </p>

      {urls.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>🔗 Liens enregistrés :</strong>
          <ul style={{ paddingLeft: '1rem' }}>
            {urls.map((link, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#90cdf4' }}>
                  {link}
                </a>{' '}
                <button
                  onClick={() => handleUrlDelete(link)}
                  style={{
                    marginLeft: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onEdit && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => onEdit(trade)} style={{ marginRight: '1rem' }}>
            🛠 Modifier
          </button>
        </div>
      )}

      <details style={{ marginTop: '1rem' }}>
        <summary>📦 Voir les détails des skins</summary>
        <div>
          <h4>🎒 Entrées :</h4>
          <ul>
            {inputs.map((skin, i) => (
              <li key={i}>
                {skin.name} — Float: {skin.float ?? 'N/A'} — Prix mis à jour: {skin.price?.toFixed(2) ?? '—'} €
              </li>
            ))}
          </ul>
          <h4>🎁 Sorties :</h4>
          <ul>
            {outputs
              .filter(skin => skin && skin.name)
              .map((skin, i) => (
                <li key={i}>
                  {skin.name} — Chance: {skin.chance}% — Valeur mise à jour: {skin.price?.toFixed(2) ?? '—'} €
                </li>
              ))
            }
          </ul>
        </div>

        <label>
          🔗 Ajouter une URL :
          <input
            type="url"
            name="url"
            value={urlInput}
            onChange={handleUrlChange}
            onKeyDown={handleUrlSubmit}
            placeholder="https://exemple.com/trade-up"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
          <small style={{ color: '#ccc' }}>Appuie sur Entrée pour enregistrer</small>
        </label>
      </details>
    </div>
  );
}

export default TradeUpCard;
