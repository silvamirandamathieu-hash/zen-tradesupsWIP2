import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';
import { enrichTradeUp } from './EnrichedTradeUp';

function TradeUpSaved({ priceMap }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);
  const [sortByProfitability, setSortByProfitability] = useState(false);
  const [enrichedTradeUps, setEnrichedTradeUps] = useState([]);
  const [visibleCards, setVisibleCards] = useState([]);

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
  }, [priceMap]);

  // 🔁 Toggle visibilité
  const toggleCardVisibility = (id) => {
    setVisibleCards((prev) =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

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

  // 🧮 Formatage sécurisé
  const formatFloat = (value, digits = 2) => {
    return typeof value === 'number' ? value.toFixed(digits) : '0.00';
  };

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
          <button
            onClick={() => toggleCardVisibility(trade.id)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#f0f0f0',
              border: '2px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              {visibleCards.includes(trade.id) ? '🔽 Masquer les détails' : '🔍 Afficher les détails'} — <strong>{trade.result?.name}</strong>
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
              💰 Coût: {formatFloat(trade.totalInputPrice)} € | 📈 Rentabilité: {formatFloat(trade.profitability, 2)}% | 🧮 Profit: {formatFloat(trade.profit)} €
            </span>
          </button>

          {visibleCards.includes(trade.id) && (
            <TradeUpCard
              trade={trade}
              id={trade.id}
              isSaved={true}
              priceMap={priceMap}
              onDelete={() => handleDelete(trade.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default TradeUpSaved;
