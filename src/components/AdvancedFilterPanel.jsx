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
  cursor: pointer;
  user-select: none;
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
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2a2e3d;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ active }) => active ? '0 0 8px 2px rgba(255,255,255,0.4)' : 'none'};
  border: ${({ active }) => active ? '2px solid #fff' : '2px solid transparent'};

  &:hover {
    background-color: #3a3f52;
    transform: scale(1.03);
  }

  input {
    accent-color: #00bcd4;
    cursor: pointer;
  }
`;

export default function AdvancedFilterPanel({
  allSkins,
  filters,
  setFilters,
  onApply,
  onReset
}) {
  const [showCollections, setShowCollections] = useState(false);
  const [showWeapons, setShowWeapons] = useState(false);

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
      {/* Usures */}
      <Section>
        <Title>🧩 Usures</Title>
        <CheckboxGroup>
          {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map(w => {
            const id = `wear-${w}`;
            return (
              <label key={id} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={filters.wear.includes(w)}
                  onChange={() => toggle('wear', w)}
                /> {w}
              </label>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Raretés */}
      <Section>
        <Title>🎨 Raretés</Title>
        <CheckboxGroup>
          {['Consumer', 'Industrial', 'Mil-spec', 'Restricted', 'Classified', 'Covert'].map(r => {
            const id = `rarity-${r}`;
            return (
              <label key={id} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={filters.rarity.includes(r)}
                  onChange={() => toggle('rarity', r)}
                /> {r}
              </label>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Type */}
      <Section>
        <Title>🔧 Type</Title>
        <CheckboxGroup>
          {['StatTrak', 'Souvenir', 'Regular'].map(t => {
            const id = `type-${t}`;
            return (
              <label key={id} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={filters.type.includes(t)}
                  onChange={() => toggle('type', t)}
                /> {t}
              </label>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Collections */}
      <Section>
        <Title onClick={() => setShowCollections(prev => !prev)}>
          📦 Collections {showCollections ? '▲' : '▼'}
        </Title>
        {showCollections && (
          <CheckboxGroup style={{ maxHeight: '300px', overflowY: 'auto', paddingLeft: '1rem' }}>
            {uniqueCollections.map(c => {
              const id = `collection-${c}`;
              return (
                <label key={id} htmlFor={id} style={{ display: 'block', marginBottom: '4px' }}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={filters.collection.includes(c)}
                    onChange={() => toggle('collection', c)}
                  /> {c}
                </label>
              );
            })}
          </CheckboxGroup>
        )}
      </Section>

      {/* Armes */}
      <Section>
        <Title onClick={() => setShowWeapons(prev => !prev)}>
          🔫 Armes {showWeapons ? '▲' : '▼'}
        </Title>
        {showWeapons && (
          <CheckboxGroup style={{ maxHeight: '300px', overflowY: 'auto', paddingLeft: '1rem' }}>
            {uniqueWeapons.map(w => {
              const id = `weapon-${w}`;
              return (
                <label key={id} htmlFor={id} style={{ display: 'block', marginBottom: '4px' }}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={filters.weapon.includes(w)}
                    onChange={() => toggle('weapon', w)}
                  /> {w}
                </label>
              );
            })}
          </CheckboxGroup>
        )}
      </Section>

      {/* Prix */}
      <Section>
        <Title>💰 Prix</Title>
        <PriceRange>
          <label htmlFor="priceMin">
            Min: <input
              id="priceMin"
              type="number"
              value={filters.priceMin}
              onChange={e => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
            />
          </label>
          <label htmlFor="priceMax">
            Max: <input
              id="priceMax"
              type="number"
              value={filters.priceMax}
              onChange={e => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
            />
          </label>
        </PriceRange>
      </Section>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onApply}>✅ Appliquer</button>
        <button onClick={onReset}>♻️ Réinitialiser</button>
      </div>
    </Panel>
  );
}
