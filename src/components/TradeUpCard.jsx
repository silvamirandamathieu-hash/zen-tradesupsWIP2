import React from 'react';
import { addSavedTradeUp, deleteCurrentTradeUp } from '../db';

function TradeUpCard({ trade, priceMap, onDelete }) {
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
      border: '1px solid #ccc',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🎯 {name} {isStatTrak ? 'StatTrak™' : ''}</h3>
      <p><strong>📦 Collection:</strong> {collection}</p>
      <p><strong>📅 Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>🎯 Résultat:</strong> {resultSkin?.name ?? '—'}</p>
      <p><strong>💰 Coût total:</strong> {totalCost.toFixed(2)} €</p>
      <p><strong>🎯 Valeur moyenne de sortie:</strong> {averageOutputValue.toFixed(2)} €</p>
      <p><strong>🧪 Float moyen:</strong> {averageFloat.toFixed(4)}</p>
      <p><strong>📈 Rentabilité:</strong> <span style={{ color: profitColor }}>{profit.toFixed(2)} €</span></p>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave} style={{ marginRight: '1rem' }}>📥 Sauvegarder</button>
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
