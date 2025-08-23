import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getCurrentTradeUps,
  deleteCurrentTradeUp,
  addSavedTradeUp
} from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpCurrent({ priceMap, onRefreshPrices, onEdit }) {
  const [currentTradeUps, setCurrentTradeUps] = useState([]);

  useEffect(() => {
    const fetchTradeUps = async () => {
      const trades = await getCurrentTradeUps();
      setCurrentTradeUps(trades);
    };
    fetchTradeUps();
  }, []);

  const handleSave = async (tradeUp) => {
    if (!tradeUp || !tradeUp.resultSkin || !tradeUp.inputs) return;

    const tradeUpToSave = {
      id: uuid(),
      name: `TradeUp ${tradeUp.resultSkin.name}`,
      collection: tradeUp.collection,
      inputs: tradeUp.inputs,
      outputs: tradeUp.outputs ?? [],
      resultSkin: tradeUp.resultSkin,
      isStatTrak: tradeUp.isStatTrak ?? false,
      profitability: calculateProfitability(tradeUp.inputs, tradeUp.resultSkin),
      date: new Date().toISOString()
    };

    await addSavedTradeUp(tradeUpToSave);
    alert('📥 Trade-up sauvegardé !');
  };

  const handleDelete = async (id) => {
    await deleteCurrentTradeUp(id);
    const updated = await getCurrentTradeUps();
    setCurrentTradeUps(updated);
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
      <h2>🧪 Trade-ups en cours</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>

      {currentTradeUps.length === 0 ? (
        <p>Aucun trade-up en cours.</p>
      ) : (
        currentTradeUps.map((trade) => (
          <div key={trade.id} style={{ marginBottom: '2rem' }}>
            <TradeUpCard
              trade={trade}
              priceMap={priceMap}
              onDelete={() => handleDelete(trade.id)}
              onEdit={() => onEdit(trade)} // ✅ pour réouverture dans TradeUpTab
            />
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => handleSave(trade)} style={{ marginRight: '1rem' }}>
                💾 Sauvegarder
              </button>
              <button onClick={() => handleDelete(trade.id)}>🗑️ Supprimer</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TradeUpCurrent;
