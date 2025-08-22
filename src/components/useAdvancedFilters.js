import { useState } from 'react';

export const useAdvancedFilters = () => {
  const [filters, setFilters] = useState({
    wear: [],
    rarity: [],
    type: [],
    collection: [],
    weapon: [],
    priceMin: '',
    priceMax: ''
  });

  const resetFilters = () => {
    setFilters({
      wear: [],
      rarity: [],
      type: [],
      collection: [],
      weapon: [],
      priceMin: '',
      priceMax: ''
    });
  };

  return { filters, setFilters, resetFilters };
};
