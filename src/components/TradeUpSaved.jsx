import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpSaved({ priceMap }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);
  const [sortByProfitability, setSortByProfitability] = useState(false);

  // 🔧 Fonction de nettoyage
  const cleanSavedTradeUps = async () => {
    const saved = await getSavedTradeUps();

    const isValidTradeUp = (trade) => {
      if (!trade || !trade.id || !Array.isArray(trade.inputs) || !Array.isArray(trade.outputs)) return false;

      const validInputs = trade.inputs.every(skin => skin?.name && skin?.wear);
      const validOutputs = trade.outputs.every(skin => skin?.name && skin?.wear);

      return validInputs && validOutputs;
    };

    const validTradeUps = saved.filter(isValidTradeUp);
    const invalidTradeUps = saved.filter(trade => !isValidTradeUp(trade));

    for (const bad of invalidTradeUps) {
      await deleteSavedTradeUp(bad.id);
      console.warn(`⛔ Trade-up corrompu supprimé : ${bad.id}`);
    }

    return validTradeUps;
  };

  // 📦 Chargement initial
  useEffect(() => {
    const fetchAndCleanTradeUps = async () => {
      const cleaned = await cleanSavedTradeUps();
      setSavedTradeUps(cleaned);
    };
    fetchAndCleanTradeUps();
  }, []);

  // 🗑️ Suppression manuelle
  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    const updated = await cleanSavedTradeUps();
    setSavedTradeUps(updated);
  };

  // 🔁 Toggle tri
  const toggleSort = () => {
    setSortByProfitability(prev => !prev);
  };

  // 💰 Enrichissement des données
  const enrichTradeUp = (tradeUp) => {
    const enrichedInputs = tradeUp.inputs.map(skin => {
      const key = `${skin.name} (${skin.wear})`;
      const price = priceMap?.[key]?.price ?? skin.price ?? 0;
      return { ...skin, price };
    });

    const enrichedOutputs = tradeUp.outputs.map(skin => {
      const key = `${skin.name} (${skin.wear})`;
      const price = priceMap?.[key]?.price ?? skin.price ?? 0;
      return { ...skin, price, chance: skin.chance ?? 0 };
    });

    const totalInputPrice = enrichedInputs.reduce((sum, s) => sum + s.price, 0);
    const totalOutputPrice = enrichedOutputs.length > 0
      ? enrichedOutputs.reduce((sum, s) => sum + s.price, 0) / enrichedOutputs.length
      : 0;

    const profit = totalOutputPrice - totalInputPrice;
    const profitability = totalInputPrice > 0
      ? ((profit / totalInputPrice) * 100).toFixed(2)
      : '0.00';

    return {
      ...tradeUp,
      inputs: enrichedInputs,
      outputs: enrichedOutputs,
      totalInputPrice: totalInputPrice.toFixed(2),
      totalOutputPrice: totalOutputPrice.toFixed(2),
      profit: profit.toFixed(2),
      profitability: parseFloat(profitability)
    };
  };

  // 📊 Enrichissement + tri
  const enrichedTradeUps = savedTradeUps.map(enrichTradeUp);
  const sortedTradeUps = [...enrichedTradeUps].sort((a, b) => {
    if (!sortByProfitability) return 0;
    return (b.profitability ?? 0) - (a.profitability ?? 0);
  });

  // 🧩 Rendu
  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>

      <button onClick={toggleSort} style={{ marginBottom: '1rem' }}>
        📊 Trier par % de rentabilité {sortByProfitability ? '⬇️' : '↕️'}
      </button>

      {sortedTradeUps.map((trade) => (
        <div key={trade.id} style={{ marginBottom: '2rem' }}>
          <TradeUpCard
            trade={trade}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default TradeUpSaved;
