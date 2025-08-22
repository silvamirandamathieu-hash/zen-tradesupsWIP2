import React, { useEffect, useState } from 'react';
import { getSavedTradeUps } from '../db';
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

function TradeUpSaved({ priceMap, onRefreshPrices }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

useEffect(() => {
  getSavedTradeUps().then(setSavedTradeUps);
}, []);

getSavedTradeUps().then(data => {
  console.log("Saved trade-ups:", data);
  setSavedTradeUps(data);
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
export default TradeUpSaved;
