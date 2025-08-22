// InventoryTabs.js

import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import InventoryManager from './InventoryManager';
import '../styles/InventoryTabs.css';
import AllSkins from './AllSkins';
import TradeUp from './TradeUpTab'; 
import TradeUpCurrent from './TradeUpCurrent';
import TradeUpSaved from './TradeUpSaved';


function InventoryTabs({
  inventory,
  setInventory,
  allInventory,
  setAllInventory,
  priceMap,
  onExport,
  onImport,
  onReset,
  onAllReset,
  onAllImport
}) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [currentTradeUps, setCurrentTradeUps] = useState([]);
  const [addSavedTradeUp, setSavedTradeUps] = useState([]);

  const tabs = [
    { key: 'inventory', label: '🎒 Mon inventaire' },
    { key: 'allskins', label: '🗂️ All skins' },
    { key: 'TradeUp', label: '💹Trade-Ups'},
    { key: 'tradeupcurrent', label: '⚙️ Trade-up en cours' },
    { key: 'tradeupsaved', label: '💾 Trade-ups sauvegardés' }
  ];

  const nodeRef = useRef(null);
  const handleRefreshPrices = () => {
    // Exemple : re-fetch des prix depuis AllSkins ou API
    console.log('🔄 Mise à jour des prix demandée');
  };
    const handleDeleteCurrent = async (id) => {
    await deleteCurrentTradeUp(id);
      setCurrentTradeUps(prev => prev.filter(trade => trade.id !== id));
      console.log(`🗑️ Trade-up en cours supprimé : ${id}`);
    };

    const handleDeleteSaved = async (id) => {
      await deleteSavedTradeUp(id);
      setSavedTradeUps(prev => prev.filter(trade => trade.id !== id));
      console.log(`🗑️ Trade-up sauvegardé supprimé : ${id}`);
    };


    const renderTabContent = () => {
      switch (activeTab) {
        case 'inventory':
          return (
            <InventoryManager
              inventory={inventory}
              priceMap={priceMap}
              onExport={onExport}
              onImport={onImport}
              onReset={onReset}
            />
          );

        case 'allskins':
          return (
            <AllSkins
              allSkinsInventory={allInventory}
              setAllInventory={setAllInventory}
              priceMap={priceMap}
              onAllImport={onAllImport}
              onAllReset={onAllReset}
            />
          );

        case 'TradeUp':
          return <TradeUp />;

        case 'tradeupcurrent':
          return (
            <TradeUpCurrent
              priceMap={priceMap}
              onRefreshPrices={handleRefreshPrices}
              onDelete={handleDeleteCurrent}
            />
          );

        case 'tradeupsaved':
          return (
            <TradeUpSaved
              priceMap={priceMap}
              onRefreshPrices={handleRefreshPrices}
              handleDelete={handleDeleteSaved}
            />
          );

        default:
          return <p>🧭 Onglet inconnu : {activeTab}</p>;
      }
    };


  return (
    <div style={{ padding: '2rem' }}>
      {/* Onglets */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.key ? '#3182ce' : '#e2e8f0',
              color: activeTab === tab.key ? '#fff' : '#2d3748',
              fontWeight: 'bold'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu avec transition */}
      <SwitchTransition>
        <CSSTransition
          key={activeTab}
          timeout={300}
          classNames="fade"
          nodeRef={nodeRef}
        >
          <div ref={nodeRef}>
            {renderTabContent()}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

export default InventoryTabs;
