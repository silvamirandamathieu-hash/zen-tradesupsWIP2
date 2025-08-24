import React, { useState, useEffect } from 'react';
import { deleteCurrentTradeUp, updateCurrentTradeUp, updateSavedTradeUp } from '../db';

function TradeUpCard({ trade, onDelete, onEdit, isSaved, id }) {
  const [urlInput, setUrlInput] = useState('');
  const [localUrls, setLocalUrls] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setLocalUrls(trade.urls || []);
  }, [trade]);

  if (!trade) return null;

  const {
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
    profitability,
  } = trade;

  const handleDelete = async () => {
    await deleteCurrentTradeUp(id);
    alert('🗑️ Supprimé des trade-ups en cours');
    onDelete?.();
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newUrl = urlInput.trim();
      if (!newUrl || localUrls.includes(newUrl) || !isValidUrl(newUrl)) return;

      const updatedUrls = [...localUrls, newUrl];
      const updatedTrade = { ...trade, urls: updatedUrls };

      try {
        if (isSaved) {
          await updateSavedTradeUp(id, updatedTrade);
        } else {
          await updateCurrentTradeUp(id, updatedTrade);
        }
        setLocalUrls(updatedUrls);
        setUrlInput('');
        alert('🔗 URL enregistrée !');
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de l’URL :', err);
        alert('❌ Impossible d’enregistrer l’URL');
      }
    }
  };

  const handleUrlDelete = async (urlToDelete) => {
    const updatedUrls = localUrls.filter(u => u !== urlToDelete);
    const updatedTrade = { ...trade, urls: updatedUrls };

    try {
      if (isSaved) {
        await updateSavedTradeUp(id, updatedTrade);
      } else {
        await updateCurrentTradeUp(id, updatedTrade);
      }
      setLocalUrls(updatedUrls);
      onEdit?.();
    } catch (err) {
      console.error('Erreur lors de la suppression de l’URL :', err);
      alert('❌ Impossible de supprimer l’URL');
    }
  };

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
      {/* 🗑️ Bouton Supprimer */}
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

      {localUrls.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>🔗 Liens enregistrés :</strong>
          <ul style={{ paddingLeft: '1rem' }}>
            {localUrls.map((url, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#3a3660',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.5rem',
                borderRadius: '6px'
              }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#9fd3ff',
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    flexGrow: 1
                  }}
                >
                  {url}
                </a>
                <button
                  onClick={() => handleUrlDelete(url)}
                  style={{
                    marginLeft: '1rem',
                    backgroundColor: '#ff4d4d',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.3rem 0.6rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  title="Supprimer ce lien"
                >
                  🗑️
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
