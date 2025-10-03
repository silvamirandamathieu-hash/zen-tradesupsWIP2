import { bulkAddEnrichedInputs, getSavedTradeUps } from "../db";
export async function generateEnrichedInputs() {
  try {
    const savedTradeUps = await getSavedTradeUps();
    const similarSkinsMap = new Map();

    for (const trade of savedTradeUps) {
      const inputs = trade?.data?.inputs;
      if (!Array.isArray(inputs)) continue;

      for (const skin of inputs) {
        if (
          !skin?.name ||
          !skin?.collection ||
          !skin?.wear ||
          !skin?.rarity
        ) {
          console.warn('Skin ignoré (incomplet):', skin);
          continue;
        }

        const key = `${skin.collection}_${skin.wear}_${skin.rarity}`;
        if (!similarSkinsMap.has(key)) similarSkinsMap.set(key, []);
        similarSkinsMap.get(key).push(skin);
      }
    }

    const enrichedSkins = [];

    for (const [groupKey, skins] of similarSkinsMap.entries()) {
      const floatAvg =
        skins.reduce((sum, s) => sum + (s.float ?? 0), 0) / skins.length;
      const priceMax = Math.max(...skins.map(s => s.price ?? 0));

      for (const skin of skins) {
        enrichedSkins.push({
          id: `${skin.name}_${skin.collection}_${skin.wear}`,
          groupKey,
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

    if (enrichedSkins.length === 0) {
      console.warn('Aucun skin enrichi à enregistrer.');
      return;
    }
    console.log(`✅ ${enrichedSkins.length} skins enrichis enregistrés`);


    await bulkAddEnrichedInputs(enrichedSkins);
    console.log(`✅ ${enrichedSkins.length} skins enrichis enregistrés dans la base.`);
  } catch (err) {
    console.error('❌ Erreur lors de la génération des inputs enrichis:', err);
  }
  
}
