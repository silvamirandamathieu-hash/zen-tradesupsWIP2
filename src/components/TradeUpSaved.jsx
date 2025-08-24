import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';
import { enrichTradeUp } from './EnrichedTradeUp';

function TradeUpSaved({ priceMap }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);
  const [sortByProfitability, setSortByProfitability] = useState(false);
  const [enrichedTradeUps, setEnrichedTradeUps] = useState([]);

  // 🔧 Nettoyage des trade-ups corrompus
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
      const enriched = cleaned.map(trade => enrichTradeUp(trade, priceMap));
      setEnrichedTradeUps(enriched);
    };
    fetchAndCleanTradeUps();
  }, [priceMap]); // ✅ Ajout de priceMap comme dépendance

  // 🗑️ Suppression manuelle
  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    const updated = await cleanSavedTradeUps();
    setSavedTradeUps(updated);
    const enriched = updated.map(trade => enrichTradeUp(trade, priceMap));
    setEnrichedTradeUps(enriched);
  };

  // 🔁 Toggle tri
  const toggleSort = () => {
    setSortByProfitability(prev => !prev);
  };

  // 🔄 Mise à jour des prix
  const handleUpdatePrices = () => {
    const updated = savedTradeUps.map(trade => enrichTradeUp(trade, priceMap));
    setEnrichedTradeUps(updated);
  };

  // 📊 Tri des trade-ups enrichis
  const sortedTradeUps = [...enrichedTradeUps].sort((a, b) => {
    if (!sortByProfitability) return 0;
    return (b.profitability ?? 0) - (a.profitability ?? 0);
  });

  // 🧩 Rendu
  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={toggleSort} style={{ marginRight: '1rem' }}>
          📊 Trier par % de rentabilité {sortByProfitability ? '⬇️' : '↕️'}
        </button>
        <button onClick={handleUpdatePrices}>
          🔄 Mettre à jour les prix
        </button>
      </div>

      {sortedTradeUps.map((trade) => (
        <div key={trade.id} style={{ marginBottom: '2rem' }}>
          <TradeUpCard
            trade={trade}
            id={trade.id}
            isSaved={true}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default TradeUpSaved;
