//AdvancedFilterPanel.jsx

import React, { useState } from 'react';
import styled from 'styled-components';




const Panel = styled.div`
  background: #1a1d29;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0,0,0,0.3);
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin-bottom: 0.5rem;
  color: #fff;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PriceRange = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export default function AdvancedFilterPanel({
  allSkins,
  filters,
  setFilters,
  onApply,
  onReset
}) {
  const [showCollections, setShowCollections] = useState(false);
  const uniqueCollections = [...new Set(allSkins.map(s => s.collection).filter(Boolean))].sort();
  const uniqueWeapons = [...new Set(allSkins.map(s => s.name.split(' | ')[0]))];

  const toggle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <Panel>
      <Section>
        <Title>🧩 Usures</Title>
        <CheckboxGroup>
          {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map(w =>
            <label key={w}>
              <input
                type="checkbox"
                checked={filters.wear.includes(w)}
                onChange={() => toggle('wear', w)}
              /> {w}
            </label>
          )}
        </CheckboxGroup>
      </Section>

      <Section>
        <Title>🎨 Raretés</Title>
        <CheckboxGroup>
          {['Consumer', 'Industrial', 'Mil-spec', 'Restricted', 'Classified', 'Covert'].map(r =>
            <label key={r}>
              <input
                type="checkbox"
                checked={filters.rarity.includes(r)}
                onChange={() => toggle('rarity', r)}
              /> {r}
            </label>
          )}
        </CheckboxGroup>
      </Section>

      <Section>
        <Title>🔧 Type</Title>
        <CheckboxGroup>
          {['StatTrak', 'Souvenir', 'Regular'].map(t =>
            <label key={t}>
              <input
                type="checkbox"
                checked={filters.type.includes(t)}
                onChange={() => toggle('type', t)}
              /> {t}
            </label>
          )}
        </CheckboxGroup>
      </Section>

      <Section>
        <Title
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setShowCollections(prev => !prev)}
        >
          📦 Collections {showCollections ? '▲' : '▼'}
        </Title>

        {showCollections && (
          <CheckboxGroup
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              paddingLeft: '1rem',
              marginTop: '0.5rem'
            }}
          >
            {uniqueCollections.map(c => (
              <label key={c} style={{ display: 'block', marginBottom: '4px' }}>
                <input
                  type="checkbox"
                  checked={filters.collection.includes(c)}
                  onChange={() => toggle('collection', c)}
                />{' '}
                {c}
              </label>
            ))}
          </CheckboxGroup>
        )}
      </Section>


      <Section>
        <Title>🔫 Armes</Title>
        <CheckboxGroup>
          {uniqueWeapons.map(w =>
            <label key={w}>
              <input
                type="checkbox"
                checked={filters.weapon.includes(w)}
                onChange={() => toggle('weapon', w)}
              /> {w}
            </label>
          )}
        </CheckboxGroup>
      </Section>

      <Section>
        <Title>💰 Prix</Title>
        <PriceRange>
          <label>Min: <input type="number" value={filters.priceMin} onChange={e => setFilters(prev => ({ ...prev, priceMin: e.target.value }))} /></label>
          <label>Max: <input type="number" value={filters.priceMax} onChange={e => setFilters(prev => ({ ...prev, priceMax: e.target.value }))} /></label>
        </PriceRange>
      </Section>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onReset}>♻️ Réinitialiser</button>
      </div>
    </Panel>
  );
}
