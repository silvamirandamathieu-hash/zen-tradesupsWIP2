import React, { useEffect, useState } from 'react';
import { getSavedTradeUps } from '../db';
import TradeUpCard from './TradeUpCard';
import { normalizeTradeUp } from '../utils/normalizeTradeUp';

function TradeUpSaved({ priceMap, onRefreshPrices, handleDelete }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

  useEffect(() => {
    getSavedTradeUps().then(data => {
      console.log("Saved trade-ups:", data);
      setSavedTradeUps(data);
    });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>
      {savedTradeUps.length === 0 ? (
        <p>Aucun trade-up sauvegardé pour le moment.</p>
      ) : (
        savedTradeUps.map((trade, i) => (
          <TradeUpCard
            key={i}
            trade={normalizeTradeUp(trade.data)}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
          />
        ))
      )}
    </div>
  );
}

export default TradeUpSaved;
