import React, { useState, useEffect, useMemo } from 'react';
import './TradeUp.css';
import { v4 as uuid } from 'uuid';
import {
  getAllInventory,
  getInventory,
  addSavedTradeUp,
  deleteCurrentTradeUp,
  saveCurrentTradeUp,
  getSavedTradeUps,
  addCurrentTradeUp
} from '../db';
import { useAdvancedFilters } from './useAdvancedFilters';
import { filterSkins } from './filterSkins';
import AdvancedFilterPanel from './AdvancedFilterPanel';
import { calculateTradeStats } from '../utils/tradeupCalc';



function TradeUp() {
  const [inputs, setInputs] = useState(Array(10).fill(null));
  const [outputs, setOutputs] = useState(Array(5).fill(null));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [panelType, setPanelType] = useState(null);
  const [activeTab, setActiveTab] = useState('myInventory');
  const [inventory, setInventory] = useState([]);
  const [allSkins, setAllSkins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilters, resetFilters } = useAdvancedFilters();
  const [collectionSearch, setCollectionSearch] = useState('');
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const stats = useMemo(() => calculateTradeStats(inputs, outputs), [inputs, outputs]);
  const [currentTradeUp, setCurrentTradeUp] = useState(null);



useEffect(() => {
  const fetchInventories = async () => {
    const userInventory = await getInventory(); // Ton inventaire perso
    const allSkinsData = await getAllInventory(); // Toutes les skins
    setInventory(userInventory);
    setAllSkins(allSkinsData);
  };
  fetchInventories();
}, []);
useEffect(() => {
  const totalChance = outputs.reduce((sum, o) => sum + (o?.chance || 0), 0);
  if (totalChance !== 100) {
    setWarning("⚠️ Vérifiez les chances : elles ne font pas 100%");
  } else {
    setWarning(null);
  }
}, [outputs]);

const [warning, setWarning] = useState(null);




  const filteredSkins = useMemo(() => {
    const source = activeTab === 'myInventory' ? inventory : allSkins;
    const filtered = filterSkins(source, filters);
    return filtered.filter(skin =>
      searchTerm === '' || skin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, allSkins, activeTab, filters, searchTerm]);

  const handleSaveTradeUp = async () => {
    const resultSkin = outputs.find(o => o?.chance === Math.max(...outputs.map(o => o?.chance ?? 0)));

    if (!resultSkin || inputs.every(i => i === null)) {
      alert('⛔ Trade-up incomplet');
      return;
    }

    const stats = calculateTradeStats(inputs, outputs);

    const tradeUpToSave = {
      id: uuid(),
      name: `TradeUp ${resultSkin.name}`,
      collection: resultSkin.collection,
      inputs,
      outputs,
      resultSkin,
      isStatTrak: inputs.some(s => s?.isStatTrak),
      totalInputPrice: stats.totalInputPrice,
      totalOutputPrice: stats.totalOutputPrice,
      profitability: stats.rentability,
      avgFloat: stats.avgFloat,
      chance: stats.chance,
      date: new Date().toISOString()
    };

    await addSavedTradeUp(tradeUpToSave);
    alert('📥 Trade-up sauvegardé !');
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
    setSelectedSlot(null);
    setPanelType(null);
  };

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
  const duplicateSkinToNextInput = (index) => {
    const skin = inputs[index];
    if (!skin) return;

    const updated = [...inputs];
    const nextIndex = inputs.findIndex((s, i) => i > index && s === null);
    if (nextIndex !== -1) {
      updated[nextIndex] = skin;
      setInputs(updated);
    }
  };

  const removeSkin = (index) => {
    const updated = [...inputs];
    updated[index] = null;
    setInputs(updated);
  };
  const updateFloat = (index, value) => {
    const updated = [...inputs];
    if (updated[index]) updated[index].float = value;
    setInputs(updated);
  };

  const updatePrice = (index, value) => {
    const updated = [...inputs];
    if (updated[index]) updated[index].price = value;
    setInputs(updated);
  };

  const updateChance = (index, value) => {
    const updated = [...outputs];
    if (updated[index]) updated[index].chance = value;
    setOutputs(updated);
  };

  const updateOutputPrice = (index, value) => {
    const updated = [...outputs];
    if (updated[index]) updated[index].price = value;
    setOutputs(updated);
  };

  const fillAllWithSkin = (skin) => {
    if (!skin) return;

    const updated = inputs.map((s) => (s === null ? skin : s));
    setInputs(updated);
  };
  const handleSetAsCurrent = async () => {
    const resultSkin = outputs.find(o => o?.chance === Math.max(...outputs.map(o => o?.chance ?? 0)));
    if (!resultSkin || inputs.every(i => i === null)) {
      alert('⛔ Trade-up incomplet');
      return;
    }

  const tradeUp = {
    name: `TradeUp ${resultSkin.name}`,
    collection: resultSkin.collection,
    inputs,
    outputs,
    resultSkin,
    isStatTrak: inputs.some(s => s?.isStatTrak),
    date: new Date().toISOString(),
    urls: []
  };

  await addCurrentTradeUp(tradeUp);
  alert('⚙️ Trade-up ajouté aux en cours');
};


  const rarityColors = {
    Consumer: '#9e9e9e',
    Industrial: '#448095ff',
    'Mil-spec': '#1d29aeff',
    Restricted: '#8b4098ff',
    Classified: '#e52bd6ff',
    Covert: '#F44336',
  };
  const allCollections = useMemo(() => {
    const source = activeTab === 'myInventory' ? inventory : allSkins;
    return [...new Set(source
      .map(s => s.collection)
      .filter(c => c && c !== 'Limited Edition Item Collection'))].sort();
  }, [inventory, allSkins, activeTab]);
  
  const filteredCollections = allCollections.filter(c =>
    c.toLowerCase().includes(collectionSearch.toLowerCase())
  );
  const resetSlots = () => {
    setInputs(Array(10).fill(null));
    setOutputs(Array(5).fill(null));
  };
  const removeThisOutput = (index) => {
    const updated = [...outputs];
    updated[index] = null;
    setOutputs(updated);
  };



  const colorMap = {
    'Factory New': '#4CAF50',
    'Minimal Wear': '#8BC34A',
    'Field-Tested': '#FFC107',
    'Well-Worn': '#FF9800',
    'Battle-Scarred': '#F44336'
  };

  return (
    <div className="tradeup-container">
      {/* SECTION INPUTS */}
      <section className="tradeup-inputs">
        <h2>🎒 Skins utilisés</h2>
        <button className="output-btn reset" onClick={resetSlots}>
          🗑️
        </button>
        <div className="inputs-grid">
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
                    {skin.collection && skin.collection !== 'Limited Edition Item Collection' && (
                      <p className="skin-collection">{skin.collection}</p>
                    )}
                    

                    <p className="skin-price">
                      💰 {typeof skin.price === 'number' ? skin.price.toFixed(2).replace('.', ',') : '—'} €
                    </p>
                  </div>

                  {/* ✅ Boutons d'action */}
                  <div className="input-actions">
                    <div className="action-button">
                      <button onClick={(e) => { e.stopPropagation(); duplicateSkinToNextInput(i); }}>➕</button>
                    </div>
                    <div className="action-button">
                      <button onClick={(e) => { e.stopPropagation(); fillAllWithSkin(skin); }}>📥</button>
                    </div>
                    <div className="action-button">
                      <button onClick={(e) => { e.stopPropagation(); removeSkin(i); }}>❌</button>
                    </div>
                  </div>
                  <div className="skin-fields">
                    <input
                            type="number"
                            value={skin.float || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateFloat(i, parseFloat(e.target.value))}
                            step="0.0001"
                            placeholder="Float"
                          />
                          <input
                            type="number"
                            value={skin.price || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updatePrice(i, parseFloat(e.target.value))}
                            step="0.01"
                            placeholder="Prix"
                          />
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
          <div className="analysis-card"><span className="label">Avg Float</span><span className="value">{stats.avgFloat}</span></div>
          <div className="analysis-card"><span className="label">Prix du trade-up</span><span className="value">€{stats.totalInputPrice}</span></div>
          <div className="analysis-card"><span className="label">Rentabilité</span><span className="value">{stats.rentability}%</span></div>
          <div className="analysis-card"><span className="label">Profit par trade</span><span className="value">€{stats.profit}</span></div>
          <div className="analysis-card"><span className="label">Chance de profit</span><span className="value">{stats.chance}%</span></div>
        </div>
      </section>

      {/* SECTION OUTPUTS */}
      <section className="tradeup-results">
        <h2>🎯 Résultats possibles</h2>
        <div className="output-section">
          <div className="output-actions-side">
            <button className="output-btn add" onClick={addOutput} style={{ visibility: outputs.length < 10 ? 'visible' : 'hidden' }}>➕</button>
            <button className="output-btn remove" onClick={removeOutput} style={{ visibility: outputs.length > 1 ? 'visible' : 'hidden' }}>➖</button>
          </div>
          <div className="result-grid">
            {outputs.map((skin, i) => (
              <div
                key={i}
                className={`skin-card ${skin ? '' : 'empty'}`}
                onClick={() => {
                  setSelectedSlot(i);
                  setPanelType('output');
                }}
              >
                {skin ? (
                  <>
                    <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />
                    <div className="action2-button">
                      <button onClick={(e) => { e.stopPropagation(); removeThisOutput(i); }}>❌</button>
                    </div>
                    <div className="skin-info">
                      <p className={`skin-name rarity-${skin.rarity?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {skin.isStatTrak && <span className="stattrak-tag">StatTrak™ </span>}
                        {skin.isSouvenir && <span className="souvenir-tag">Souvenir </span>}
                        {skin.name}
                      </p>
                      <p className="skin-wear" style={{ color: colorMap[skin.wear] }}>{skin.wear}</p>
                      {skin.collection && skin.collection !== 'Limited Edition Item Collection' && (
                        <p className="skin-collection">{skin.collection}</p>
                      )}
                      
                      

                      <p className="skin-price">
                        💰 {typeof skin.price === 'number' ? skin.price.toFixed(2).replace('.', ',') : '—'} €
                      </p>
                    </div>
                    <div className="skin-fields">
                    <input
                        type="number"
                        value={skin.chance || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateChance(i, parseFloat(e.target.value))}
                        step="0.1"
                        placeholder="% chance"
                      />
                      <input
                        type="number"
                        value={skin.price || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateOutputPrice(i, parseFloat(e.target.value))}
                        step="0.01"
                        placeholder="Prix"
                      />
                    </div>
                    
                  </>
                ) : (
                  <p>Output {i + 1}</p>
                )}

              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSaveTradeUp}>💾 Sauvegarder</button>
        <button className="action-btn" onClick={handleSetAsCurrent}>
          ⚙️ Définir comme en cours
        </button>
        
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
            <div className="tab-content">
              <input
                type="text"
                placeholder="🔍 Rechercher un skin..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="filter-row">
                {['Consumer', 'Industrial', 'Mil-spec', 'Restricted', 'Classified', 'Covert'].map(rarity => (
                  <button
                    key={rarity}
                    className={filters.rarity === rarity ? 'active' : ''}
                    style={{ backgroundColor: rarityColors[rarity], color: 'white' }}
                    onClick={() => setFilters(prev => ({ ...prev, rarity }))}
                  >
                    {rarity}
                  </button>
                ))}
              </div>

              <div className="collection-search-wrapper">
                <div className="collection-search-bar">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher une collection..."
                    value={collectionSearch}
                    onChange={e => setCollectionSearch(e.target.value)}
                    onFocus={() => setShowCollectionDropdown(true)}
                    className="search-input"
                  />
                  <button onClick={() => setShowCollectionDropdown(prev => !prev)} className="dropdown-toggle">
                    ⏷
                  </button>
                </div>
                <div className="filter-row">
                  <button
                    style={{
                      backgroundColor: filters.isStatTrak === true ? '#2196F3' :
                                      filters.isStatTrak === false ? '#f44336' : '#9e9e9e',
                      color: 'white'
                    }}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        isStatTrak:
                          prev.isStatTrak === null ? true :
                          prev.isStatTrak === true ? false :
                          null
                      }));
                    }}
                  >
                    {filters.isStatTrak === true
                      ? 'StatTrak™ ON'
                      : filters.isStatTrak === false
                      ? 'StatTrak™ OFF'
                      : 'StatTrak™ TOUS'}
                  </button>
                </div>


                {showCollectionDropdown && (
                  <div className="collection-dropdown-list">
                    {filteredCollections.map((collection, i) => (
                      
                      <div
                        key={i}
                        className="collection-item"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, collection }));
                          setCollectionSearch(collection);
                          setShowCollectionDropdown(false);
                        }}
                      >
                        {collection}
                      </div>
                    ))}
                  </div>
                  
                )}
              </div>
              <div className="filter-row">
                {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map(wear => (
                  <button
                    key={wear}
                    className={filters.wear === wear ? 'active' : ''}
                    style={{ backgroundColor: colorMap[wear], color: 'white' }}
                    onClick={() => setFilters(prev => ({ ...prev, wear }))}
                  >
                    {wear}
                  </button>
                ))}
              </div>

              <button className="reset-filters-btn" onClick={resetFilters}>
                🔄 Réinitialiser tous les filtres
              </button>



              <button
                className="toggle-filters-btn"
                onClick={() => setShowFilters(prev => !prev)}
              >
                {showFilters ? 'Masquer les filtres' : '🎛️ Afficher les filtres'}
              </button>
              {showFilters && (
                  <AdvancedFilterPanel
                    allSkins={activeTab === 'myInventory' ? inventory : allSkins}
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => {}}
                    onReset={resetFilters}
                  />
                )}


              <div className="skin-results">
                {filteredSkins.length === 0 ? (
                  <p>Aucun skin trouvé.</p>
                ) : (
                  filteredSkins.map((skin, index) => {
                    const statTrakQty = skin.statTrakItems?.length || 0;
                    const regularQty = skin.regularItems?.length || 0;
                    const totalQty = statTrakQty + regularQty;

                    return (
                      <div key={index} className="skin-card">
                        <img src={skin.imageUrl} alt={skin.name} className="skin-thumb" />
                        
                        <div className="skin-info">
                          <p className={`skin-name rarity-${skin.rarity?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {skin.isStatTrak && <span className="stattrak-tag">StatTrak™ </span>}
                            {skin.isSouvenir && <span className="souvenir-tag">Souvenir </span>}
                            {skin.name}
                          </p>

                          {/* ✅ Badge de quantité affiché uniquement si onglet "Mon inventaire" */}
                          {activeTab === 'myInventory' && totalQty > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '180px',
                                right: '8px',
                                backgroundColor: '#2d3748',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                              }}
                            >
                              x{totalQty}
                            </div>
                          )}

                          <p className="skin-wear" style={{ color: colorMap[skin.wear] }}>{skin.wear}</p>

                          {skin.collection && skin.collection !== 'Limited Edition Item Collection' && (
                            <p className="skin-collection">{skin.collection}</p>
                          )}

                          <p className="skin-price">
                            💰 {typeof skin.price === 'number' ? skin.price.toFixed(2).replace('.', ',') : '—'} €
                          </p>

                          <div className="skin-footer">
                            <button onClick={() => handleSelectSkin(skin)}>Ajouter au slot</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeUp;
