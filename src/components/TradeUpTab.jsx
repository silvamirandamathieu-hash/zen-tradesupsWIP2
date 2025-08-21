// src/components/TradeUpTab.jsx

import React, { useState, useEffect } from 'react';
import { getTradeups, addTradeup } from '../db';
import calculateProfit from './TradeUpAnalytics';

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

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔁 Trade-Up</h2>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Inputs:</strong>
        <ul>{inputs.map((skin, i) => <li key={i}>{skin.name} ({skin.wear}) — {skin.price_now} €</li>)}</ul>
        <strong>Outputs:</strong>
        <ul>{outputs.map((skin, i) => <li key={i}>{skin.name} ({skin.wear}) — {skin.price_now} €</li>)}</ul>
        <p>💰 Profit: {profitData.profit.toFixed(2)} € ({profitData.profitPercent.toFixed(1)}%)</p>
        <button onClick={handleSaveTradeup}>💾 Sauvegarder Trade-Up</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setActiveView('current')}>🧪 Trade-Up en cours</button>
        <button onClick={() => setActiveView('archived')}>📚 Tous les Trade-Ups</button>

        {activeView === 'current' && (
          <ul>
            {tradeups.map((t, i) => {
              const stats = calculateProfit(t);
              return (
                <li key={i}>
                  <strong>{t.name}</strong> — {stats.profit.toFixed(2)} € ({stats.profitPercent.toFixed(1)}%)
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TradeUpTab;
