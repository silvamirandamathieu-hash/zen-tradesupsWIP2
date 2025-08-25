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
  const amplifyProfitability = (realPercent) => {
    return 100 + realPercent;
  };

  const getProfitabilityColor = (profitability) => {
    const clamped = Math.max(-100, Math.min(100, profitability));
    const ratio = (clamped + 100) / 200;
    const red = Math.round(255 * (1 - ratio));
    const green = Math.round(255 * ratio);
    return `rgb(${red}, ${green}, 80)`;
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

  const amplified = amplifyProfitability(profitability ?? 0);
  const profitabilityColor = getProfitabilityColor(profitability ?? 0);


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
        

        <h3 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#ffd369',
          marginBottom: '0.5rem',
        }}>
          🎯 {name} {isStatTrak ? 'StatTrak™' : ''}
        </h3>

        <p style={{ margin: '0.2rem 0', color: '#ccc' }}>
          <strong>📅 Date :</strong> <span style={{ color: '#fff' }}>{new Date(date).toLocaleDateString()}</span>
        </p>
        <p style={{ margin: '0.2rem 0', color: '#ccc' }}>
          <strong>🎯 Résultat :</strong> <span style={{ color: '#fff' }}>{resultSkin?.name ?? '—'}</span>
        </p>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{
            fontSize: '1.6rem',
            fontWeight: 'bold',
            color: '#a0a8e5ff',
            backgroundColor: '#1e1e2f',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            display: 'inline-block',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            {collection}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1rem',
        }}>
          <p style={{
            backgroundColor: '#2c2c44',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#9fd3ff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            Coût du trade-up : <span style={{ color: '#fff' }}>{totalInputPrice} €</span>
          </p>
          <p style={{
            backgroundColor: '#2c2c44',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#9fd3ff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            Valeur moy. sortie : <span style={{ color: '#fff' }}>{avgOutputValue} €</span>
          </p>
          <p style={{
            backgroundColor: '#2c2c44',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#9fd3ff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            💸 Profit moy/trade : <span style={{ color: '#fff' }}>{profit} €</span>
          </p>
        </div>

        <p style={{
          backgroundColor: '#1e1e2f',
          padding: '0.8rem',
          borderRadius: '6px',
          color: profitabilityColor,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 0 8px rgba(255,255,255,0.1)',
          marginTop: '1rem',
        }}>
          📈  Rentabilité : {profitability >= 0 ? '+' : ''}{amplified.toFixed(0)}%
          {amplified >= 180 && ' 🔥'}
          {amplified <= 70 && ' 🧊'}
        </p>

        <p style={{
          backgroundColor: '#1e1e2f',
          padding: '0.6rem 1rem',
          borderRadius: '6px',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#a0a8e5ff',
          fontFamily: 'monospace',
          border: '1px solid #3a3a5a',
          marginTop: '1rem',
          textAlign: 'center',
        }}>
          🧪 Float moyen : {averageFloat.toFixed(4)}
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

            {/* Calcul de la valeur moyenne des sorties */}
            {outputs.length > 0 && (
              <>
                {(() => {
                  const averageOutputValue = outputs.reduce((sum, skin) => sum + (skin.price || 0), 0) / outputs.length;
                  const prixMaxParItem = (averageOutputValue / 1.25) / inputs.length;

                  return (
                    <ul>
                      {inputs.map((skin, i) => {
                        const prixActuel = skin.price ?? 0;
                        const estTropCher = prixActuel > prixMaxParItem;

                        return (
                          <li key={i}>
                            {skin.name} — Float: {skin.float ?? 'N/A'} — Prix mis à jour:{" "}
                            <span style={{ color: estTropCher ? 'red' : 'green' }}>
                              {prixActuel.toFixed(2)} €
                            </span>{" "}
                            —  Max avg. : {prixMaxParItem.toFixed(2)} €
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </>
            )}

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
