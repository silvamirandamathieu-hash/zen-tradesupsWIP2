export function calculateTradeStats(inputs, outputs) {
  const validInputs = inputs.filter(Boolean);
  const validOutputs = outputs.filter(Boolean);

  const avgFloat =
    validInputs.length > 0
      ? validInputs.reduce((sum, s) => sum + (s.float || 0), 0) / validInputs.length
      : 0;

  const totalInputPrice = validInputs.reduce((sum, s) => sum + (s.price || 0), 0);

  const totalOutputPrice = validOutputs.reduce(
    (sum, s) => sum + ((s.price || 0) * (s.chance || 0)) / 100,
    0
  );

  const profit = totalOutputPrice - totalInputPrice;
  const rentability = totalInputPrice > 0 ? (totalOutputPrice / totalInputPrice) * 100 : 0;

  // ✅ Chance de profit = somme des chances des outputs dont le prix > coût du trade-up
  const profitableChance = validOutputs.reduce((sum, s) => {
    const outputPrice = s.price || 0;
    const outputChance = s.chance || 0;
    return outputPrice > totalInputPrice ? sum + outputChance : sum;
  }, 0);

  return {
    avgFloat: avgFloat.toFixed(4),
    totalInputPrice: totalInputPrice.toFixed(2),
    totalOutputPrice: totalOutputPrice.toFixed(2),
    profit: profit.toFixed(2),
    rentability: Math.round(rentability),
    chance: Math.round(profitableChance), // 🟡 arrondi à l'entier
  };
}
// utils/tradeUpUtils.js
export function computePriceMaxForInputs(tradeUp, targetROI = 1.25) {
  const { inputs, expectedPrice } = tradeUp;

  const sumInputs = inputs.reduce(
    (sum, item) => sum + item.price * (item.count || 1),
    0
  );

  const currentROI = expectedPrice / sumInputs;
  const yMax = currentROI / targetROI - 1;

  return inputs.map(item => ({
    ...item,
    priceMax: parseFloat((item.price * (1 + yMax)).toFixed(3)),
  }));
}
