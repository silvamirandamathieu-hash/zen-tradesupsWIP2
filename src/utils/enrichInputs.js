import { getSavedTradeUps } from '../db';
import { bulkAddEnrichedInputs } from '../db';

export async function generateEnrichedInputs() {
  const savedTradeUps = await getSavedTradeUps();
  const similarSkinsMap = new Map();

  for (const trade of savedTradeUps) {
    const inputs = trade?.data?.inputs;
    if (!Array.isArray(inputs)) continue;

    for (const skin of inputs) {
        if (!skin?.collection || !skin?.wear || !skin?.rarity) continue;

        const key = `${skin.collection}_${skin.wear}_${skin.rarity}`;
        if (!similarSkinsMap.has(key)) similarSkinsMap.set(key, []);
        similarSkinsMap.get(key).push(skin);
    }
    }


  const enrichedSkins = [];

  for (const [key, skins] of similarSkinsMap.entries()) {
    const floatAvg = skins.reduce((sum, s) => sum + (s.float ?? 0), 0) / skins.length;
    const priceMax = Math.max(...skins.map(s => s.price ?? 0));

    for (const skin of skins) {
      enrichedSkins.push({
        id: `${skin.name}_${skin.collection}_${skin.wear}`,
        groupKey: key,
        name: skin.name,
        wear: skin.wear,
        float: floatAvg,
        collection: skin.collection,
        rarity: skin.rarity,
        isStatTrak: skin.isStatTrak ?? false,
        isSouvenir: skin.isSouvenir ?? false,
        price: skin.price ?? 0,
        priceMax,
        imageUrl: skin.imageUrl ?? ''
      });
    }
  }

  await bulkAddEnrichedInputs(enrichedSkins);
}
