import React from 'react';
import { addSavedTradeUp, deleteCurrentTradeUp } from '../db';

function TradeUpCard({ trade, priceMap, onDelete , onEdit }) {
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
    profitability
  } = trade;

  // 💰 Calcul du coût total
  const totalCost = inputs.reduce((sum, skin) => {
    const price = priceMap?.[skin.name]?.price ?? 0;
    return sum + price;
  }, 0);

  // 🎯 Valeur moyenne de sortie
  const averageOutputValue = outputs.reduce((sum, skin) => {
    const price = priceMap?.[skin.name]?.price ?? 0;
    return sum + price;
  }, 0) / outputs.length;

  // 🧪 Float moyen
  const averageFloat = inputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / inputs.length;

  // 📈 Rentabilité
  const profit = averageOutputValue - totalCost;
  const profitColor = profit > 0 ? 'green' : profit < 0 ? 'red' : 'gray';

  const handleSave = async () => {
    await addSavedTradeUp(trade);
    alert('📥 Trade-up sauvegardé !');
  };

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
      <p><strong>🧪 Float moyen:</strong> {averageFloat.toFixed(4)}</p>
      <p style={{ color: trade.profitability >= 0 ? 'green' : 'red' }}>
        📊 Rentabilité : {trade.profitability}%
      </p>

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
            {outputs.map((skin, i) => (
              <li key={i}>{skin.name}</li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}

export default TradeUpCard;
