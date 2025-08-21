//db.js

import Dexie from 'dexie';

export const db = new Dexie('cs2TradeUpDB');

// Définition des tables
db.version(1).stores({
  inventory: '++id,name,wear,collection,collectionIMGUrl,rarity,isStatTrak,imageUrl',
  allSkins: '++id,name,wear,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume,imageUrl',
  history:  '++id,name,wear,rarity,isStatTrak,isSouvenir,isST,isSV,collection,price,date,volume'
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

// (optionnel) migration pour AllSkins
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
