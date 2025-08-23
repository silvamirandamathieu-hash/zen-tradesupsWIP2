import React, { useEffect, useState } from 'react';
import { getSavedTradeUps, deleteSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';

function TradeUpSaved({ priceMap }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);
  const [sortByProfitability, setSortByProfitability] = useState(false);

  useEffect(() => {
    const fetchSavedTradeUps = async () => {
      const saved = await getSavedTradeUps();
      setSavedTradeUps(saved);
    };
    fetchSavedTradeUps();
  }, []);

  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    const updated = await getSavedTradeUps();
    setSavedTradeUps(updated);
  };

  const toggleSort = () => {
    setSortByProfitability(prev => !prev);
  };

  const sortedTradeUps = [...savedTradeUps].sort((a, b) => {
    if (!sortByProfitability) return 0;
    return (b.profitability ?? 0) - (a.profitability ?? 0);
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>

      <button onClick={toggleSort} style={{ marginBottom: '1rem' }}>
        📊 Trier par % de rentabilité {sortByProfitability ? '⬇️' : '↕️'}
      </button>

      {sortedTradeUps.length === 0 ? (
        <p>Aucun trade-up sauvegardé pour le moment.</p>
      ) : (
        sortedTradeUps.map((trade) => (
          <div key={trade.id} style={{ marginBottom: '2rem' }}>
            <TradeUpCard
              trade={trade}
              priceMap={priceMap}
              onDelete={() => handleDelete(trade.id)}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default TradeUpSaved;
