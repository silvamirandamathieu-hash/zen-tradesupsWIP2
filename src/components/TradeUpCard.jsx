import React from 'react';
import { deleteCurrentTradeUp } from '../db';

function TradeUpCard({ trade, priceMap, onDelete, onEdit }) {
  if (!trade) return null;

  const {
    id,
    name,
    collection,
    date,
    resultSkin,
    inputs = [],
    outputs = [],
    isStatTrak = false
  } = trade;

  // 🧪 Float moyen
  const validInputs = inputs.filter(skin => skin && skin.name);
  const averageFloat = validInputs.length > 0
    ? validInputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / validInputs.length
    : 0;

  const handleDelete = async () => {
    await deleteCurrentTradeUp(id);
    alert('🗑️ Supprimé des trade-ups en cours');
    if (onDelete) onDelete();
  };

  return (
    <div style={{
      border: '2px solid #241853ff',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: '#302d56ff'
    }}>
      <h3>🎯 {name} {isStatTrak ? 'StatTrak™' : ''}</h3>
      <p><strong>📦 Collection:</strong> {collection}</p>
      <p><strong>📅 Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>🎯 Résultat:</strong> {resultSkin?.name ?? '—'}</p>
      <p>💰 Coût total : {trade.totalInputPrice} €</p>
      <p>📈 Valeur moyenne de sortie : {trade.totalOutputPrice} €</p>
      <p style={{ color: trade.profitability >= 0 ? 'green' : 'red' }}>
        📊 Rentabilité : {trade.profitability}%
      </p>
      <p><strong>🧪 Float moyen:</strong> {averageFloat.toFixed(4)}</p>

      <div style={{ marginTop: '1rem' }}>
        {onEdit && (
          <button onClick={() => onEdit(trade)}>🛠 Modifier</button>
        )}
        <button onClick={handleDelete}>🗑️ Supprimer</button>
      </div>

      <details style={{ marginTop: '1rem' }}>
        <summary>📦 Voir les skins</summary>
        <div>
          <h4>Entrées :</h4>
          <ul>
            {inputs.map((skin, i) => (
              <li key={i}>{skin.name} — Float: {skin.float ?? 'N/A'}</li>
            ))}
          </ul>
          <h4>Sorties :</h4>
          <ul>
            {outputs
              ?.filter(skin => skin && skin.name)
              .map((skin) => (
                <li key={skin.name}>{skin.name}</li>
              ))
            }
          </ul>
        </div>
      </details>
    </div>
  );
}

export default TradeUpCard;
