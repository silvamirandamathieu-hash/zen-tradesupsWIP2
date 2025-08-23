import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getCurrentTradeUp,
  deleteCurrentTradeUp,
  addSavedTradeUp
} from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpCurrent({ priceMap, onRefreshPrices }) {
  const [currentTradeUp, setCurrentTradeUp] = useState(null);

  useEffect(() => {
    const fetchTradeUp = async () => {
      const trade = await getCurrentTradeUp();
      setCurrentTradeUp(trade);
    };
    fetchTradeUp();
  }, []);

  const handleSave = async () => {
    if (!currentTradeUp || !currentTradeUp.resultSkin || !currentTradeUp.inputs) return;

    const tradeUpToSave = {
      id: uuid(),
      name: `TradeUp ${currentTradeUp.resultSkin.name}`,
      collection: currentTradeUp.collection,
      inputs: currentTradeUp.inputs,
      outputs: currentTradeUp.outputs ?? [],
      resultSkin: currentTradeUp.resultSkin,
      isStatTrak: currentTradeUp.isStatTrak ?? false,
      profitability: calculateProfitability(currentTradeUp.inputs, currentTradeUp.resultSkin),
      date: new Date().toISOString()
    };

    await addSavedTradeUp(tradeUpToSave);
    alert('📥 Trade-up sauvegardé !');
  };

  const handleDelete = async () => {
    await deleteCurrentTradeUp();
    setCurrentTradeUp(null);
    alert('🗑️ Trade-up supprimé');
  };

  const calculateProfitability = (inputs, resultSkin) => {
    const totalCost = inputs.reduce((sum, skin) => {
      const price = priceMap?.[skin.name]?.price ?? 0;
      return sum + price;
    }, 0);
    const resultPrice = priceMap?.[resultSkin.name]?.price ?? 0;
    return ((resultPrice - totalCost) / totalCost) * 100;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Trade-up en cours</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>

      {currentTradeUp ? (
        <>
          <TradeUpCard trade={currentTradeUp} priceMap={priceMap} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleSave} style={{ marginRight: '1rem' }}>💾 Sauvegarder</button>
            <button onClick={handleDelete}>🗑️ Supprimer</button>
          </div>
        </>
      ) : (
        <p>Aucun trade-up en cours.</p>
      )}
    </div>
  );
}

export default TradeUpCurrent;
