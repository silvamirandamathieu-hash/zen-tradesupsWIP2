import React, { useState, useEffect, useMemo } from 'react';
import './TradeUp.css';
import { getAllInventory, getInventory } from '../db';
import { useAdvancedFilters } from './useAdvancedFilters';
import { filterSkins } from './filterSkins';
import AdvancedFilterPanel from './AdvancedFilterPanel';



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

useEffect(() => {
  const fetchInventories = async () => {
    const userInventory = await getInventory(); // Ton inventaire perso
    const allSkinsData = await getAllInventory(); // Toutes les skins
    setInventory(userInventory);
    setAllSkins(allSkinsData);
  };
  fetchInventories();
}, []);



  const filteredSkins = useMemo(() => {
    const source = activeTab === 'myInventory' ? inventory : allSkins;
    const filtered = filterSkins(source, filters);
    return filtered.filter(skin =>
      searchTerm === '' || skin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, allSkins, activeTab, filters, searchTerm]);

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


  const fillAllWithSkin = (skin) => {
    if (!skin) return;

    const updated = inputs.map((s) => (s === null ? skin : s));
    setInputs(updated);
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
          <div className="analysis-card"><span className="label">Avg Float</span><span className="value">0.12</span></div>
          <div className="analysis-card"><span className="label">Prix du trade-up</span><span className="value">€24.50</span></div>
          <div className="analysis-card"><span className="label">Rentabilité</span><span className="value">87%</span></div>
          <div className="analysis-card"><span className="label">Profit par trade</span><span className="value">€3.20</span></div>
          <div className="analysis-card"><span className="label">Chance de profit</span><span className="value">60%</span></div>
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
                    style={{ backgroundColor: colorMap[wear], color: 'white' }}
                    onClick={() => setFilters(prev => ({ ...prev, wear: wear }))}
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
