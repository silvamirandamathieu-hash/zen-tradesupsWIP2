// EnrichedTradeUp.js

export const enrichTradeUp = (tradeUp, priceMap) => {
  const getSkinPrice = (skin) => {
    const prefix = skin.isStatTrak ? '★ ST ' : skin.isSouvenir ? '★ SV ' : '';
    const key = `${prefix}${skin.name} (${skin.wear})`;
    return priceMap?.[key]?.price ?? skin.price ?? 0;
  };

  const enrichedInputs = tradeUp.inputs.map(skin => ({
    ...skin,
    price: getSkinPrice(skin)
  }));

  const enrichedOutputs = tradeUp.outputs.map(skin => ({
    ...skin,
    price: getSkinPrice(skin),
    chance: skin.chance ?? 0
  }));

  const totalInputPrice = enrichedInputs.reduce((sum, s) => sum + s.price, 0);
  const avgOutputValue = enrichedOutputs.reduce((sum, s) => sum + s.price * (s.chance / 100), 0);
  const profit = avgOutputValue - totalInputPrice;
  const profitability = totalInputPrice > 0
    ? ((profit / totalInputPrice) * 100).toFixed(2)
    : '0.00';

  return {
    ...tradeUp,
    inputs: enrichedInputs,
    outputs: enrichedOutputs,
    totalInputPrice: totalInputPrice.toFixed(2),
    avgOutputValue: avgOutputValue.toFixed(2),
    profit: profit.toFixed(2),
    profitability: parseFloat(profitability)
  };
};
