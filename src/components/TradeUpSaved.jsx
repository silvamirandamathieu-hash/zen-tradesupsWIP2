import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';

import TradeUpCard from './TradeUpCard';

function TradeUpSaved({ priceMap, onRefreshPrices , onDelete }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

  useEffect(() => {
    getSavedTradeUps().then(setSavedTradeUps);
  }, []);

  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    const updated = await getSavedTradeUps();
    setSavedTradeUps(updated);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>
      {onDelete && (
        <button onClick={onDelete} style={{ marginTop: '0.5rem' }}>
            🗑️ Supprimer ce trade-up
        </button>
        )}

      {savedTradeUps.length === 0 ? (
        <p>Aucun trade-up sauvegardé pour le moment.</p>
      ) : (
        savedTradeUps.map((trade, i) => (
          <TradeUpCard
            key={i}
            trade={trade.data}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
          />
        ))
      )}
    </div>
  );
}

export default TradeUpSaved;
