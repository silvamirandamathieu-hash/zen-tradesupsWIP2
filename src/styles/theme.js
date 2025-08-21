//theme.js

export const lightTheme = {
  colors: {
    bg: '#ffffffff',         // Fond général doux
    cardBg: '#efeaeaff', 
    cardBackground: 'rgba(244, 237, 237, 0.62)',    // Fond des cartes clair
    border: '#d0d7de',     // Bordures subtiles
    text: '#1f2937',       // Texte principal sombre
    accent: '#2563eb',     // Accent bleu vif
    stattrak: '#f59e0b',   // Couleur StatTrak™ (orange doré)
    textOnBadge: '#000000',
  },

  rarityColors: {
    'Consumer Grade': '#b0c3d9',     // Gris clair
    'Industrial Grade': '#399fc4ff',   // Bleu clair
    'Mil-Spec Grade': '#1f25cdd4', 
    'Consumer': '#b0c3d9',     // Gris clair
    'Industrial': '#399fc4ff',   // Bleu clair
    'Mil-Spec': '#1f25cdd4',     // Bleu moyen
    'Restricted': '#da23ffff',         // Violet
    'Classified': '#e91eceff',         // Rose vif
    'Covert': '#e74c3c',             // Rouge intense
    'Contraband': '#f1c40f',         // Jaune doré
    '★': '#f59e0b',                  // Couleur des couteaux / étoiles
  },

  shadow: {
    regular: '0 2px 6px rgba(0, 0, 0, 0.06)',
    stattrak: '0 0 12px 4px rgba(255,165,0,0.6)',
    souvenir: '0 0 12px 4px rgba(214,228,18,0.6)',
  },


  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },

  radius: {
    sm: '6px',
    md: '12px',
  }
};
export const darkTheme = {
  colors: {
    bg: '#0f172a',
    cardBg: '#1e293b',
    cardBackground: 'rgba(79, 83, 113, 0.53)',
    border: '#334155',
    text: '#f1f5f9',
    accent: '#60a5fa',
    stattrak: '#fbbf24',
    souvenir: '#d9ea48ff',
    textOnBadge: '#ffffff',
  },

  rarityColors: {
    'Consumer Grade': '#94a3b8',
    'Industrial Grade': '#38bdf8',
    'Mil-Spec Grade': '#3b82f6',
    'Consumer': '#94a3b8',
    'Industrial': '#38bdf8',
    'Mil-spec': '#3b82f6',
    'Restricted': '#a78bfa',
    'Classified': '#f472b6',
    'Covert': '#f87171',
    'Contraband': '#facc15',
    '★': '#fbbf24',
  },
  shadow: {
    regular: '0 2px 6px rgba(255, 255, 255, 0.05)',
    stattrak: '0 0 12px 4px rgba(251,191,36,0.6)',
    souvenir: '0 0 12px 4px rgba(217,234,72,0.6)',
  },
  
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },

  radius: {
    sm: '6px',
    md: '12px',
  }
};
