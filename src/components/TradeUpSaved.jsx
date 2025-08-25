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
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');

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

  const toggleCardVisibility = (id) => {
    setVisibleCards((prev) =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    await deleteSavedTradeUp(id);
    await removeFavoriteTradeUp(id);
    const updated = await cleanSavedTradeUps();
    setSavedTradeUps(updated);
    const enriched = updated.map(trade => enrichTradeUp(trade, priceMap));
    setEnrichedTradeUps(enriched);
    setFavorites(await getFavoriteTradeUps());
  };

  const toggleSort = () => {
    setSortByProfitability(prev => !prev);
  };

  const handleUpdatePrices = () => {
    const updated = savedTradeUps.map(trade => enrichTradeUp(trade, priceMap));
    setEnrichedTradeUps(updated);
  };

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

  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, '');

  const filteredTradeUps = enrichedTradeUps.filter(trade => {
    const matchFavorites = !filterFavoritesOnly || favorites.includes(trade.id);
    const matchSearch = normalize(trade.collection ?? '').includes(normalize(searchQuery));
    const matchCollection = !collectionFilter || normalize(trade.collection ?? '') === normalize(collectionFilter);
    return matchFavorites && matchSearch && matchCollection;
  });

  const sortedTradeUps = [...filteredTradeUps].sort((a, b) => {
    if (!sortByProfitability) return 0;
    return (b.profitability ?? 0) - (a.profitability ?? 0);
  });

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

  const getWearStyle = (rarity, isStatTrak = false) => {
    if (isStatTrak) return { color: '#FFA500', fontWeight: 'bold' };

    const rarityColors = {
      'Mil-spec': '#4B69FF',
      'Industrial': '#82addfff',
      'Restricted': '#8847FF',
      'Classified': '#D32CE6',
      'Covert': '#EB4B4B',
      'Consumer': '#AFAFAF',
      'Contraband': '#FFD700'
    };

    return { color: rarityColors[rarity] || '#CCCCCC' };
  };

  const getWearAbbreviationsStyled = (inputs, isStatTrak) => {
    const wearMap = {
      'Factory New': 'FN',
      'Minimal Wear': 'MW',
      'Field-Tested': 'FT',
      'Well-Worn': 'WW',
      'Battle-Scarred': 'BS'
    };

    const seen = new Map();

    for (const skin of inputs) {
      const abbrev = wearMap[skin?.wear];
      if (abbrev && skin?.rarity) {
        seen.set(abbrev, getWearStyle(skin.rarity));
      }
      if (skin?.name?.includes('StatTrak') || isStatTrak) {
        seen.set('ST', getWearStyle(null, true));
      }
    }

    return Array.from(seen.entries()).map(([label, style], i) => (
      <span key={i} style={style}>{label}</span>
    ));
  };


  // 🧩 Rendu
  return (
    // Replace your outer <div> with this:
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(to right, #1e1e2f, #2c2c3e)',
        minHeight: '100vh',
        color: '#f0f0f0',
        fontFamily: 'Segoe UI, Roboto, sans-serif'
      }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          color: '#ffffff',
          textShadow: '0 0 8px #6c63ff'
        }}>
          💾 Trade-ups sauvegardés
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button onClick={toggleSort} style={{
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'background 0.3s ease'
          }}>
            📊 Trier par % de rentabilité {sortByProfitability ? '⬇️' : '↕️'}
          </button>

          <button onClick={() => setFilterFavoritesOnly(prev => !prev)} style={{
            background: filterFavoritesOnly ? '#ffd700' : '#444',
            color: filterFavoritesOnly ? '#000' : '#fff',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'background 0.3s ease'
          }}>
            ⭐ Filtrer par favoris {filterFavoritesOnly ? '✅' : '❌'}
          </button>

          <input
            type="text"
            placeholder="🔎 Rechercher par collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flexGrow: 1,
              background: '#2e2e3e',
              color: '#fff',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #6c63ff',
              fontSize: '1rem'
            }}
          />
        </div>

        {sortedTradeUps.map((trade) => {
          const profitability = trade.profitability ?? 0;
          const borderColor = getProfitabilityColor(profitability);
          const textColor = getProfitabilityColor(profitability);

          return (
            <div key={trade.id} style={{
              marginBottom: '2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
            }}>
              <button
                onClick={() => toggleCardVisibility(trade.id)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#3a3a4f',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '12px 12px 0 0',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  transition: 'background 0.3s ease'
                }}
              >
                <span style={{ flexBasis: '60%' }}>
                  {visibleCards.includes(trade.id) ? '🔽 Masquer les détails' : '🔍 Afficher les détails'} —{' '}
                  <strong>{trade.result?.name}</strong>{' '}
                  <span style={{ fontStyle: 'italic', color: '#ccc', fontWeight: 'bold' }}>
                    {trade.collection}
                  </span>{' '}
                  <span style={{ fontStyle: 'normal', fontSize: '0.9rem' }}>
                    [
                    {getWearAbbreviationsStyled(trade.inputs, trade.isStatTrak).map((span, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && ', '}
                        {span}
                      </React.Fragment>
                    ))}
                    ]
                  </span>
                </span>

                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: textColor,
                  textAlign: 'center',
                  flexBasis: '25%',
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
                <div style={{
                  animation: 'fadeIn 0.3s ease-in-out',
                  padding: '1rem',
                  backgroundColor: '#2c2c3e',
                  borderTop: `1px solid ${borderColor}`
                }}>
                  <TradeUpCard
                    key={trade.id}
                    trade={trade}
                    id={trade.id}
                    isSaved={true}
                    priceMap={priceMap}
                    onDelete={() => handleDelete(trade.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

  );

}

export default TradeUpSaved;
