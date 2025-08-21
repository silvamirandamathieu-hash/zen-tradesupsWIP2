export const calculateProfit = (tradeup) => {
  const totalInputCost = tradeup.inputs?.reduce((sum, skin) => sum + (skin?.price_now || 0), 0) || 0;
  const averageOutputValue = tradeup.outputs?.reduce((sum, skin) => sum + (skin?.price_now || 0), 0) / (tradeup.outputs?.length || 1);

  return {
    profit: averageOutputValue - totalInputCost,
    profitPercent: totalInputCost > 0
      ? ((averageOutputValue - totalInputCost) / totalInputCost) * 100
      : 0
  };
}


