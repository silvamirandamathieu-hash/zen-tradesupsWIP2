import React, { useEffect, useState } from 'react';
import { getCurrentTradeUps } from '../db';
import TradeUpCard from './TradeUpCard'; // à créer pour afficher chaque trade-up
function normalizeTradeUp(rawTrade) {
  return {
    inputs: rawTrade.inputs.map(skin => ({
      name: skin.name,
      float: skin.float,
      price: skin.price,
      imageUrl: skin.imageUrl
    })),
    outputs: rawTrade.outputs.map(skin => ({
      name: skin.name,
      price: skin.price,
      imageUrl: skin.imageUrl
    })),
    isStatTrak: rawTrade.isStatTrak ?? false,
    isSouvenir: rawTrade.isSouvenir ?? false
  };
}

function TradeUpCurrent({ priceMap, onRefreshPrices, onDelete  }) {
  const [savedTradeUps, setCurrentTradeUps] = useState([]);

  useEffect(() => {
    getCurrentTradeUps().then(setCurrentTradeUps);
  }, []);
  getCurrentTradeUps().then(data => {
  console.log("Saved trade-ups:", data);
  getCurrentTradeUps(data);
});


  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>
      {savedTradeUps.map((trade, i) => (
        <TradeUpCard trade={normalizeTradeUp(trade.data)} priceMap={priceMap} />
      ))}
    </div>
  );
}
export default TradeUpCurrent;
