// EnrichedTradeUp.js

const clamp = (v, min, max) => {
  if (v == null) return v;
  if (min != null && v < min) return min;
  if (max != null && v > max) return max;
  return v;
};

// Convertit une float (0..1) en label d'usure tel que ton priceMap attend "Factory New", "Minimal Wear", ...
// Ajuste les bornes si ton système utilise des seuils différents.
const floatToWearLabel = (f) => {
  if (f == null) return null;
  if (f <= 0.07) return 'Factory New';
  if (f <= 0.15) return 'Minimal Wear';
  if (f <= 0.38) return 'Field-Tested';
  if (f <= 0.45) return 'Well-Worn';
  return 'Battle-Scarred';
};

// Si l'item n'a pas de valeur float précise, mais a un range (par ex. minWear/maxWear),
// on calcule une valeur représentative en respectant les float caps.
// Si tu n'as pas minWear/maxWear, cette partie est neutre et laisse la float à null.
const resolveRepresentativeFloat = (skin) => {
  const hasExactFloat = typeof skin.float === 'number';
  const capMin = (typeof skin.floatCapMin === 'number') ? skin.floatCapMin : null;
  const capMax = (typeof skin.floatCapMax === 'number') ? skin.floatCapMax : null;

  if (hasExactFloat) {
    return clamp(skin.float, capMin, capMax);
  }

  // Si on a un intervalle (par ex. skin.minWear, skin.maxWear), on utilise le milieu borné par caps
  const hasRange = typeof skin.minWear === 'number' && typeof skin.maxWear === 'number';
  if (hasRange) {
    const raw = (skin.minWear + skin.maxWear) / 2;
    return clamp(raw, capMin ?? skin.minWear, capMax ?? skin.maxWear);
  }

  // fallback null (aucune info)
  return null;
};

export const enrichTradeUp = (tradeUp, priceMap) => {
  const getSkinPriceFromMap = (skin, effectiveWearLabel) => {
    const prefix = skin.isStatTrak ? '★ ST ' : skin.isSouvenir ? '★ SV ' : '';
    // usage : key = `${prefix}${skin.name} (Factory New)` si priceMap indexe par "(WearLabel)"
    const wearKey = effectiveWearLabel ?? skin.wear ?? '';
    const key = `${prefix}${skin.name} (${wearKey})`;
    return priceMap?.[key]?.price ?? null;
  };

  const enrichedInputs = tradeUp.inputs.map(skin => {
    const effectiveFloat = resolveRepresentativeFloat(skin);
    const effectiveWear = effectiveFloat != null ? floatToWearLabel(effectiveFloat) : skin.wear ?? null;
    const priceFromMap = getSkinPriceFromMap(skin, effectiveWear);
    const finalPrice = priceFromMap ?? skin.price ?? 0;

    return {
      ...skin,
      effectiveFloat,
      effectiveWear,
      price: finalPrice
    };
  });

  const enrichedOutputs = tradeUp.outputs.map(skin => {
    const effectiveFloat = resolveRepresentativeFloat(skin);
    const effectiveWear = effectiveFloat != null ? floatToWearLabel(effectiveFloat) : skin.wear ?? null;
    const priceFromMap = getSkinPriceFromMap(skin, effectiveWear);
    const finalPrice = priceFromMap ?? skin.price ?? 0;

    return {
      ...skin,
      effectiveFloat,
      effectiveWear,
      price: finalPrice,
      chance: skin.chance ?? 0
    };
  });

  const totalInputPrice = enrichedInputs.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const avgOutputValue = enrichedOutputs.reduce((sum, s) => sum + (Number(s.price) || 0) * (s.chance / 100), 0);
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
