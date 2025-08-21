// AllSkins.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  List, Card, SkinImage, SkinTitle,
  Label, Value, FilterBar, Select, ImageWrapper
} from './StyledInventory'; // adapte le chemin
import { getAllInventory, clearAllInventory, bulkAddAllSkins } from "../db";
import AdvancedFilterPanel from './AdvancedFilterPanel'; // ajuste le chemin si besoin

import AK47 from '../scrapedskins/AK-47_img.json';
import AUG from '../scrapedskins/AUG_img.json';
import AWP from '../scrapedskins/AWP_img.json';
import CZ75Auto from '../scrapedskins/CZ75-Auto_img.json';
import DesertEagle from '../scrapedskins/Desert Eagle_img.json';
import DualBerettas from '../scrapedskins/Dual Berettas_img.json';
import FAMAS from '../scrapedskins/FAMAS_img.json';
import FiveSeveN from '../scrapedskins/Five-SeveN_img.json';
import G3SG1 from '../scrapedskins/G3SG1_img.json';
import GalilAR from '../scrapedskins/Galil AR_img.json';
import Glock18 from '../scrapedskins/Glock-18_img.json';
import M4A1S from '../scrapedskins/M4A1-S_img.json';
import M4A4 from '../scrapedskins/M4A4_img.json';
import M249 from '../scrapedskins/M249_img.json';
import MAC10 from '../scrapedskins/MAC-10_img.json';
import MAG7 from '../scrapedskins/MAG-7_img.json';
import MP5SD from '../scrapedskins/MP5-SD_img.json';
import MP7 from '../scrapedskins/MP7_img.json';
import MP9 from '../scrapedskins/MP9_img.json';
import Negev from '../scrapedskins/Negev_img.json';
import Nova from '../scrapedskins/Nova_img.json';
import P90 from '../scrapedskins/P90_img.json';
import P250 from '../scrapedskins/P250_img.json';
import P2000 from '../scrapedskins/P2000_img.json';
import PPBizon from '../scrapedskins/PP-Bizon_img.json';
import R8Revolver from '../scrapedskins/R8 Revolver_img.json';
import SawedOff from '../scrapedskins/Sawed-Off_img.json';
import SCAR20 from '../scrapedskins/SCAR-20_img.json';
import SG553 from '../scrapedskins/SG 553_img.json';
import SSG08 from '../scrapedskins/SSG 08_img.json';
import Tec9 from '../scrapedskins/Tec-9_img.json';
import UMP45 from '../scrapedskins/UMP-45_img.json';
import USPS from '../scrapedskins/USP-S_img.json';
import XM1014 from '../scrapedskins/XM1014_img.json';
import ZeusX27 from '../scrapedskins/Zeus x27_img.json';

const scrapedData = [
  ...AK47,
  ...AUG,
  ...AWP,
  ...CZ75Auto,
  ...DesertEagle,
  ...DualBerettas,
  ...FAMAS,
  ...FiveSeveN,
  ...G3SG1,
  ...GalilAR,
  ...Glock18,
  ...M4A1S,
  ...M4A4,
  ...M249,
  ...MAC10,
  ...MAG7,
  ...MP5SD,
  ...MP7,
  ...MP9,
  ...Negev,
  ...Nova,
  ...P90,
  ...P250,
  ...P2000,
  ...PPBizon,
  ...R8Revolver,
  ...SawedOff,
  ...SCAR20,
  ...SG553,
  ...SSG08,
  ...Tec9,
  ...UMP45,
  ...USPS,
  ...XM1014,
  ...ZeusX27
];


function AllSkins({ priceMap = {} }) {
  const [allSkins, setAllSkins] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [wearFilter, setWearFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [raritySearch, setRaritySearch] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    wear: [],
    rarity: [],
    type: [],
    collection: [],
    weapon: [],
    priceMin: '',
    priceMax: ''
  });


  //
  // 📥 Chargement initial depuis IndexedDB
  //
  useEffect(() => {
    loadSkins();
  }, []);

  const normalizedRarity = (rarity) => {
    const map = {
      'Mil-spec Grade': 'Mil-Spec Grade',
      'Consumer Grade': 'Consumer',
      'Industrial Grade': 'Industrial',
      'Mil-spec': 'Mil-Spec Grade',
      'Consumer ': 'Consumer Grade',
      'Industrial': 'Industrial Grade',
      'Restricted': 'Restricted',
      'Classified': 'Classified',
      'Covert': 'Covert',
      'Contraband': 'Contraband',
      'Rare': 'Rare'
    };
    return map[rarity] || rarity;
  };

  const loadSkins = async () => {
    const dbSkins = await getAllInventory();
    setAllSkins(dbSkins);
  };

  const updateSkinsFromScrapedData = async () => {
    if (!window.confirm("Mettre à jour les images et variantes ST/SV ?")) return;

    const existingSkins = await getAllInventory();
    const updatedSkins = [];

    for (const scraped of scrapedData) {
      const { name, imageUrl, isST, isSV, rarity } = scraped;

      const trimmedName = name.trim();

      // 🔧 Cas spécial pour le Zeus x27 — recréer toutes les usures manuellement
      if (trimmedName.startsWith("Zeus x27")) {
        const allWears = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];

        for (const wear of allWears) {
          const matchingSkin = existingSkins.find(s => s.name.trim() === trimmedName && s.wear === wear);

          const resolvedRarity = rarity || matchingSkin?.rarity || "Unknown";
          if (!rarity && !matchingSkin?.rarity) {
            console.warn(`⚠️ Rareté manquante pour ${trimmedName} (${wear})`);
          }

          const commonFields = {
            name: trimmedName,
            wear,
            rarity: resolvedRarity,
            collection: matchingSkin?.collection || '',
            price: matchingSkin?.price || null,
            volume: matchingSkin?.volume || null,
            date: matchingSkin?.date || null,
            imageUrl: matchingSkin?.imageUrl || imageUrl,
          };

          updatedSkins.push({ ...commonFields, isStatTrak: false, isSouvenir: false });

          if (isST === "StatTrak Available") {
            updatedSkins.push({ ...commonFields, isStatTrak: true, isSouvenir: false });
          }

          if (isSV === "Souvenir Available") {
            updatedSkins.push({ ...commonFields, isStatTrak: false, isSouvenir: true });
          }
        }

        continue;
      }

      // 🔍 Cas général : variantes existantes
      const wearVariants = existingSkins
        .filter(s => s.name.trim() === trimmedName)
        .map(s => s.wear);

      const uniqueWears = [...new Set(wearVariants)];

      if (uniqueWears.length === 0) {
        console.warn(`⚠️ Aucun wear trouvé pour ${trimmedName}, création par défaut`);
        updatedSkins.push({
          name: trimmedName,
          wear: "Field-Tested",
          rarity: rarity || "Unknown",
          collection: '',
          price: null,
          volume: null,
          date: null,
          imageUrl,
          isStatTrak: false,
          isSouvenir: false,
        });
        continue;
      }

      for (const wear of uniqueWears) {
        const baseSkin = existingSkins.find(s => s.name.trim() === trimmedName && s.wear === wear);
        if (!baseSkin) {
          console.log(`❌ Skin ignoré : ${trimmedName} (${wear}) — aucune correspondance trouvée`);
          continue;
        }

        const resolvedRarity = baseSkin.rarity || rarity || "Unknown";
        if (!baseSkin.rarity && !rarity) {
          console.warn(`⚠️ Rareté manquante pour ${trimmedName} (${wear})`);
        }

        const commonFields = {
          name: trimmedName,
          wear,
          rarity: resolvedRarity,
          collection: baseSkin.collection || '',
          price: baseSkin.price || null,
          volume: baseSkin.volume || null,
          date: baseSkin.date || null,
          imageUrl,
        };

        updatedSkins.push({ ...commonFields, isStatTrak: false, isSouvenir: false });

        if (isST === "StatTrak Available") {
          updatedSkins.push({ ...commonFields, isStatTrak: true, isSouvenir: false });
        }

        if (isSV === "Souvenir Available") {
          updatedSkins.push({ ...commonFields, isStatTrak: false, isSouvenir: true });
        }
      }
    }

    await clearAllInventory();
    await bulkAddAllSkins(updatedSkins);
    await loadSkins();

    alert(`✅ Mise à jour terminée : ${updatedSkins.length} skins mis à jour avec variantes ST/SV correctes`);
  };



  //
  // 🧩 Import JSON → IndexedDB
  //
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (Array.isArray(json)) {
        await bulkAddAllSkins(json);
        await loadSkins();
        alert("✅ Import terminé !");
      } else {
        alert("❌ Le fichier JSON doit contenir un tableau.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'import.");
    }
  };

  const handleExport = () => {
    if (!allSkins || allSkins.length === 0) {
      alert("❌ Aucun skin à exporter.");
      return;
    }

    const dataStr = JSON.stringify(allSkins, null, 2); // JSON lisible avec indentation
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "allSkins_export.json"; // nom du fichier
    a.click();
    URL.revokeObjectURL(url);
  };

  //
  // ♻️ Reset DB
  //
  const handleReset = async () => {
    if (window.confirm("Voulez-vous vraiment vider AllSkins ?")) {
      await clearAllInventory();
      setAllSkins([]);
    }
  };
    const handlePriceUpdate = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          const priceData = Array.isArray(parsed.items) ? parsed.items : [];

          if (priceData.length === 0) {
            throw new Error('Aucun item trouvé dans le fichier JSON.');
          }

          // 🔍 Fonction pour extraire les infos du market_hash_name
          const parseMarketHashName = (fullName) => {
            const isStatTrak = fullName.startsWith('StatTrak™');
            const isSouvenir = fullName.startsWith('Souvenir');
            const baseName = fullName
              .replace(/^StatTrak™ /, '')
              .replace(/^Souvenir /, '')
              .trim();
            const wearMatch = baseName.match(/\(([^)]+)\)$/);
            const wear = wearMatch ? wearMatch[1] : null;
            const name = wear ? baseName.replace(/\s*\([^)]+\)$/, '') : baseName;
            return { name, wear, isStatTrak, isSouvenir };
          };

          const updatedSkins = allSkins.map(skin => {
            const match = priceData.find(p => {
              const { name, wear, isStatTrak, isSouvenir } = parseMarketHashName(p.market_hash_name);
              return (
                name === skin.name &&
                wear === skin.wear &&
                isStatTrak === !!skin.isStatTrak &&
                isSouvenir === !!skin.isSouvenir
              );
            });

            if (match) {
              return {
                ...skin,
                price: parseFloat(match.price),
                volume: parseInt(match.volume)
              };
            }
            return skin;
          });

          await clearAllInventory();
          await bulkAddAllSkins(updatedSkins);
          await loadSkins();
          alert(`✅ Prix mis à jour pour ${priceData.length} items.`);
        } catch (err) {
          console.error('Erreur lors de la mise à jour des prix:', err);
          alert('❌ Fichier invalide ou erreur de parsing.');
        }
      };
      input.click();
    };

  //
  // 📚 Collections uniques
  //
  const collections = useMemo(() => {
    if (!Array.isArray(allSkins)) return [];
    const unique = new Set(allSkins.map(s => s.collection).filter(Boolean));
    return Array.from(unique).sort();
  }, [allSkins]);

  //
  // 🔍 Filtres appliqués
  //
  const filteredInventory = useMemo(() => {
    return allSkins.filter(skin => {
      const normalizeText = (text) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      
      const matchesName =
        searchTerm.trim() === '' ||
        normalizeText(`${skin.name}`).includes(normalizeText(searchTerm));


      const matchesWear =
          (wearFilter === 'all' || skin.wear === wearFilter) &&
          (advancedFilters.wear.length === 0 || advancedFilters.wear.includes(skin.wear));

      const matchesRarity =
        (raritySearch === 'all' || skin.rarity?.toLowerCase().includes(raritySearch.toLowerCase())) &&
        (advancedFilters.rarity.length === 0 || advancedFilters.rarity.includes(skin.rarity));

      const matchesType =
        (typeFilter === 'all' ||
          (typeFilter === 'stattrak' && skin.isStatTrak) ||
          (typeFilter === 'souvenir' && skin.isSouvenir) ||
          (typeFilter === 'regular' && !skin.isStatTrak && !skin.isSouvenir)) &&
        (advancedFilters.type.length === 0 ||
          (advancedFilters.type.includes('StatTrak') && skin.isStatTrak) ||
          (advancedFilters.type.includes('Souvenir') && skin.isSouvenir) ||
          (advancedFilters.type.includes('Regular') && !skin.isStatTrak && !skin.isSouvenir));

       const matchesCollection =
        (collectionFilter === 'all' || skin.collection === collectionFilter) &&
        (advancedFilters.collection.length === 0 || advancedFilters.collection.includes(skin.collection));

      const matchesWeapon =
        advancedFilters.weapon.length === 0 || advancedFilters.weapon.includes(skin.name.split(' | ')[0]);

      const matchesPrice =
        (advancedFilters.priceMin === '' || (skin.price !== null && skin.price >= parseFloat(advancedFilters.priceMin))) &&
        (advancedFilters.priceMax === '' || (skin.price !== null && skin.price <= parseFloat(advancedFilters.priceMax)));

      return (
        matchesWear &&
        matchesRarity &&
        matchesType &&
        matchesCollection &&
        matchesWeapon &&
        matchesPrice &&
        matchesName
      );

    });
  }, [allSkins, advancedFilters, typeFilter, wearFilter, raritySearch, collectionFilter, searchTerm]);


  //
  // 🔄 Reset filtres
  //
  const handleResetFilters = () => {
    setTypeFilter('all');
    setWearFilter('all');
    setCollectionFilter('all');
    setSearchTerm('');
    setRaritySearch('all');
  };
  

  const groupedSkins = useMemo(() => {
    const map = new Map();

    for (const skin of filteredInventory) {
      const key = `${skin.name}_${skin.isStatTrak ? 'ST' : skin.isSouvenir ? 'SV' : 'REG'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(skin);
    }

    return Array.from(map.values());
  }, [filteredInventory]);
  


  return (
    <div style={{ padding: '1rem' }}>
      {/* 🧰 Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <label>
          📥 Importer JSON
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        <button onClick={updateSkinsFromScrapedData}>🧬 Update IMG + ST/SV</button>
        <button onClick={handlePriceUpdate}>💰 Update Price</button>
        <button onClick={handleExport}>💾 Exporter JSON</button>
        <button onClick={handleReset}>♻️ Reset AllSkins</button>
      </div>

      {/* 📊 Statistiques */}
      <p style={{
        fontStyle: 'italic',
        marginBottom: '1rem',
        backgroundColor: '#2d385faa',
        padding: '0.5rem 1rem',
        borderRadius: '6px'
      }}>
        🧮 Total: <strong>{allSkins.length}</strong> | Regular: <strong>{allSkins.filter(s => !s.isStatTrak && !s.isSouvenir).length}</strong> | ST: <strong>{allSkins.filter(s => s.isStatTrak).length}</strong> | SV: <strong>{allSkins.filter(s => s.isSouvenir).length}</strong>
      </p>

      {/* 🔍 Filtres */}
      <FilterBar>
        <input
          type="text"
          placeholder="🔎 Rechercher un skin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: '#2a2e3d',
            color: '#fff',
            width: '100%',
            marginBottom: '1rem',
            outline: 'none',
            transition: 'border 0.2s ease'
          }}
          onFocus={(e) => e.target.style.border = '1px solid #4CAF50'}
          onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.2)'}
        />



        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">Tous les types</option>
          <option value="stattrak">StatTrak™</option>
          <option value="regular">Non StatTrak</option>
          <option value="souvenir">Souvenir</option>
        </Select>
        <Select value={wearFilter} onChange={e => setWearFilter(e.target.value)}>
          <option value="all">Toutes les usures</option>
          <option value="Factory New">Factory New</option>
          <option value="Minimal Wear">Minimal Wear</option>
          <option value="Field-Tested">Field-Tested</option>
          <option value="Well-Worn">Well-Worn</option>
          <option value="Battle-Scarred">Battle-Scarred</option>
        </Select>
        <Select value={raritySearch} onChange={e => setRaritySearch(e.target.value)}>
          <option value="all">Toutes les raretés</option>
          <option value="Consumer">Consumer Grade</option>
          <option value="Industrial">Industrial Grade</option>
          <option value="Mil-spec">Mil-Spec</option>
          <option value="Restricted">Restricted</option>
          <option value="Classified">Classified</option>
          <option value="Covert">Covert</option>
        </Select>
        <Select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)}>
          <option value="all">Toutes les collections</option>
          {collections.map((col, i) => <option key={i} value={col}>{col}</option>)}
        </Select>
        <button onClick={handleResetFilters}>🔄 Réinitialiser les filtres</button>
        <button onClick={() => setShowAdvanced(prev => !prev)}>
          🧠 Filtrage avancé {showAdvanced ? '▲' : '▼'}
        </button>
        {showAdvanced && (
          <AdvancedFilterPanel
            allSkins={allSkins}
            filters={advancedFilters}
            setFilters={setAdvancedFilters}
            onApply={() => setShowAdvanced(false)}
            onReset={() => {
              setAdvancedFilters({
                wear: [],
                rarity: [],
                type: [],
                collection: [],
                weapon: [],
                priceMin: '',
                priceMax: ''
              });
            }}
          />
        )}

      </FilterBar>

      {/* 📦 Liste des skins regroupés */}
      <List>
        {groupedSkins.length === 0 ? (
          <p>Aucun skin trouvé.</p>
        ) : (
          groupedSkins.map((group, i) => {
            const wearOrder = {
              "Factory New": 0,
              "Minimal Wear": 1,
              "Field-Tested": 2,
              "Well-Worn": 3,
              "Battle-Scarred": 4,
              "None": 5
            };

            const colorMap = {
              "Factory New": "#4CAF50",
              "Minimal Wear": "#8BC34A",
              "Field-Tested": "#FFC107",
              "Well-Worn": "#FF9800",
              "Battle-Scarred": "#F44336",
              "None": "#ccc"
            };

            const mainSkin = group[0];
            const normalizeRarity = normalizedRarity(mainSkin.rarity);
            const getWearValue = (wear) => wearOrder[wear?.trim()] ?? 99;

            const sortedVariants = [...group].sort(
              (a, b) => getWearValue(a.wear) - getWearValue(b.wear)
            );

            // 🔍 Filtrage uniquement par nom
            const filteredVariants = sortedVariants.filter(variant =>
              variant.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <Card key={mainSkin.id} $rarity={mainSkin.rarity}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    width: '100%',
                  }}
                >
                  {/* 📸 Image à gauche */}
                  <ImageWrapper>
                    <SkinImage
                      src={mainSkin.imageUrl}
                      alt={mainSkin.name}
                      $isStatTrak={mainSkin.isStatTrak}
                      $isSouvenir={mainSkin.isSouvenir}
                    />
                  </ImageWrapper>

                  {/* 📋 Infos à droite */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <SkinTitle $rarity={mainSkin.rarity}>
                      {mainSkin.isStatTrak && (
                        <span style={{ color: '#FFA500', marginRight: '0.5rem' }}>StatTrak™</span>
                      )}
                      {mainSkin.isSouvenir && (
                        <span style={{ color: '#d6e412', marginRight: '0.5rem' }}>Souvenir</span>
                      )}
                      {mainSkin.name}
                    </SkinTitle>

                    <p>
                      <Label>Collection:</Label> <Value>{mainSkin.collection}</Value>
                    </p>
                    <p>
                      <Label>Rareté:</Label> <Value>{mainSkin.rarity}</Value>
                    </p>

                    {/* 🧩 Liste verticale des variantes */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        backgroundColor: '#1c1f2b',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        width: '100%',
                      }}
                    >
                      {filteredVariants.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>
                          Aucune variante ne correspond à la recherche.
                        </p>
                      ) : (
                        filteredVariants.map((variant, index) => {
                          const key = `${variant.name} (${variant.wear})`;
                          const price = priceMap[key] || variant.price || 'N/A';
                          const volume = variant.volume !== undefined ? `${variant.volume} offres` : '—';

                          return (
                            <div
                              key={`${variant.name}-${variant.wear}-${index}`}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto 1fr',
                                alignItems: 'center',
                                fontSize: '1.1rem',
                                padding: '0.25rem 0.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: colorMap[variant.wear?.trim()] ?? '#ccc',
                                transition: 'background 0.2s ease',
                                cursor: 'default',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              {/* 🧼 Usure à gauche */}
                              <span style={{ textAlign: 'left' }}>
                                <strong>{variant.wear ?? 'Sans usure'}</strong>
                              </span>

                              {/* 📊 Volume centré */}
                              <span style={{ textAlign: 'center', color: '#aaa', fontSize: '0.95rem' }}>
                                {variant.volume !== undefined ? `${variant.volume} offres` : '—'}
                              </span>

                              {/* 💰 Prix à droite */}
                              <span style={{ textAlign: 'right' }}>
                                {priceMap[`${variant.name} (${variant.wear})`] || variant.price || 'N/A'} €
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </List>
    </div>
  );
}

export default AllSkins;
