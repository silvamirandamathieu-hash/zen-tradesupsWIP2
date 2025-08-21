// src/components/TradeUpTab.jsx

import React, { useState, useEffect } from 'react';
import { getTradeups, addTradeup, db } from '../db';
import { calculateProfit } from './TradeUpAnalytics.jsx'; // ✅ Import par défaut

function TradeUpTab({ inventory, allSkins }) {
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [tradeups, setTradeups] = useState([]);
  const [activeView, setActiveView] = useState('current');

  useEffect(() => {
    getTradeups(false).then(setTradeups);
  }, []);

  const handleSaveTradeup = async () => {
    const newTradeup = {
      name: `TradeUp ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      inputs,
      outputs,
      isArchived: false
    };
    await addTradeup(newTradeup);
    setTradeups(prev => [...prev, newTradeup]);
    setInputs([]);
    setOutputs([]);
  };

  const profitData = calculateProfit({ inputs, outputs });

  const renderTradeupList = (filterArchived = false) => {
    const filtered = tradeups.filter(t => t.isArchived === filterArchived);
    if (filtered.length === 0) return <p>Aucun trade-up enregistré.</p>;

    return (
      <ul>
        {filtered.map((t, i) => {
          const stats = calculateProfit(t);
          return (
            <li key={i}>
              <strong>{t.name}</strong> — {stats.profit.toFixed(2)} € ({stats.profitPercent.toFixed(1)}%)
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔁 Trade-Up</h2>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Inputs:</strong>
        {inputs.length > 0 ? (
          <ul>{inputs.map((skin, i) => (
            <li key={i}>{skin.name} ({skin.wear}) — {skin.price_now} €</li>
          ))}</ul>
        ) : <p>Aucun skin sélectionné.</p>}

        <strong>Outputs:</strong>
        {outputs.length > 0 ? (
          <ul>{outputs.map((skin, i) => (
            <li key={i}>{skin.name} ({skin.wear}) — {skin.price_now} €</li>
          ))}</ul>
        ) : <p>Aucun skin en sortie.</p>}

        <p>💰 Profit estimé : {profitData.profit.toFixed(2)} € ({profitData.profitPercent.toFixed(1)}%)</p>
        <button onClick={handleSaveTradeup}>💾 Sauvegarder Trade-Up</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setActiveView('current')}>🧪 Trade-Up en cours</button>
        <button onClick={() => setActiveView('archived')}>📚 Trade-Ups archivés</button>

        {activeView === 'current' && renderTradeupList(false)}
        {activeView === 'archived' && renderTradeupList(true)}
      </div>
    </div>
  );
}

export default TradeUpTab;
