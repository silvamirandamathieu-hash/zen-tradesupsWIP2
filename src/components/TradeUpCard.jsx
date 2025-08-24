import React from 'react';
import { deleteCurrentTradeUp } from '../db';

function TradeUpCard({ trade, onDelete, onEdit }) {
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
      border: '2px solid #241853',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: '#302d56',
      color: '#fff'
    }}>
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

      <div style={{ marginTop: '1rem' }}>
        {onEdit && (
          <button onClick={() => onEdit(trade)} style={{ marginRight: '1rem' }}>
            🛠 Modifier
          </button>
        )}
        <button onClick={handleDelete}>🗑️ Supprimer</button>
      </div>

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
      </details>
    </div>
  );
}

export default TradeUpCard;
