import React, { useEffect, useState } from 'react';
import {
  getSavedTradeUps,
  deleteSavedTradeUp,
  getFavoriteTradeUps,
  addFavoriteTradeUp,
  removeFavoriteTradeUp
} from '../db';
import TradeUpCard from './TradeUpCard';
import { enrichTradeUp } from './EnrichedTradeUp';

function TradeUpSaved({ priceMap }) {
  const [savedTradeUps, setSavedTradeUps] = useState([]);
  const [sortByProfitability, setSortByProfitability] = useState(false);
  const [enrichedTradeUps, setEnrichedTradeUps] = useState([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  // 📦 Chargement initial des favoris et trade-ups
  useEffect(() => {
    const fetchData = async () => {
      const favs = await getFavoriteTradeUps();
      setFavorites(favs);

      const cleaned = await cleanSavedTradeUps();
      setSavedTradeUps(cleaned);

      const enriched = cleaned.map(trade => enrichTradeUp(trade, priceMap));
      setEnrichedTradeUps(enriched);
    };

    fetchData();
  }, [priceMap]);

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

  // 🔁 Toggle visibilité
  const toggleCardVisibility = (id) => {
    setVisibleCards((prev) =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  // 🗑️ Suppression manuelle
  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    await removeFavoriteTradeUp(id); // Supprime aussi des favoris
    const updated = await cleanSavedTradeUps();
    setSavedTradeUps(updated);
    const enriched = updated.map(trade => enrichTradeUp(trade, priceMap));
    setEnrichedTradeUps(enriched);
    setFavorites(await getFavoriteTradeUps());
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

  // ⭐ Toggle favori
  const toggleFavorite = async (id) => {
    let updated;
    if (favorites.includes(id)) {
      await removeFavoriteTradeUp(id);
      updated = favorites.filter(favId => favId !== id);
    } else {
      await addFavoriteTradeUp(id);
      updated = [...favorites, id];
    }
    setFavorites(updated);
  };

  // 📊 Tri et filtrage
  const filteredTradeUps = filterFavoritesOnly
    ? enrichedTradeUps.filter(trade => favorites.includes(trade.id))
    : enrichedTradeUps;

  const sortedTradeUps = [...filteredTradeUps].sort((a, b) => {
    if (!sortByProfitability) return 0;
    return (b.profitability ?? 0) - (a.profitability ?? 0);
  });

  // 🧮 Formatage
  const formatFloat = (value, digits = 2) => {
    return typeof value === 'number' ? value.toFixed(digits) : '0.00';
  };
  const getProfitabilityColor = (profitability) => {
    const clamped = Math.max(-100, Math.min(100, profitability));
    const ratio = (clamped + 100) / 200;
    const red = Math.round(255 * (1 - ratio));
    const green = Math.round(255 * ratio);
    return `rgb(${red}, ${green}, 80)`;
  };
  const amplifyProfitability = (realPercent) => 100 + realPercent;

  // 🧩 Rendu
  return (
    <div style={{ padding: '2rem' }}>
      <h2>💾 Trade-ups sauvegardés</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={toggleSort} style={{ marginRight: '1rem' }}>
          📊 Trier par % de rentabilité {sortByProfitability ? '⬇️' : '↕️'}
        </button>
        <button onClick={() => setFilterFavoritesOnly(prev => !prev)} style={{ marginRight: '1rem' }}>
          ⭐ Filtrer par favoris {filterFavoritesOnly ? '✅' : '❌'}
        </button>
        <button onClick={handleUpdatePrices}>
          🔄 Mettre à jour les prix
        </button>
      </div>

      {sortedTradeUps.map((trade) => {
        const profitability = trade.profitability ?? 0;
        const borderColor = getProfitabilityColor(profitability);
        const textColor = getProfitabilityColor(profitability);

        return (
          <div key={trade.id} style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => toggleCardVisibility(trade.id)}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#4b4977',
                border: `2px solid ${borderColor}`,
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
              <span style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: textColor,
                textAlign: 'center',
                flexBasis: '30%',
              }}>
                📈 {profitability >= 0 ? ' ' : ''}{formatFloat(amplifyProfitability(profitability), 0)}%
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(trade.id);
                }}
                style={{
                  marginLeft: '1rem',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: favorites.includes(trade.id) ? '#ffd700' : '#888',
                  textShadow: favorites.includes(trade.id) ? '0 0 6px #ffd700' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {favorites.includes(trade.id) ? '⭐' : '☆'}
              </span>
            </button>

            {visibleCards.includes(trade.id) && (
              <TradeUpCard
                key={trade.id}
                trade={trade}
                id={trade.id}
                isSaved={true}
                priceMap={priceMap}
                onDelete={() => handleDelete(trade.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TradeUpSaved;
