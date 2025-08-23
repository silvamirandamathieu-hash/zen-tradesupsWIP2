import { updateSavedTradeUp } from '../db';
import { calculateTradeStats } from './calculateTradeStats';

export async function refreshSavedTradeUpPrices(tradeUp, priceMap) {
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
}
