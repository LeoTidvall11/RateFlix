const colors = {
  // Svart – ytor och bakgrunder (bakgrundsbildens botten är ink-950)
  ink: {
    950: '#040304',
    900: '#0A0607',
    800: '#120A0D',
    700: '#1C0F13',
    600: '#2A1519',
  },

  // Mörkröd – bakgrundens glöd, huvudfärgen för varumärket
  blood: {
    950: '#2B0508',
    900: '#46080E',
    800: '#6E0C10',
    700: '#8F1216', // primär knappfärg
    600: '#B01C20',
    500: '#CF2B2F', // aktiv/hover
    400: '#E8564F',
    300: '#F58A80', // ljus accent på mörk yta
  },

  // Accenter som funkar mot svart/röd
  gold: '#F2B84B', // betyg / stjärnor
  ember: '#E5622E', // varm highlight, "trending"
  plum: '#8A3A7A', // wishlist / favoriter
  steel: '#6B84A3', // sekundär, info, länkar
  mint: '#3FB68B', // sett / klart / success
  amber: '#E3A23B', // varning

  // Text
  text: {
    primary: '#F6F1EF',
    secondary: '#BDB1AE',
    muted: '#7E7371',
    onRed: '#FFFFFF',
  },

  // Glassmorphism-ytor (rgba, används som bg-glass / border-glass-border …)
  glass: {
    DEFAULT: 'rgba(255,255,255,0.08)', // kortyta
    strong: 'rgba(255,255,255,0.14)', // upphöjd/aktiv yta
    subtle: 'rgba(255,255,255,0.04)', // bakom text
    tint: 'rgba(143,18,22,0.22)', // rödtonat glas
    dark: 'rgba(4,3,4,0.45)', // mörkt glas över omslag
    border: 'rgba(255,255,255,0.18)',
    highlight: 'rgba(255,255,255,0.32)', // tunn ljuskant upptill
  },
};

module.exports = colors;
