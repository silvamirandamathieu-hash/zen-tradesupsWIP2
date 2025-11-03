//TradeUpCard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { deleteCurrentTradeUp, updateCurrentTradeUp, updateSavedTradeUp, updateSkinFloatCaps, getAllInventory  } from '../db';

function TradeUpCard({ trade, actions, onDelete, onEdit, isSaved, id, allSkins, priceMap}) {
  const [urlInput, setUrlInput] = useState('');
  const [localUrls, setLocalUrls] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(trade.note || '');
  const [outputLinks, setOutputLinks] = useState({});
  const [floatCaps, setFloatCaps] = useState({});
  const [selectedSkinId, setSelectedSkinId] = useState(null); // Pour ouvrir la fenêtre


  useEffect(() => {
    const storedLinks = localStorage.getItem('outputLinks');
    if (storedLinks) {
      setOutputLinks(JSON.parse(storedLinks));
    }
  }, []);
  useEffect(() => {
    setNote(trade.note || '');
  }, [trade]);

  useEffect(() => {
    setLocalUrls(trade.urls || []);
  }, [trade]);

  useEffect(() => {
    const loadFloatCaps = async () => {
      const allSkins = await getAllInventory(); // ou getAllSkins()
      const caps = {};
      allSkins.forEach(skin => {
        caps[skin.id] = {
          floatMin: skin.floatMin,
          floatMax: skin.floatMax
        };
      });
      setFloatCaps(caps);
    };
    loadFloatCaps();
  }, []);


  const updateFloatCap = (skinId, key, value) => {
    setFloatCaps(prev => ({
      ...prev,
      [skinId]: {
        ...prev[skinId],
        [key]: value
      }
    }));
  };


  const matchingSkins = useMemo(() => {
    if (!Array.isArray(trade?.inputs) || !Array.isArray(allSkins)) return [];

    const normalize = str =>
      typeof str === 'string'
        ? str.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
        : '';

    const criteria = trade.inputs
      .filter(skin => skin?.collection && skin?.wear && skin?.rarity)
      .map(skin => ({
        collection: normalize(skin.collection),
        wear: normalize(skin.wear),
        rarity: normalize(skin.rarity),
        isStatTrak: !!skin.isStatTrak,
        isSouvenir: !!skin.isSouvenir
      }));

    const seen = new Set();

    return allSkins.filter(skin => {
      const key = `${normalize(skin.name)}-${normalize(skin.collection)}-${normalize(skin.wear)}-${normalize(skin.rarity)}-${skin.isStatTrak}-${skin.isSouvenir}`;

      const skinNormalized = {
        collection: normalize(skin.collection),
        wear: normalize(skin.wear),
        rarity: normalize(skin.rarity),
        isStatTrak: !!skin.isStatTrak,
        isSouvenir: !!skin.isSouvenir
      };

      const isMatch = criteria.some(c =>
        c.collection === skinNormalized.collection &&
        c.wear === skinNormalized.wear &&
        c.rarity === skinNormalized.rarity &&
        c.isStatTrak === skinNormalized.isStatTrak &&
        c.isSouvenir === skinNormalized.isSouvenir
      );

      if (isMatch && !seen.has(key)) {
        seen.add(key);
        return true;
      }

      return false;
    });
  }, [trade?.inputs, allSkins]);





  if (!trade) return null;

  const {
    name,
    collection,
    date,
    resultSkin,
    inputs = [],
    outputs = [],
    isStatTrak = false,
    totalInputPrice,
    avgOutputValue,
    profit,
    profitability,
    floatCapMin,
    floatCapMax,
  } = trade;

  const handleDelete = async () => {
    await deleteCurrentTradeUp(id);
    alert('🗑️ Supprimé des trade-ups en cours');
    onDelete?.();
  };
  const handleAddLink = (skinName) => {
    const url = prompt(`🔗 Ajouter un lien pour ${skinName}`);
    if (url) {
      const updatedLinks = { ...outputLinks, [skinName]: url };
      setOutputLinks(updatedLinks);
      localStorage.setItem('outputLinks', JSON.stringify(updatedLinks));
    }
  };
  function generateLisSkinsUrl(skin) {
    if (!skin || !skin.name || !skin.wear || skin.float === undefined) return null;

    const isStatTrak = skin.isStatTrak ?? false;

    let cleanedName = skin.name
      .replace(/StatTrak™?\s*\|\s*/i, '')
      .replace(/\|\s*/g, '');

    let formattedName = cleanedName
      .toLowerCase()
      .replace(/[^a-z0-9.'’]+/gi, '-') // conserve . et ' (apostrophes typographiques incluses)
      .replace(/^-+|-+$/g, '');

    if (isStatTrak) {
      formattedName = `stattrak-${formattedName}`;
    }

    const wearFormatted = skin.wear.toLowerCase().replace(/\s+/g, '-');
    return `https://lis-skins.com/market/csgo/${formattedName}-${wearFormatted}/?sort_by=price_asc&float_to=${skin.float.toFixed(2)}`;
  }

  function generateLisSkinsUnlocksUrl(skin) {
    if (!skin || !skin.name || !skin.wear || skin.float === undefined) return null;

    const isStatTrak = skin.isStatTrak ?? false;

    let cleanedName = skin.name
      .replace(/StatTrak™?\s*\|\s*/i, '')
      .replace(/\|\s*/g, '');

    let formattedName = cleanedName
      .toLowerCase()
      .replace(/[^a-z0-9.'’]+/gi, '-') // conserve . et ' (apostrophes typographiques incluses)
      .replace(/^-+|-+$/g, '');

    if (isStatTrak) {
      formattedName = `stattrak-${formattedName}`;
    }

    const wearFormatted = skin.wear.toLowerCase().replace(/\s+/g, '-');
    return `https://lis-skins.com/market/csgo/${formattedName}-${wearFormatted}/?sort_by=unlock_at_desc`;
  }



  function generateShadowPayUrl(skin) {
    const nameEncoded = encodeURIComponent(skin.name).replace(/%20/g, '+');
    const wearEncoded = skin.wear?.replace(/\s/g, '+') ?? 'Field-Tested';
    const floatTo = skin.float?.toFixed(6) ?? '0.2';

    const exteriors = `["${wearEncoded}"]`;
    const floatRange = `{"from":0,"to":${floatTo}}`;

    const stattrakParam = skin.isStatTrak ? 'is_stattrak=1' : 'is_stattrak';
    const souvenirParam = skin.isSouvenir ? '&is_souvenir=1' : '';

    return `https://shadowpay.com/csgo-items?exteriors=${exteriors}&float=${floatRange}&price_from=0&price_to=75143.68&${stattrakParam}${souvenirParam}&hold_days&sort_column=price&sort_dir=asc&search=${nameEncoded}`;
  }

/**
 * Génère l’URL SkinPort pour un skin CS:GO
 * avec filtres weargt / wearlt, exteriors, StatTrak et Souvenir.
 *
 * @param {Object}  skin
 * @param {string}  skin.name        – ex. "M4A4 | Magnesium"
 * @param {string}  skin.wear        – ex. "Field-Tested"
 * @param {number}  skin.float       – float actuel du skin
 * @param {Object}  [opts]
 * @param {number}  [opts.floatMin]  – borne inférieure (0–1), sinon min du wear
 * @param {number}  [opts.floatMax]  – borne supérieure, sinon skin.float
 * @returns {string|null}
 */
function generateSkinPortUrl(
  skin,
  { floatMin, floatMax } = {}
) {
  // validation minimale
  if (
    !skin ||
    typeof skin.name  !== 'string' ||
    typeof skin.wear  !== 'string' ||
    typeof skin.float !== 'number'
  ) {
    return null;
  }

  // 1) plages float par wear
  const wearRanges = {
    'Factory New':    { min: 0,    max: 0.07  },
    'Minimal Wear':   { min: 0.07, max: 0.15  },
    'Field-Tested':   { min: 0.15, max: 0.38  },
    'Well-Worn':      { min: 0.38, max: 0.45  },
    'Battle-Scarred': { min: 0.45, max: 1     }
  };

  const range = wearRanges[skin.wear] || { min: 0, max: skin.float };

  // 2) floatMin / floatMax effectifs
  const minFloat = typeof floatMin === 'number'
    ? floatMin
    : range.min;

  const maxFloat = typeof floatMax === 'number'
    ? floatMax
    : skin.float;

  // 3) conversion en pourcents et arrondi
  const toPercent = v => Math.round(v * 100);
  const wearGt = toPercent(minFloat);
  const wearLt = toPercent(maxFloat);

  // 4) liste de tous les exterior IDs
  const wearToExterior = {
    'Factory New':    2,
    'Minimal Wear':   4,
    'Field-Tested':   3,
    'Well-Worn':      5,
    'Battle-Scarred': 1
  };
  const allExteriors = Object.values(wearToExterior).join(',');

  // 5) encodage du nom
  const nameEncoded = encodeURIComponent(skin.name).replace(/%20/g, '+');

  // 6) flags StatTrak / Souvenir
  const stattrakParam = skin.isStatTrak ? '1' : '0';
  const souvenirParam = skin.isSouvenir ? '1' : '0';

  // 7) assemblage de l’URL
  return [
    'https://skinport.com/fr/market',
    '?sort=price&order=asc',
    `&search=${nameEncoded}`,
    `&weargt=${wearGt}`,
    `&wearlt=${wearLt}`,
    `&exterior=${encodeURIComponent(allExteriors)}`,
    `&stattrak=${stattrakParam}`,
    `&souvenir=${souvenirParam}`
  ].join('');
}
  function generateBuffMarketUrl(skin, {
    isStatTrak = false,
    isSouvenir = false,
    sortBy = "price.asc"
  } = {}) {
    if (!skin?.name || !skin?.wear) return null;

    // 1. Map d’usure vers wearcategory
    const wearCategoryMap = {
      "Factory New":    0,
      "Minimal Wear":   1,
      "Field-Tested":   2,
      "Well-Worn":      3,
      "Battle-Scarred": 4
    };
    const wearCategory = wearCategoryMap[skin.wear] ?? 2;

    // 2. Détermination de la qualité
    let quality = "normal";
    if (skin.isSouvenir) {
      quality = "tournament";
    } else if (skin.isStatTrak) {
      quality = "strange";
    }

    // 3. Nettoyage du nom
    const cleanedName = skin.name
      .replace(/\s*\|\s*/g, ' ')
      .replace(/[.'’]/g, '')
      .trim();

    // 4. Encodage du nom
    const encodedName = encodeURIComponent(cleanedName);

    // 5. Construction de l’URL
    return `https://buff.market/market/all` +
          `?exterior=wearcategory${wearCategory}` +
          `&quality=${quality}` +
          `&search=${encodedName}` +
          `&sort_by=${sortBy}`;
  }

  /**
 * Génère une URL vers Skinbid.com pour une skin CS:GO/CS2,
 * en utilisant un intervalle de float basé sur l’usure,
 * et en encodant le nom pour la recherche.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "FAMAS | Royal Guard"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – valeur max de float
 *
 * @param {Object}  [options]
 * @param {number}  [options.floatMin]             – override du min
 * @param {number}  [options.floatMax=skin.float]  – max float
 * @param {string}  [options.sortBy="wear"]        – critère de tri
 * @param {boolean} [options.ascending=true]       – sens de tri
 * @param {number}  [options.take=60]              – nombre d’items
 * @param {number}  [options.skip=0]               – offset
 *
 * @returns {string|null}
 */
/**
 * Génère une URL vers Skinbid.com avec Wear en format texte (MinimalWear, FieldTested…),
 * et nom de recherche incluant "StatTrak" si nécessaire.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Five-SeveN | Urban Hazard"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {boolean}[skin.isStatTrak]  – true → ajoute "StatTrak" devant le nom
 *
 * @param {Object}  [options]
 * @param {string}  [options.sortBy="wear"]        – critère de tri
 * @param {boolean} [options.ascending=true]       – sens de tri
 * @param {number}  [options.take=60]              – nombre d’items
 * @param {number}  [options.skip=0]               – offset
 *
 * @returns {string|null}
 */
function generateSkinbidUrl(
  skin,
  {
    sortBy     = "wear",
    ascending  = true,
    take       = 60,
    skip       = 0
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Mapping usure → slug Skinbid
  const wearSlugMap = {
    "Factory New":    "FactoryNew",
    "Minimal Wear":   "MinimalWear",
    "Field-Tested":   "FieldTested",
    "Well-Worn":      "WellWorn",
    "Battle-Scarred": "BattleScarred"
  };
  const wearSlug = wearSlugMap[skin.wear] ?? skin.wear.replace(/\s+/g, "");

  // 2. Construire le nom de recherche
  const baseName = skin.name.replace(/\s*\|\s*/g, " ");
  const searchName = (skin.isStatTrak ? "StatTrak " : "") + baseName;
  const encodedSearch = encodeURIComponent(searchName); // garde %20

  // 3. Encodage du tri
  const sortParam = `${sortBy}#${ascending ? "asc" : "desc"}`;

  // 4. Assemblage final
  return `https://skinbid.com/market?Wear=${wearSlug}` +
         `&sort=${encodeURIComponent(sortParam)}` +
         `&search=${encodedSearch}` +
         `&take=${take}&skip=${skip}`;
}
/**
 * Génère une URL vers Tradeit.gg pour une skin CS:GO/CS2,
 * avec nom complet encodé pour le paramètre search.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Glock-18 | Glockingbird"
 *
 * @returns {string|null}
 */
function generateTradeitUrl(skin) {
  if (!skin?.name) return null;

  // 1. Encodage du nom complet
  const encodedName = encodeURIComponent(skin.name);

  // 2. Assemblage final
  return `https://tradeit.gg/csgo/store?aff=SkinSnipe&search=${encodedName}`;
}

/**
 * Génère une URL vers CS.Money Market avec nom complet, usure, StatTrak/Souvenir,
 * tri par float croissant, et float max basé sur l’input.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Negev | Terrain"
 * @param {string}  skin.wear         – ex. "Field-Tested"
 * @param {number}  skin.float        – valeur max de float
 * @param {boolean}[skin.isStatTrak]  – true → version StatTrak
 * @param {boolean}[skin.isSouvenir]  – true → version Souvenir
 *
 * @param {Object}  [options]
 * @param {string}  [options.lang="fr"]            – langue du site
 * @param {string}  [options.sortBy="float"]       – critère de tri
 * @param {string}  [options.order="asc"]          – sens du tri
 *
 * @returns {string|null}
 */
function generateCsMoneyMarketUrl(
  skin,
  {
    lang     = "fr",
    sortBy   = "float",
    order    = "asc"
  } = {}
) {
  if (!skin?.name || !skin?.wear || typeof skin.float !== "number") return null;

  // 1. Construction du nom complet avec usure
  const fullName = `${skin.name} (${skin.wear})`;
  const encodedName = encodeURIComponent(fullName);

  // 2. StatTrak et Souvenir
  const statTrak = skin.isStatTrak ? "true" : "false";
  const souvenir = skin.isSouvenir ? "true" : "false";

  // 3. Float max
  const floatMaxParam = `&maxFloat=${encodeURIComponent(skin.float.toFixed(3))}`;

  // 4. Assemblage final
  return `https://cs.money/${lang}/market/buy/?` +
         `utm_source=mediabuy&utm_medium=skinsnipe&utm_campaign=market&utm_content=link` +
         `&search=${encodedName}` +
         `&isStatTrak=${statTrak}` +
         `&isSouvenir=${souvenir}` +
         `&sort=${encodeURIComponent(sortBy)}` +
         `&order=${encodeURIComponent(order)}` +
         `${floatMaxParam}`;
}

/**
 * Génère une URL vers Skinflow.gg pour une skin CS:GO/CS2,
 * avec nom complet incluant l’usure, encodé pour le paramètre search.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "AK-47 | Slate"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {string}  [lang="fr"]       – langue du site
 *
 * @returns {string|null}
 */
function generateSkinflowUrl(skin, lang = "fr") {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Construction du nom complet avec usure
  const fullName = `${skin.name} (${skin.wear})`;

  // 2. Encodage du nom
  const encodedName = encodeURIComponent(fullName);

  // 3. Assemblage final
  return `https://skinflow.gg/${lang}/buy?search=${encodedName}`;
}

/**
 * Génère une URL vers SIH.app pour une skin CS:GO/CS2,
 * avec nom complet incluant "StatTrak™" si nécessaire et usure,
 * encodé pour le paramètre item.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "AUG | Luxe Trim"
 * @param {string}  skin.wear         – ex. "Factory New"
 * @param {boolean}[skin.isStatTrak]  – true → ajoute "StatTrak™" devant
 *
 * @returns {string|null}
 */
function generateSihUrl(skin) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Construction du nom complet
  const prefix = skin.isStatTrak ? "StatTrak™ " : "";
  const fullName = `${prefix}${skin.name} (${skin.wear})`;

  // 2. Encodage du nom
  const encodedItem = encodeURIComponent(fullName);

  // 3. Assemblage final
  return `https://sih.app/market?item=${encodedItem}&sortBy=-profitPercent&appId=730`;
}



/**
 * Génère une URL vers HaloSkins.com pour une skin CS:GO/CS2,
 * avec nom nettoyé, usure convertie en WearCategory, qualité (StatTrak/Souvenir),
 * et tri configurable.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "UMP-45 | K.O."
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {boolean}[skin.isStatTrak]  – true → version StatTrak
 * @param {boolean}[skin.isSouvenir]  – true → version Souvenir
 *
 * @param {Object}  [options]
 * @param {number}  [options.sort=1]  – 1 = prix croissant, 2 = float, etc.
 *
 * @returns {string|null}
 */
function generateHaloSkinsUrl(
  skin,
  {
    sort = 1
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Map d’usure vers WearCategory
  const wearCategoryMap = {
    "Factory New":    0,
    "Minimal Wear":   1,
    "Field-Tested":   2,
    "Well-Worn":      3,
    "Battle-Scarred": 4
  };
  const wearCategory = wearCategoryMap[skin.wear] ?? 2;

  // 2. Détermination de la qualité
  let quality = "normal";
  if (skin.isSouvenir) {
    quality = "tournament";
  } else if (skin.isStatTrak) {
    quality = "strange";
  }

  // 3. Nettoyage du nom
  const cleanedName = skin.name
    .replace(/\s*\|\s*/g, " ")       // remplace " | " par espace
    .replace(/[.'’™]/g, "")          // retire ponctuation et "™"
    .replace(/\s+/g, " ")            // normalise les espaces
    .trim();

  // 4. Encodage du nom
  const encodedName = encodeURIComponent(cleanedName);

  // 5. Construction de l’URL
  return `https://haloskins.com/fr/market` +
         `?keyword=${encodedName}` +
         `&exterior=WearCategory${wearCategory}` +
         `&quality=${quality}` +
         `&sort=${sort}`;
}


  function generateSkinPlaceUrl(skin) {
    if (!skin?.name || !skin?.wear) return null;

    // 1. Nettoyage : retirer les pipes, points et apostrophes
    const cleanedName = skin.name
      .replace(/\s*\|\s*/g, ' ')       // remplace " | " par un espace
      .replace(/[.'’]/g, '')           // supprime les points et apostrophes

    // 2. Encodage + remplacement des espaces par des tirets
    const nameEncodedSP = encodeURIComponent(cleanedName).replace(/%20/g, '-');

    // 3. Encodage du wear avec "+" pour les espaces
    const wearEncodedSP = skin.wear?.replace(/\s/g, '+') ?? 'Field-Tested';

    return `https://skin.place/buy-cs2-skins/${nameEncodedSP}?exterior=${wearEncodedSP}`;
  }

  //https://skinbaron.de/fr/csgo/Pistol/P2000/Lifted-Spirits/Minimal-Wear?sort=BE
  
  /**
 * Génère l’URL SkinBaron pour un skin CS:GO,
 * avec optional StatTrak et Souvenir.
 *
 * @param {Object}  skin
 * @param {string}  skin.name    — ex. "XM1014 | Entombed"
 * @param {string}  skin.wear    — ex. "Minimal Wear"
 * @param {Object}  [opts]
 * @param {boolean} [opts.isStatTrak=false]
 * @param {boolean} [opts.isSouvenir=false]
 * @returns {string}
 */
function generateSkinBaronUrl(
  skin,
  { isStatTrak = false, isSouvenir = false } = {}
) {
  const categories = {
    Heavy:  ["Negev", "Sawed-Off", "M249", "Nova", "XM1014", "MAG-7"],
    SMG:    ["MP9", "PP-Bizon", "UMP-45", "MP7", "MAC-10", "P90", "MP5-SD"],
    Rifle:  ["AK-47", "AUG", "AWP", "FAMAS", "G3SG1", "M4A4", "SCAR-20", "M4A1-S", "Galil AR", "SG 553", "SSG 08"],
    Pistol: ["Five-SeveN", "Glock-18", "Tec-9", "P2000", "P250", "USP-S", "CZ75-Auto", "Desert Eagle", "Dual Berettas", "Revolver R8", "R8 Revolver"]
  };

  // 1. Séparation nom d’arme et skin
  const [weaponName, skinSuffix = ""] = skin.name.split(/\s*\|\s*/);

  // 2. Détection de la catégorie (Heavy, SMG, etc.)
  const category = Object
    .entries(categories)
    .find(([, weapons]) => weapons.includes(weaponName))
    ?.[0] || "Misc";

  // 3. Construction des slugs pour l’URL
  const weaponSlug = weaponName.trim().replace(/\s+/g, "-");
  const skinSlug   = skinSuffix.trim().replace(/\s+/g, "-");
  const wearSlug   = (skin.wear || "").trim().replace(/\s+/g, "-");

  // 4. Paramètres StatTrak / Souvenir
  const flags = [];
  if (skin.isStatTrak) flags.push("statTrak=true");
  if (skin.isSouvenir) flags.push("souvenir=true");
  const extraQuery = flags.length ? "&" + flags.join("&") : "";

  // 5. Assemblage final
  return (
    `https://skinbaron.de/fr/csgo/` +
    `${category}/` +
    `${weaponSlug}/` +
    `${skinSlug}/` +
    `${wearSlug}` +
    `?sort=BE` +
    extraQuery
  );
}

/**
 * Génère l’URL BitSkins CS2 avec exterior_id et category_id injectés automatiquement.
 *
 * @param {Object}  skin
 * @param {string}  skin.name              — ex. "P2000 | Lifted Spirits"
 * @param {string}  skin.wear              — ex. "Field-Tested"
 * @param {number}  [skin.float]           — valeur de float si floatMax non spécifié
 * @param {number}  [floatMin=0]
 * @param {number|null} [floatMax=null]    — si null on prend skin.float ou 1
 * @param {number[]} [exteriorIds=[]]
 * @param {boolean} [isStatTrak=false]
 * @param {boolean} [isSouvenir=false]
 * @param {string}  [sortField="price"]
 * @param {string}  [sortOrder="ASC"]
 * @returns {string}
 */
function generateBitSkinsUrlRaw(
  skin,
  floatMin    = 0,
  floatMax    = null,
  exteriorIds = [],
  isStatTrak  = false,
  isSouvenir  = false,
  sortField   = "price",
  sortOrder   = "ASC"
) {
  // 1) Mappage wear → exterior_id
  const wearMap = {
    "Factory New":    1,
    "Minimal Wear":   2,
    "Field-Tested":   3,
    "Well-Worn":      4,
    "Battle-Scarred": 5
  };
  if (!exteriorIds.length && skin.wear) {
    const id = wearMap[skin.wear];
    if (id) exteriorIds = [id];
  }

  // 2) Détermination de category_id
  const categoryMap = {
    normal:   1,  // skins classiques
    statTrak: 3,  // StatTrak
    souvenir: 5   // Souvenir
  };
  let categoryIds = [];
  if (skin.isStatTrak)  categoryIds.push(categoryMap.statTrak);
  if (skin.isSouvenir)  categoryIds.push(categoryMap.souvenir);
  if (!categoryIds.length) categoryIds.push(categoryMap.normal);

  // 3) Nettoyage du nom
  const cleanName = skin.name
    .replace(/\s*\|\s*/g, "+")
    .trim()
    .replace(/\s+/g, "+");

  // 4) Calcul de float_value_to
  const fvTo = floatMax != null
    ? floatMax
    : (typeof skin.float === "number" ? skin.float : 1);

  // 5) Construction de l’objet search
  const searchObj = {
    order: [{ field: sortField, order: sortOrder }],
    where: {
      skin_name:        cleanName,
      float_value_from: floatMin,
      float_value_to:   fvTo,
      category_id:      categoryIds
    }
  };
  if (exteriorIds.length) {
    searchObj.where.exterior_id = exteriorIds;
  }

  // 6) Encodage minimal
  const rawSearch = JSON.stringify(searchObj).replace(/"/g, "%22");
  return `https://bitskins.com/market/cs2?search=${rawSearch}`;
}

/**
 * Génère une URL DMarket pour un skin CS:GO,
 * avec filtres float, StatTrak et Souvenir.
 *
 * @param {Object}  skin
 * @param {string}  skin.name        — ex. "StatTrak™ | M4A4 | Magnesium"
 * @param {string}  skin.wear        — ex. "Field-Tested"
 * @param {number}  skin.float       — valeur max du float si floatMax non précisé
 * @param {Object}  [opts]
 * @param {number}  [opts.floatMin=0]
 * @param {number}  [opts.floatMax]  — si absent, on prend skin.float
 * @param {boolean} [opts.isStatTrak]  
 * @param {boolean} [opts.isSouvenir]
 * @returns {string|null}
 */
function generateDMarketUrl(
  skin,
  {
    floatMin   = 0,
    floatMax,
    isStatTrak = false,
    isSouvenir = false
  } = {}
) {
  // 1) validations
  if (
    !skin ||
    typeof skin.name  !== 'string' ||
    typeof skin.wear  !== 'string' ||
    typeof skin.float !== 'number'
  ) {
    return null;
  }

  // 2) floatValueTo
  const fvTo = floatMax != null
    ? floatMax
    : skin.float;

  // 3) nettoyage du nom
  let baseName = skin.name
    .replace(/StatTrak™?\s*\|\s*/i, '')
    .replace(/Souvenir\s*\|\s*/i, '')
    .trim();

  // 4) reconstruction du titre : on replace le 1er "|" par " | "
  //    pour garder la forme "Arme | Skin"
  if (baseName.includes('|')) {
    const [weapon, skinSuffix] = baseName.split(/\s*\|\s*/);
    baseName = `${weapon.trim()} | ${skinSuffix.trim()}`;
  }

  // 5) on ajoute le wear entre parenthèses
  const titleRaw = `${baseName} (${skin.wear})`;

  // 6) encodage minimal : espaces→%20, on conserve | (pipe) et ( )
  const titleEncoded = encodeURIComponent(titleRaw)
    .replace(/\+/g, '%20')
    .replace(/%7C/g, '|')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');

  // 7) flags catégories
  const catParams = []
  if (skin.isStatTrak) catParams.push('category_0=stattrak_tm')
  if (skin.isSouvenir) catParams.push('category_1=souvenir')

  // 8) on assemble l’URL
  const params = [
    `floatValueFrom=${floatMin}`,
    `floatValueTo=${fvTo}`,
    ...catParams,
    `title=${titleEncoded}`
  ].join('&');

  return `https://dmarket.com/fr/ingame-items/item-list/csgo-skins?${params}`;
}
/**
 * Génère l’URL cs.money pour un skin CS:GO.
 *
 * @param {Object}  skin
 * @param {string}  skin.name        — ex. "AK-47 | Slate"
 * @param {string}  skin.wear        — ex. "Field-Tested"
 * @param {number}  skin.float       — float actuel du skin
 * @param {Object}  [opts]
 * @param {number}  [opts.maxFloat]  — borne float max (sinon skin.float)
 * @param {string}  [opts.sort="price"] — champ de tri
 * @param {string}  [opts.order="asc"]  — ordre de tri ("asc" ou "desc")
 * @param {boolean} [opts.isStatTrak=false]
 * @param {boolean} [opts.isSouvenir=false]
 * @returns {string|null}
 */
function generateCsMoneyUrl(
  skin,
  {
    maxFloat,
    sort       = "price",
    order      = "asc",
    isStatTrak = false,
    isSouvenir = false
  } = {}
) {
  // 1) validations
  if (
    !skin ||
    typeof skin.name  !== "string" ||
    typeof skin.wear  !== "string" ||
    typeof skin.float !== "number"
  ) {
    return null;
  }

  // 2) float max effectif
  const mf = typeof maxFloat === "number"
    ? maxFloat
    : skin.float;

  // 3) encodage search et exterior
  const searchParam   = encodeURIComponent(skin.name).replace(/\+/g, "%20");
  const exteriorParam = encodeURIComponent(skin.wear).replace(/\+/g, "%20");

  // 4) construction de la liste des query parts
  const parts = [
    `search=${searchParam}`,
    `sort=${sort}`,
    `order=${order}`,
    `maxFloat=${mf}`,
    `exterior=${exteriorParam}`
  ];

  if (skin.isStatTrak) parts.push("isStatTrak=true");
  if (skin.isSouvenir) parts.push("isSouvenir=true");

  // 5) assemblage final
  return `https://cs.money/fr/csgo/trade/?${parts.join("&")}`;
}

/**
 * Génère l’URL Avan Market pour un skin CS:GO
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "AK-47 | Slate"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – float du skin
 * @param {number}  [sort=1]          – ordre de tri (1 = asc, 2 = desc, etc.)
 * @param {string}  [special]         – filtre spécial : 'without', 'stattrak' ou 'souvenir'
 * @returns {string|null}
 */
function generateAvanMarketUrl(
  skin,
  sort = 1,
  { isStatTrak = false, isSouvenir = false } = {}
) {
  // validations
  if (
    !skin ||
    typeof skin.name  !== "string" ||
    typeof skin.wear  !== "string" ||
    typeof skin.float !== "number"
  ) {
    return null;
  }

  // retirer '|' et espaces autour
  const cleanedName = skin.name.replace(/\s*\|\s*/g, " ");

  // encodage (espaces => '+')
  const nameEncoded    = encodeURIComponent(cleanedName).replace(/%20/g, "+");
  const qualityEncoded = encodeURIComponent(skin.wear).replace(/%20/g, "+");

  // float max arrondi à 2 décimales
  const floatMax = skin.float.toFixed(2);

  // URL de base
  let url =
    "https://avan.market/en/market/cs" +
    `?name=${nameEncoded}` +
    `&sort=${sort}` +
    `&quality=${qualityEncoded}` +
    `&float_max=${floatMax}`;

  // déterminer le filtre spécial
  let specialLabel;
  if (skin.isStatTrak) {
    specialLabel = "StatTrak™";
  } else if (skin.isSouvenir) {
    specialLabel = "Souvenir";
  } else {
    specialLabel = "Without StatTrak™";
  }

  // ajouter le paramètre spécial encodé
  const specialEncoded = encodeURIComponent(specialLabel).replace(/%20/g, "+");
  url += `&special=${specialEncoded}`;

  return url;
}

  //
/**
 * Génère l’URL White Market pour un skin CS:GO.
 *
 * @param {Object}  skin
 * @param {string}  skin.name        – ex. "AK-47 | Slate"
 * @param {number}  skin.float       – float actuel du skin
 * @param {Object}  [opts]
 * @param {number}  [opts.floatFrom] – borne inférieure de float (0–1), sinon 0
 * @param {number}  [opts.floatTo]   – borne supérieure de float (0–1), sinon skin.float
 * @param {boolean} [opts.isStatTrak=false]
 * @param {boolean} [opts.isSouvenir=false]
 * @returns {string|null}
 */
function generateWhiteMarketUrl(
  skin,
  {
    floatFrom  = 0,
    floatTo,
    isStatTrak = false,
    isSouvenir = false
  } = {}
) {
  // 1) validation basique
  if (
    !skin ||
    typeof skin.name  !== 'string' ||
    typeof skin.float !== 'number'
  ) {
    return null;
  }

  // 2) nettoyage du nom (supprime "|" et espaces autour)
  const cleanedName = skin.name.replace(/\s*\|\s*/g, ' ');

  // 3) encodage : espaces → '+'
  const nameEncoded = encodeURIComponent(cleanedName)
    .replace(/%20/g, '+');

  // 4) floats effectifs
  const from = typeof floatFrom === 'number'
    ? floatFrom
    : 0;
  const to   = typeof floatTo === 'number'
    ? floatTo
    : skin.float;

  // 5) arrondi à 2 décimales
  const fFrom = from.toFixed(2);
  const fTo   = to.toFixed(2);

  // 6) booléens en chaîne
  const stParam = skin.isStatTrak  ? 'true' : 'false';
  const soParam = skin.isSouvenir  ? 'true' : 'false';

  // 7) assemblage final
  return (
    'https://white.market/market' +
    `?name=${nameEncoded}&sort=pr_a` +
    `&stattrak=${stParam}` +
    `&souvenir=${soParam}` +
    `&float-from=${fFrom}` +
    `&float-to=${fTo}`
  );
}

/**
 * Génère l’URL d’une recherche sur ExeSkins.
 *
 * @param {Object} skin
 * @param {string} skin.name      — ex. "MP5-SD | Necro Jr."
 * @param {string} skin.wear      — ex. "Minimal Wear"
 * @param {Object} [opts]
 * @param {string} [opts.type="Normal"]         — "Normal" ou "StatTrak"
 * @param {number|string} [opts.floatMax]       — nombre décimal entre 0 et 1 (ex. 0.93 ou "0.93")
 * @param {string} [opts.sortBy="price"]
 * @param {string} [opts.direction="asc"]
 * @returns {string}
 */
/**
 * Génère une URL ExeSkins pour une skin CS:GO, en conservant le pipe ('|') dans le nom.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "MP5-SD | Necro Jr."
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – valeur de flottant par défaut
 * @param {boolean} [skin.isStatTrak] – true si StatTrak
 * @param {boolean} [skin.isSouvenir] – true si Souvenir
 *
 * @param {Object}  [options]
 * @param {number}  [options.floatMax=skin.float] – flottant max
 * @param {string}  [options.sortBy="price"]      – champ de tri
 * @param {string}  [options.direction="asc"]     – sens de tri ("asc" ou "desc")
 *
 * @returns {string|null} URL formatée ou null si paramètres manquants
 */
function generateExeSkinsUrl(
  skin,
  {
    floatMax = skin.float,
    sortBy    = "price",
    direction = "asc"
  } = {}
) {
  // Vérification des données obligatoires
  if (!skin?.name || !skin?.wear) return null;

  // Encodage du nom en gardant le '|' → %7C, espaces → +
  const searchParam = encodeURIComponent(skin.name).replace(/%20/g, "+");

  // Détermination du type (StatTrak / Souvenir / Normal)
  let type;
  if (skin.isStatTrak)      type = "StatTrak";
  else if (skin.isSouvenir) type = "Souvenir";
  else                      type = "Normal";

  // Mapping des états d'usure vers le paramètre ExeSkins
  const exteriorMap = {
    "Factory New":    "FN",
    "Minimal Wear":   "MW",
    "Field-Tested":   "FT",
    "Well-Worn":      "WW",
    "Battle-Scarred": "BS"
  };
  const exteriorParam = exteriorMap[skin.wear] || "";

  // Construction de la liste de paramètres
  const parts = [
    `search=${searchParam}`,
    `type=${type}`,
    `exterior=${exteriorParam}`,
    `sortBy=${encodeURIComponent(sortBy)}`,
    `direction=${encodeURIComponent(direction)}`
  ];

  // Ajout conditionnel du floatMax
  if (floatMax != null) {
    parts.push(`floatMax=${encodeURIComponent(String(floatMax))}`);
  }

  // Assemblage final
  return `https://exeskins.com/?${parts.join("&")}`;
}
/**
 * Génère une URL vers GamerPay.gg pour une skin CS:GO/CS2,
 * en appliquant un floatMin par défaut selon le skin.wear,
 * et en n’incluant statTrak/souvenir que s’ils sont actifs.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "PP-Bizon | Brass"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – flottant par défaut
 * @param {boolean}[skin.isStatTrak]  – true si version StatTrak
 * @param {boolean}[skin.isSouvenir]  – true si version Souvenir
 *
 * @param {Object}  [options]
 * @param {number}  [options.floatMin]             – flottant min (override)
 * @param {number}  [options.floatMax=skin.float]  – flottant max
 * @param {string}  [options.sortBy="price"]       – champ de tri
 * @param {boolean}[options.ascending=true]        – sens de tri
 * @param {boolean}[options.statTrak=skin.isStatTrak]
 * @param {boolean}[options.souvenir=skin.isSouvenir]
 * @param {number}  [options.page=1]               – page de résultats
 *
 * @returns {string|null} URL formatée ou null si nom manquant
 */
function generateGamerPayUrl(
  skin,
  {
    floatMin,                          
    floatMax    = skin.float,
    sortBy      = "price",
    ascending   = true,
    statTrak    = skin.isStatTrak,
    souvenir    = skin.isSouvenir,
    page        = 1
  } = {}
) {
  if (!skin?.name) return null;

  // Définit floatMin par défaut selon l’usure si non précisé
  const wearFloatMinMap = {
    "Factory New":    0.00,
    "Minimal Wear":   0.07,
    "Field-Tested":   0.15,
    "Well-Worn":      0.38,
    "Battle-Scarred": 0.45
  };
  if (floatMin == null) {
    floatMin = wearFloatMinMap[skin.wear] ?? 0;
  }

  // Encodage du nom : espaces → +, pipe → %7C
  const queryParam = encodeURIComponent(skin.name).replace(/%20/g, "+");

  // Paramètres communs
  const parts = [
    `query=${queryParam}`,
    `floatMax=${encodeURIComponent(String(floatMax))}`,
    `floatMin=${encodeURIComponent(String(floatMin))}`,
    `sortBy=${encodeURIComponent(sortBy)}`,
    `ascending=${ascending ? "true" : "false"}`
  ];

  // Ajoute statTrak=1 uniquement si actif
  if (statTrak) {
    parts.push(`statTrak=1`);
  }

  // Ajoute souvenir=1 uniquement si actif
  if (souvenir) {
    parts.push(`souvenir=1`);
  }

  // Pagination
  parts.push(`page=${page}`);

  return `https://gamerpay.gg/?${parts.join("&")}`;
}
/**
 * Génère une URL vers cs.deals pour une skin CS:GO/CS2,
 * en déterminant automatiquement item_type (Machinegun, Pistol, Rifle, SMG, Shotgun, Sniper Rifle)
 * d’après le nom d’arme, et en appliquant un floatMax.
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Slate"
 * @param {string}  skin.wear   – ex. "Field-Tested"
 * @param {number}  skin.float  – flottant par défaut
 *
 * @param {Object}  [options]
 * @param {string}  [options.sortBy="price"]      – champ de tri
 * @param {boolean} [options.ascending=true]      – true → ascendant, false → descendant
 * @param {number}  [options.exactMatch=0]        – 0 ou 1
 * @param {number}  [options.floatMax=skin.float] – flottant max (0–1)
 *
 * @returns {string|null}
 */
/**
 * Génère une URL vers cs.deals pour une skin CS:GO/CS2,
 * en déterminant automatiquement item_type, en appliquant un floatMin par défaut selon l’usure,
 * et en n’incluant statTrak que si actif.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Nova | Wood Fired"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – float par défaut
 * @param {boolean}[skin.isStatTrak]  – true pour StatTrak
 *
 * @param {Object}  [options]
 * @param {string}  [options.sortBy="price"]      
 * @param {boolean} [options.ascending=true]      
 * @param {number}  [options.exactMatch=0]        
 * @param {number}  [options.floatMin]             – override du float min
 * @param {number}  [options.floatMax=skin.float]  
 * @param {boolean} [options.statTrak=skin.isStatTrak]
 *
 * @returns {string|null}
 */
/**
 * Génère une URL vers cs.deals pour une skin CS:GO/CS2,
 * en déterminant automatiquement item_type, en appliquant
 * un floatMin par défaut selon l’usure,
 * et en n’incluant statTrak que si actif.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Nova | Wood Fired"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – float par défaut
 * @param {boolean}[skin.isStatTrak]  – true pour StatTrak
 *
 * @param {Object}  [options]
 * @param {string}  [options.sortBy="price"]
 * @param {boolean} [options.ascending=true]
 * @param {number}  [options.exactMatch=0]
 * @param {number}  [options.floatMin]             
 * @param {number}  [options.floatMax=skin.float]
 * @param {boolean} [options.statTrak=skin.isStatTrak]
 *
 * @returns {string|null}
 */
function generateCsDealsUrl(
  skin,
  {
    sortBy     = "price",
    ascending  = true,
    exactMatch = 0,
    floatMin,
    floatMax   = skin.float,
    statTrak   = skin.isStatTrak
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Float min par défaut selon l’usure
  const wearFloatMinMap = {
    "Factory New":    0.00,
    "Minimal Wear":   0.07,
    "Field-Tested":   0.15,
    "Well-Worn":      0.38,
    "Battle-Scarred": 0.45
  };
  if (floatMin == null) {
    floatMin = wearFloatMinMap[skin.wear] ?? 0;
  }

  // 2. Extraire le nom d’arme (avant " | ")
  const [weaponName] = skin.name.split(" | ").map(s => s.trim());

  // 3. Catégorisation en item_type
  const categoryMap = {
    "Machinegun":    ["Negev", "M249"],
    "Shotgun":       ["Nova", "Sawed-Off", "XM1014", "MAG-7"],
    "SMG":           ["MP9", "PP-Bizon", "UMP-45", "MP7", "MAC-10", "P90", "MP5-SD"],
    "Sniper Rifle":  ["AWP", "SSG 08", "SCAR-20", "G3SG1"],
    "Rifle":         ["AK-47", "AUG", "FAMAS", "M4A4", "M4A1-S", "Galil AR", "SG 553"],
    "Pistol":        ["Five-SeveN", "Glock-18", "Tec-9", "P2000", "P250", "USP-S", "CZ75-Auto", "Desert Eagle", "Dual Berettas", "Revolver R8"]
  };
  let itemType = "Misc";
  for (const [cat, list] of Object.entries(categoryMap)) {
    if (list.includes(weaponName)) {
      itemType = cat;
      break;
    }
  }


  // 4. Construction du paramètre name (sans l’usure)
  const nameParam = encodeURIComponent(skin.name).replace(/%20/g, "+");

  // 5. Assemblage des paramètres
  const params = [
    `game=csgo`,
    `sort=${encodeURIComponent(sortBy)}`,
    `sort_desc=${ascending ? 0 : 1}`,
    `item_type=${encodeURIComponent(itemType)}`,
    `cs_weapon=${encodeURIComponent(weaponName)}`,
    `name=${nameParam}`,
    `exact_match=${exactMatch}`,
    `cs_min_paintwear=${encodeURIComponent(String(floatMin))}`,
    `cs_max_paintwear=${encodeURIComponent(String(floatMax))}`
  ];

  if (statTrak) {
    params.push(`cs_stattrak=1`);
  }

  return `https://cs.deals/new/market?${params.join("&")}`;
}
function generateSkinsMonkeyUrl(skin) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Construction du nom complet avec usure
  const fullName = `${skin.name} (${skin.wear})`;

  // 2. Encodage du nom pour l’URL
  const encodedName = encodeURIComponent(fullName);

  // 3. Ajout du paramètre StatTrak si actif
  const statTrakParam = skin.isStatTrak ? "&stat_trak=1" : "";

  // 4. Assemblage final
  return `https://skinsmonkey.com/trade?r=SKINSNIPE&appId=730&q=${encodedName}${statTrakParam}`;
}  

/**
 * Génère une URL vers CSFloat.com avec min_float et max_float,
 * en utilisant le floatMax du skin et un floatMin par défaut selon l’usure.
 *
 * @param {Object}  skin
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {number}  skin.float        – valeur max de float
 *
 * @returns {string|null}
 */
function generateCsFloatUrl(skin) {
  if (!skin?.wear || typeof skin.float !== "number") return null;

  // Valeurs minimales par usure
  const wearFloatMinMap = {
    "Factory New":    0.00,
    "Minimal Wear":   0.07,
    "Field-Tested":   0.15,
    "Well-Worn":      0.38,
    "Battle-Scarred": 0.45
  };

  const floatMin = wearFloatMinMap[skin.wear] ?? 0;
  const floatMax = skin.float;

  return `https://csfloat.com/search?sort_by=lowest_price&min_float=${floatMin}&max_float=${floatMax}`;
}

/**
 * Génère une URL vers Mannco.store pour une skin CS:GO/CS2,
 * en construisant un slug complet avec préfixes stattrak/souvenir,
 * et en formatant le nom en minuscules avec tirets.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "G3SG1 | Scavenger"
 * @param {string}  skin.wear         – ex. "Field-Tested"
 * @param {boolean}[skin.isStatTrak]  – true → ajoute "stattrak"
 * @param {boolean}[skin.isSouvenir]  – true → ajoute "souvenir"
 * @param {boolean}[skin.isStattrack] – toléré comme variante
 * @param {boolean}[skin.isStartrack] – toléré comme variante
 *
 * @returns {string|null}
 */
function generateManncoStoreUrl(skin) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Extraire nom d’arme et nom de skin
  const [weaponName, skinSuffix = ""] = skin.name.split(" | ").map(s => s.trim());

  // 2. Slugifier chaque partie
  const toSlug = str =>
    str.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

  const weaponSlug = toSlug(weaponName);
  const skinSlug   = toSlug(skinSuffix);
  const wearSlug   = toSlug(skin.wear);

  // 3. Préfixes robustes
  const isStatTrak = Boolean(
    skin.isStatTrak || skin.isStattrack || skin.isStartrack
  );
  const isSouvenir = Boolean(skin.isSouvenir);

  const prefix = isStatTrak ? "stattrak-" :
                 isSouvenir ? "souvenir-" : "";

  // 4. Assemblage final
  return `https://mannco.store/item/730-${prefix}${weaponSlug}-${skinSlug}-${wearSlug}`;
}



/**
 * Génère une URL vers 49skins.com pour une skin CS:GO,
 * en déterminant automatiquement la catégorie (machinegun, rifle, etc.),
 * en appliquant un floatMin par défaut selon l’usure,
 * et en n’incluant statTrak que si actif.
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "AK-47 | Hydroponic"
 * @param {string}  skin.wear         – ex. "Field-Tested"
 * @param {number}  skin.float        – float par défaut
 * @param {boolean}[skin.isStatTrak]  – true pour la version StatTrak
 *
 * @param {Object}  [options]
 * @param {number}  [options.floatMin]              – override du float min
 * @param {number}  [options.floatMax=skin.float]   – float max
 * @param {string}  [options.sortBy="price"]        – critère de tri (price, float…)
 * @param {boolean} [options.stattrak=skin.isStatTrak]
 *
 * @returns {string|null}
 */
function generate49SkinsUrl(
  skin,
  {
    floatMin,
    floatMax   = skin.float,
    sortBy     = "price",
    stattrak   = skin.isStatTrak,
    souvenir   = skin.isSouvenir
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Float min par défaut selon l’usure
  const wearFloatMinMap = {
    "Factory New":    0.00,
    "Minimal Wear":   0.07,
    "Field-Tested":   0.15,
    "Well-Worn":      0.38,
    "Battle-Scarred": 0.45
  };
  if (floatMin == null) {
    floatMin = wearFloatMinMap[skin.wear] ?? 0;
  }

  // 2. Extraire nom d’arme et suffixe de skin
  const [weaponName, skinSuffix = ""] = skin.name.split(" | ").map(s => s.trim());

  // 3. Déterminer la catégorie (slug) pour l’URL
  const categoryMap = {
    machinegun:    ["Negev", "M249"],
    shotgun:       ["Nova", "Sawed-Off", "XM1014", "MAG-7"],
    smg:           ["MP9", "PP-Bizon", "UMP-45", "MP7", "MAC-10", "P90", "MP5-SD"],
    "sniper-rifle":["AWP", "SSG 08", "SCAR-20", "G3SG1"],
    rifle:         ["AK-47", "AUG", "FAMAS", "M4A4", "M4A1-S", "Galil AR", "SG 553"],
    pistol:        ["Five-SeveN", "Glock-18", "Tec-9", "P2000", "P250", "USP-S", "CZ75-Auto", "Desert Eagle", "Dual Berettas","R8 Revolver" ,"Revolver R8"]
  };
  let categorySlug = "misc";
  for (const [slug, list] of Object.entries(categoryMap)) {
    if (list.includes(weaponName)) {
      categorySlug = slug;
      break;
    }
  }

  // 4. Slugifier le nom d’arme et la skin
  const toSlug = str =>
    str
      .toLowerCase()
      .replace(/[^\w\s.'’\-]/g, "") // conserve . et ' (apostrophes typographiques incluses)
      .trim()
      .replace(/\s+/g, "-");

  const weaponSlug = toSlug(weaponName);
  const skinSlug   = toSlug(skinSuffix);

  // 5. Construire la query
  const params = [
    `floatMin=${encodeURIComponent(String(floatMin))}`,
    `floatMax=${encodeURIComponent(String(floatMax))}`,
    `sortBy=${encodeURIComponent(sortBy)}`
  ];

  if (stattrak) {
    params.push(`stattrak=1`);
  }

  // 6. Ajouter le bon tagOptionsQuality[]
  if (stattrak && souvenir) {
    // Cas rare : les deux activés
    params.push(`tagOptionsQuality[]=9cb18e4b-ebce-4c22-bb8a-9f93f1fbb366`);
    params.push(`tagOptionsQuality[]=9caaa352-42b1-42f9-bdae-1d511a768a30`);
  } else if (stattrak) {
    params.push(`tagOptionsQuality[]=9cb18e4b-ebce-4c22-bb8a-9f93f1fbb366`);
  } else if (souvenir) {
    params.push(`tagOptionsQuality[]=9caaa352-42b1-42f9-bdae-1d511a768a30`);
  } else {
    params.push(`tagOptionsQuality[]=9caaa349-7573-4cab-9049-d1a3eed74882`);
  }

  // 7. Assemblage final
  return `https://49skins.com/market/` +
         `${categorySlug}/` +
         `${weaponSlug}/` +
         `${skinSlug}` +
         `?${params.join("&")}`;
}


/**
 * Génère une URL de recherche pour waxpeer.com
 * en appliquant automatiquement :
 *  - sort (ASC / DESC)
 *  - order (price / float)
 *  - exact match
 *  - filtrage StatTrak
 *  - filtre d’exterior (wear)
 *  - recherche par nom de skin (weapon + pipe + skinSuffix)
 *
 * @param {Object}  skin
 * @param {string}  skin.name         – ex. "Nova | Wood Fired"
 * @param {string}  skin.wear         – ex. "Minimal Wear"
 * @param {boolean}[skin.isStatTrak]  – true → version StatTrak
 *
 * @param {Object}  [options]
 * @param {boolean}[options.ascending=true]      – true → ASC, false → DESC
 * @param {string} [options.order="price"]       – "price" ou "float"
 * @param {boolean}[options.all=false]           – inclure tous les listings (1) ou non (0)
 * @param {boolean}[options.exactMatch=false]    – recherche exacte (1) ou partielle (0)
 * @param {boolean}[options.statTrak=skin.isStatTrak]
 * @param {string} [options.lang="fr"]           – code de langue dans l’URL
 *
 * @returns {string|null}
 */
function generateWaxpeerUrl(
  skin,
  {
    ascending   = true,
    order       = "float",
    all         = false,
    exactMatch  = false,
    statTrak    = skin.isStatTrak,
    lang        = "fr"
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1. Map wear → code exterior
  const exteriorMap = {
    "Factory New":    "FN",
    "Minimal Wear":   "MW",
    "Field-Tested":   "FT",
    "Well-Worn":      "WW",
    "Battle-Scarred": "BS"
  };
  const exterior = exteriorMap[skin.wear] || "";

  // 2. Encoder le nom complet (avec pipe)
  const searchParam = encodeURIComponent(skin.name);

  // 3. Assembler les paramètres
  const params = [
    `sort=${ascending ? "ASC" : "DESC"}`,
    `order=${encodeURIComponent(order)}`,
    `all=${all ? 1 : 0}`,
    `exact=${exactMatch ? 1 : 0}`,
    `exterior=${exterior}`,
    `stat_trak=${statTrak ? 1 : 0}`,
    `search=${searchParam}`
  ];

  // 4. Retourner l’URL finale
  return `https://waxpeer.com/${lang}?${params.join("&")}`;
}
function injectCopyButtonIntoSkinCards() {
  document.querySelectorAll('.skin-card').forEach(card => {
    const titleEl = card.querySelector('.skin-title');     // Nom du skin
    const wearEl = card.querySelector('.skin-wear');       // Usure
    const statTrakEl = card.querySelector('.skin-stattrak'); // Présence de StatTrak

    if (!titleEl || !wearEl) return;

    const isStatTrak = statTrakEl && /stattrak/i.test(statTrakEl.textContent);
    const prefix = isStatTrak ? 'StatTrak™ ' : '';
    const formattedName = `${prefix}${titleEl.textContent.trim()} (${wearEl.textContent.trim()})`;

    if (card.querySelector('.copy-name-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-name-btn';
    btn.textContent = '📋 Copier le nom';

    Object.assign(btn.style, {
      marginTop: 'auto',
      padding: '0.4rem 0.6rem',
      fontSize: '0.8rem',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#4a4a6a',
      color: '#fff',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      width: '100%'
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#6a6aff';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#4a4a6a';
    });

    btn.addEventListener('click', () => {
      const tempInput = document.createElement('textarea');
      tempInput.value = formattedName;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      btn.textContent = '✅ Copié !';
      setTimeout(() => {
        btn.textContent = '📋 Copier le nom';
      }, 1500);
    });

    card.appendChild(btn);
  });
}


document.addEventListener('DOMContentLoaded', injectCopyButtonIntoSkinCards);



/**
 * Génère une URL vers Skinout.gg pour une skin CS:GO/CS2,
 * en déterminant automatiquement la partie “wear” dans le chemin,
 * en nettoyant le nom pour la recherche (pipe → espace),
 * et en ajoutant float_max et sort (price_asc / price_desc).
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Slate"
 * @param {string}  skin.wear   – ex. "Minimal Wear"
 * @param {number}  skin.float  – float par défaut
 *
 * @param {Object}  [options]
 * @param {number}  [options.floatMax=skin.float]    – valeur max de float
 * @param {string}  [options.sortBy="price"]         – champ de tri ("price", "float", etc.)
 * @param {boolean} [options.ascending=true]         – true → _asc, false → _desc
 * @param {string}  [options.lang="en"]              – code langue du site
 *
 * @returns {string|null}
 */
/**
 * Génère une URL vers Skinout.gg en intégrant les préfixes StatTrak™ et Souvenir,
 * en construisant le slug complet dans le path, et en utilisant float_min et float_max
 * avec des virgules et encodage URL.
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Slate"
 * @param {string}  skin.wear   – ex. "Minimal Wear"
 * @param {number}  [skin.float]– float par défaut, ex. 0.15 (uniquement si floatMax non fourni)
 *
 * @param {Object}  [options]
 * @param {boolean} [options.isStatTrak=false] – true pour préfixer "stattrak"
 * @param {boolean} [options.isSouvenir=false]– true pour préfixer "souvenir"
 * @param {number}  [options.floatMin=0]      – valeur min de float
 * @param {number}  [options.floatMax=skin.float||1] – valeur max de float
 * @param {string}  [options.lang="en"]       – code langue du site
 *
 * @returns {string|null}
 */
function generateSkinoutUrl(
  skin,
  {
    isStatTrak  = false,
    isSouvenir  = false,
    floatMin    = 0,
    floatMax    = skin.float ?? 1,
    lang        = "en"
  } = {}
) {
  if (!skin?.name || !skin?.wear) return null;

  // 1) Nettoyer le nom : retirer les séparateurs, les points et les apostrophes
  const cleanedName = skin.name
    .replace(/\s*\|\s*/g, " ")       // remplace " | " par un espace
    .replace(/[.'’]/g, "")           // supprime les points et apostrophes
    .toLowerCase()
    .trim();

  const baseSlug = cleanedName.replace(/\s+/g, "-"); // remplace les espaces par des tirets

  // 2) Ajouter les préfixes "stattrak" et/ou "souvenir"
  const prefixParts = [];
  if (skin.isStatTrak || isStatTrak) prefixParts.push("stattrak");
  if (skin.isSouvenir || isSouvenir) prefixParts.push("souvenir");

  const nameSlug = prefixParts.length
    ? `${prefixParts.join("-")}-${baseSlug}`
    : baseSlug;

  // 3) Slug du wear
  const wearSlug = skin.wear
    .toLowerCase()
    .replace(/\s+/g, "-");

  // 4) Encodage des floats
  function encodeFloat(f) {
    const str = typeof f === "number" ? f.toString() : f;
    const withComma = str.replace(".", ",");
    return encodeURIComponent(withComma);
  }

  const floatMinParam = encodeFloat(floatMin);
  const floatMaxParam = encodeFloat(floatMax);

  // 5) Assemblage de l’URL finale
  return `https://skinout.gg/${lang}/market/` +
         `${nameSlug}-${wearSlug}` +
         `?float_min=${floatMinParam}` +
         `&float_max=${floatMaxParam}`;
}

/**
 * Génère une URL vers Aim.Market avec filtres float, StatTrak™, et encodage propre.
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Slate"
 * @param {string}  [skin.wear] – ex. "Minimal Wear"
 * @param {number}  [skin.float]– float par défaut, ex. 0.15 (utilisé si floatMax non fourni)
 *
 * @param {Object}  [options]
 * @param {boolean} [options.isStatTrak=false] – true pour filtrer uniquement StatTrak™
 * @param {boolean} [options.excludeStatTrak=false] – true pour exclure StatTrak™
 * @param {number}  [options.floatMin]         – valeur min de float (prioritaire sur wear)
 * @param {number}  [options.floatMax=skin.float||1] – valeur max de float
 * @param {string}  [options.lang="en"]         – code langue du site
 *
 * @returns {string|null}
 */
/**
 * Génère une URL vers Aim.Market avec filtres float, StatTrak™, exterior (wear), et encodage propre.
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Slate"
 * @param {string}  [skin.wear] – ex. "Minimal Wear"
 * @param {number}  [skin.float]– float par défaut, ex. 0.15 (utilisé si floatMax non fourni)
 *
 * @param {Object}  [options]
 * @param {boolean} [options.isStatTrak=false] – true pour filtrer uniquement StatTrak™
 * @param {boolean} [options.excludeStatTrak=false] – true pour exclure StatTrak™
 * @param {number}  [options.floatMin]         – valeur min de float (prioritaire sur wear)
 * @param {number}  [options.floatMax=skin.float||1] – valeur max de float
 * @param {string}  [options.lang="en"]         – code langue du site
 *
 * @returns {string|null}
 */
function generateAimMarketUrl(
  skin,
  {
    isStatTrak       = false,
    excludeStatTrak  = false,
    floatMin,
    floatMax         = skin.float ?? 1,
    lang             = "en"
  } = {}
) {
  if (!skin?.name) return null;

  // 1) Déterminer floatMin par défaut selon le wear
  const wearFloatMinMap = {
    "Factory New": 0.00,
    "Minimal Wear": 0.07,
    "Field-Tested": 0.15,
    "Well-Worn": 0.38,
    "Battle-Scarred": 0.45
  };

  const defaultFloatMin = skin.wear && wearFloatMinMap[skin.wear] !== undefined
    ? wearFloatMinMap[skin.wear]
    : 0;

  const finalFloatMin = floatMin !== undefined ? floatMin : defaultFloatMin;

  // 2) Nettoyer le nom pour la recherche
  const cleanedName = skin.name
    .replace(/\s*\|\s*/g, " ")       // remplace " | " par un espace
    .replace(/[.'’]/g, "")           // supprime les points et apostrophes
    .trim();

  const query = encodeURIComponent(cleanedName);

  // 3) Encodage des floats
  const floatMinParam = encodeURIComponent(finalFloatMin.toFixed(6));
  const floatMaxParam = encodeURIComponent(floatMax.toFixed(6));

  // 4) Construction du filtre combiné
  const filterObj = {};

  if (isStatTrak) {
    filterObj.quality = { _in: ["StatTrak™"] };
  } else if (excludeStatTrak) {
    filterObj.quality = { _nin: ["StatTrak™"] };
  }

  if (skin.wear) {
    filterObj.exterior = { _in: [skin.wear] };
  }

  const filterEncoded = encodeURIComponent(JSON.stringify(filterObj));

  // 5) Assemblage final
  return `https://aim.market/${lang}/buy/csgo` +
         `?text=${query}` +
         `&order_column=float` +
         `&order=asc_nulls_last` +
         `&filter=${filterEncoded}` +
         `&float_min=${floatMinParam}` +
         `&float_max=${floatMaxParam}`;
}
/**
 * Génère une URL vers GameBoost.com avec float range, StatTrak, wear et nom du skin.
 *
 * @param {Object}  skin
 * @param {string}  skin.name   – ex. "AK-47 | Redline"
 * @param {string}  [skin.wear] – ex. "Field-Tested"
 * @param {number}  [skin.float] – float par défaut, ex. 0.23 (utilisé si floatMax non fourni)
 *
 * @param {Object}  [options]
 * @param {boolean} [options.isStatTrak=false] – true pour ajouter le filtre StatTrak
 * @param {number}  [options.floatMin]         – valeur min de float
 * @param {number}  [options.floatMax=skin.float||1] – valeur max de float
 *
 * @returns {string|null}
 */
function generateGameBoostUrl(
  skin,
  {
    isStatTrak = false,
    floatMin,
    floatMax = skin.float ?? 1
  } = {}
) {
  if (!skin?.name) return null;

  // 1) Déterminer floatMin par défaut selon le wear
  const wearFloatMinMap = {
    "Factory New": 0.00,
    "Minimal Wear": 0.07,
    "Field-Tested": 0.15,
    "Well-Worn": 0.38,
    "Battle-Scarred": 0.45
  };

  const defaultFloatMin = skin.wear && wearFloatMinMap[skin.wear] !== undefined
    ? wearFloatMinMap[skin.wear]
    : 0;

  const finalFloatMin = floatMin !== undefined ? floatMin : defaultFloatMin;

  // 2) Encodage du nom complet avec wear
  const fullName = skin.wear
    ? `${skin.name} (${skin.wear})`
    : skin.name;

  const encodedName = encodeURIComponent(fullName);

  // 3) Encodage du float range
  const floatRange = `${finalFloatMin.toFixed(6)}-${floatMax.toFixed(6)}`;

  // 4) Encodage du wear
  const wearSlug = skin.wear?.toLowerCase().replace(/\s+/g, "_");

  // 5) Paramètre StatTrak
  const statTrakParam = isStatTrak ? "&special=is_stat_trak" : "";

  // 6) Assemblage final
  return `https://gameboost.com/counter-strike-2/skins` +
         `?float=${floatRange}` +
         `&s=${encodedName}` +
         `${statTrakParam}` +
         (wearSlug ? `&wear=${wearSlug}` : "");
}


  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
  };

  const handleNoteChange = async (e) => {
    const newNote = e.target.value;
    setNote(newNote);

    const updatedTrade = { ...trade, note: newNote };

    try {
      if (isSaved) {
        await updateSavedTradeUp(id, updatedTrade);
      } else {
        await updateCurrentTradeUp(id, updatedTrade);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note :', err);
      alert('❌ Impossible d’enregistrer la note');
    }
  };


  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };
  const amplifyProfitability = (realPercent) => {
    return 100 + realPercent;
  };

  const getProfitabilityColor = (profitability) => {
    const clamped = Math.max(-100, Math.min(100, profitability));
    const ratio = (clamped + 100) / 200;
    const red = Math.round(255 * (1 - ratio));
    const green = Math.round(255 * ratio);
    return `rgb(${red}, ${green}, 80)`;
  };


  const handleUrlSubmit = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newUrl = urlInput.trim();
      if (!newUrl || localUrls.includes(newUrl) || !isValidUrl(newUrl)) return;

      const updatedUrls = [...localUrls, newUrl];
      const updatedTrade = { ...trade, urls: updatedUrls };

      try {
        if (isSaved) {
          await updateSavedTradeUp(id, updatedTrade);
        } else {
          await updateCurrentTradeUp(id, updatedTrade);
        }
        setLocalUrls(updatedUrls);
        setUrlInput('');
        alert('🔗 URL enregistrée !');
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de l’URL :', err);
        alert('❌ Impossible d’enregistrer l’URL');
      }
    }
  };
  


  const handleUrlDelete = async (urlToDelete) => {
    const updatedUrls = localUrls.filter(u => u !== urlToDelete);
    const updatedTrade = { ...trade, urls: updatedUrls };

    try {
      if (isSaved) {
        await updateSavedTradeUp(id, updatedTrade);
      } else {
        await updateCurrentTradeUp(id, updatedTrade);
      }
      setLocalUrls(updatedUrls);
      onEdit?.();
    } catch (err) {
      console.error('Erreur lors de la suppression de l’URL :', err);
      alert('❌ Impossible de supprimer l’URL');
    }
  };
  


  const validInputs = inputs.filter(skin => skin && skin.name);
  const averageFloat = validInputs.length > 0
    ? validInputs.reduce((sum, skin) => sum + (skin.float ?? 0), 0) / validInputs.length
    : 0;

  const amplified = amplifyProfitability(profitability ?? 0);
  const profitabilityColor = getProfitabilityColor(profitability ?? 0);
  const seenOutputs = {};
            outputs.forEach((skin) => {
              const key = `${skin.name}-${skin.imageUrl}`;
              if (seenOutputs[key]) {
                seenOutputs[key].chance += skin.chance ?? 0;
              } else {
                seenOutputs[key] = { ...skin };
              }
            });
            const finalOutputs = Object.values(seenOutputs);
const avgValue = outputs.reduce((sum, s) => sum + (s.price || 0), 0) / outputs.length;
            const seuilParItem = (avgValue / 1.25) / inputs.length;

            const generateMarketLink = (name, wear) =>
              `https://market.csgo.com/en/?search=${encodeURIComponent(name)}&quality=${encodeURIComponent(wear ?? '')}`;

            // 🔁 Regrouper les skins similaires (Entrées)
            const groupedInputs = [];
            const seenInputs = new Set();
const generateMarketLink2 = (skin) => {
              const name = skin?.name ?? '';
              const wear = skin?.wear ?? '';
              const float = skin?.float ?? null;

              // Détection des variantes
              const isStatTrak = skin?.isStatTrak ?? false;
              const isSouvenir = skin?.isSouvenir ?? false;

              // Extraction du type d’arme
              const allTypes = [
                'AK-47', 'AUG', 'FAMAS', 'Galil AR', 'M4A1-S', 'M4A4', 'SG 553',
                'AWP', 'G3SG1', 'SCAR-20', 'SSG 08',
                'MAC-10', 'MP5-SD', 'MP7', 'MP9', 'P90', 'PP-Bizon', 'UMP-45',
                'M249', 'Negev',
                'MAG-7', 'Nova', 'Sawed-Off', 'XM1014'
              ];

              const type = allTypes.find(t => name.toLowerCase().includes(t.toLowerCase())) ?? '';

              // Construction du lien
              const base = `https://market.csgo.com/en/?sort=price&order=asc`;
              const search = `&search=${encodeURIComponent(name)} (${encodeURIComponent(wear)})`;
              const quality = `&quality=${encodeURIComponent(wear)}`;
              const weaponType = type ? `&type=${encodeURIComponent(type)}` : '';
              const floatMax = float ? `&floatMax=${float}` : '';
              const category = isStatTrak
                ? `&categories=StatTrak™`
                : isSouvenir
                ? `&categories=Souvenir`
                : '';

              return `${base}${search}${quality}${weaponType}${category}${floatMax}`;
            };
  
// 🔁 Regrouper les sorties identiques
             
            const ratio = amplified / 125;

            const inputsWithPriceMax = inputs
              .filter(skin => skin && skin.name)
              .map(skin => {
                const priceMax = skin.price * ratio;
                return {
                  ...skin,
                  priceMax: parseFloat(priceMax.toFixed(2)),
                };
              });

              // default float range per wear (used as fallback)
              const wearFloatDefaults = {
                'Factory New': { min: 0.00, max: 0.07 },
                'Minimal Wear': { min: 0.07, max: 0.15 },
                'Field-Tested': { min: 0.15, max: 0.38 },
                'Well-Worn': { min: 0.38, max: 0.45 },
                'Battle-Scarred': { min: 0.45, max: 1.00 }
              };

              function getFloatCapsForInput(input, tradeFloatCapMin, tradeFloatCapMax) {
                // Priorités : input.floatMinCap/MaxCap -> trade.floatCapMin/Max -> wear defaults -> input.float -> sensible fallback
                const wear = input?.wear;
                const wearDefaults = wear ? (wearFloatDefaults[wear] || { min: 0, max: input?.float ?? 1 }) : { min: 0, max: input?.float ?? 1 };

                const minCap = (typeof input?.floatMinCap === 'number')
                  ? input.floatMinCap
                  : (typeof tradeFloatCapMin === 'number' ? tradeFloatCapMin : wearDefaults.min);

                const maxCap = (typeof input?.floatMaxCap === 'number')
                  ? input.floatMaxCap
                  : (typeof tradeFloatCapMax === 'number' ? tradeFloatCapMax : (typeof input?.float === 'number' ? input.float : wearDefaults.max));

                return { min: minCap, max: maxCap };
              }

function enableSkinCardCopyOnClick() {
  document.querySelectorAll('.skin-card').forEach(card => {
    const nameEl = card.querySelector('.skin-title');
    const wearEl = card.querySelector('.skin-wear');
    const statTrakEl = card.querySelector('.skin-stattrak');

    if (!nameEl || !wearEl) return;

    const isStatTrak = statTrakEl?.textContent?.toLowerCase().includes('stattrak');
    const prefix = isStatTrak ? 'StatTrak™ ' : '';
    const formattedName = `${prefix}${nameEl.textContent.trim()} (${wearEl.textContent.trim()})`;

    card.addEventListener('click', e => {
      // Ignore si clic sur un bouton ou un lien
      if (e.target.closest('button, a')) return;

      const tempInput = document.createElement('textarea');
      tempInput.value = formattedName;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      // Optionnel : feedback visuel
      card.style.outline = '2px solid #6a6aff';
      setTimeout(() => {
        card.style.outline = '';
      }, 800);
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  enableSkinCardCopyOnClick();
});

  return (
    
    <div style={{
      position: 'relative',
      border: '1px solid #4b4b6b',
      padding: '1.5rem',
      marginBottom: '2rem',
      borderRadius: '12px',
      background: 'rgba(48, 45, 86, 0.85)',
      backdropFilter: 'blur(6px)',
      color: '#f0f0f0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s ease',
    }}>
      {/* 🗑️ Bouton Supprimer */}
      <button
        onClick={() => setConfirmDelete(true)}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'transparent',
          border: 'none',
          color: '#ff4d4d',
          fontSize: '1.4rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        title="Supprimer ce trade-up"
      >
        🗑️
      </button>

      {/* ✅ Confirmation suppression */}
      {confirmDelete && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '12px',
          zIndex: 10,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <p style={{ fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ Êtes-vous sûr de vouloir supprimer ce trade-up ?
          </p>
          <div>
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#ff4d4d',
                border: 'none',
                padding: '0.6rem 1.2rem',
                marginRight: '1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                backgroundColor: '#555',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Non
            </button>
          </div>
        </div>
      )}

      {/* 📋 Contenu principal */}
      <h3 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#ffd369',
        marginBottom: '0.5rem',
        textShadow: '0 0 6px #ffd36988'
      }}>
        🎯 {name} {isStatTrak ? 'StatTrak™' : ''}
      </h3>

      <p><strong>📅 Date :</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>🎯 Résultat :</strong> {resultSkin?.name ?? '—'}</p>
      <div style={{ marginTop: '1.5rem' }}>
        <label htmlFor="note" style={{
          display: 'block',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          📝 Note personnelle :
        </label>

        <textarea
          id="note"
          value={note}
          onChange={handleNoteChange}
          placeholder="Notes..."
          style={{
            width: '97%',
            minHeight: '100px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #5348b7ff',
            resize: 'vertical',
            backgroundColor: '#2a2546ff',
            color: '#82c2f2ff',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            boxShadow: 'inset 0 0 5px rgba(255, 0, 0, 0.2)',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ff4d4d';
            e.target.style.boxShadow = '0 0 8px rgba(255, 77, 77, 0.6)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#8948a1ff';
            e.target.style.boxShadow = 'inset 0 0 5px rgba(255, 0, 0, 0.2)';
          }}
        />
      </div>



      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <p style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#a0a8e5',
          backgroundColor: '#1e1e2f',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          display: 'inline-block',
          border: '1px solid #3a3a5a',
          boxShadow: '0 0 6px rgba(0,255,213,0.3)',
        }}>
          {collection}
        </p>
      </div>

      {/* 💰 Infos financières */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.75rem',
        marginTop: '1rem',
      }}>
        {[{
          label: 'Coût du trade-up',
          value: `${totalInputPrice} €`
        }, {
          label: 'Valeur moy. sortie',
          value: `${avgOutputValue} €`
        }, {
          label: '💸 Profit moy/trade',
          value: `${profit} €`
        }].map(({ label, value }, i) => (
          <p key={i} style={{
            backgroundColor: '#2c2c44',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#9fd3ff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #3a3a5a',
            boxShadow: '0 0 6px rgba(0,255,213,0.3)',
          }}>
            {label} : <span style={{ color: '#fff' }}>{value}</span>
          </p>
        ))}
      </div>

      {/* 📈 Rentabilité */}
      <p style={{
        backgroundColor: '#1e1e2f',
        padding: '0.8rem',
        borderRadius: '6px',
        color: profitabilityColor,
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 0 8px rgba(255,255,255,0.1)',
        marginTop: '1rem',
      }}>
        📈 Rentabilité : {profitability >= 0 ? '+' : ''}{amplified.toFixed(0)}%
        {amplified >= 180 && ' 🔥'}
        {amplified <= 70 && ' 🧊'}
      </p>

      <p
        onClick={() => {
          navigator.clipboard.writeText(averageFloat.toFixed(4));
        }}
        style={{
          backgroundColor: '#1e1e2f',
          padding: '0.6rem 1rem',
          borderRadius: '6px',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#a0a8e5',
          fontFamily: 'monospace',
          border: '1px solid #3a3a5a',
          marginTop: '1rem',
          textAlign: 'center',
          cursor: 'pointer' // ← indique que c’est cliquable
        }}
        title="Copier le float moyen"
      >
        🧪 Float moyen : {averageFloat.toFixed(4)}
      </p>

      {/* 🔗 Liens enregistrés */}
      {localUrls.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>🔗 Liens enregistrés :</strong>
          <ul style={{ paddingLeft: '1rem' }}>
            {localUrls.map((url, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#3a3660',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.5rem',
                borderRadius: '6px'
              }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#9fd3ff',
                    textDecoration: 'none',
                    wordBreak: 'break-word',
                    flexGrow: 1
                  }}
                >
                  {url}
                </a>
                <button
                  onClick={() => handleUrlDelete(url)}
                  style={{
                    marginLeft: '1rem',
                    backgroundColor: '#ff4d4d',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.3rem 0.6rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  title="Supprimer ce lien"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      
      )}

      {onEdit && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => onEdit(trade)}
            style={{
              backgroundColor: '#6c63ff',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 0 8px rgba(108,99,255,0.4)',
              transition: 'background 0.3s ease',
            }}
          >
            🛠 Modifier
          </button>
        </div>
      )}


      <details style={{
        marginTop: '2rem',
        backgroundColor: '#2c2c44',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #3a3a5a',
        boxShadow: '0 0 6px rgba(0,255,213,0.2)',
        color: '#f0f0f0'
      }}>
        <summary style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '1rem',
          color: '#9fd3ff'
        }}>
          📦 Voir les détails des skins
        </summary>

        <div style={{
          marginTop: '1rem',
          backgroundColor: '#121212',
          padding: '1rem',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.4)',
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '0.95rem'
        }}>
          <section className="matching-skins">
            <h4>Skins similaires (collection + wear + rareté)</h4>
            <div className="inputs-grid">
              {matchingSkins.map((skin, i) => {
                const price = skin.price ?? 0;
                
                
                const wearSuffix = skin.wear ? ` (${skin.wear})` : '';
                
                const matchingInput = inputs.find(inp => inp.wear === skin.wear);
                const floatValue = matchingInput?.float ?? '';
                const skinWithFloat = { ...skin, float: floatValue };
                
                return (
                  <div
                    key={i}
                    className={`skin-card ${skin.rarity?.toLowerCase()}`}
                    onClick={(e) => {
                      if (e.target.closest('a, button, img')) return;
                      const prefix = skin.isStatTrak ? 'StatTrak™ ' : '';
                      const wearSuffix = skin.wear ? ` (${skin.wear})` : '';
                      const formattedName = `${prefix}${skin.name}${wearSuffix}`;
                      navigator.clipboard.writeText(formattedName);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />

                    <div className="skin-info">
                      <p className="skin-name">
                        {skin.isStatTrak ? 'StatTrak™ ' : ''}
                        {skin.name}
                      </p>
                      <p className="skin-wear">
                        {skin.wear ? `(${skin.wear})` : ''}
                      </p>
                      <p className={`rarity-${skin.rarity?.toLowerCase()}`}>{skin.rarity}</p>
                      <p className="skin-price">{price} €</p>
                      <div className="float-display">
                        <p>Float Min: {floatCaps[skin.id]?.floatMin || skin.floatMin || '—'}</p>
                        <p>Float Max: {floatCaps[skin.id]?.floatMax || skin.floatMax || '—'}</p>
                      </div>


                    </div>
                    



                    

                    <div className="input-actions actions-hidden">
                      <ul>
                        <li>
                          <a
                            href={generateLisSkinsUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                                  src="https://assets.lis-skins.com/assets/images/logo.svg"
                                  alt="Lis-Skins"
                                  style={{
                                    width: '20px',
                                    height: '20px'
                                  }}
                                />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateSkinPlaceUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                      <li>
                          <a
                            href={generateSkinoutUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateMarketLink2(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://market.csgo.com/ru/favicon.ico"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateCsMoneyUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateDMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateWhiteMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateExeSkinsUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateSkinPortUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://ggscore.com/media/logo/t86333.png?25"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateSkinBaronUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5a40aff2b894c905f826ac16/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateManncoStoreUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5e08a89c053f320001f78afd/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                         <li>
                          <a
                            href={generateSkinsMonkeyUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/6150f7e0aeab7a001d66d7fb/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateBitSkinsUrlRaw(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://bitskins.com/assets/logo-mobile-D1I7ZSJP.svg"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateBuffMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA1VBMVEUcHB4aGh0XGBwAABHStXzXvYcAAA4AABPjzp3awYzfyJYTFRvhy5nk0KAeHiDWu4TcxJAFCxbPsXcNEBc2MSoABhU9Ny5lXEncwYpZUD7mzpoABxNeVkZ2bFWxnHHp1KKOfVvIsYFeUTuZglcmJSTXwZGWiWvMrHC6qoOslWiPfl0uKyfCpnDMuIvSuINHPjGkkmxSTD+xn3l8cVmCclKkjmQAAATGrny/pHB5aUpvYEaIdE+fk3N5b1icimaHe1/XxZmRhWprY1Cun3y8p3rCsIexlmJlRJBaAAAM2UlEQVR4nO2cbVviOBeAmxaLUAZaQ0spyssssAryKooys6AOzv//SU9z0haahKnPTplrP5x7r3F2pCg3SU5OTlI0DUEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQ5D8KaZkqXKoLF1oGw5J/AoUHhMuJRVtFFVR4tm45rutGD7pHkLwE6fdbFd//8dIv2rqG7zclRXqzb7eX7VnqaurMVtu2ilVKUXfHm+7jnYLHfk6KutdJ8yX8r3MZ/k9lOT5+McZtUKlUgp0j/gRjYIcEm6OLidHYl3y/FP45cHFRC/H37tFznfpjoVYrKJmJnehfYl13vhxzeaBTWRzpmJNKuVwO3sVeRggY2keNa1ltpneRohbxeDAkxY1K74ozzsmQ3nROCFYql5eL5GWTYhkMr8VeqtdLTLDkJS/IGvdO+tX8bvKuEbfrK/wiw/tqTr3U2XXUgqFh5XJyMOyDYXkmGloLaMJBMmwI2YeCJw1fkk7grJT9M2rCZysnw9aQGwqjsQOGlU7SKXWP+ZUHdfH3Wg0wnDrxA+6IC/pqNvFbpM9OjUDgp6vlg/kDDF+HaX5E/fTWiEWuoQknRDSkN2DYM+MXXgfBkr8fRXRD4AtjlTzRbUeC2/ixb9/Yn4i8Ak0YQKAFd0+tFKY3gEasxC+c3gRgaIg/wNmBYTt+oLVlhiX/xmw5CpI+qnt8EN5Zruo6Jy9Bjb6C4Y0YIls3HeimRRKLMMPK3hR/gLsFw20r+rcxZU3oj4yMYRSNwnU1NxU1pM8NF1KI9LhhHPlaQzCcS21otMFwFF0YhlbGhZf1wt07ZlhbSfNrzugejzPS5KMvwDB4iv5tLGGyeBNfEHH24VRRsh+iTmBdQyftZbaMsWZNWGso0sBcsRYQaDrSO2k1wHAQ90rjAwwfpAlf67HZ0I7nSXrD5kK/V8z4xcSFUViTs8CciVKayyfxAfoAhh+xoXUqpRkPoA3jXumsmGGpLfVm8Xn9fHOzk9B/wPBDCiDhuGOddGnEL2gA8+FC6s2eDYZ6FFhYKA3nwiTwnEKfgeA6r9zsJK03Ztj5IRkaP8DwezTvRhN+eSxN+IuAjTs7/gHFdphih6E0K4BYXyGU3p9bMBQBw+9yiEwvJUIRMFSMV9aEpWTCN9YsX/Ol8SpCN2D4nFfmchLjFgyHYqcixgRC6XsSIsFwILU1fWCC9j7JfXpgmBkio+nwLisi/S6EfnSUEz6d8cmiHvWiKKVRjNctGM6T8ToFQylBF3G6YLg993So6dGE37JSGH1owkqytnBGYLiUerM7B8M4sujeBawqxrpuqUiGnXsHkWblZFz3u5A+n/DfrtPseFZ6WNFHE/5WGjatNhjGtQlr4cNq6ak6a6pIQmfxGQw3Rl15XWYf+Cz6+LB2gq/R2jDgafdES5ZE3FAKkcTpgWE87qwGN2wfVk+HtWG4OryL3yLrHgzbV+rV4ZUUtP8lUUojrnxjmvHwDMdrKGjLE75GIQ21Z4eUBgx9YeEr1jDIeH1CLSKvbkrfO6LgQTF4SEYd0SZsGAZSgk4Inw7jiOSMfOXSPiauYejerwWv8oqxvIaR0ju0YfB2MOyzJrST0Jqg121oxLiG4c5/bZiM12btl4bPeRka3zsg+EXZSYNkCaTXAzCUVvhWEwx7yXhtpwxFxWSejFKak453eWUCLKUJ/b68vr4OjigH3DBJBFhKY9vlgaIcDIZ7yhWJteclKN/vrVXEZR76Ehte3at4ycqJPov5ETZhmLTR6jFa/TtXTGoW9D2wy3a5R8U2dEbM0G/HAaTa44LtRVVFMs853chvM9ZUF+YlqD29sk7aaVCSQjfnoJiUCFkNww4nfGnFwFMafx4b9qEJ/b1rERXJ89xHbrhwz5x6mzAM5RqGdR36lSuDeFZyt9CGckpjtNmS3t8lNQwYhr6XmbTxlGabtYz8XUi1A3FGKqpYi1CwfGhDYwmThZSga8aeF9bSKc2heHrqF1tRSnPuFb7uQaB5lRKIcNyxNpzEw8HYhy1oyzUMzbyA6TCpYfCUZp9pWL3/Qyv8BkvTvijKvA9QWUuWEuYAJgt5TWTBbOjH3dxZwfq3nRXr9TEfhmdf4dMHbiiXed+CsJcmNQzNZMPQllMasXbY2oLhPNPQ45NFbiHzFK03Zti5lWsY8+B43JFqAEVRxXjlE346pTnaXzqBtQDB+6ze/NuEKQ0zlGsYJq8dJiHSYxO+PZDH64YbxvOksQdDaUEtYm3A8Pns61/zFgylfV3i8tphEiIbYNiT3nFew/CTGoY5hckiswjqrMAwt9zsJOaETRZyDYNUB6nt0DDwsE66l15QlNIktX6DT4eZIdL5Cwwfz96GzisYNqTzEXUwLCdl3hFrQvtUDSOpHZIqz7ulJYj0PJ7SfDu3Iem/wnJCKvNaMxAsV5OUhhmW5TJvNOHHayJ9BobrzGMUxTaf8M8dS/UZXy/JZV5eOywnRdAlM5TPYRC3B4abZLxyw+xtGV68+BObFszwVV4TvfPt0GTCn8CBEsV45YbxK6UrntJkBpBi4Q+lNO9gKJd5W3w7NNm0aPEjM/J49WDCL6VrGH47c+Opyg2lQwF540BKcymVefVooynplUUwLO/EV27sYLNwGkcgd/u5TYtoW+Y+r2NPJ2kNYTr88URTtJwldNJDEcPo8RMlnpG60GjwrDSposK2TM3P3Ne1vvIJ/09sy7A2nNyk2U1AsPKRTA48ltp2aZS6cM77qH94J9asMuNnhkj6Aoa5HSg5ifHBK1DREZoghk8VR3m21eR5aRqfl9n8edJ5KUtpap9Iab7xCf/shtYkPt51VGArRwTDo/nd3B/EwuVg6Qi/l5ym0MdTqK5lhkh3C4aZCfrvEk/46RJipBjMj8MK7PQeFI8Fp4eKhT4DwWnmqq/Iaxi5FdROoddPClaCt1YqztHmCcH9+OhMYhM2KaaZ83jx/s/UMKxZ56CYqgQHHwtxiND6MhAVfX/6cHyUmG54SpN5SsHiKc3XcxuS+kTJcueZ8u/WTW+07B3T3jbc1EiymlD1XWV1PmLd3T8/P9+dfTrUiPKEt2mcOFOmO0bqMqMlFSHhxHf26CJwrju3k9wIgiAIgiAIgiAI8gl0y4rvJCCWpa4r6Ke+D5x6CH5k+Le40NV19fP0A5998Z9B9xaLGT8oS8aLxaKvumbWbKq/z/CI6lxT+H2dvWfhBUKxgswixuln9GcJmfuP/w/GR6US1X7ZSWfFgRJNH9uqozSaZvLjQet5XTp2Wp/W1kVNc1eFgrCbqHvxKcR0MZFurv6OybUYDoZwOkSvD8pKQ7ZZb+8VVRVmyI45+1PxkAYzLBia06gVCsIJMDBkZ/aEcil9OaNhBU5VOuyUkMKQuOzuNFtxtjw0nK5W2+mFfydUr6ENDcq2mJrCQ8zw+YWRLo3rs/Bbf4V24V+5FlLZPWkVdiSBOOwot8JQ9wK7V7JH8p1MzNBxjIV/sRYamNQLtYI5LhRqL2JzMMOfRbZ1JbS7Tqn79e+//zIozbWOCnfdBXMDjgEPVIatrW0vLuyeug1J+Nb4tbVwazkzXBvPhVpX6ty6d3V1xwwVGhYzzHszIzQc3FbKDtwkulUZuiV76mxtxY4SMywWixu/tqeSYWH9WCs8yrvBzPB5w5AD5pkMg8FNELxTcxIsd4FsyG7dmpsL25ZvkA0Na4937YuaL+5/h+OQb2MrIrMXhdKCXPI+WxuOB5Xl0yIIbkYKQ3afb9Oh4UiUjkDzWFqrTV+kQxr1QnToSbIAQ3hQ/tCEsxk+3VYG2jYY9IeyIRnH24W2dBSDGU5rF7X5k/hawfBxXSispLjPDH+O656nuBf6bIZG2E1vBsHySWHosMmQbfiWSnuxm7JxaLrrC78pHUNh4/CpwQ6UyDeJh4auIpnTzjgOqV5mYfTdlA3hVu05Y1oqiXu7EEtpQw6lYHhlFB/ZLZTCQ2DopI61J5ytDanJ7tsaWK2hFEvZ5u/0yXDdp63vi1MiM9RIsV3zu0Jn5IaEsH4qhFMwtKrVav9EL817cx8MaSNgHybQktuwNbT5XG8tfOkmez4f6mO/Jt5RCb3U0Kym3E+TWHolb3Kfx3ASlC1Cy0GYfre2oiEJJ8PoWI3R833hw2nMMJCGfc3t+v46fdoXchqDPSSdC0oyb8U2/lkM6cNwFxreDHeOZl0Ph+kIR7ThaMc/KMZqjEbCOW86Gq1gOHW7XWF11V912VYwqa66XSFo9k9/eonuffuW/9Y3bbGhTR321ZI+UoQ4TjwNhg+Kvzx+0HGk8ED5p5gQxaeU/OLTS3T5dyAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgvyn+B9+SJ5VtJ4aWgAAAABJRU5ErkJggg=="
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateShadowPayUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://shadowpay.com/favicon.ico"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }}
                          />
                          </a>
                        </li>
                        
                        <li>
                          <a
                            href={generateGamerPayUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        
                        <li>
                          <a
                            href={generateCsFloatUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5f5c75296c8f190001dc6120/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateCsMoneyMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        
                         <li>
                          <a
                            href={generateAvanMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                         <li>
                          <a
                            href={generateHaloSkinsUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        
                        <li>
                          <a
                            href={generateSkinbidUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://csgoskins.gg/social-images/eyJpbWFnZV91cmwiOiJodHRwczpcL1wvY3Nnb3NraW5zLmdnXC9idWlsZFwvYXNzZXRzXC9zcXVhcmUtQ0JpVnl2UGIucG5nIiwiYXNwZWN0X3JhdGlvIjoxLCJzaWciOiJlNGY5ZTAwOGU0ZGY5YWM0NjkxNGViNjQ2NjQ5NWJhZiJ9.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generate49SkinsUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM8AAACOCAMAAAChW6ykAAAAkFBMVEXr/wAAAAD///91fwA6PwD1/393gQCdqwADAwD5/7P9//Hw/0b7/9jt/yKjsQD1/3wvMwDH2AAkJwDj9wDQ4gAKCgAWFwCzwwAODwBMUgAbHQCquQATFAB2fxF9iAAgIgC+zgBcZAAsLwCXpABkbQDV6AA0OAA8QQBqcwDd8ABFSwDk+ACGkQCOmgCntgAsMADloJgLAAADmElEQVR4nN3ciVJaQRCFYToo4IaooLiziApu7/92SbWmYtRwp2dO22fyP8F8VfcoDBStH7i2WgThOPvRFA2l2d6JlrwG4uzuRUPewnAopqNBOBzT0QAalulo5Rya6WjFHJ7paKUcouloZRqq6WhFHK7paCUcsuloBRy26WjZGr7paLkcwulomRzG6Wh5HMrpaDka0uloGRzW6Wh2Du10NDOHdzqaUcM8Hc3GoZ6OZuJwT0ezcMino6Vr6KejJXP4p6OlciqYjpbIqWE6WpKmjulomyldtuPrHOHQEl+vj+MQeKCceA+WE+4Bc6I9aE6wp9cFc2I9eE6ox4ET6fHgBHpcOHEeH06Yx4kT5fHiBHlG6H+jsZ7jiRcnxLMaunECPC8nfppv9xzenHtqUjyDDUyr6VXX8UF76+CwyXM9cT8EsqNpE6h3FX1GW91Rk+jW/zlBNpw1gcbz6DOaerhpAsnpMvqQpvrjJtDZJPqMpoaDJlAn+oi2Hu7/L0+rdX4B9QAvpTNbbCA9nbbLIU21e0CP3C5cDmnp5BjokbHzi8+EFndAj8j9g8spLV3945nL8sgg/qXSyRnQI+Nnl0NaWq6AHpGb+Gfu8YtnLtsjswOXQ1qaXAM9MvK6bUtveQr0iEzjXy08jYAeOYx/5j5cLZR5ZPTkckhLf18tFHoo3hK+v1oo9jDcFB3MgB7pPboc0tKfqwWAR2QV/8z9vlqAeBiuId6uFjAehtvJ16sFkEfkLv5t3vkY6JFj109MklrcAj3SI7gragM9Ihvxz5z1FeVaj1zEP3PG1nsorhZMNXkYrhYsTb6+hnjX2O1bCC59fkv4KYKrBUvzxk9hZnU9c82fwvh988Wnzpob8dcIrhYsfXFT9CH/q4Xl/H56egf6HkXjIyfiq+k3/10C56l5fvlujadnuPYjuuo8k/Ufodbm6Td+86Uqz7zxf0VVnm4Ux8cTx3HxBHI8PJEcB08oB++J5cA9wRy0J5oD9oRzsJ54DtRDwEF6GDhAz7IT/WMBv7pM+mUDHNq5ne2kX56IPmZqm4m/CxJ9zsS2Ejl1ePZ2UzlVeBKnU4tnP11Tgyd5OlV4DNOpwWOZTgUe03T4PbbpsHus0yH3mKfD7bFPh9qTMR1iT9Z0eD1506H1ZE6H1ZM7HU5P/nQoPQXTYfSUTIfQUzQdOk/hdNg8pdMh8xRPh8tTPh0mD2I6RB7IdHg8mOnQeEDT0X4CHVNSXnak7QgAAAAASUVORK5CYII="
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        
                        <li>
                          <a
                            href={generateTradeitUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://avatars.fastly.steamstatic.com/b651ab5d7f223e831bdbd700cebee6754452cd9f_full.jpg"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateSkinflowUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/63c45f4646061d086acf1438/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        
                        <li>
                          <a
                            href={generateAimMarketUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/64a7fc38b764014b60e0109c/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateGameBoostUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://s3-eu-west-1.amazonaws.com/tpd/logos/6389ffecd46aa6408d48d088/0x0.png"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        

                        
                       
                        <li>
                          <a
                            href={generateSihUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://avatars.fastly.steamstatic.com/faa27c7e61ec0ec7ef08c37405bd89cab38c291f_full.jpg"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateWaxpeerUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/jpeg;base64,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"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateLisSkinsUnlocksUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="https://assets.lis-skins.com/assets/images/logo.svg"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        <li>
                          <a
                            href={generateCsDealsUrl(skinWithFloat)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEhAQEBAVEBAVGCAbGRUVGBsQEBggIB0iIiAdHx8kKDQsJCYxJx8fLTItMSwtMDAwIys1QD8uNzQuLzUBCgoKDg0OGhAQGi0dHx0tLS0tLS4rKy0tLS0tKystLS0rKy0tLSstKy0sLS0tKy0vKy03KzgrLS03LSsuLS4rLf/AABEIALgAuAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABgEHAwQFAgj/xABFEAABAwIBBgkJBwMDBQEAAAABAAIDBBEFBgcSITFBE1FTYXFyk7LRFhciMjWBkaGxFCM0QlJiwTNUgkOS4SREosLwY//EABoBAAIDAQEAAAAAAAAAAAAAAAABAgQFAwb/xAAxEQACAQICBwYGAwEAAAAAAAAAAQIDEQRxEhMUITEyUQUzUpGx0RVBYYGhwSJC8CP/2gAMAwEAAhEDEQA/AOXlllXWU9XJDDIGxtDSAWNcdbQTrIXE8u8R5ZvZs8EZxfx83VZ3AlpWalSam974nCEIuK3DN5eYjyzezZ4I8vMR5ZvZs8EtKVDWz6vzJ6uHRDL5eYjyzezZ4KfLzEeWb2TPBLKEayfVi1UOiGby9xLlm9kzwU+XuJcs3smeCWbKUayfVi1UPCvIZvL7EuWb2TPBHl9iXLt7JngllCNZPqGpp+FeQz+X+Jcu3smeCPL/ABLl29kzwSwhGsl1FqafhXkNHnAxPl29kzwR5wMT5dvZM8EroRpy6hqKXhXkho84OJ8u3smeCPOFifLt7KPwSuhGnLqLZ6XhXkho84eJ8u3so/BHnDxPl29lH4JWsiyWnLqGz0fAvJDT5xMU5dvZR+CjziYpy7eyj8ErIRpy6hs1HwLyQ0+cXFOXb2TPBHnFxTl29kzwSqoRpy6hs1HwLyRZWQmWdfU1sUE8odE4PJAY1h1NJGsBC4Ga72lB1ZO4UKzRba3mH2lTjCqlFW3ftmLON+Pm6rO4EtJlzjfj5uqzuBLSr1ed5s9BT5FkShClQJApshb2C4RPVzMp6dhfI4/4gbyTuAQBqQxOe4NaLuO5MNHk+wAGQlx4hqarho82tLHRClv9/fSNSB95p22j9u7R4udVXlQ+qopTTzRNa8aw/bG8fqbzfRdqTp/2ONVVOEQbgtPyY+JQ/Aac/lI6CVxo8oZhtDSOiy6lHlHG6wkaYzx+s1d1Ok/kV5QrLf8AswVGS4/05Lczh/IXIrcKmi1vYbfqHpNT1C9rgHNIcDvGsLMGpyoRfDcQjiZx47yskJ3xHJ2KS5Z90/jHqnpCVMQw6WE2kbYbiNbT0FVp0nEt068Z8OJpospTdm8yPNfI6SQ2pYiNOx9Jx2hg4ucrmdhTkge0Mc5rmteLtJFg6xsbcaxr6Eyjyfp6mD7O5ga1o+7LRYx22aPhvVD4vh7qeaSBzmvLDa7Tdp/+4kkBpKF6UFAEKFKEANOa/wBpQdWTuFCM1/tKDqydwoVvD8pg9qd8sv2zHnG/HzdVncCWky5x/aE3VZ3AlpV6nO8zbpciyBelAUqBMF0MDxmejlbPTyGN497XD9LhvC0EJgfRmSWXcFWxgm0aapIHoONmPvqBjJ26920LdysyTpa9tpwRI1pDJGkhzL77bDs3r5+xKoc1tE9ji1zYw5pGogg7R8Fa+bvOGapxp6x8ccoYNB3qcIRfSJOwG1tXSlONnuIwlpLeVHjuBVFI/g6iN0ZNy0kWDgDa4XOsvpjKbJ6nr4hFODog6TXNNnA2tceC+fspMAlo5nxSAlocQ2TRLWPtvHxQnclY0aKtkiN43W4xtaekJvwfG45rNd6EnFuPQkhe2sO0A6he4Gwcf/K6wqOJxq0Y1MyzWhE1O17S17Q5p2gpYwHKPZHOeYSH6O8U3NCuxkprcZVWEqcrMUKvJlkcscjtN1JpDhAzXM1t9duNXphDKPgGOohGKdwGiYwADYW18/TrVegLj4tRVEcU4opHRslH3kLTZruMt4jx22qtVofOJbw+M/rPzM+W+cIPBgoi5pNw+UjRcN1m+KrMlSRbVsUFV7GgQhentINiCDxHUV5QBBUKSoSAas2HtGDqydwoRmw9owdWTuFCt4flMPtPvlkvVmPOP7Qm6rO4Espnzke0JuqzuBLIVepzvM2aXJHJEhCFKiTBSoClAG7VyB0VPr1tDmn/AHXH1WnZTdCbdyKVi383ecJ0roqOrLQ7Rs2YnRLyLaLSNl7b96eMpMFirYHU8ps0kEOABc2x2i+w7l80gq3M1mUc32eWOoYTSwDVPvBJ/p2/MTfVZQaJ3OPHm2MM8z6lxdQxDTuwXllG3RAGw8fyXLjy6kbVmYQs+ylnAmm0RoGL9PTvV00YkcOElGg52xn6BxHn4/guLS5D0P2z7YY9YF+D1cAHfrt/Gy6LgJsubVks8M0DnR0Eo03Mf6M8e/QsePcdy6GLYMKFrXRlzqUCzg46b4/3X3t4+JP+LRvtpxEcINgPqvH6Txcx3Ktc5WI1L6dphaW0x1Tcq1wPqPG4c+9ShNxd0c6lOM42ZtMsbEG4O8LI0JWyJfU6Ja9h4D8rnaiOYcYTY0LRhLSVzBrQ0JON7izlFksJ3CSEtY8n0wfVPP0/VbmDZKwQWc4cLJ+pw9EdAXdAWRoS1cb3sDxNTQ0L7ipsqjerqev/AAFyl0MoHXqag/8A6H6rnqhLizdpboRyRCgqVBUToNObH2jB1ZO4UIzY+0YOrJ3ChXMPymJ2j3qy/bPGcn2hN1WdwJZCZs5PtCbqs7gSyFWqc7Nej3cckSpUKVE6EgbhrKki23V06lnw6XQlhf8Ape0/AhXrJTRu1mNrr8bQUm7AUIFKvJ2T1G/1qaI/4gfRY3ZC4c7bTgdVzm/yi4WKTZa4vci+u2oprxfLJ16eKgaaWmpyHMZqc9zt7n8Z2plymyRwmki4WV0rCdTWNfd7zxAEfPcuNkTkm6WUSuBiLQyaEPGmx7NOxuegfFAFkZL5VMqoojI3gZnj1SfRdtF2npB1HWu65L+K4FC5haxojOkXgi+1xub8xOvmOsKMCxt2l9mqSBM3UHEj0uIHnI2H83TcKIzoZS4s+npZ52tDnMbdrSbN3DWq1wfRkMr5KszySm8jCdBhI2AsPErRrKZkjDHI0PY7a07Druq1y8ySe6Qzw3fNLI9xt6MbWNYDrO46tu+66U5KL3q5yrU3ONk7HZa1e2hVjh+NVcbS5kpcxpAId6YF9m1d2gy6GoTw/wCTD/BVxV4vjuMmpgaseG8dQFkYFysPyhpZrBkzQ79LvQd811SdV+ZdU0+BRnGUXaSsUviTrzTHje76laqyTuu5x4yT81jKzWemirIgoKChIkM+bL2jB1ZO4UIzZ+0YOrJ3ChXcNymN2h3qy/bIzle0JuqzuBLITRnJ9oTdVncCWVVqczNSj3cckeQpUqQonUhXzhc2nDC/9TGn5BUQrlyJn06KnN9jdE+4kJMEMsLVt6LtF2gAX29EO1NvuvzJboMq6N85p2zDTGoE6o3HiB3lNUKiMrHC8Fq6jEmPxAsdMyVv/Tv9R8WvSdHfUQ3VqFzxqz6HDo6eGOCO/BsFm6R0nWvfb717rMNhqGhkzA4A3afVe0/qa4awecLm4i2up43aANa0D0X2/wCob1m/6luaxO8b0AcvKvHWU7XAOAeBck6xGDsJG8n8rd/QCqfmx+UzGVt9HZoOOlpAm50jvJOu+42tawRlBiks0jhIHNAcTou9e+9zv3fTYNS5SmkRuXRkhlYydrWSPuTqa53r3/Q/93E7Y/puEz1EQc1zHeq4EHdqIsV870dW+J2kw8xB9Vw4irZyOyubO1scrvSFgHOOu+5rj9Hb9h17U0NM18byNL3VD49FkfANjZGBt0Re/SCB81UhC+gMYkqgYfszGPBfaTTNrN4wq9zjZL8G41cDfu3H7xo/KT+boP1QmDEBbtFjFRDqjmc0cV9JvwK1FCkrrgRlFS3NXPBUFZFBSGeCoXooQMZc2ntGDqv7hQpzbe0IOq/uFCu4blMjHd79vcM5XtCfqs7gSymfOX7Qm6rO4ErhVJ8zNGh3Ucl6EqQoUhROxK67MfmbTCkYdBlyXEes6+7mC5AUoEbFBSSTSMhiaXSPNmgcau+ioquijjDJDWhrQHxvNpL7zG//ANXfELn5rskfs8X22dtp5W+g07WMO/pP0WbKzLilptJjCJ5/0NPojrO/hJ7xoZMFygp6glrH6Mo9aJ44OZvS0/wu0JV8y4pjU9RLw8jzpj1dH0dEcTeJMWCZx66CzZHCpYN0nr/7h/KWiFy3MosnKOsH38IL90jfQlHvG33qtcazXysJdSzNlb+mT0H/AB2H5Jhw/OfRyWErZIHc402fEeC7MWU1FJ6lVEelwafmjeh7imK3JutiJElNIOcDTHxC8YdR1bXgxQyF2y2gdEjeDfcrqlxOHbw0duu3xXLrMpKOO5fUs6AdM/AJ6QrBk9isoLKaqYY5C27NI6V+YO/Nb48fGu7PG1wLXAOaRYg6wRxKqMrMsvtDeCgaWxg303f1CRs0f09O1bmTucN7AI6wGRuwSN/qDpG/6pWC5w8scnXUcvo3MD9bDxcbTzhLyuypdR4hA6NsjZGuGqx9Np3G20EKoMYwySmlfDKLOGw7nDcQpJgaKChQUCIKEIQMZs2/tCHqv7hQozb+0Ieq/uFCu4blMrGr/osvc9ZzPaM/VZ3AlcJozme0Z+rH3AldVJ8zL+H7qOS9CUBZKWB8j2RxtLnuIDQNpJV05MZtaOJgNUwVMxHpaX9JvMB/JUG7HYpRZ6Kp4ORkga15YQdF404zbcRvC+gKrN1hUrHMFK2EnY+O7XhVThGQM01dUUZfox07rSSgX1flsOMjci4WOfjWWmIVQIlqHBh/JH90z4BL6+gKPNnhTGhroXSH9T3nSPwSnnHzcwU9O+soy5rY7acbjpNsTa7Tt1XGpCaCxVilWNmpyTpquOolqouEa1wazWW7ru+oT+3NxhP9r/5ORpBY+eroVl5ys3sNJF9rpC4RggPjcdK19QLT07udNeE5usO4GHhYNKXQbpnSIuba07hYom3MoX0K3NxhP9t/5uVQZxqKmgrpKeljEccbWggEuu61z9QPchO4WFlCufIvNtS/Zo5K2MyTyDS0bloYDsbq321lZsssiMLpqGqqI6ez2M9E6RNnEgD5lLSQWKTY8tN2kg8YNistVWSyaPCSOk0dQ0iXW6FY+arI6lq4Jp6uLhPvNBmsttYXOzpC5GdbCKOknggpIuDPB6b9ZcdZ1DX0fNO4WEcrystPA6R7Y2NLnuIDWjaSTYBXRk5mopGMBrC6eYj0mtOhE3mG89KTYFJKCr/xHNThsjC2Jr6d+57XaVjzg7QqJxOifBNLBJbTieWOtsuDZCYHdzce0Ieq/uFCjNz7Qh6r+4UK/huUzMYv5rI95zfaM/Vj7gSumjOd7Rn6sfcCVlSnzMu4fuoZL0HDNZR8JXscRqia5/v2D6qzM4WNyUlE58LtCZ7gxjt4vrJHuCU8zlJZtTORtIYD0az9QvOeau10kF9gc8j5D+VD5nf5Fm4Vj1M2KITVsDpAxumeEZrNhc7Vxc31SJY6uqGsz1Ujr8wIDfkvn+w4grczM4oDDPSk+kx2mOcO1H5j5oaC4yNx+c4yaTTDaWODTcLDWSAdIndtC5edTK+ldRyUkE7ZZpHNDgz0wGg3NyNW4Jezx4a5k0VWy4ZK3g32426xfpH0VdQRFzmsG1xAHvNkJA2X3mwo+Bw+nuLOkvIf8jq+QCMAxyonxWvhEl6SBgaGWFtPULg7dt12KQNgha3YyJlvc1v/AAlXNIwuhq6t3rVE5N+Yf8uKQHbzhP4RlFSD/uKlgI/az0nfQLdylxM09JUztNnMjJb07G/MhcjEJOFxaFu1tLTl54tKQ2HyC2srMHfW0zqZsoh0nAlxGnqBvb6IGVEM4mLf3jv9rPBesjaJ+IYi1854T0uFlJ323e82C6eP5tjS081S+sa4Ri+iIyC4k2AvfnXezOYboQTVJHpSu0Wn9rNvzPyUm1bcRLGqK0MdCy13Sv0R7gXOPuASrnirNDDXMv8A1JGN9wu4/QLcjquFxPgxrbTU5J68pA7o+aWs8rzIMPpW7ZJCfo0fVRXEbGfNvR8Dh1K21nObpnpeb/Syp3OTiHD4jVuBu1rtBvQwW+t1epmbTwk7GQx39zG/8L5nqJS9znna4lx95umgY1Zq4Q7EoCRfRD3DpDdX1VqZxscmpKJ0lO7Qmc9rA62kW3vcjn1KmshsTbTV1NK7UzS0XHiDha/uvdXPl1hZqqGeJuuRo4Rlv1M1294uh8QR1qnKWmpIozW1LGSaDdIX+8cbC9mjXtXzfjFaZ555z/qSOf8AEkrWkeXEucSXHaSbuPSV4TtYVxlzc/j4eq/uFCM3P4+Hqv7hULQwvI8zOxfOsjLnO9oz9WPuBKqas5/tGfqx9wJXYwkho2k2+Koz5mW8N3MMl6F2ZuaYRUMN7Avu8+86vkq7zlV3C181jcRgMHuGv5lWbh8IjYxgGprQPgFyMisEe37VNVRN4SWUkBwDyBr8VzudyoQV2Mk8XNJVQzj1QbPHG06j4+5WTjNBBNWxwuhYY4oS5zdEAFz3WF7cwXLypyZjMTG0lKwSOkALmixaN56E7hYdMr6WOqo54rgu0dNh/c3WPD3qnshqYSV1MD6rXaZ/xF/rZWvVVRjbHEyMyyP9FrAQ3Y3WbnVYD6pPyUydqKKcPqowDKCyPRcH6/WcTxCw2pLgDQ4Zb4sI6GpIJ0nN0B/kbfS62siWtgoqWKxvoAnVvdrP1SzlrRzVDaeniYXNdJd7vytA4z7ymOtqhDDJJsEbCR7hqQBpZN1gkqMRqiCeEm0Gn9sYt9brWypy/FHK2FsHCktDiS/Qtc6hsKMk4DHSQA+sW6bulxufqkXKvCayernkbTSOYTZptqIAsCj5gzcypy+kroPsracRaT2m4fp3tsFrDerJwMCmp4YA3VGwA69p2n53VS5JYLJ9ujZPGWGMcI5rtv7fmrPq8RihaHTSNjaTYFxsCU2CNLIWSbTr6qeJ0b55bgPBadEDV9VpZQSmfGaJpAIgj0yN20nwTJSVTJGtkjcHscLhw2FLOFDTxHEJ9oZoxNPQNf0SA6eX+LuZQVA1AyWjHH6R1/IFUirRzi0tRPHBFBC+UBxc7RFwNVgPmUiSZNVrRpPppGNG1xGoXNv5TQM5Ku/ITKCSopI3F15I/QceMt2H3iy0Y8mKENA+yxuIG++sgdO9Y8gMOkggk4ZnBvkkLtDeBawSbBFf5cYaKesmY0WY46beh2u3uN1wE3Z0Zg6tAG1sTQfmf5CUFIQy5ufx8PVf3ChGbr8fD1X9woWjhOR5lDFL+f2MudD2jP1Y+4ErxPLSHDaCCPcbpozoe0p+qzuBKioT5mWcN3MMl6FrYZlvRvaDK/gX72kEi/MRtWeuzgUUTSYy6d+5rQWt95KqNChY73GzBMrnNqpp6nWJvWLfy29Ww4hsTkzLCg2/aB0Wdf6KoVN0WAtKnyzouHdK6Rwa1ugwaBvrN3O9+oe5ZajLGilnbIZwGRs0W6TXAkuPpG1uIAKqLqbosK5b4ywoB/3A+DvBK+VOWLKkCmhuyBzhwkjtRIvstuCSEIsFy24sq6BoAFQ0ACw1O3e5Z25YUH9y34O8FTt0XRYdyx8KyhoxPWVEk4DpX2bcE+g0WG7ftXDy8x2OodEyF+nGwE3FwNI9PEAlS6E7CuW1g+VOHxQwRGpaNBjQdTtw17lzcnso6ONszpJw2SWZ7yLOJsT6O7iVboulYLlwtyxoP7lvwd4Lk5XZXUz6Ysp5hJIXtNgCNTTpa7jmCrS6i6LBctShy1o3tDnycE7e1wJseYjajEMvKSNp4Imd+4AFrPeT/CqpCLDubGIVr5pHzSG73m5PhzLXQoTEMubr8fD1X9wqVGbr8fD1X9woWjhOR5lHE8/2GTLrI2uqa2WeCIOicGgEva3Y0A6iVwfN3inIN7VnihC4ujFu5lU+0qsIqKS3L6+4ebrFOQb2rPFHm7xTkG9qzxQhLUROnxSt0X59w83mJ8g3tY/FHm8xPkG9rH4oQnqIkviVbovJ+4ebzE+Qb2sfijze4nyDe1j8UIT2eJL4jV6L8+4eb7E+Qb2rPFHm/wAS5Bvas8UIT2eJJdoVei/PuR5AYlyDe1Z4o8gMS5Bvas8UIT2aJPbqv0/33DyBxLkG9qzxUeQOJci3tWeKEI2aI1janRB5BYlyLe1Z4qPILEeRb2rPFCE9lgSWMqfQjyDxHkW9qzxR5B4jyLe0Z4qEJ7LDqySxc+iDyDxHkW9ozxR5CYjyLe0Z4oQnskOrHtU/oR5CYjyLe0Z4o8hMR5FvaM8VKEbJDqyW0z+h2cjslaynq45pow2NocCQ9rtrSBqBQhC7U6apqyITm5u7P//Z"
                            alt="ShadowPay"
                            style={{ width: '20px', height: '20px' }} 
                          />
                          
                          </a>
                        </li>
                        

                       
                      </ul>
                    </div>
                    <button
                      className="edit-float-button"
                      onClick={() => setSelectedSkinId(skin.id)}
                    >
                      🎯    FloatCap
                    </button>

                  </div>
                );
              })}
            </div>
            
          </section>
          {selectedSkinId && (
            <div className="float-modal">
              <h3>Modifier float pour {selectedSkinId}</h3>
              <input
                type="number"
                step="0.0001"
                min="0"
                max="1"
                value={floatCaps[selectedSkinId]?.floatMin || ''}
                onChange={(e) =>
                  setFloatCaps(prev => ({
                    ...prev,
                    [selectedSkinId]: {
                      ...prev[selectedSkinId],
                      floatMin: e.target.value
                    }
                  }))
                }
                placeholder="Float Min"
              />
              <input
                type="number"
                step="0.0001"
                min="0"
                max="1"
                value={floatCaps[selectedSkinId]?.floatMax || ''}
                onChange={(e) =>
                  setFloatCaps(prev => ({
                    ...prev,
                    [selectedSkinId]: {
                      ...prev[selectedSkinId],
                      floatMax: e.target.value
                    }
                  }))
                }
                placeholder="Float Max"
              />
              <button
                onClick={async () => {
                  const { floatMin, floatMax } = floatCaps[selectedSkinId];
                  await updateSkinFloatCaps(selectedSkinId, floatMin, floatMax); // Appel à db.js
                  setSelectedSkinId(null);
                }}
              >
                ✅ Valider
              </button>
            </div>
          )}



          <h4 style={{ color: '#ffd369', fontSize: '1.2rem', marginBottom: '0.8rem' }}>🎒 Entrées :</h4>
          
          {outputs.length > 0 && (() => {
            

            inputs.forEach((skin) => {
              const key = `${skin.name}-${skin.wear}`;
              if (!seenInputs.has(key)) {
                const count = inputs.filter(s => s.name === skin.name && s.wear === skin.wear).length;
                const priceMax = skin.price * ratio;
                groupedInputs.push({ ...skin, count, priceMax: parseFloat(priceMax.toFixed(2)) });
                seenInputs.add(key);
              }
            });
            
            

            return (
              <>
                {/* 🎒 Entrées */}
                <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: '1rem' }}>
                  {groupedInputs.map((skin, i) => {
                    const prix = skin.price ?? 0;
                    const tropCher = skin.price > skin.priceMax;
                    const link = generateMarketLink(skin.name, skin.wear);
                    const link2 = generateMarketLink2(skin);
                    const { min: floatMinCap, max: floatMaxCap } = getFloatCapsForInput(
                      skin,
                      trade.floatCapMin, // depuis le trade (déstructuré plus haut)
                      trade.floatCapMax
                    );

                    return (
                      <li key={i} style={{
                        backgroundColor: '#1e1e2f',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        marginBottom: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <img
                          src={skin.imageUrl}
                          alt={skin.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #444'
                          }}
                        />
                        <div style={{ color: '#eee', flex: 1 }}>
                          <strong>{skin.name}</strong> — Float: {skin.float ?? 'N/A'} — Wear: <span style={{ color: '#ffd369' }}>{skin.wear ?? 'N/A'}</span><br />
                          <span style={{ color: tropCher ? '#ff4d4d' : '#4dff88', fontWeight: 'bold',
                            fontSize: '1.25rem', // ≈ 20px
                            letterSpacing: '0.5px',
                            marginLeft: '2px' }}>
                              {prix.toFixed(2)} €</span> — Seuil conseillé (ratio {ratio.toFixed(3)}): 
                          <span style={{
                            color: '#cf686bff',
                            fontWeight: 'bold',
                            fontSize: '1.65rem', // ≈ 20px
                            letterSpacing: '0.5px',
                            marginLeft: '502px'                            
                          }}>
                            {skin.priceMax.toFixed(2)} €
                          </span>

                          {skin.count > 1 && (
                            <div style={{ color: '#aaa', marginTop: '0.2rem' }}>× {skin.count} items similaires</div>
                          )}
                        </div>
                    
                        <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{
                            background: '#222',
                            color: '#a0d8ff',
                            padding: '2px 6px',
                            borderRadius: 6,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}>
                            minCap: {typeof floatMinCap === 'number' ? floatMinCap.toFixed(4) : '—'}
                          </span>
                          <span style={{
                            background: '#222',
                            color: '#ffd369',
                            padding: '2px 6px',
                            borderRadius: 6,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}>
                            maxCap: {typeof floatMaxCap === 'number' ? floatMaxCap.toFixed(4) : '—'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                
              </>
            );
          })()}



          <h4 style={{ color: '#ffd369', fontSize: '1.2rem', marginBottom: '0.8rem' }}>🎁 Sorties :</h4>
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {/* 🎁 Sorties */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {finalOutputs.map((skin, i) => {
                    const link = outputLinks[skin.name];
                    const CardContent = (
                      <div style={{
                        backgroundColor: '#1e1e2f',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        textAlign: 'center',
                        color: '#eee',
                        boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                        cursor: link ? 'pointer' : 'default',
                        transition: 'transform 0.2s ease'
                      }}>
                        <img
                          src={skin.imageUrl}
                          alt={skin.name}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                            backgroundColor: '#2a2a2a'
                          }}
                        />
                        <strong style={{ fontSize: '0.9rem' }}>{skin.name}</strong><br />
                        <span style={{ color: '#ffd369', fontSize: '0.85rem' }}>{skin.chance.toFixed(2)}%</span><br />
                        <span style={{ color: '#4dff88', fontSize: '0.85rem' }}>{skin.price?.toFixed(2) ?? '—'} €</span>

                        {/* ➕ Bouton pour ajouter un lien */}
                        {/* ➕ Bouton pour ajouter un lien */}
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleAddLink(skin.name);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              padding: '2px',
                              marginRight: '4px',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: '#ffd369'
                            }}
                            title="Ajouter un lien"
                          >
                            ➕
                          </button>

                          {/* ✏️ Bouton pour modifier le lien */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleAddLink(skin.name);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: '#ffd369'
                            }}
                            title="Modifier le lien"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    );

                    return link ? (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        {CardContent}
                      </a>
                    ) : (
                      <div key={i}>
                        {CardContent}
                      </div>
                    );
                  })}


                </div>
          </ul>

          <label style={{ display: 'block', marginTop: '1.5rem', color: '#ffd369', fontWeight: 'bold' }}>
            🔗 Ajouter une URL :
            <input
              type="url"
              name="url"
              value={urlInput}
              onChange={handleUrlChange}
              onKeyDown={handleUrlSubmit}
              placeholder="https://exemple.com/trade-up"
              style={{
                width: '100%',
                padding: '0.6rem',
                marginTop: '0.4rem',
                borderRadius: '6px',
                border: '1px solid #6c63ff',
                backgroundColor: '#1e1e2f',
                color: '#fff',
                fontSize: '0.9rem',
                boxShadow: 'inset 0 0 4px rgba(108,99,255,0.3)'
              }}
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.3rem' }}>Appuie sur Entrée pour enregistrer</small>
          </label>
        </div>



      </details>

    </div>
  );
}

export default TradeUpCard;
