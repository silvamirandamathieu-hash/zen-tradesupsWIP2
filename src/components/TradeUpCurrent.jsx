import React, { useEffect, useState } from 'react';
import {
  getCurrentTradeUps,
  saveTradeUp,
  clearCurrentTradeUps
} from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpCurrent({ priceMap, onRefreshPrices }) {
  const [currentTradeUps, setCurrentTradeUps] = useState([]);

  useEffect(() => {
    getCurrentTradeUps().then(setCurrentTradeUps);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Trade-ups en cours</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>
      {currentTradeUps.map((trade, i) => (
        <TradeUpCard key={i} trade={trade.data} priceMap={priceMap} />
      ))}
    </div>
  );
}

export default TradeUpCurrent;
