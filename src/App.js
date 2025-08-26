// App.js

import React, { useState, useEffect } from 'react';
import { getInventory, getAllInventory, clearInventory, clearAllInventory, db } from './db';
import InventoryTabs from './components/InventoryTabs';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';

function App() {
  const [inventory, setInventory] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [error, setError] = useState('');
  const [priceMap, setPriceMap] = useState(() => {
    const saved = localStorage.getItem('priceMap');
    return saved ? JSON.parse(saved) : {};
  });
  const [darkMode, setDarkMode] = useState(true);

  // Charger l’inventaire principal
  useEffect(() => {
    async function loadInitialInventory() {
      const existingInventory = await getInventory();
      if (existingInventory.length === 0) {
        setInventory([]); // au lieu de inventory (qui est vide de toute façon)
        await db.inventory.bulkAdd([]);
      } else {
        setInventory(existingInventory);
      }
    }
    loadInitialInventory();
  }, []);

  // Charger AllSkins
  useEffect(() => {
    async function loadInitialAllInventory() {
      const existingAllInventory = await getAllInventory();
      if (existingAllInventory.length === 0) {
        setAllInventory([]);
        await db.allSkins.bulkAdd([]);
      } else {
        setAllInventory(existingAllInventory);
      }
    }
    loadInitialAllInventory();
  }, []);

  // Import Inventaire principal
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
          alert('Le fichier doit contenir un tableau de skins.');
          return;
        }
        if (data.length === 0) {
          alert('Le fichier est vide.');
          return;
        }

        const isValid = data.every(skin =>
          skin.name && skin.wear && skin.imageUrl
        );
        if (!isValid) {
          alert('Certains skins sont mal formatés.');
          return;
        }

        setInventory(data);
        await db.inventory.clear();
        await db.inventory.bulkAdd(data);
        alert('Inventaire importé avec succès !');
      } catch (err) {
        console.error('Erreur d’importation :', err);
        alert('Le fichier est invalide ou corrompu.');
      }
    };

    input.click();
  };

  // Import AllSkins
  const handleAllSkinsImport = () => {
    const inputall = document.createElement('input');
    inputall.type = 'file';
    inputall.accept = 'application/json';

    inputall.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const textall = await file.text();
        const dataall = JSON.parse(textall);

        if (!Array.isArray(dataall)) {
          alert('Le fichier doit contenir un tableau de skins.');
          return;
        }
        if (dataall.length === 0) {
          alert('Le fichier est vide.');
          return;
        }

        const isValid = dataall.every(allSkin =>
          allSkin.name && allSkin.wear && allSkin.imageUrl
        );
        if (!isValid) {
          alert('Certains skins sont mal formatés.');
          return;
        }

        setAllInventory(dataall);
        await db.allSkins.clear();
        await db.allSkins.bulkAdd(dataall);
        await refreshPriceMap(); // ✅ mise à jour des prix
        alert('AllSkins importé avec succès !');
      } catch (err) {
        console.error('Erreur d’importation AllSkins :', err);
        alert('Le fichier est invalide ou corrompu.');
      }
    };

    inputall.click();
  };

  // Export inventaire
  const handleExport = () => {
    const json = JSON.stringify(inventory, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset inventaire
  const handleReset = async () => {
    await clearInventory();
    setInventory([]);
    alert('Inventaire réinitialisé !');
  };

  // Reset AllSkins
  const handleAllReset = async () => {
    await clearAllInventory();
    setAllInventory([]);
    alert('AllSkins réinitialisé !');
  };
  const refreshPriceMap = async () => {
    const allSkins = await getAllInventory();
    const newMap = {};

    for (const skin of allSkins) {
      const prefix = skin.isStatTrak ? '★ ST ' : skin.isSouvenir ? '★ SV ' : '';
      const key = `${prefix}${skin.name} (${skin.wear})`;
      newMap[key] = {
        price: parseFloat(skin.price) || 0,
        volume: parseInt(skin.volume) || 0
      };
    }

    setPriceMap(newMap);
    localStorage.setItem('priceMap', JSON.stringify(newMap));
  };
  const handleFullExport = async () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      inventory: await db.inventory.toArray(),
      allSkins: await db.allSkins.toArray(),
      history: await db.history.toArray(),
      currentTradeUps: await db.currentTradeUps.toArray(),
      savedTradeUps: await db.savedTradeUps.toArray(),
      favoriteTradeUps: await db.favoriteTradeUps.toArray()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs2_full_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const requiredKeys = [
          'inventory',
          'allSkins',
          'history',
          'currentTradeUps',
          'savedTradeUps',
          'favoriteTradeUps'
        ];

        const isValid = requiredKeys.every(key => Array.isArray(data[key]));
        if (!isValid) {
          alert('❌ Fichier incomplet ou invalide.');
          return;
        }

        await db.transaction('rw',
          db.inventory,
          db.allSkins,
          db.history,
          db.currentTradeUps,
          db.savedTradeUps,
          db.favoriteTradeUps,
          async () => {
            await db.inventory.clear();
            await db.allSkins.clear();
            await db.history.clear();
            await db.currentTradeUps.clear();
            await db.savedTradeUps.clear();
            await db.favoriteTradeUps.clear();

            await db.inventory.bulkAdd(data.inventory);
            await db.allSkins.bulkAdd(data.allSkins);
            await db.history.bulkAdd(data.history);
            await db.currentTradeUps.bulkAdd(data.currentTradeUps);
            await db.savedTradeUps.bulkAdd(data.savedTradeUps);
            await db.favoriteTradeUps.bulkAdd(data.favoriteTradeUps);
          }
        );

        alert('✅ Import réussi ! Recharge la page pour voir les changements.');
      } catch (err) {
        console.error('Erreur import :', err);
        alert('❌ Fichier corrompu ou erreur de parsing.');
      }
    };

    input.click();
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <div style={{
        background: darkMode ? darkTheme.colors.bg : lightTheme.colors.bg,
        minHeight: '100vh',
        padding: '2rem',
        transition: 'background 0.3s ease',
        color: darkMode ? darkTheme.colors.text : lightTheme.colors.text
      }}>
        <h1>🎮 Gestionnaire de Skins CS</h1>

        {/* 🌗 Toggle + Actions */}
          <div style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Bouton mode clair/sombre */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: darkMode ? '#334155' : '#e2e8f0',
                color: darkMode ? '#e8ecef' : '#1f2937',
                cursor: 'pointer'
              }}
            >
              {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>

            {/* Boutons Export / Import */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleFullExport}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#48bb78',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                📤 Export DB
              </button>
              <button
                onClick={handleFullImport}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#4299e1',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                📥 Import DB
              </button>
            </div>
          </div>

        

        {/* ❗ Erreur */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* 📦 Inventaire + AllSkins */}
        <InventoryTabs
          inventory={inventory}
          setInventory={setInventory}
          allInventory={allInventory}          // ✅ correction
          setAllInventory={setAllInventory}    // ✅ conserve
          priceMap={priceMap}
          onExport={handleExport}
          onReset={handleReset}
          onImport={handleImport}
          onAllReset={handleAllReset}
          onAllImport={handleAllSkinsImport}
          refreshPriceMap={refreshPriceMap} // ✅ nouveau
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
