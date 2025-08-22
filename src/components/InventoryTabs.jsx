// InventoryTabs.js

import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import InventoryManager from './InventoryManager';
import '../styles/InventoryTabs.css';
import AllSkins from './AllSkins';
import TradeUp from './TradeUpTab'; 
import TradeUpCurrent from './TradeUpCurrent';
import TradeUpSaved from './TradeUpSaved';
import { saveTradeUp, clearCurrentTradeUp, saveCurrentTradeUp } from '../db';



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


  const renderTabContent = () => {
    if (activeTab === 'inventory') {
      return (
        <InventoryManager
          inventory={inventory}
          priceMap={priceMap}
          onExport={onExport}
          onImport={onImport}
          onReset={onReset}
        />
      );
    } else if (activeTab === 'allskins') {
      return (
        <AllSkins
          allSkinsInventory={allInventory}   // ✅ allInventory dynamique
          setAllInventory={setAllInventory} // ✅ nom correct
          priceMap={priceMap}
          onAllImport={onAllImport}
          onAllReset={onAllReset}
        />
      );
    } else if (activeTab === 'TradeUp') {
        return <TradeUp />;// 👈 Ton composant vide pour l'instant
    } else if (activeTab === 'tradeupcurrent') {
        return <TradeUpCurrent priceMap={priceMap} />;
    } else if (activeTab === 'tradeupsaved') {
        return <TradeUpSaved priceMap={priceMap} onRefreshPrices={handleRefreshPrices} />;
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
