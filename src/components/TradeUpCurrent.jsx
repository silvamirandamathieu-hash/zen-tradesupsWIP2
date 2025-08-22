import React, { useEffect, useState } from 'react';
import { getCurrentTradeUps } from '../db';
import TradeUpCard from './TradeUpCard'; // à créer pour afficher chaque trade-up

function TradeUpCurrent({ priceMap, onRefreshPrices, onDelete  }) {
  const [savedTradeUps, setCurrentTradeUps] = useState([]);

  useEffect(() => {
    getCurrentTradeUps().then(setCurrentTradeUps);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>
      {savedTradeUps.map((trade, i) => (
        <TradeUpCard key={i} trade={trade} priceMap={priceMap} />
      ))}
    </div>
  );
}
export default TradeUpCurrent;
