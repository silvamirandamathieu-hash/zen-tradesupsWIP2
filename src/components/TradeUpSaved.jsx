import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpSaved({ priceMap, onRefreshPrices }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

  useEffect(() => {
    const fetchSavedTradeUps = async () => {
      const saved = await getSavedTradeUps();
      setSavedTradeUps(saved);
    };
    fetchSavedTradeUps();
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

      {savedTradeUps.length === 0 ? (
        <p>Aucun trade-up sauvegardé pour le moment.</p>
      ) : (
        savedTradeUps.map((trade) => (
          <TradeUpCard
            key={trade.id}
            trade={trade}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
          />
        ))
      )}
    </div>
  );
}

export default TradeUpSaved;
