import React, { useEffect, useState } from 'react';
import { getCurrentTradeUps } from '../db';
import TradeUpCard from './TradeUpCard';
import { normalizeTradeUp } from '../utils/normalizeTradeUp';

function TradeUpCurrent({ priceMap, onRefreshPrices, onDelete }) {
  const [currentTradeUps, setCurrentTradeUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentTradeUps().then(data => {
      console.log("Current trade-ups:", data);
      setCurrentTradeUps(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📈 Trade-ups en cours</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>

      {loading ? (
        <p>Chargement des trade-ups...</p>
      ) : currentTradeUps.length === 0 ? (
        <p>Aucun trade-up en cours pour le moment.</p>
      ) : (
        currentTradeUps.map((trade, i) => (
          <TradeUpCard
            key={i}
            trade={normalizeTradeUp(trade.data)}
            priceMap={priceMap}
            onDelete={() => onDelete(trade.id)}
          />
        ))
      )}
    </div>
  );
}

export default TradeUpCurrent;
