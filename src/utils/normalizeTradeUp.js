export function normalizeTradeUp(rawTrade) {
  const inputs = [...(rawTrade.regularItems || []), ...(rawTrade.statTrakItems || [])];

  return {
    inputs: inputs.map(skin => ({
      name: skin.name ?? 'Unknown',
      float: skin.float ?? 0,
      price: skin.price ?? 0,
      imageUrl: skin.imageUrl ?? rawTrade.imageUrl
    })),
    outputs: (rawTrade.outputs || []).map(skin => ({
      name: skin.name ?? 'Unknown',
      price: skin.price ?? 0,
      imageUrl: skin.imageUrl ?? ''
    })),
    isStatTrak: rawTrade.isStatTrak ?? false,
    isSouvenir: rawTrade.isSouvenir ?? false
  };
}
