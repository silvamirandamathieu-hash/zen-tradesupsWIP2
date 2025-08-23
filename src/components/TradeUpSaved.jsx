import React, { useEffect, useState } from 'react';
import {
  getSavedTradeUps,
  deleteSavedTradeUp,
  updateSavedTradeUp
} from '../db';
import TradeUpCard from './TradeUpCard';
import { calculateTradeStats } from '../utils/calculateTradeStats';

function TradeUpSaved({ priceMap, onRefreshPrices, onEdit }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);

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

  const refreshSavedTradeUpPrices = async (tradeUp) => {
    const enrichedInputs = tradeUp.inputs.map(skin => ({
      ...skin,
      price: typeof priceMap?.[skin.name]?.price === 'number'
        ? priceMap[skin.name].price
        : skin.price ?? 0
    }));

    const enrichedOutputs = tradeUp.outputs.map(skin => ({
      ...skin,
      price: typeof priceMap?.[skin.name]?.price === 'number'
        ? priceMap[skin.name].price
        : skin.price ?? 0,
      chance: skin.chance ?? 0
    }));

    const stats = calculateTradeStats(enrichedInputs, enrichedOutputs);

    const updatedTradeUp = {
      ...tradeUp,
      inputs: enrichedInputs,
      outputs: enrichedOutputs,
      ...stats,
      date: new Date().toISOString()
    };

    await updateSavedTradeUp(tradeUp.id, updatedTradeUp);
    return updatedTradeUp;
  };

  const refreshAllTradeUps = async () => {
    if (!priceMap || Object.keys(priceMap).length === 0) {
      alert('⚠️ Les prix ne sont pas chargés. Clique sur "Actualiser les prix" avant de mettre à jour.');
      return;
    }

    const updatedList = await Promise.all(
      savedTradeUps.map(trade => refreshSavedTradeUpPrices(trade))
    );
    setSavedTradeUps(updatedList);
    alert('✅ Tous les trade-ups ont été mis à jour avec les prix actuels.');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>
      <button onClick={onRefreshPrices} style={{ marginRight: '1rem' }}>
        🔄 Actualiser les prix du marché
      </button>
      <button onClick={refreshAllTradeUps}>
        🔁 Mettre à jour tous les trade-ups avec les prix actuels
      </button>

      {savedTradeUps.length === 0 ? (
        <p>Aucun trade-up sauvegardé pour le moment.</p>
      ) : (
        savedTradeUps.map((trade) => (
          <div key={trade.id} style={{ marginBottom: '2rem' }}>
            <TradeUpCard
              trade={trade}
              priceMap={priceMap}
              onDelete={() => handleDelete(trade.id)}
              onEdit={() => onEdit(trade)}
            />
            <button
              onClick={async () => {
                const updated = await refreshSavedTradeUpPrices(trade);
                setSavedTradeUps(prev =>
                  prev.map(t => (t.id === updated.id ? updated : t))
                );
              }}
              style={{ marginTop: '0.5rem' }}
            >
              🔄 Mettre à jour ce trade-up avec les prix actuels
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default TradeUpSaved;
