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

        {/* 🌗 Toggle mode */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setDarkMode(prev => !prev)}
            style={{
              marginBottom: '1rem',
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
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
