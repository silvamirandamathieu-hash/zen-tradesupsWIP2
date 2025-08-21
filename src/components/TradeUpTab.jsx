import React, { useState, useEffect, useMemo } from 'react';
import './TradeUp.css';
import { getAllInventory } from '../db';


function TradeUp({ }) {
  const [outputs, setOutputs] = useState(Array(5).fill(null));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [panelType, setPanelType] = useState(null); // 'input' ou 'output'
  const [activeTab, setActiveTab] = useState('myInventory'); // 'search' ou 'stats'
  const [inventory, setInventory] = useState([]);
  const [allSkins, setAllSkins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [wearFilter, setWearFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState({
    wear: [],
    rarity: [],
    type: [],
    collection: [],
    weapon: [],
    priceMin: '',
    priceMax: ''
  });
  useEffect(() => {
    const fetchInventory = async () => {
      const data = await getAllInventory();
      setInventory(data);
      setAllSkins(data); // si tu veux les mêmes pour les deux onglets
    };
    fetchInventory();
  }, []);
  const filteredSkins = useMemo(() => {
    const source = activeTab === 'myInventory' ? inventory : allSkins;

    return source.filter(skin => {
      const matchesSearch = searchTerm === '' || skin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWear = wearFilter === 'all' || skin.wear === wearFilter;
      const matchesCollection = collectionFilter === 'all' || skin.collection === collectionFilter;

      return matchesSearch && matchesWear && matchesCollection;
    });
  }, [inventory, allSkins, activeTab, searchTerm, wearFilter, collectionFilter]);

  const addOutput = () => {
    if (outputs.length < 10) {
      setOutputs(prev => [...prev, null]);
    }
  };

  const removeOutput = () => {
    if (outputs.length > 1) {
      setOutputs(prev => prev.slice(0, -1));
    }
  };

  const closePanel = () => {
    setSelectedSlot(null);
    setPanelType(null);
  };
  const handleSelectSkin = (skin) => {
    if (panelType === 'input') {
      const newInputs = [...inputs];
      newInputs[selectedSlot] = skin;
      setInputs(newInputs);
    } else {
      const newOutputs = [...outputs];
      newOutputs[selectedSlot] = skin;
      setOutputs(newOutputs);
    }
    closePanel();
  };
  const [inputs, setInputs] = useState(Array(10).fill(null));
  const colorMap = {
    'Factory New': '#4CAF50',
    'Minimal Wear': '#8BC34A',
    'Field-Tested': '#FFC107',
    'Well-Worn': '#FF9800',
    'Battle-Scarred': '#F44336'
  };
  const formatRarity = (rarity) => rarity?.toLowerCase().replace(/\s+/g, '-');

  const availableCollections = useMemo(() => {
    const source = activeTab === 'myInventory' ? inventory : allSkins;
    const collections = source.map(skin => skin.collection).filter(Boolean);
    const unique = [...new Set(collections)];
    return unique.sort();
  }, [inventory, allSkins, activeTab]);





  return (
    <div className="tradeup-container">
      {/* SECTION INPUTS */}
      <section className="tradeup-inputs">
        <h2>🎒 Skins utilisés</h2>
        <div className="skin-grid">
          {inputs.map((skin, i) => (
            <div
              key={i}
              className={`skin-card ${skin ? '' : 'empty'}`}
              onClick={() => {
                setSelectedSlot(i);
                setPanelType('input');
              }}
            >
              {skin ? (
                <>
                  <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />
                  <div className="skin-info">
                    <p className={`skin-name rarity-${skin.rarity?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {skin.isStatTrak && <span className="stattrak-tag">StatTrak™ </span>}
                      {skin.isSouvenir && <span className="souvenir-tag">Souvenir </span>}
                      {skin.name}
                    </p>
                    <p className="skin-wear" style={{ color: colorMap[skin.wear] }}>{skin.wear}</p>
                  </div>
                </>
              ) : (
                <p>Input {i + 1}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION ANALYSE */}
      <section className="tradeup-analysis">
        <h2>📊 Analyse du trade-up</h2>
        <div className="analysis-grid">
          <div className="analysis-card">
            <span className="label">Avg Float</span>
            <span className="value">0.12</span>
          </div>
          <div className="analysis-card">
            <span className="label">Prix du trade-up</span>
            <span className="value">€24.50</span>
          </div>
          <div className="analysis-card">
            <span className="label">Rentabilité</span>
            <span className="value">87%</span>
          </div>
          <div className="analysis-card">
            <span className="label">Profit par trade</span>
            <span className="value">€3.20</span>
          </div>
          <div className="analysis-card">
            <span className="label">Chance de profit</span>
            <span className="value">60%</span>
          </div>
        </div>
      </section>

      {/* SECTION OUTPUTS */}
      <section className="tradeup-results">
        <h2>🎯 Résultats possibles</h2>
        <div className="output-section">
          <div className="output-actions-side">
            <button
              className="output-btn add"
              onClick={addOutput}
              style={{ visibility: outputs.length < 10 ? 'visible' : 'hidden' }}
            >
              ➕
            </button>
            <button
              className="output-btn remove"
              onClick={removeOutput}
              style={{ visibility: outputs.length > 1 ? 'visible' : 'hidden' }}
            >
              ➖
            </button>
          </div>

          <div className="result-grid">
            {outputs.map((skin, i) => (
              <div
                key={i}
                className={`result-card ${skin ? '' : 'empty'}`}
                onClick={() => {
                  setSelectedSlot(i);
                  setPanelType('output');
                }}
              >
                {skin ? (
                  <>
                    <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />
                    <div>
                      <p className={`skin-name rarity-${skin.rarity?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {skin.isStatTrak && <span className="stattrak-tag">StatTrak™ </span>}
                        {skin.isSouvenir && <span className="souvenir-tag">Souvenir </span>}
                        {skin.name}
                      </p>
                      <p className="skin-wear" style={{ color: colorMap[skin.wear] }}>{skin.wear}</p>
                    </div>
                  </>
                ) : (
                  <p>Output {i + 1}</p>
                )}
              </div>
            ))}
          </div> 
        </div>
      </section>

      {/* PANEL LATÉRAL */}
      {selectedSlot !== null && (
        <div className="side-panel">
          <div className="panel-header">
            <h3>
              {panelType === 'input' ? '🎒 Slot Input' : '🎯 Slot Output'} {selectedSlot + 1}
            </h3>
            <button onClick={closePanel}>✖</button>
          </div>
          <div className="panel-content">
            {/* Onglets */}
            <div className="panel-tabs">
              <button
                className={`tab-btn ${activeTab === 'myInventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('myInventory')}
              >
                🔮 Mon inventaire
              </button>
              <button
                className={`tab-btn ${activeTab === 'allSkins' ? 'active' : ''}`}
                onClick={() => setActiveTab('allSkins')}
              >
                📊 All Skins
              </button>
            </div>

            {/* Contenu de l’onglet actif */}
            {activeTab === 'allSkins' && (
              <div className="tab-content">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un skin..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />

                <select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)} className="collection-select">
                  <option value="all">Toutes les collections</option>
                  {availableCollections.map((collection, index) => (
                    <option key={index} value={collection}>{collection}</option>
                  ))}
                </select>


                <div className="wear-buttons">
                  {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map(wear => (
                    <button
                      key={wear}
                      className={`wear-btn ${wearFilter === wear ? 'active' : ''}`}
                      onClick={() => setWearFilter(wear)}
                    >
                      {wear}
                    </button>
                  ))}
                  <button className="wear-btn reset" onClick={() => setWearFilter('all')}>Réinitialiser</button>
                </div>


                <div className="skin-results">
                  {filteredSkins.length === 0 ? (
                    <p>Aucun skin trouvé.</p>
                  ) : (
                    filteredSkins.map((skin, index) => (
                      <div key={index} className="skin-card">
                        <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />
                        <div className="skin-info">
                          <p className={`skin-name rarity-${skin.rarity?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {skin.isStatTrak && <span className="stattrak-tag">StatTrak™ </span>}
                            {skin.isSouvenir && <span className="souvenir-tag">Souvenir </span>}
                            {skin.name}
                          </p>
                          <p className="skin-wear" style={{ color: colorMap[skin.wear] }}>{skin.wear}</p>
                          {skin.collection !== 'Limited Edition Item Collection' && (
                            <p className="skin-collection">{skin.collection}</p>
                          )}
                          <p className="skin-price">💰 {skin.price} €</p>
                          <button onClick={() => handleSelectSkin(skin)}>Ajouter au slot</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'myInventory' && (
              <div className="tab-content">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un skin..."
                  className="search-input"
                />

                <select className="collection-select">
                  <option value="">Toutes les collections</option>
                  <option value="Prisma">Prisma</option>
                  <option value="Gamma">Gamma</option>
                  <option value="Revolver">Revolver</option>
                </select>

                <div className="wear-buttons">
                  <button className="wear-btn fn">Factory New</button>
                  <button className="wear-btn mw">Minimal Wear</button>
                  <button className="wear-btn ft">Field-Tested</button>
                  <button className="wear-btn ww">Well-Worn</button>
                  <button className="wear-btn bs">Battle-Scarred</button>
                </div>

                <div className="skin-results">
                  <p>Résultats filtrés ici...</p>
                </div>
              </div>
            )}
          </div>


        </div>
      )}
    </div>
  );
};

export default TradeUp;
