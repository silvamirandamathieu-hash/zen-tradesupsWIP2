import React, { useState, useEffect } from 'react';
import { deleteCurrentTradeUp, updateCurrentTradeUp, updateSavedTradeUp, updateTradeUpNote } from '../db';

function TradeUpCard({ trade, onDelete, onEdit, isSaved, id }) {
  const [urlInput, setUrlInput] = useState('');
  const [localUrls, setLocalUrls] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(trade.note || '');

  useEffect(() => {
    setNote(trade.note || '');
  }, [trade]);

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
  const generateMarketLink = (skinName, skinWear) => {
    const encodedName = encodeURIComponent(skinName);
    const encodedWear = encodeURIComponent(skinWear ?? '');
    return `https://market.csgo.com/en/?search=${encodedName}&quality=${encodedWear}`;
  };


  const handleNoteChange = async (e) => {
    const newNote = e.target.value;
    setNote(newNote);

    const updatedTrade = { ...trade, note: newNote };

    try {
      if (isSaved) {
        await updateSavedTradeUp(id, updatedTrade);
      } else {
        await updateCurrentTradeUp(id, updatedTrade);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note :', err);
      alert('❌ Impossible d’enregistrer la note');
    }
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
      border: '1px solid #4b4b6b',
      padding: '1.5rem',
      marginBottom: '2rem',
      borderRadius: '12px',
      background: 'rgba(48, 45, 86, 0.85)',
      backdropFilter: 'blur(6px)',
      color: '#f0f0f0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s ease',
    }}>
      {/* 🗑️ Bouton Supprimer */}
      <button
        onClick={() => setConfirmDelete(true)}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'transparent',
          border: 'none',
          color: '#ff4d4d',
          fontSize: '1.4rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
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
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '12px',
          zIndex: 10,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <p style={{ fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ Êtes-vous sûr de vouloir supprimer ce trade-up ?
          </p>
          <div>
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#ff4d4d',
                border: 'none',
                padding: '0.6rem 1.2rem',
                marginRight: '1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                backgroundColor: '#555',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Non
            </button>
          </div>
        </div>
      )}

      {/* 📋 Contenu principal */}
      <h3 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#ffd369',
        marginBottom: '0.5rem',
        textShadow: '0 0 6px #ffd36988'
      }}>
        🎯 {name} {isStatTrak ? 'StatTrak™' : ''}
      </h3>

      <p><strong>📅 Date :</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>🎯 Résultat :</strong> {resultSkin?.name ?? '—'}</p>
      <div style={{ marginTop: '1.5rem' }}>
        <label htmlFor="note" style={{
          display: 'block',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          📝 Note personnelle :
        </label>

        <textarea
          id="note"
          value={note}
          onChange={handleNoteChange}
          placeholder="Notes..."
          style={{
            width: '97%',
            minHeight: '100px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #5348b7ff',
            resize: 'vertical',
            backgroundColor: '#2a2546ff',
            color: '#82c2f2ff',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            boxShadow: 'inset 0 0 5px rgba(255, 0, 0, 0.2)',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ff4d4d';
            e.target.style.boxShadow = '0 0 8px rgba(255, 77, 77, 0.6)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#8948a1ff';
            e.target.style.boxShadow = 'inset 0 0 5px rgba(255, 0, 0, 0.2)';
          }}
        />
      </div>



      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <p style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#a0a8e5',
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

      {/* 💰 Infos financières */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.75rem',
        marginTop: '1rem',
      }}>
        {[{
          label: 'Coût du trade-up',
          value: `${totalInputPrice} €`
        }, {
          label: 'Valeur moy. sortie',
          value: `${avgOutputValue} €`
        }, {
          label: '💸 Profit moy/trade',
          value: `${profit} €`
        }].map(({ label, value }, i) => (
          <p key={i} style={{
            backgroundColor: '#2c2c44',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#9fd3ff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            {label} : <span style={{ color: '#fff' }}>{value}</span>
          </p>
        ))}
      </div>

      {/* 📈 Rentabilité */}
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
        📈 Rentabilité : {profitability >= 0 ? '+' : ''}{amplified.toFixed(0)}%
        {amplified >= 180 && ' 🔥'}
        {amplified <= 70 && ' 🧊'}
      </p>

      {/* 🧪 Float */}
      <p style={{
        backgroundColor: '#1e1e2f',
        padding: '0.6rem 1rem',
        borderRadius: '6px',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#a0a8e5',
        fontFamily: 'monospace',
        border: '1px solid #3a3a5a',
        marginTop: '1rem',
        textAlign: 'center',
      }}>
        🧪 Float moyen : {averageFloat.toFixed(4)}
      </p>

      {/* 🔗 Liens enregistrés */}
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
                    wordBreak: 'break-word',
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
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => onEdit(trade)}
            style={{
              backgroundColor: '#6c63ff',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 0 8px rgba(108,99,255,0.4)',
              transition: 'background 0.3s ease',
            }}
          >
            🛠 Modifier
          </button>
        </div>
      )}


      <details style={{
        marginTop: '2rem',
        backgroundColor: '#2c2c44',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #3a3a5a',
        boxShadow: '0 0 6px rgba(0,255,213,0.2)',
        color: '#f0f0f0'
      }}>
        <summary style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '1rem',
          color: '#9fd3ff'
        }}>
          📦 Voir les détails des skins
        </summary>

        <div>
          <h4 style={{ color: '#ffd369' }}>🎒 Entrées :</h4>
          {outputs.length > 0 && (
            <>
              {(() => {
                const averageOutputValue = outputs.reduce((sum, skin) => sum + (skin.price || 0), 0) / outputs.length;
                const prixMaxParItem = (averageOutputValue / 1.25) / inputs.length;

                const generateMarketLink = (skinName) => {
                  const encodedName = encodeURIComponent(skinName);
                  const wearTiers = [
                    'Factory New',
                    'Minimal Wear',
                    'Field-Tested',
                    'Well-Worn',
                    'Battle-Scarred'
                  ];
                  const qualityParams = wearTiers.map(wear => `quality=${encodeURIComponent(wear)}`).join('&');
                  return `https://market.csgo.com/en/?search=${encodedName}&${qualityParams}`;
                };

                return (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {inputs.map((skin, i) => {
                      const prixActuel = skin.price ?? 0;
                      const estTropCher = prixActuel > prixMaxParItem;
                      const marketLink = generateMarketLink(skin.name, skin.wear);

                      return (
                        <li key={i} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <span>
                              {skin.name} — Float: {skin.float ?? 'N/A'} — Prix mis à jour:{" "}
                              <span style={{ color: estTropCher ? '#ff4d4d' : '#4dff88' }}>
                                {prixActuel.toFixed(2)} €
                              </span>{" "}
                              — Max avg. : {prixMaxParItem.toFixed(2)} €
                            </span>
                            <a
                              href={marketLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: '#222831',
                                color: '#ffd369',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                width: 'fit-content',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#393e46'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#222831'}
                            >
                              🔍 Voir sur Market
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </>
          )}

          <h4 style={{ color: '#ffd369', marginTop: '1rem' }}>🎁 Sorties :</h4>
          <ul style={{ paddingLeft: '1rem' }}>
            {outputs
              .filter(skin => skin && skin.name)
              .map((skin, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>
                  {skin.name} — Chance: {skin.chance}% — Valeur mise à jour: {skin.price?.toFixed(2) ?? '—'} €
                </li>
              ))
            }
          </ul>
        </div>

        <label style={{ display: 'block', marginTop: '1.5rem' }}>
          🔗 Ajouter une URL :
          <input
            type="url"
            name="url"
            value={urlInput}
            onChange={handleUrlChange}
            onKeyDown={handleUrlSubmit}
            placeholder="https://exemple.com/trade-up"
            style={{
              width: '100%',
              padding: '0.6rem',
              marginTop: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #6c63ff',
              backgroundColor: '#1e1e2f',
              color: '#fff'
            }}
          />
          <small style={{ color: '#ccc' }}>Appuie sur Entrée pour enregistrer</small>
        </label>
      </details>

    </div>
  );
}

export default TradeUpCard;
