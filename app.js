const featureButtons = document.querySelectorAll('.feature-item');
const panels = document.querySelectorAll('.feature-panel');

featureButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    featureButtons.forEach((btn) => btn.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(`panel-${target}`)?.classList.add('active');
  });
});

function normalizePrice(price) {
  const amount = Number(price) || 0;
  return amount > 1000 ? amount / 1000 : amount;
}

function formatCurrency(value) {
  const amount = Math.abs(Number(value) || 0);

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2).replace('.', ',')} KK`;
  }

  if (amount > 0) {
    return `${Math.round(amount)} K`;
  }

  return '0 K';
}

function formatMoneyLabel(value) {
  const amount = Math.ceil(Math.abs(Number(value) || 0));
  return `$${Math.ceil(amount / 1000)}k`;
}

function useCommonStone(requiredStones, stonePrice, boostStonePrice) {
  if (boostStonePrice <= 0) {
    return true;
  }

  return requiredStones * stonePrice < boostStonePrice;
}

function calculateNormalBoost(currentBoost, targetBoost, boostType, stonePrice, boostStonePrice) {
  let commonStones = 0;
  let boostStones = 0;
  const boostStoneLevels = [];
  let stonesPerBoost = 0;

  for (let level = 0; level <= currentBoost; level += 1) {
    if (level % boostType === 0) {
      stonesPerBoost += 1;
    }
  }

  for (let level = currentBoost + 1; level <= targetBoost; level += 1) {
    if (useCommonStone(stonesPerBoost, stonePrice, boostStonePrice)) {
      commonStones += stonesPerBoost;
    } else {
      boostStones += 1;
      boostStoneLevels.push(level);
    }

    if (level % boostType === 0 && level !== currentBoost) {
      stonesPerBoost += 1;
    }
  }

  return { commonStones, boostStones, boostStoneLevels };
}

function calculateSpecialBoost(currentBoost, targetBoost, boostType, stonePrice, boostStonePrice) {
  let commonStones = 0;
  let boostStones = 0;
  const boostStoneLevels = [];
  let stonesPerBoost = 1;

  for (let level = 1; level <= currentBoost; level += 1) {
    if (level < 10) {
      continue;
    }

    if (level % boostType === 0) {
      stonesPerBoost += 1;
    }
  }

  for (let level = currentBoost + 1; level <= targetBoost; level += 1) {
    if (level < 10) {
      if (level % 2 !== 0) {
        continue;
      }

      if (useCommonStone(stonesPerBoost, stonePrice, boostStonePrice)) {
        commonStones += stonesPerBoost;
      } else {
        boostStones += 1;
        boostStoneLevels.push(level);
      }

      continue;
    }

    if (useCommonStone(stonesPerBoost, stonePrice, boostStonePrice)) {
      commonStones += stonesPerBoost;
    } else {
      boostStones += 1;
      boostStoneLevels.push(level);
    }

    if (level % boostType === 0) {
      stonesPerBoost += 1;
    }
  }

  return { commonStones, boostStones, boostStoneLevels };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .trim();
}

const TYPE_EFFECTIVENESS = {
  Normal: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 0.5,
    Ghost: 0,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 0.5,
  },
  Fire: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Electric: 1,
    Ice: 2,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 2,
    Rock: 0.5,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
    Crystal: 2,
  },
  Water: {
    Normal: 1,
    Fire: 2,
    Water: 0.5,
    Grass: 0.5,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 2,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
    Crystal: 0.5,
  },
  Grass: {
    Normal: 1,
    Fire: 0.5,
    Water: 2,
    Grass: 0.5,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 2,
    Flying: 0.5,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 2,
  },
  Electric: {
    Normal: 1,
    Fire: 1,
    Water: 2,
    Grass: 0.5,
    Electric: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 0,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
    Crystal: 0,
  },
  Ice: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Electric: 1,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 2,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 0.5,
  },
  Fighting: {
    Normal: 2,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 2,
    Fighting: 1,
    Poison: 0.5,
    Ground: 1,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Rock: 2,
    Ghost: 0,
    Dragon: 1,
    Dark: 2,
    Steel: 2,
    Fairy: 0.5,
    Crystal: 2,
  },
  Poison: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 2,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 0.5,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 0.5,
    Ghost: 0.5,
    Dragon: 1,
    Dark: 1,
    Steel: 0,
    Fairy: 2,
    Crystal: 2,
  },
  Ground: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Grass: 0.5,
    Electric: 2,
    Ice: 1,
    Fighting: 1,
    Poison: 2,
    Ground: 1,
    Flying: 0,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
    Crystal: 2,
  },
  Flying: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 2,
    Electric: 0.5,
    Ice: 1,
    Fighting: 2,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 2,
    Rock: 0.5,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 0.5,
  },
  Psychic: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 2,
    Ground: 1,
    Flying: 1,
    Psychic: 0.5,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 0,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 0.5,
  },
  Bug: {
    Normal: 1,
    Fire: 0.5,
    Water: 1,
    Grass: 2,
    Electric: 1,
    Ice: 1,
    Fighting: 0.5,
    Poison: 0.5,
    Ground: 1,
    Flying: 0.5,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 0.5,
    Dragon: 1,
    Dark: 2,
    Steel: 0.5,
    Fairy: 0.5,
    Crystal: 1,
  },
  Rock: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 2,
    Fighting: 0.5,
    Poison: 1,
    Ground: 0.5,
    Flying: 2,
    Psychic: 1,
    Bug: 2,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 0.5,
  },
  Ghost: {
    Normal: 0,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 1,
    Crystal: 1,
  },
  Dragon: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 1,
    Steel: 0.5,
    Fairy: 0,
    Crystal: 0.5,
  },
  Dark: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 0.5,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 0.5,
    Crystal: 1,
  },
  Steel: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Grass: 1,
    Electric: 0.5,
    Ice: 2,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 2,
    Crystal: 2,
  },
  Fairy: {
    Normal: 1,
    Fire: 0.5,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 0.5,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 2,
    Steel: 0.5,
    Fairy: 1,
    Crystal: 1,
  },
  Crystal: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Grass: 1,
    Electric: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
    Crystal: 1,
  },
};

const TYPE_ALIASES = {
  normal: 'Normal',
  fire: 'Fire',
  fogo: 'Fire',
  water: 'Water',
  agua: 'Water',
  'água': 'Water',
  grass: 'Grass',
  planta: 'Grass',
  electric: 'Electric',
  eletrico: 'Electric',
  'elétrico': 'Electric',
  ice: 'Ice',
  gelo: 'Ice',
  fighting: 'Fighting',
  lutador: 'Fighting',
  poison: 'Poison',
  veneno: 'Poison',
  ground: 'Ground',
  terra: 'Ground',
  flying: 'Flying',
  voador: 'Flying',
  psychic: 'Psychic',
  'psíquico': 'Psychic',
  psiquico: 'Psychic',
  bug: 'Bug',
  inseto: 'Bug',
  rock: 'Rock',
  pedra: 'Rock',
  ghost: 'Ghost',
  fantasma: 'Ghost',
  dragon: 'Dragon',
  dragao: 'Dragon',
  'dragão': 'Dragon',
  dark: 'Dark',
  noturno: 'Dark',
  steel: 'Steel',
  metal: 'Steel',
  fairy: 'Fairy',
  fada: 'Fairy',
  crystal: 'Crystal',
  cristal: 'Crystal',
};

const TYPE_ICON_FILES = {
  Fighting: '01_fighting_circle.png',
  Psychic: '02_psychic_circle.png',
  Poison: '03_poison_circle.png',
  Dragon: '04_dragon_circle.png',
  Ghost: '05_ghost_circle.png',
  Dark: '06_dark_circle.png',
  Ground: '07_ground_circle.png',
  Fire: '08_fire_circle.png',
  Fairy: '09_fairy_circle.png',
  Water: '10_water_circle.png',
  Flying: '11_flying_circle.png',
  Normal: '12_normal_circle.png',
  Rock: '13_rock_circle.png',
  Electric: '14_electric_circle.png',
  Bug: '15_bug_circle.png',
  Grass: '16_grass_circle.png',
  Ice: '17_ice_circle.png',
  Steel: '18_steel_circle.png',
  Crystal: '19_crystal_circle.png',
};


const TYPE_OPTIONS = Object.keys(TYPE_EFFECTIVENESS);

function populateTypeSelects() {
  document.querySelectorAll('[data-type-select]').forEach((select) => {
    const existingValue = select.value;
    const isOptional = select.hasAttribute('data-optional-type');
    select.innerHTML = isOptional ? '<option value="">None</option>' : '';

    TYPE_OPTIONS.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });

    if (existingValue) {
      select.value = existingValue;
    }
  });
}
function renderTypeLabel(type) {
  const iconFile = TYPE_ICON_FILES[type];

  if (!iconFile) {
    return `<span class="type-label">${type}</span>`;
  }

  return `
    <span class="type-label">
      <img class="type-icon" src="assets/type-icons/${iconFile}" alt="${type} type icon" loading="lazy">
      <span>${type}</span>
    </span>
  `;
}

const BOOST_TABLES = {
  '2': {
    1: 1,
    2: 2,
    3: 4,
    4: 6,
    5: 9,
    6: 12,
    7: 16,
    8: 20,
    9: 25,
    10: 30,
    11: 36,
    12: 42,
    13: 49,
    14: 56,
    15: 64,
    16: 72,
    17: 81,
    18: 90,
    19: 100,
    20: 110,
    21: 121,
    22: 132,
    23: 144,
    24: 156,
    25: 169,
    26: 182,
    27: 196,
    28: 210,
    29: 225,
    30: 240,
    31: 256,
    32: 272,
    33: 289,
    34: 306,
    35: 324,
    36: 342,
    37: 361,
    38: 380,
    39: 400,
    40: 420,
    41: 441,
    42: 462,
    43: 484,
    44: 506,
    45: 529,
    46: 552,
    47: 576,
    48: 600,
    49: 625,
    50: 650,
  },
  '3': {
    1: 1,
    2: 2,
    3: 3,
    4: 5,
    5: 7,
    6: 9,
    7: 12,
    8: 15,
    9: 18,
    10: 22,
    11: 26,
    12: 30,
    13: 35,
    14: 40,
    15: 45,
    16: 51,
    17: 57,
    18: 63,
    19: 70,
    20: 77,
    21: 84,
    22: 92,
    23: 100,
    24: 108,
    25: 117,
    26: 126,
    27: 135,
    28: 145,
    29: 155,
    30: 165,
    31: 176,
    32: 187,
    33: 198,
    34: 210,
    35: 222,
    36: 234,
    37: 247,
    38: 260,
    39: 273,
    40: 287,
    41: 301,
    42: 315,
    43: 330,
    44: 345,
    45: 360,
    46: 376,
    47: 392,
    48: 408,
    49: 425,
    50: 442,
  },
  '4': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 6,
    6: 8,
    7: 10,
    8: 12,
    9: 15,
    10: 18,
    11: 21,
    12: 24,
    13: 28,
    14: 32,
    15: 36,
    16: 40,
    17: 45,
    18: 50,
    19: 55,
    20: 60,
    21: 66,
    22: 72,
    23: 78,
    24: 84,
    25: 91,
    26: 98,
    27: 105,
    28: 112,
    29: 120,
    30: 128,
    31: 136,
    32: 144,
    33: 153,
    34: 162,
    35: 171,
    36: 180,
    37: 190,
    38: 200,
    39: 210,
    40: 220,
    41: 231,
    42: 242,
    43: 253,
    44: 264,
    45: 276,
    46: 288,
    47: 300,
    48: 312,
    49: 325,
    50: 338,
  },
  '5': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 7,
    7: 9,
    8: 11,
    9: 13,
    10: 15,
    11: 18,
    12: 21,
    13: 24,
    14: 27,
    15: 30,
    16: 34,
    17: 38,
    18: 42,
    19: 46,
    20: 50,
    21: 55,
    22: 60,
    23: 65,
    24: 70,
    25: 75,
    26: 81,
    27: 87,
    28: 93,
    29: 99,
    30: 105,
    31: 112,
    32: 119,
    33: 126,
    34: 133,
    35: 140,
    36: 148,
    37: 156,
    38: 164,
    39: 172,
    40: 180,
    41: 189,
    42: 198,
    43: 207,
    44: 216,
    45: 225,
    46: 235,
    47: 245,
    48: 255,
    49: 265,
    50: 275,
  },
  '6': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 8,
    8: 10,
    9: 12,
    10: 14,
    11: 16,
    12: 18,
    13: 21,
    14: 24,
    15: 27,
    16: 30,
    17: 33,
    18: 36,
    19: 40,
    20: 44,
    21: 48,
    22: 52,
    23: 56,
    24: 60,
    25: 65,
    26: 70,
    27: 75,
    28: 80,
    29: 85,
    30: 90,
    31: 96,
    32: 102,
    33: 108,
    34: 114,
    35: 120,
    36: 126,
    37: 133,
    38: 140,
    39: 147,
    40: 154,
    41: 161,
    42: 168,
    43: 176,
    44: 184,
    45: 192,
    46: 200,
    47: 208,
    48: 216,
    49: 225,
    50: 234,
  },
  '7': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 9,
    9: 11,
    10: 13,
    11: 15,
    12: 17,
    13: 19,
    14: 21,
    15: 24,
    16: 27,
    17: 30,
    18: 33,
    19: 36,
    20: 39,
    21: 42,
    22: 46,
    23: 50,
    24: 54,
    25: 58,
    26: 62,
    27: 66,
    28: 70,
    29: 75,
    30: 80,
    31: 85,
    32: 90,
    33: 95,
    34: 100,
    35: 105,
    36: 111,
    37: 117,
    38: 123,
    39: 129,
    40: 135,
    41: 141,
    42: 147,
    43: 154,
    44: 161,
    45: 168,
    46: 175,
    47: 182,
    48: 189,
    49: 196,
    50: 204,
  },
  '8': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 10,
    10: 12,
    11: 14,
    12: 16,
    13: 18,
    14: 20,
    15: 22,
    16: 24,
    17: 27,
    18: 30,
    19: 33,
    20: 36,
    21: 39,
    22: 42,
    23: 45,
    24: 48,
    25: 52,
    26: 56,
    27: 60,
    28: 64,
    29: 67,
    30: 72,
    31: 76,
    32: 80,
    33: 85,
    34: 90,
    35: 95,
    36: 100,
    37: 105,
    38: 110,
    39: 115,
    40: 120,
    41: 126,
    42: 132,
    43: 138,
    44: 144,
    45: 150,
    46: 156,
    47: 162,
    48: 168,
    49: 175,
    50: 182,
  },
  '9': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 11,
    11: 13,
    12: 15,
    13: 17,
    14: 19,
    15: 21,
    16: 23,
    17: 25,
    18: 27,
    19: 30,
    20: 33,
    21: 36,
    22: 39,
    23: 42,
    24: 45,
    25: 48,
    26: 51,
    27: 54,
    28: 58,
    29: 62,
    30: 66,
    31: 70,
    32: 74,
    33: 78,
    34: 82,
    35: 86,
    36: 90,
    37: 95,
    38: 100,
    39: 105,
    40: 110,
    41: 115,
    42: 120,
    43: 125,
    44: 130,
    45: 135,
    46: 141,
    47: 147,
    48: 153,
    49: 159,
    50: 165,
  },
  '10': Object.fromEntries(Array.from({ length: 50 }, (_, index) => [index + 1, index + 1])),
  '15': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    16: 17,
    17: 19,
    18: 21,
    19: 23,
    20: 25,
    21: 27,
    22: 29,
    23: 31,
    24: 33,
    25: 35,
    26: 37,
    27: 39,
    28: 41,
    29: 43,
    30: 45,
    31: 48,
    32: 51,
    33: 54,
    34: 57,
    35: 60,
    36: 63,
    37: 66,
    38: 69,
    39: 72,
    40: 75,
    41: 78,
    42: 81,
    43: 84,
    44: 87,
    45: 90,
    46: 94,
    47: 98,
    48: 102,
    49: 106,
    50: 110,
  },
  '20': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    16: 16,
    17: 17,
    18: 18,
    19: 19,
    20: 20,
    21: 22,
    22: 24,
    23: 26,
    24: 28,
    25: 30,
    26: 32,
    27: 34,
    28: 36,
    29: 38,
    30: 40,
    31: 42,
    32: 44,
    33: 46,
    34: 48,
    35: 50,
    36: 52,
    37: 54,
    38: 56,
    39: 58,
    40: 60,
    41: 63,
    42: 66,
    43: 69,
    44: 72,
    45: 75,
    46: 78,
    47: 81,
    48: 84,
    49: 87,
    50: 90,
  },
  '25': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    16: 16,
    17: 17,
    18: 18,
    19: 19,
    20: 20,
    21: 21,
    22: 22,
    23: 23,
    24: 24,
    25: 25,
    26: 27,
    27: 29,
    28: 31,
    29: 33,
    30: 35,
    31: 37,
    32: 39,
    33: 41,
    34: 43,
    35: 45,
    36: 47,
    37: 49,
    38: 51,
    39: 53,
    40: 55,
    41: 57,
    42: 59,
    43: 61,
    44: 63,
    45: 65,
    46: 67,
    47: 69,
    48: 71,
    49: 73,
    50: 75,
  },
  '30': {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    16: 16,
    17: 17,
    18: 18,
    19: 19,
    20: 20,
    21: 21,
    22: 22,
    23: 23,
    24: 24,
    25: 25,
    26: 26,
    27: 27,
    28: 28,
    29: 29,
    30: 30,
    31: 32,
    32: 34,
    33: 36,
    34: 38,
    35: 40,
    36: 42,
    37: 44,
    38: 46,
    39: 48,
    40: 50,
    41: 52,
    42: 54,
    43: 56,
    44: 58,
    45: 60,
    46: 62,
    47: 64,
    48: 66,
    49: 68,
    50: 70,
  },
  '30_special': {
    1: 0,
    2: 1,
    3: 1,
    4: 2,
    5: 2,
    6: 3,
    7: 3,
    8: 4,
    9: 4,
    10: 5,
    11: 6,
    12: 7,
    13: 8,
    14: 9,
    15: 10,
    16: 11,
    17: 12,
    18: 13,
    19: 14,
    20: 15,
    21: 16,
    22: 17,
    23: 18,
    24: 19,
    25: 20,
    26: 21,
    27: 22,
    28: 23,
    29: 24,
    30: 25,
    31: 27,
    32: 29,
    33: 31,
    34: 33,
    35: 35,
    36: 37,
    37: 39,
    38: 41,
    39: 43,
    40: 45,
    41: 47,
    42: 49,
    43: 51,
    44: 53,
    45: 55,
    46: 57,
    47: 59,
    48: 61,
    49: 63,
    50: 65,
  },
  '50': Object.fromEntries(Array.from({ length: 50 }, (_, index) => [index + 1, index + 1])),
  '50_special': {
    1: 0,
    2: 1,
    3: 1,
    4: 2,
    5: 2,
    6: 3,
    7: 3,
    8: 4,
    9: 4,
    10: 5,
    11: 6,
    12: 7,
    13: 8,
    14: 9,
    15: 10,
    16: 11,
    17: 12,
    18: 13,
    19: 14,
    20: 15,
    21: 16,
    22: 17,
    23: 18,
    24: 19,
    25: 20,
    26: 21,
    27: 22,
    28: 23,
    29: 24,
    30: 25,
    31: 26,
    32: 27,
    33: 28,
    34: 29,
    35: 30,
    36: 31,
    37: 32,
    38: 33,
    39: 34,
    40: 35,
    41: 36,
    42: 37,
    43: 38,
    44: 39,
    45: 40,
    46: 41,
    47: 42,
    48: 43,
    49: 44,
    50: 45,
  },
};

function parseDefenseTypes(typeInput) {
  const tokens = Array.isArray(typeInput)
    ? typeInput.map((token) => String(token || '').trim()).filter(Boolean)
    : String(typeInput || '')
      .split(/[\/,]/)
      .map((token) => token.trim())
      .filter(Boolean);

  if (!tokens.length || tokens.length > 2) {
    return null;
  }

  const parsed = tokens.map((token) => TYPE_ALIASES[normalizeText(token)] || (TYPE_EFFECTIVENESS[token] ? token : null));
  if (parsed.some((value) => !value)) {
    return null;
  }

  return parsed;
}

function classifyEffectiveness(multiplier) {
  if (multiplier === 0) {
    return 'None';
  }
  if (multiplier >= 2) {
    return 'Super Effective';
  }
  if (multiplier > 1) {
    return 'Effective';
  }
  if (multiplier === 1) {
    return 'Normal';
  }
  if (multiplier >= 0.5) {
    return 'Ineffective';
  }
  return 'Very Ineffective';
}

function formatMultiplier(multiplier) {
  return `${Number(multiplier).toFixed(multiplier % 1 === 0 ? 0 : 2)}x`;
}

function getDisplayType(typeInput) {
  const typeMap = {
    normal: 'Normal',
    fire: 'Fire',
    fogo: 'Fire',
    water: 'Water',
    agua: 'Water',
    'água': 'Water',
    grass: 'Grass',
    planta: 'Grass',
    electric: 'Electric',
    eletrico: 'Electric',
    'elétrico': 'Electric',
    ice: 'Ice',
    gelo: 'Ice',
    fighting: 'Fighting',
    lutador: 'Fighting',
    poison: 'Poison',
    veneno: 'Poison',
    ground: 'Ground',
    terra: 'Ground',
    flying: 'Flying',
    voador: 'Flying',
    psychic: 'Psychic',
    'psíquico': 'Psychic',
    psiquico: 'Psychic',
    bug: 'Bug',
    inseto: 'Bug',
    rock: 'Rock',
    pedra: 'Rock',
    ghost: 'Ghost',
    fantasma: 'Ghost',
    dragon: 'Dragon',
    dragao: 'Dragon',
    'dragão': 'Dragon',
    dark: 'Dark',
    noturno: 'Dark',
    steel: 'Steel',
    metal: 'Steel',
    fairy: 'Fairy',
    fada: 'Fairy',
    crystal: 'Crystal',
    cristal: 'Crystal',
  };

  const normalized = normalizeText(typeInput).split(/[\/,]/)[0];
  return typeMap[normalized] || String(typeInput || 'Unknown').trim();
}

function getElementalBallByType(typeInput) {
  const ballMap = {
    fire: 'Magu Ball',
    fogo: 'Magu Ball',
    water: 'Net Ball',
    agua: 'Net Ball',
    grass: 'Janguru Ball',
    planta: 'Janguru Ball',
    electric: 'Tinker Ball',
    eletrico: 'Tinker Ball',
    eletrico: 'Tinker Ball',
    dark: 'Moon Ball',
    noturno: 'Moon Ball',
    ghost: 'Moon Ball',
    fantasma: 'Moon Ball',
    rock: 'Dusk Ball',
    pedra: 'Dusk Ball',
    fighting: 'Dusk Ball',
    lutador: 'Dusk Ball',
    normal: 'Yume Ball',
    psychic: 'Yume Ball',
    'psíquico': 'Yume Ball',
    psiquico: 'Yume Ball',
    dragon: 'Tale Ball',
    dragao: 'Tale Ball',
    'dragão': 'Tale Ball',
    fairy: 'Tale Ball',
    fada: 'Tale Ball',
    crystal: 'Tale Ball',
    cristal: 'Tale Ball',
    bug: 'Net Ball',
    inseto: 'Net Ball',
    poison: 'Janguru Ball',
    veneno: 'Janguru Ball',
    ground: 'Magu Ball',
    terra: 'Magu Ball',
    ice: 'Sora Ball',
    gelo: 'Sora Ball',
    flying: 'Sora Ball',
    voador: 'Sora Ball',
    steel: 'Tinker Ball',
    metal: 'Tinker Ball',
  };

  const normalized = normalizeText(typeInput).split(/[\/,]/)[0];
  return ballMap[normalized] || 'Elemental Ball';
}

function buildLuckyResult(data) {
  const results = [];
  const luckyLevels = [
    { label: 'Lucky 1', multiplier: 0.1 },
    { label: 'Lucky 2', multiplier: 0.2 },
    { label: 'Lucky 3', multiplier: 0.35 },
    { label: 'Lucky 4', multiplier: 0.5 },
    { label: 'Lucky 5', multiplier: 0.65 },
    { label: 'Lucky 6', multiplier: 0.8 },
    { label: 'Lucky 7', multiplier: 1.0 },
    { label: 'Lucky 9', multiplier: 1.5 },
  ];
  const elixirBonus = 0.2;
  const elixirGreat = 0.8;

  luckyLevels.forEach((item) => {
    const base = data.dropPercentage * (1 + item.multiplier);
    const with20 = data.dropPercentage * (1 + item.multiplier + elixirBonus);
    const with80 = data.dropPercentage * (1 + item.multiplier + elixirGreat);

    results.push(`<strong>${item.label}</strong><br>`);
    results.push(`Base: ${base.toFixed(2)}<br>`);
    if (data.hasElixir) {
      results.push(`+20%: ${with20.toFixed(2)}<br>`);
      results.push(`+80%: ${with80.toFixed(2)}<br>`);
    }
    results.push('<br>');
  });

  return results.join('');
}

function buildAverageResult(data) {
  const elemental = 250;
  const ub = 130;
  const elementalAverage = 2 * (data.npcPrice / elemental);
  const ultraAverage = 2 * (data.npcPrice / ub);
  const ultraCost = Math.ceil((ultraAverage * ub) / 1000);
  const primaryElementalPrice = Number(data.elementalBallPrice) || 0;
  const secondaryElementalPrice = Number(data.secondaryElementalBallPrice) || primaryElementalPrice;
  const selectedTypes = [data.pokemonType, data.secondaryPokemonType]
    .map((type) => getDisplayType(type))
    .filter((type, index, list) => type && list.indexOf(type) === index);

  const elementalRows = selectedTypes.map((type, index) => {
    const chosenBall = getElementalBallByType(type);
    const ballPrice = index === 0 ? primaryElementalPrice : secondaryElementalPrice;
    const elementalCost = Math.ceil((elementalAverage * ballPrice) / 1000);

    return `
      <div class="result-line">
        ${renderBallLabel(chosenBall)}: ${Math.ceil(elementalAverage)} average
        <span class="muted-inline">- type: ${renderTypeLabel(type)}</span>
        (${formatMoneyLabel(elementalCost * 1000)})
      </div>
    `;
  }).join('');

  return `
    <strong>Average capture estimate</strong>
    <div class="average-result-list">
      <div class="result-line">${renderBallLabel('Ultra Ball')}: ${Math.ceil(ultraAverage)} average (${formatMoneyLabel(ultraCost * 1000)})</div>
      ${elementalRows}
    </div>
  `;
}

const ballCatalogData = [
  { name: 'Poke Ball', bestFor: 'Universal', rate: '1x Rate' },
  { name: 'Great Ball', bestFor: 'Universal', rate: '2x Rate' },
  { name: 'Super Ball', bestFor: 'Universal', rate: '3x Rate' },
  { name: 'Ultra Ball', bestFor: 'Universal', rate: '4x Rate' },
  { name: 'Moon Ball', bestFor: 'Dark or Ghost', rate: '5x Rate' },
  { name: 'Tinker Ball', bestFor: 'Electric or Steel', rate: '5x Rate' },
  { name: 'Sora Ball', bestFor: 'Ice or Flying', rate: '5x Rate' },
  { name: 'Dusk Ball', bestFor: 'Rock or Fighting', rate: '5x Rate' },
  { name: 'Yume Ball', bestFor: 'Normal or Psychic', rate: '5x Rate' },
  { name: 'Tale Ball', bestFor: 'Dragon, Fairy or Crystal', rate: '5x Rate' },
  { name: 'Net Ball', bestFor: 'Bug or Water', rate: '5x Rate' },
  { name: 'Janguru Ball', bestFor: 'Poison or Grass', rate: '5x Rate' },
  { name: 'Magu Ball', bestFor: 'Fire or Ground', rate: '5x Rate' },
  { name: 'Fast Ball', bestFor: 'Fast Pokemon', rate: '5x Rate' },
  { name: 'Heavy Ball', bestFor: 'Heavy Pokemon', rate: '5x Rate' },
  { name: 'Premier Ball', bestFor: 'Universal + Free Aura', rate: '4x Rate' },
  { name: 'Nightmare Ball', bestFor: 'Nightmare World', rate: '6x Rate' },
  { name: 'Beast Ball', bestFor: 'Pokemon without capture facilitation', rate: '10x Rate' },
];
const BALL_ICON_FILES = {
  'Poke Ball': 'poke-ball.png',
  'Great Ball': 'great-ball.png',
  'Super Ball': 'super-ball.png',
  'Ultra Ball': 'ultra-ball.png',
  'Moon Ball': 'moon-ball.png',
  'Tinker Ball': 'tinker-ball.png',
  'Sora Ball': 'sora-ball.png',
  'Dusk Ball': 'dusk-ball.png',
  'Yume Ball': 'yume-ball.png',
  'Tale Ball': 'tale-ball.png',
  'Net Ball': 'net-ball.png',
  'Janguru Ball': 'janguru-ball.png',
  'Magu Ball': 'magu-ball.png',
  'Fast Ball': 'fast-ball.png',
  'Heavy Ball': 'heavy-ball.png',
  'Premier Ball': 'premier-ball.png',
  'Nightmare Ball': 'nightmare-ball.png',
  'Beast Ball': 'beast-ball.png',
};
function renderBallLabel(ballName) {
  const iconFile = BALL_ICON_FILES[ballName];

  if (!iconFile) {
    return `<span class="ball-inline-label">${ballName}</span>`;
  }

  return `
    <span class="ball-inline-label">
      <img class="ball-inline-icon" src="assets/ball-icons/${iconFile}" alt="${ballName} icon" loading="lazy">
      <span>${ballName}</span>
    </span>
  `;
}

function renderBallCatalog() {
  const container = document.getElementById('ball-catalog');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  ballCatalogData.forEach((ball) => {
    const card = document.createElement('div');
    card.className = 'ball-card';
    const iconFile = BALL_ICON_FILES[ball.name];
    card.innerHTML = `
      ${iconFile ? `<span class="ball-icon-shell"><img class="ball-icon" src="assets/ball-icons/${iconFile}" alt="${ball.name} icon" loading="lazy"></span>` : ''}
      <span class="ball-card-copy">
        <strong>${ball.name}</strong>
        <span>${ball.bestFor} - ${ball.rate}</span>
      </span>
    `;
    container.appendChild(card);
  });
}

function buildBoostResult(data) {
  const current = Number(data.currentBoost);
  const target = Number(data.targetBoost);
  const rawStonePrice = Number(data.stonePrice) || 0;
  const rawBoostStonePrice = Number(data.boostStonePrice) || 0;
  const stonePrice = normalizePrice(rawStonePrice);
  const boostStonePrice = normalizePrice(rawBoostStonePrice);
  const boostType = Number(data.boostType);

  if (current > target) {
    return 'Current boost cannot be higher than the desired boost.';
  }

  const result = current === target
    ? { commonStones: 0, boostStones: 0, boostStoneLevels: [] }
    : data.useSpecial
      ? calculateSpecialBoost(current, target, boostType, stonePrice, boostStonePrice)
      : calculateNormalBoost(current, target, boostType, stonePrice, boostStonePrice);

  const totalStoneCost = result.commonStones * stonePrice;
  const totalBoostCost = result.boostStones * boostStonePrice;
  const totalCost = totalStoneCost + totalBoostCost;

  return `
    <strong>Current boost:</strong> +${current}<br>
    <strong>Desired boost:</strong> +${target}<br><br>
    Common stones used: ${result.commonStones}<br>
    Boost Stones used: ${result.boostStones}<br>
    ${result.boostStones > 0 ? `Boosts done with Boost Stone: ${result.boostStoneLevels.map((level) => `+${level}`).join(', ')}<br><br>` : ''}
    Common stone cost: ${formatCurrency(totalStoneCost)}<br>
    Boost Stone cost: ${formatCurrency(totalBoostCost)}<br><br>
    <strong>TOTAL COST: ${formatCurrency(totalCost)}</strong>
  `;
}

function buildEffectivenessResult(typeInput) {
  const defenseTypes = parseDefenseTypes(typeInput);
  if (!defenseTypes) {
    return 'Choose one or two valid defense types.';
  }

  const results = Object.entries(TYPE_EFFECTIVENESS)
    .map(([attackType, table]) => {
      let multiplier = 1;
      defenseTypes.forEach((defenseType) => {
        multiplier *= table[defenseType] ?? 1;
      });

      return {
        attackType,
        multiplier,
        category: classifyEffectiveness(multiplier),
      };
    })
    .sort((left, right) => right.multiplier - left.multiplier || left.attackType.localeCompare(right.attackType));

  const groups = [
    { title: 'Super effective', entries: results.filter((entry) => entry.multiplier > 1) },
    { title: 'Normal damage', entries: results.filter((entry) => entry.multiplier === 1) },
    { title: 'Ineffective', entries: results.filter((entry) => entry.multiplier > 0 && entry.multiplier < 1) },
    { title: 'No effect', entries: results.filter((entry) => entry.multiplier === 0) },
  ];

  const defenseTypeLabels = defenseTypes.map(renderTypeLabel).join('<span class="type-separator">/</span>');
  const groupCards = groups.map((group) => `
    <section class="effectiveness-card">
      <h3>${group.title}</h3>
      <div class="effectiveness-list">
        ${group.entries.length
          ? group.entries.map((entry) => `
            <span class="effectiveness-pill">
              ${renderTypeLabel(entry.attackType)}
              <span class="multiplier-pill">${formatMultiplier(entry.multiplier)}</span>
            </span>
          `).join('')
          : '<span class="empty-state">None</span>'}
      </div>
    </section>
  `).join('');

  return `
    <div class="type-summary-row"><strong>Defense type:</strong> ${defenseTypeLabels}</div>
    <div class="effectiveness-grid">${groupCards}</div>
  `;
}

function buildBoostTableResult(boostType, useSpecial) {
  const labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '20', '25', '30', '50'];
  const selected = String(boostType);
  if (!labels.includes(selected)) {
    return 'Choose a valid boost type.';
  }

  const key = useSpecial ? `${selected}_special` : `${selected}`;
  const table = BOOST_TABLES[key];
  if (!table) {
    return 'This boost type does not have a special table yet.';
  }

  const rows = Object.entries(table)
    .map(([level, stones]) => `
      <tr>
        <td>+${level}</td>
        <td>${stones}</td>
      </tr>
    `)
    .join('');

  return `
    <strong>Boost table for ${selected}${useSpecial ? ' (special)' : ''}</strong><br><br>
    <table class="result-table">
      <thead>
        <tr>
          <th>Level</th>
          <th>Stones</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function formStorageKey(form) {
  return `pxg-tools:${form.id}`;
}

function formToObject(form) {
  const data = {};
  Array.from(form.elements).forEach((field) => {
    if (!field.name) {
      return;
    }
    data[field.name] = field.type === 'checkbox' ? field.checked : field.value;
  });
  return data;
}

function restoreFormState(form) {
  const raw = localStorage.getItem(formStorageKey(form));
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([name, value]) => {
      const field = form.elements[name];
      if (!field) {
        return;
      }
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });
  } catch {
    localStorage.removeItem(formStorageKey(form));
  }
}

function saveFormState(form) {
  localStorage.setItem(formStorageKey(form), JSON.stringify(formToObject(form)));
}

function bindFormPersistence(form, resultId) {
  restoreFormState(form);

  form.addEventListener('input', () => saveFormState(form));
  form.addEventListener('change', () => saveFormState(form));
  form.addEventListener('reset', () => {
    localStorage.removeItem(formStorageKey(form));
    window.setTimeout(() => {
      saveFormState(form);
      const result = document.getElementById(resultId);
      if (result) {
        result.innerHTML = '';
      }
    }, 0);
  });
}

populateTypeSelects();

document.querySelectorAll('form[id]').forEach((form) => {
  const resultId = form.id.replace('-form', '-result');
  bindFormPersistence(form, resultId);
});

document.getElementById('lucky-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    dropPercentage: Number(formData.get('dropPercentage') || 0),
    hasElixir: Boolean(formData.get('hasElixir')),
  };
  saveFormState(event.target);
  document.getElementById('lucky-result').innerHTML = buildLuckyResult(payload);
});

document.getElementById('average-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    npcPrice: Number(formData.get('npcPrice') || 0),
    pokemonType: String(formData.get('pokemonType') || ''),
    secondaryPokemonType: String(formData.get('secondaryPokemonType') || ''),
    elementalBallPrice: Number(formData.get('elementalBallPrice') || 0),
    secondaryElementalBallPrice: Number(formData.get('secondaryElementalBallPrice') || 0),
  };
  saveFormState(event.target);
  document.getElementById('average-result').innerHTML = buildAverageResult(payload);
});

renderBallCatalog();

document.getElementById('boost-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    boostType: formData.get('boostType') || '2',
    useSpecial: Boolean(formData.get('useSpecial')),
    currentBoost: formData.get('currentBoost') || '0',
    targetBoost: formData.get('targetBoost') || '0',
    stonePrice: formData.get('stonePrice') || '0',
    boostStonePrice: formData.get('boostStonePrice') || '0',
  };
  saveFormState(event.target);
  document.getElementById('boost-result').innerHTML = buildBoostResult(payload);
});

document.getElementById('effectiveness-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const selectedTypes = [
    String(formData.get('primaryType') || ''),
    String(formData.get('secondaryType') || ''),
  ].filter(Boolean);
  saveFormState(event.target);
  document.getElementById('effectiveness-result').innerHTML = buildEffectivenessResult(selectedTypes);
});

document.getElementById('boost-table-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const boostType = formData.get('boostType') || '2';
  const useSpecial = Boolean(formData.get('useSpecial'));
  saveFormState(event.target);
  document.getElementById('boost-table-result').innerHTML = buildBoostTableResult(boostType, useSpecial);
});





