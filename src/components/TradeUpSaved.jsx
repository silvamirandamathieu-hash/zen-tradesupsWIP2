import React, { useEffect, useState } from 'react';
import { getSavedTradeUps } from '../db';
import TradeUpCard from './TradeUpCard'; // à créer pour afficher chaque trade-up

function TradeUpSaved({ priceMap, onRefreshPrices }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

  useEffect(() => {
    getSavedTradeUps().then(setSavedTradeUps);
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
export default TradeUpSaved;
