export const filterSkins = (skins, filters) => {
  return skins.filter(skin => {
    const {
      wear,
      rarity,
      type,
      collection,
      weapon,
      priceMin,
      priceMax
    } = filters;

    const matchesWear = wear.length === 0 || wear.includes(skin.wear);
    const matchesRarity = rarity.length === 0 || rarity.includes(skin.rarity);
    const skinType = skin.isStatTrak ? 'StatTrak' : skin.isSouvenir ? 'Souvenir' : 'Regular';
    const matchesType = type.length === 0 || type.includes(skinType);
    const matchesCollection = collection.length === 0 || collection.includes(skin.collection);
    const skinWeapon = skin.name.split(' | ')[0];
    const matchesWeapon = weapon.length === 0 || weapon.includes(skinWeapon);
    const price = parseFloat(skin.price);
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    const matchesPriceMin = !priceMin || price >= min;
    const matchesPriceMax = !priceMax || price <= max;

    return (
      matchesWear &&
      matchesRarity &&
      matchesType &&
      matchesCollection &&
      matchesWeapon &&
      matchesPriceMin &&
      matchesPriceMax
    );
  });
};
