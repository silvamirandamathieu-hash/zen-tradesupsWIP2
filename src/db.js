import Dexie from 'dexie';

export const db = new Dexie('cs2TradeUpDB');

// Définition des tables
db.version(3).stores({
  inventory: '++id,name,wear,collection,collectionIMGUrl,rarity,isStatTrak,imageUrl',
  allSkins: '++id,name,wear,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume,imageUrl',
  history:  '++id,name,wear,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume',
  tradeUps: '++id,date,data', // nouvelle table pour les trade-ups sauvegardés
  currentTradeUps: '++id,date,data',   // table pour le trade-up en cours (id fixe = 1)
  savedTradeUps: '++id,date,data'
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
// Ajouter un trade-up en cours
export async function addCurrentTradeUp(tradeUpData) {
  if (!tradeUpData || typeof tradeUpData !== 'object') throw new Error('Trade-up invalide');
  return db.currentTradeUps.add({ date: Date.now(), data: tradeUpData });
}

// Récupérer tous les trade-ups en cours
export async function getCurrentTradeUps() {
  return db.currentTradeUps.orderBy('date').reverse().toArray();
}

// Supprimer tous les trade-ups en cours
export async function clearCurrentTradeUps() {
  return db.currentTradeUps.clear();
}


// Supprimer un trade-up en cours spécifique
export async function deleteCurrentTradeUp(id) {
  return db.currentTradeUps.delete(id);
}
export async function addSavedTradeUp(tradeUpData) {
  return db.savedTradeUps.add({ date: Date.now(), data: tradeUpData });
}

export async function getSavedTradeUps() {
  return db.savedTradeUps.orderBy('date').reverse().toArray();
}

export async function deleteSavedTradeUp(id) {
  return db.savedTradeUps.delete(id);
}
