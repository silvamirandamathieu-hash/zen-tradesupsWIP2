import React, { useEffect, useState } from 'react';
import { getCurrentTradeUps, deleteCurrentTradeUp, addSavedTradeUp } from '../db';
import TradeUpCard from './TradeUpCard';
import { v4 as uuid } from 'uuid';

function TradeUpCurrent({ priceMap, onRefreshPrices, onEdit }) {
  const [currentTradeUps, setCurrentTradeUps] = useState([]);

    useEffect(() => {
        const fetchCurrentTradeUps = async () => {
            const current = await getCurrentTradeUps();
            const enriched = current.map(enrichTradeUp);
            setCurrentTradeUps(enriched);
        };
        fetchCurrentTradeUps();
        }, [priceMap]);



    const handleDelete = async (id) => {
        await deleteCurrentTradeUp(id);
        const updated = await getCurrentTradeUps();
        const enriched = updated.map(enrichTradeUp);
        setCurrentTradeUps(enriched);
        };

    const enrichTradeUp = (tradeUp) => {
        const validInputs = tradeUp.inputs?.filter(s => s && s.name) ?? [];
        const validOutputs = tradeUp.outputs?.filter(s => s && s.name) ?? [];

        const totalInputPrice = validInputs.reduce((sum, skin) => {
            const price = priceMap?.[skin.name]?.price ?? 0;
            return sum + price;
        }, 0);

        const totalOutputPrice = validOutputs.length > 0
            ? validOutputs.reduce((sum, skin) => {
                const price = priceMap?.[skin.name]?.price ?? 0;
                return sum + price;
            }, 0) / validOutputs.length
            : 0;

        const averageFloat = validInputs.length > 0
            ? validInputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / validInputs.length
            : 0;

        const profitability = totalInputPrice > 0
            ? ((totalOutputPrice - totalInputPrice) / totalInputPrice) * 100
            : 0;

        return {
            ...tradeUp,
            totalInputPrice,
            totalOutputPrice,
            averageFloat,
            profitability
        };
        };



  const handleSave = async (tradeUp) => {
    if (!tradeUp || !tradeUp.resultSkin || !tradeUp.inputs?.length) return;

    const validInputs = tradeUp.inputs.filter(s => s && s.name);
    const validOutputs = tradeUp.outputs?.filter(s => s && s.name) ?? [];

    const totalInputPrice = validInputs.reduce((sum, skin) => {
        const price = priceMap?.[skin.name]?.price ?? 0;
        return sum + price;
    }, 0);

    const totalOutputPrice = validOutputs.length > 0
        ? validOutputs.reduce((sum, skin) => {
            const price = priceMap?.[skin.name]?.price ?? 0;
            return sum + price;
        }, 0) / validOutputs.length
        : 0;

    const averageFloat = validInputs.length > 0
        ? validInputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / validInputs.length
        : 0;

    const profitability = totalInputPrice > 0
        ? ((totalOutputPrice - totalInputPrice) / totalInputPrice) * 100
        : 0;

    const tradeUpToSave = {
        id: uuid(),
        name: `TradeUp ${tradeUp.resultSkin.name}`,
        collection: tradeUp.collection,
        inputs: tradeUp.inputs,
        outputs: tradeUp.outputs ?? [],
        resultSkin: tradeUp.resultSkin,
        isStatTrak: tradeUp.isStatTrak ?? false,
        totalInputPrice,
        totalOutputPrice,
        averageFloat,
        profitability,
        date: new Date().toISOString()
    };

    await addSavedTradeUp(tradeUpToSave);
    alert('📥 Trade-up sauvegardé !');
    };



  const calculateTotalCost = (inputs) => {
    return inputs.reduce((sum, skin) => {
      const price = priceMap?.[skin?.name]?.price ?? 0;
      return sum + price;
    }, 0);
  };

  const calculateAverageOutputValue = (outputs) => {
    const validOutputs = outputs?.filter(o => o?.name) ?? [];
    const total = validOutputs.reduce((sum, skin) => {
      const price = priceMap?.[skin.name]?.price ?? 0;
      return sum + price;
    }, 0);
    return validOutputs.length ? total / validOutputs.length : 0;
  };

  const calculateProfitability = (inputs, resultSkin) => {
    const totalCost = calculateTotalCost(inputs);
    const resultPrice = priceMap?.[resultSkin?.name]?.price ?? 0;
    return totalCost > 0 ? ((resultPrice - totalCost) / totalCost) * 100 : 0;
  };

  const calculateAverageFloat = (inputs) => {
    const valid = inputs?.filter(s => s?.float !== undefined) ?? [];
    const total = valid.reduce((sum, s) => sum + s.float, 0);
    return valid.length ? total / valid.length : 0;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Trade-ups en cours</h2>
      <button onClick={onRefreshPrices}>🔄 Actualiser les prix</button>

      {currentTradeUps.length === 0 ? (
        <p>Aucun trade-up en cours.</p>
      ) : (
        currentTradeUps.map((trade) => (
          <TradeUpCard
            key={trade.id}
            trade={trade}
            priceMap={priceMap}
            onDelete={() => handleDelete(trade.id)}
            onEdit={() => onEdit(trade)}
            extraActions={
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => handleSave(trade)} style={{ marginRight: '1rem' }}>
                  💾 Sauvegarder
                </button>
                <button onClick={() => handleDelete(trade.id)}>🗑️ Supprimer</button>
              </div>
            }
          />
        ))
      )}
    </div>
  );
}

export default TradeUpCurrent;
