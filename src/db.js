import Dexie from 'dexie';

export const db = new Dexie('cs2TradeUpDB');

// 📦 Définition des tables
db.version(7).stores({
  inventory: '++id,name,wear,float,collection,collectionIMGUrl,rarity,isStatTrak,imageUrl',
  allSkins: '++id,name,wear,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume,imageUrl',
  history: '++id,date,name,wear,float,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume',
  currentTradeUps: '++id,name,collection,inputs,outputs,resultSkin,isStatTrak,profitability,date,urls',
  savedTradeUps: '++id,name,collection,inputs,outputs,resultSkin,isStatTrak,profitability,date,urls',
  favoriteTradeUps: 'id' // ⭐ Table des favoris
});

//
// 📦 INVENTAIRE
//
export async function getInventory() {
  return db.inventory.toArray();
}

export async function getAllInventory() {
  return db.allSkins.toArray();
}

export async function addSkin(skin) {
  if (!skin || typeof skin !== 'object') throw new Error('Skin invalide');
  return db.inventory.add(skin);
}

export async function addAllSkin(allSkin) {
  if (!allSkin || typeof allSkin !== 'object') throw new Error('Skin invalide');
  return db.allSkins.add(allSkin);
}

export async function bulkAddInventory(skins) {
  if (!Array.isArray(skins)) throw new Error('Données invalides');
  return db.inventory.bulkAdd(skins);
}

export async function bulkAddAllSkins(skins) {
  if (!Array.isArray(skins)) throw new Error('Données invalides');
  return db.allSkins.bulkPut(skins);
}

export async function clearInventory() {
  return db.inventory.clear();
}

export async function clearAllInventory() {
  return db.allSkins.clear();
}

//
// 🔄 MIGRATION
//
export async function migrateInventory() {
  const all = await getInventory();
  const migrated = all.map(skin => {
    const item = {
      float: skin.float ?? 0,
      price: skin.price ?? 0,
      tradeProtected: skin.tradeProtected ?? false,
      protectionIcon: skin.protectionIcon ?? ''
    };
    return {
      ...skin,
      statTrakItems: skin.isStatTrak ? [item] : [],
      regularItems: !skin.isStatTrak ? [item] : []
    };
  });
  await clearInventory();
  await db.inventory.bulkAdd(migrated);
}

export async function migrateAllSkins() {
  const all = await getAllInventory();
  const migrated = all.map(skin => ({
    ...skin,
    price: skin.price ?? 0,
    volume: skin.volume ?? 0,
    isST: skin.isST ?? false,
    isSV: skin.isSV ?? false
  }));
  await clearAllInventory();
  await db.allSkins.bulkAdd(migrated);
}

//
// 📜 HISTORIQUE
//
export async function addHistory(entry) {
  if (!entry || typeof entry !== 'object') throw new Error('Entrée invalide');
  return db.history.add(entry);
}

export async function getHistory() {
  return db.history.orderBy('date').reverse().toArray();
}

export async function clearHistory() {
  return db.history.clear();
}

//
// 🧪 TRADE-UP
//
export async function addCurrentTradeUp(tradeUp) {
  if (!tradeUp || typeof tradeUp !== 'object') throw new Error('Trade-up invalide');
  return db.currentTradeUps.add({ ...tradeUp, date: new Date().toISOString() });
}

export async function getCurrentTradeUps() {
  return db.currentTradeUps.orderBy('date').reverse().toArray();
}

export async function updateCurrentTradeUp(id, updatedTradeUp) {
  if (!id || typeof updatedTradeUp !== 'object') throw new Error('Trade-up invalide');
  return db.currentTradeUps.update(id, { ...updatedTradeUp, date: new Date().toISOString() });
}

export async function deleteCurrentTradeUp(id) {
  return db.currentTradeUps.delete(id);
}

export async function clearCurrentTradeUps() {
  return db.currentTradeUps.clear();
}

export async function addSavedTradeUp(tradeUp) {
  if (!tradeUp || typeof tradeUp !== 'object') throw new Error('Trade-up invalide');
  const id = tradeUp.id || crypto.randomUUID();
  return db.savedTradeUps.put({ ...tradeUp, id, date: new Date().toISOString() });
}

export async function getSavedTradeUps() {
  return db.savedTradeUps.orderBy('date').reverse().toArray();
}

export async function deleteSavedTradeUp(id) {
  return db.savedTradeUps.delete(id);
}

export async function clearSavedTradeUps() {
  return db.savedTradeUps.clear();
}

export async function updateSavedTradeUp(id, updatedTradeUp) {
  if (!id || typeof updatedTradeUp !== 'object') {
    throw new Error('Trade-up invalide');
  }
  return db.savedTradeUps.update(id, {
    ...updatedTradeUp,
    date: new Date().toISOString()
  });
}

export async function updateTradeUpUrl(id, url, type = 'current') {
  if (!id || typeof url !== 'string') {
    throw new Error('Paramètres invalides');
  }

  const table =
    type === 'saved' ? db.savedTradeUps :
    type === 'current' ? db.currentTradeUps :
    null;

  if (!table) throw new Error('Type de trade-up inconnu');

  return table.update(id, {
    urlTradeUp: url,
    date: new Date().toISOString()
  });
}

//
// ⭐ FAVORIS
//
export async function addFavoriteTradeUp(id) {
  if (!id) throw new Error('ID invalide');
  return db.favoriteTradeUps.put({ id });
}

export async function removeFavoriteTradeUp(id) {
  if (!id) throw new Error('ID invalide');
  return db.favoriteTradeUps.delete(id);
}

export async function getFavoriteTradeUps() {
  const all = await db.favoriteTradeUps.toArray();
  return all.map(fav => fav.id);
}

export async function clearFavoriteTradeUps() {
  return db.favoriteTradeUps.clear();
}

export async function cleanOrphanFavorites() {
  const saved = await getSavedTradeUps();
  const savedIds = saved.map(t => t.id);
  const favorites = await getFavoriteTradeUps();
  const orphans = favorites.filter(id => !savedIds.includes(id));
  for (const id of orphans) {
    await removeFavoriteTradeUp(id);
  }
  return orphans.length;
}
