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

const OFFICIAL_WIKI_CLANS_URL = 'https://wiki.pokexgames.com/index.php/Cl%C3%A3s';

let clanCatalogData = [
  {
    name: 'Volcanic',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/5/55/Volcanicvetorr.png/120px-Volcanicvetorr.png',
    focus: 'Fire specialists',
    types: ['Fire'],
    status: 'Synced seed',
    summary: 'Volcanic clan members are the most destructive trainers, constantly training their Fire-type Pokemon to become stronger than any opponent.',
  },
  {
    name: 'Raibolt',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/4/46/Raiboltvetor.png/120px-Raiboltvetor.png',
    focus: 'Electric specialists',
    types: ['Electric'],
    status: 'Synced seed',
    summary: 'Raibolt clan members are highly intelligent and know everything needed to handle Electric-type Pokemon and defeat enemies with ease.',
  },
  {
    name: 'Orebound',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/6/6f/Oreboundvetor.png/120px-Oreboundvetor.png',
    focus: 'Ground and rock specialists',
    types: ['Ground', 'Rock'],
    status: 'Synced seed',
    summary: 'Orebound clan members dedicate their lives to mastering the strongest Ground- and Rock-type Pokemon to defeat any opponent they encounter.',
  },
  {
    name: 'Naturia',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/7/7a/Naturiavetor.png/120px-Naturiavetor.png',
    focus: 'Grass and bug specialists',
    types: ['Grass', 'Bug'],
    status: 'Synced seed',
    summary: 'Naturia clan members are known for their passion for nature, preferring to live in forests and jungles alongside Grass- and Bug-type Pokemon.',
  },
  {
    name: 'Gardestrike',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/8/82/Gardestrikevetor.png/120px-Gardestrikevetor.png',
    focus: 'Normal and fighting specialists',
    types: ['Normal', 'Fighting'],
    status: 'Synced seed',
    summary: 'Gardestrike clan members are strong, earning their power through long training with Normal- and Fighting-type Pokemon.',
  },
  {
    name: 'Ironhard',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/8/82/Ironhardvetor.png/120px-Ironhardvetor.png',
    focus: 'Steel and crystal specialists',
    types: ['Steel', 'Crystal'],
    status: 'Synced seed',
    summary: 'Ironhard clan Pokemon are known for brute force, resistance, and range, mastering Steel techniques after years of breaking every limit.',
  },
  {
    name: 'Wingeon',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/5/58/Wingeonvetor.png/120px-Wingeonvetor.png',
    focus: 'Flying and dragon specialists',
    types: ['Flying', 'Dragon'],
    status: 'Synced seed',
    summary: 'Wingeon clan members live far from cities, preferring the highest mountains among Flying- and Dragon-type Pokemon.',
  },
  {
    name: 'Psycraft',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/7/76/Psycraftvetor.png/120px-Psycraftvetor.png',
    focus: 'Psychic and fairy specialists',
    types: ['Psychic', 'Fairy'],
    status: 'Synced seed',
    summary: 'Psycraft clan members are enigmatic, said to control the minds of Psychic-type Pokemon and share a strong bond with affectionate Fairy-type Pokemon.',
  },
  {
    name: 'Seavell',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/a/a8/Seavellvetor.png/120px-Seavellvetor.png',
    focus: 'Water and ice specialists',
    types: ['Water', 'Ice'],
    status: 'Synced seed',
    summary: 'Seavell clan members are known for their knowledge of the sea and its creatures, handling the most powerful Water- and Ice-type Pokemon.',
  },
  {
    name: 'Malefic',
    iconUrl: 'https://wiki.pokexgames.com/images/thumb/a/a6/Maleficvetor.png/120px-Maleficvetor.png',
    focus: 'Ghost, dark and poison specialists',
    types: ['Ghost', 'Dark', 'Poison'],
    status: 'Synced seed',
    summary: 'Malefic clan members are mysterious, rarely speaking about their personal lives while controlling Ghost-, Dark-, and Poison-type Pokemon.',
  },
];

let activeClanSlug = '';

let professionData = {
  intro: '',
  professions: [],
  relatedLinks: [],
};
let activeProfessionSlug = '';
<<<<<<< HEAD
let activeProfessionTab = 'overview';

let craftData = {
  crafts: [],
};
let professionCraftFilters = {};
let professionCraftSorts = {};
let professionCraftRanks = {};
let activeProfessorStudentClan = 'Malefic';
let professorStudentData = {
  groups: [],
};

const PROFESSOR_STUDENT_GROUPS = [
  { clan: 'Malefic', students: [
    { name: 'Rocket Member Student Card', level: 50, iconUrl: 'https://wiki.pokexgames.com/images/b/b3/Card_Rocket_Member_Female.png' },
    { name: 'Rocket Leader Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/f/f4/Card_Rocket_Leader_Female.png' },
    { name: 'Shaggy Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/3/3f/Shaggy_Student_Card.png' },
    { name: 'Malefic Lady/Lord Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/8/86/Card_Malefic_Lady.png' },
    { name: 'James Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/d/d5/Card_James.png' },
    { name: 'Jessie Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/3/3a/Card_Jessie.png' },
    { name: 'Koga Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/9/9c/Card_Koga.png' },
    { name: 'Morty Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/6/64/Morty_Student_Card.png' },
    { name: 'Agatha Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/0/07/Card_Agatha.png' },
    { name: 'Akame Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/1/12/Akame_Student_Card.png' },
    { name: 'Joker Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/c/c3/Joker_Student_Card.png' },
    { name: 'Nezuko Kamado Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/0/08/Nezuko_Kamado_Student_Card.png' },
    { name: 'Swain Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/5/5d/Swain_Student_Card.png' },
    { name: 'Silver Student Card', level: 500, iconUrl: 'https://wiki.pokexgames.com/images/8/84/Silver_Student_Card.png' },
  ] },
  { clan: 'Gardestrike', students: [
    { name: 'Chun Li Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/4/49/Card_Chun_Li.png' },
    { name: 'Gardestrike Champion Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/3/31/Card_Gardestrike_Champion_Female.png' },
    { name: 'Looker Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/a/a7/Card_Looker.png' },
    { name: 'Butch Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/6/6d/Card_Butch.png' },
    { name: 'Cassidy Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/7/70/Card_Cassidy.png' },
    { name: 'Chuck Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/a/a6/Chuck_Student_Card.png' },
    { name: 'Kyra Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/5/5f/Card_Kyra.png' },
    { name: 'Luffy Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/3/35/Luffy_Student_Card.png' },
    { name: 'Norman Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/1/1b/Norman_Student_Card.png' },
    { name: 'Sanji Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/a/a8/Sanji_Student_Card.png' },
    { name: 'Whitney Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/5/5a/Whitney_Student_Card.png' },
    { name: 'Bruno Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/b/b6/Card_Bruno.png' },
    { name: 'Harley Quinn Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/4/40/Harley_Quinn_Student_Card.png' },
  ] },
  { clan: 'Seavell', students: [
    { name: 'Melody Student Card', level: 100, iconUrl: 'https://wiki.pokexgames.com/images/7/77/Card_Melody.png' },
    { name: 'Seavell Queen/King Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/6/63/Card_Seavell_Queen.png' },
    { name: 'Officer Jenny Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/3/30/Card_Officer_Jenny.png' },
    { name: 'Crystal Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/d/df/Crystal_Student_Card.png' },
    { name: 'Jon Snow Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/f/fb/Jon_Snow_Student_Card.png' },
    { name: 'Juan Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/f/f3/Juan_Student_Card.png' },
    { name: 'Misty Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/a/a2/Card_Misty.png' },
    { name: 'Pryce Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/3/3e/Pryce_Student_Card.png' },
    { name: 'Lorelei Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/3/34/Card_Lorelei.png' },
    { name: 'Tanjiro Kamado Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/f/f5/Card_Tanjiro.png' },
    { name: 'Gary Oak Student Card', level: 400, iconUrl: 'https://wiki.pokexgames.com/images/7/79/Card_Gary_Oak.png' },
    { name: 'Blue Student Card', level: 550, iconUrl: 'https://wiki.pokexgames.com/images/1/13/Card_Blue.png' },
  ] },
  { clan: 'Volcanic', students: [
    { name: 'Police Officer Student Card', level: 50, iconUrl: 'https://wiki.pokexgames.com/images/7/7f/Card_Police_Officer_Female.png' },
    { name: 'Police Captain Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/4/4a/Card_Police_Captain_Female.png' },
    { name: 'Goh Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/2/29/Goh_Student_Card.png' },
    { name: 'Volcanic Master Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/8/8d/Volcanic_Master_Female.png' },
    { name: 'May Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/3/38/Card_May.png' },
    { name: 'Rin Okumura Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/9/9f/Rin_Okumura_Student_Card.png' },
    { name: 'Blaine Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/2/20/Card_Blaine.png' },
    { name: 'Flannery Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/e/e7/Flannery_Student_Card.png' },
    { name: 'Annie Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/c/c8/Annie_Student_Card.png' },
    { name: 'Gold Student Card', level: 500, iconUrl: 'https://wiki.pokexgames.com/images/6/66/Gold_Student_Card.png' },
    { name: 'Red Student Card', level: 550, iconUrl: 'https://wiki.pokexgames.com/images/2/2c/Red_Student_Card.png' },
  ] },
  { clan: 'Raibolt', students: [
    { name: 'Ritchie Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/f/ff/Ritchie_Student_Card.png' },
    { name: 'Raibolt Legend Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/7/7a/Card_Raibolt_Legend_Female.png' },
    { name: 'Lt. Surge Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/4/43/Card_Lt_Surge.png' },
    { name: 'Wattson Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/a/a2/Wattson_Student_Card.png' },
    { name: 'Deadpool Student Card', level: 375, iconUrl: 'https://wiki.pokexgames.com/images/5/5c/Card_Deadpool.png' },
    { name: 'Ash Ketchum Student Card', level: 400, iconUrl: 'https://wiki.pokexgames.com/images/9/91/Card_Ash_Ketchum.png' },
  ] },
  { clan: 'Naturia', students: [
    { name: 'Naturia Keeper Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/9/94/Card_Naturia_Keeper_Female.png' },
    { name: 'Lyra Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/a/a1/Lyra_Student_Card.png' },
    { name: 'Tracey Student Card', level: 250, iconUrl: 'https://wiki.pokexgames.com/images/7/7e/Card_Tracey.png' },
    { name: 'Bugsy Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/3/33/Bugsy_Student_Card.png' },
    { name: 'Erika Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/9/9a/Card_Erika.png' },
    { name: 'Doflamingo Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/0/01/Doflamingo_Student_Card.png' },
    { name: 'Green Student Card', level: 550, iconUrl: 'https://wiki.pokexgames.com/images/6/68/Green_Student_Card.png' },
  ] },
  { clan: 'Orebound', students: [
    { name: 'Orebound Heroine/Hero Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/2/2f/Card_Orebound_Heroine.png' },
    { name: 'Brock Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/2/2a/Card_Brock.png' },
    { name: 'Roxanne Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/1/1c/Roxanne_Student_Card.png' },
    { name: 'Giovanni Student Card', level: 400, iconUrl: 'https://wiki.pokexgames.com/images/7/7a/Giovanni_Student_Card.png' },
  ] },
  { clan: 'Wingeon', students: [
    { name: 'Wingeon Dragon Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/2/2e/Card_Wingeon_Dragon_Female.png' },
    { name: 'Clair Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/8/8e/Clair_Student_Card.png' },
    { name: 'Daenerys Targaryen Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/6/69/Daenerys_Targaryen_Student_Card.png' },
    { name: 'Falkner Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/b/b0/Falkner_Student_Card.png' },
    { name: 'Winona Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/2/2c/Winona_Student_Card.png' },
    { name: 'Killer Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/5/52/Killer_Student_Card.png' },
    { name: 'Lance Student Card', level: 375, iconUrl: 'https://wiki.pokexgames.com/images/9/99/Card_Lance.png' },
    { name: 'Cynthia Student Card', level: 500, iconUrl: 'https://wiki.pokexgames.com/images/9/93/Cynthia_Student_Card.png' },
  ] },
  { clan: 'Psycraft', students: [
    { name: 'Velma Student Card', level: 150, iconUrl: 'https://wiki.pokexgames.com/images/7/7f/Velma_Student_Card.png' },
    { name: 'Psycraft Medium Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/0/0b/Card_Psycraft_Medium_Female.png' },
    { name: 'Liza Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/5/5e/Liza_Student_Card.png' },
    { name: 'Tate Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/f/f3/Tate_Student_Card.png' },
    { name: 'Sabrina Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/a/ae/Card_Sabrina.png' },
    { name: 'Ahri Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/1/11/Ahri_Student_Card.png' },
    { name: 'Satoru Gojo Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/c/ce/Satoru_Gojo_Student_Card.png' },
    { name: 'Trafalgar Law Student Card', level: 350, iconUrl: 'https://wiki.pokexgames.com/images/6/67/Trafalgar_Law_Student_Card.png' },
  ] },
  { clan: 'Ironhard', students: [
    { name: 'Ironhard Titan Student Card', level: 200, iconUrl: 'https://wiki.pokexgames.com/images/d/d5/Card_Ironhard_Titan_Female.png' },
    { name: 'Jasmine Student Card', level: 300, iconUrl: 'https://wiki.pokexgames.com/images/d/d8/Jasmine_Student_Card.png' },
    { name: 'Steven Student Card', level: 500, iconUrl: 'https://wiki.pokexgames.com/images/7/7e/Steven_Student_Card.png' },
  ] },
];
=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642

let pokemonData = {
  generations: [],
  pokemon: [],
};

let itemData = {
  categories: [],
};
let activeItemCategorySlug = '';

let clanDetailData = {
  volcanic: {
    name: 'Volcanic',
    sourceUrl: 'https://wiki.pokexgames.com/index.php/Volcanic',
    bonus: [
      { type: 'Fire', attack: '28%', defense: '28%' },
    ],
    npcPokemon: [
      {
        label: 'Shiny de Cla',
        pokemon: 'Shiny Flareon',
        npc: 'Pepper',
        location: 'area do Cla Volcanic, no Trade Center',
      },
      {
        label: 'Shiny de Cla da Nightmare World',
        pokemon: 'Shiny Magby',
        npc: 'Pepper',
        location: 'area de Volcanic, na resistencia de Cerulean',
      },
    ],
    tiers: [
      { tier: 'Tier 1A', pokemon: ['Shiny Magmar'] },
      { tier: 'Tier 1B', pokemon: ['Shiny Arcanine'] },
      {
        tier: 'Tier 1C',
        pokemon: [
          'Shiny Charizard',
          'Mega Charizard X',
          'Mega Charizard Y',
          'Shiny Ninetales',
          'Hisuian Arcanine',
          'Alolan Marowak',
          'Shiny Typhlosion',
          'Shiny Magcargo',
          'Mega Houndoom',
          'Mega Blaziken',
          'Shiny Torkoal',
          'Shiny Infernape',
          'Magmortar',
          'Heatran',
          'Shiny Delphox',
          'Shiny Cinderace',
          'Mega Scovillain',
        ],
      },
      {
        tier: 'Technical Machine (TM)',
        pokemon: ['Shiny Charizard (TM)', 'Alolan Marowak (TM)', 'Mega Houndoom (TM)', 'Shiny Torkoal (TM)', 'Magmortar (TM)'],
      },
      { tier: 'Technical Records (TR)', pokemon: ['Charizard (TR)'] },
      {
        tier: 'Tier 1H',
        pokemon: ['Shiny Houndoom', 'Shiny Chandelure', 'Mega Chandelure', 'Shiny Heatmor', 'Mega Pyroar'],
      },
      {
        tier: 'Tier 2',
        pokemon: [
          'Ninetales',
          'Arcanine',
          'Shiny Rapidash',
          'Magmar',
          'Shiny Flareon',
          'Hisuian Typhlosion',
          'Houndoom',
          'Shiny Magby',
          'Mega Camerupt',
          'Torkoal',
          'Castform',
          'Infernape',
          'Darmanitan',
          'Galarian Darmanitan',
          'Galarian Zen Darmanitan',
          'Volcarona',
          'Pyroar',
          'Pyroar Female',
          'Talonflame',
          'Turtonator',
          'Cinderace',
        ],
      },
      {
        tier: 'Tier 3',
        pokemon: ['Charizard', 'Rapidash', 'Flareon', 'Typhlosion', 'Magcargo', 'Blaziken', 'Camerupt', 'Simisear', 'Chandelure', 'Heatmor', 'Scovillain'],
      },
    ],
    rotation: [
      {
        element: 'Fire',
        rows: [
          { pokemon: 'Pyroar Female', role: 'Tank', roleIcon: 'https://wiki.pokexgames.com/images/thumb/8/80/Interface_Tank_PVE.png/25px-Interface_Tank_PVE.png', tier: '2' },
          { pokemon: 'Alolan Marowak (TM)', role: 'Offensive Tank', roleIcon: 'https://wiki.pokexgames.com/images/thumb/0/00/Interface_OffensiveTanker_pve.png/25px-Interface_OffensiveTanker_pve.png', tier: 'TM OFF-Tank' },
          { pokemon: 'Magmar', role: 'Offensive Tank', roleIcon: 'https://wiki.pokexgames.com/images/thumb/0/00/Interface_OffensiveTanker_pve.png/25px-Interface_OffensiveTanker_pve.png', tier: '2' },
          { pokemon: 'Arcanine', role: 'Offensive Tank', roleIcon: 'https://wiki.pokexgames.com/images/thumb/0/00/Interface_OffensiveTanker_pve.png/25px-Interface_OffensiveTanker_pve.png', tier: '2' },
          { pokemon: 'Shiny Chandelure', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '1H' },
          { pokemon: 'Shiny Heatmor', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '1H' },
          { pokemon: 'Mega Pyroar', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '1H' },
          { pokemon: 'Ninetales', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '2' },
          { pokemon: 'Shiny Magby', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '2' },
          { pokemon: 'Typhlosion', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '3' },
          { pokemon: 'Flareon', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: '3' },
          { pokemon: 'Charizard (TR)', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/24px-Interface_BDD_PVE.png', tier: 'TR' },
          { pokemon: 'Magmortar (TM)', role: 'Burst Damage Dealer', roleIcon: 'https://wiki.pokexgames.com/images/thumb/b/bc/Interface_BDD_PVE.png/25px-Interface_BDD_PVE.png', tier: 'TM Burst' },
        ],
      },
    ],
    pvpExclusive: [
      'Mega Charizard X',
      'Hisuian Arcanine',
      'Alolan Marowak',
      'Shiny Flareon',
      'Shiny Magby',
      'Castform',
      'Infernape',
      'Darmanitan',
      'Volcarona',
      'Shiny Infernape',
      'Galarian Darmanitan',
      'Cinderace',
      'Shiny Cinderace',
      'Mega Scovillain',
    ],
    pvpNote: 'A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.',
  },
};

function formatClanStatus(status) {
  if (!status) {
    return 'Synced';
  }

  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeClanRecord(clan) {
  return {
    name: clan.name || 'Unknown clan',
    iconUrl: clan.iconUrl || '',
    focus: clan.focus || `${(clan.types || []).join(', ') || 'PXG'} specialists`,
    types: Array.isArray(clan.types) ? clan.types : [],
    status: formatClanStatus(clan.status || 'synced'),
    summary: clan.summary || 'Loaded from the official wiki data file.',
  };
}

function slugifyClanName(name) {
  return normalizeText(name).replace(/\s+/g, '-');
}

async function loadClanCatalog() {
  try {
    const response = await fetch('data/clans.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Clan data request failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const clans = Array.isArray(payload.clans) ? payload.clans.map(normalizeClanRecord) : [];

    if (clans.length) {
      clanCatalogData = clans;
      renderClanView();
    }
  } catch (error) {
    console.warn('Using embedded clan seed because data/clans.json could not be loaded.', error);
  }
}

function normalizeClanDetail(detail) {
  return {
    ...detail,
    bonus: Array.isArray(detail.bonus) ? detail.bonus : [],
    npcPokemon: Array.isArray(detail.npcPokemon) ? detail.npcPokemon : [],
    tiers: Array.isArray(detail.tiers) ? detail.tiers : [],
    rotation: Array.isArray(detail.rotation) ? detail.rotation : [],
    pvpExclusive: Array.isArray(detail.pvpExclusive) ? detail.pvpExclusive : [],
    pvpNote: detail.pvpNote || 'A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.',
  };
}

async function loadClanDetails() {
  try {
    const response = await fetch('data/clan-details.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Clan detail request failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const details = Array.isArray(payload.clans) ? payload.clans : [];

    if (details.length) {
      clanDetailData = details.reduce((accumulator, detail) => {
        const slug = detail.slug || slugifyClanName(detail.name);
        accumulator[slug] = normalizeClanDetail(detail);
        return accumulator;
      }, { ...clanDetailData });

      renderClanView();
    }
  } catch (error) {
    console.warn('Using embedded clan detail seed because data/clan-details.json could not be loaded.', error);
  }
}

function renderPillList(items) {
  return items.map((item) => `<span class="data-pill">${item}</span>`).join('');
}

function renderIconItem(item, className = 'mini-icon-label') {
  if (!item) {
    return '';
  }

  const label = item.label || item.name || '';
  const icon = item.icon || '';

  return `
    <span class="${className}">
      ${icon ? `<img src="${icon}" alt="${label}" loading="lazy">` : ''}
      <span>${label}</span>
    </span>
  `;
}

function renderIconList(items, emptyText = '-') {
  if (!Array.isArray(items) || !items.length) {
    return `<span class="muted-cell">${emptyText}</span>`;
  }

  return `<div class="icon-list">${items.map((item) => renderIconItem(item)).join('')}</div>`;
}

function renderPokemonIcon(row) {
  if (!row.icon) {
    return '-';
  }

  return `<img class="pokemon-sprite" src="${row.icon}" alt="${row.name}" loading="lazy">`;
}

function renderTierGroup(group) {
  if (!Array.isArray(group.rows) || !group.rows.length) {
    return `
      <div class="tier-group">
        <strong>${group.tier}</strong>
        <div>${renderPillList(group.pokemon)}</div>
      </div>
    `;
  }

  return `
    <section class="tier-table-group">
      <h5>${group.tier}</h5>
      <div class="table-scroll">
        <table class="result-table clan-tier-table">
          <thead>
            <tr>
              <th>Dex</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Elements</th>
              <th>PvE roles</th>
              <th>PvP roles</th>
              <th>Recommended helds</th>
            </tr>
          </thead>
          <tbody>
            ${group.rows.map((row) => `
              <tr>
                <td>${row.dex || '-'}</td>
                <td>${renderPokemonIcon(row)}</td>
                <td><strong>${row.name}</strong></td>
                <td>${renderIconList(row.elements)}</td>
                <td>${renderIconList(row.pveRoles)}</td>
                <td>${renderIconList(row.pvpRoles)}</td>
                <td>${renderIconList(row.helds)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderRoleLabel(entry) {
  if (!entry.role) {
    return '-';
  }

  return `
    <span class="role-label">
      ${entry.roleIcon ? `<img src="${entry.roleIcon}" alt="${entry.role}" loading="lazy">` : ''}
      <span>${entry.role}</span>
    </span>
  `;
}

function normalizeRotationGroups(rotation) {
  if (!rotation.length) {
    return [];
  }

  if (rotation[0].rows) {
    return rotation;
  }

  return [{ element: 'Fire', rows: rotation }];
}

function normalizePokemonNameKey(value) {
  return normalizeText(value || '')
    .replace(/\s*\((?:TM|TR)\)\s*$/i, '')
    .replace(/^mega\s+/i, '')
    .replace(/^shiny\s+/i, '');
}

function buildTierPokemonIconMap(tiers) {
  const iconMap = new Map();

  (tiers || []).forEach((tier) => {
    (tier.rows || []).forEach((row) => {
      if (!row.name || !row.icon) {
        return;
      }

      iconMap.set(normalizePokemonNameKey(row.name), row.icon);
      iconMap.set(normalizeText(row.name), row.icon);
    });
  });

  return iconMap;
}

function renderRotationPokemon(entry, iconMap) {
  const name = entry.pokemon || '';
  const icon = entry.icon || entry.pokemonIcon || iconMap.get(normalizeText(name)) || iconMap.get(normalizePokemonNameKey(name));

  return `
    <span class="rotation-pokemon">
      ${icon ? `<img class="pokemon-sprite" src="${icon}" alt="${name}" loading="lazy">` : ''}
      <span>${name}</span>
    </span>
  `;
}

function renderClanDetail(detail) {
  const container = document.getElementById('clan-catalog');
  const toolbar = document.querySelector('.clan-toolbar');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = true;
  }

  const rotationPokemonIcons = buildTierPokemonIconMap(detail.tiers);

  container.classList.add('detail-mode');
  container.innerHTML = `
    <article class="clan-detail">
      <div class="clan-detail-toolbar">
        <button class="clan-back-button" type="button" data-clan-back>Voltar aos clas</button>
        <a href="${detail.sourceUrl}" target="_blank" rel="noreferrer">Abrir na Wiki</a>
      </div>
      <div class="clan-detail-header">
        <div>
          <h3>${detail.name}</h3>
        </div>
      </div>

      <section class="clan-detail-section">
        <h4>Bonus de cla</h4>
        <div class="detail-grid">
          ${detail.bonus.map((entry) => `
            <div class="detail-metric">
              ${renderTypeLabel(entry.type)}
              <strong>Atk ${entry.attack} / Def ${entry.defense}</strong>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="clan-detail-section">
        <h4>Pokemons obtidos via NPC de Cla</h4>
        <div class="detail-grid">
          ${detail.npcPokemon.length ? detail.npcPokemon.map((entry) => `
            <div class="detail-metric">
              <span class="clan-note">${entry.label}</span>
              <strong>${entry.pokemon}</strong>
              <span>NPC ${entry.npc} - ${entry.location}</span>
            </div>
          `).join('') : '<span class="empty-state">Nao informado na wiki oficial.</span>'}
        </div>
      </section>

      <section class="clan-detail-section">
        <h4>Tiers</h4>
        <div class="tier-list">
          ${detail.tiers.map(renderTierGroup).join('')}
        </div>
      </section>

      <section class="clan-detail-section">
        <h4>Rotacao mid-late Game</h4>
        <div class="rotation-groups">
          ${normalizeRotationGroups(detail.rotation).map((group) => `
            <section class="rotation-group">
              <h5>${renderTypeLabel(group.element)}</h5>
              <table class="result-table">
                <thead>
                  <tr>
                    <th>Pokemon</th>
                    <th>Funcao</th>
                    <th>Tier</th>
                  </tr>
                </thead>
                <tbody>
                  ${group.rows.map((entry) => `
                    <tr>
                      <td>${renderRotationPokemon(entry, rotationPokemonIcons)}</td>
                      <td>${renderRoleLabel(entry)}</td>
                      <td>${entry.tier || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>
          `).join('')}
        </div>
      </section>

      <section class="clan-detail-section">
        <h4>Exclusividade do Cla no PVP</h4>
        <div class="pill-list">${renderPillList(detail.pvpExclusive)}</div>
        <p>${detail.pvpNote}</p>
      </section>
    </article>
  `;
}

function renderClanPendingDetail(slug) {
  const clan = clanCatalogData.find((item) => slugifyClanName(item.name) === slug);
  const container = document.getElementById('clan-catalog');
  const toolbar = document.querySelector('.clan-toolbar');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = true;
  }

  container.classList.add('detail-mode');
  container.innerHTML = `
    <article class="clan-detail">
      <div class="clan-detail-toolbar">
        <button class="clan-back-button" type="button" data-clan-back>Voltar aos clas</button>
      </div>
      <div class="clan-detail-header">
        <div>
          <h3>${clan?.name || 'Clan'}</h3>
        </div>
      </div>
      <section class="clan-detail-section">
        <h4>Detail not loaded yet</h4>
        <p>Volcanic is the first clan detail page prepared for this test. The next step is applying the same scraper structure to every clan.</p>
      </section>
    </article>
  `;
}

function renderClanCatalog() {
  const container = document.getElementById('clan-catalog');
  const searchInput = document.getElementById('clan-search');
  const typeFilter = document.getElementById('clan-type-filter');
  const toolbar = document.querySelector('.clan-toolbar');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = false;
  }

  container.classList.remove('detail-mode');

  const searchTerm = normalizeText(searchInput?.value || '');
  const selectedType = typeFilter?.value || '';
  const filteredClans = clanCatalogData.filter((clan) => {
    const matchesSearch = !searchTerm || normalizeText(`${clan.name} ${clan.focus} ${clan.summary}`).includes(searchTerm);
    const matchesType = !selectedType || clan.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  container.innerHTML = filteredClans.length
    ? filteredClans.map((clan) => `
      <article class="clan-card">
        <div class="clan-card-header">
          <div>
            <h3>
              <button class="clan-name-button" type="button" data-clan-open="${slugifyClanName(clan.name)}">
                ${clan.iconUrl ? `<img class="clan-emblem" src="${clan.iconUrl}" alt="${clan.name} emblem" loading="lazy">` : ''}
                ${clan.name}
              </button>
            </h3>
          </div>
          <a href="${OFFICIAL_WIKI_CLANS_URL}" target="_blank" rel="noreferrer">Wiki</a>
        </div>
        <p>${clan.summary}</p>
        <div class="clan-type-list">${clan.types.map(renderTypeLabel).join('')}</div>
      </article>
    `).join('')
    : '<div class="empty-state">No clans found for this filter.</div>';
}

function renderClanView() {
  if (activeClanSlug) {
    const detail = clanDetailData[activeClanSlug];

    if (detail) {
      renderClanDetail(detail);
      return;
    }

    renderClanPendingDetail(activeClanSlug);
    return;
  }

  renderClanCatalog();
}

function slugifyProfessionName(name) {
  return normalizeText(name).replace(/\s+/g, '-');
}

function normalizeProfessionPayload(payload) {
  return {
    intro: payload?.intro || '',
    professions: Array.isArray(payload?.professions) ? payload.professions : [],
    relatedLinks: Array.isArray(payload?.relatedLinks) ? payload.relatedLinks : [],
  };
}

<<<<<<< HEAD
function normalizeCraftPayload(payload) {
  return {
    crafts: Array.isArray(payload?.crafts) ? payload.crafts : [],
  };
}

function normalizeProfessorStudentsPayload(payload) {
  return {
    groups: Array.isArray(payload?.groups) ? payload.groups : [],
  };
}

=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
async function loadProfessions() {
  try {
    const response = await fetch('data/professions.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Profession data request failed with HTTP ${response.status}.`);
    }

    professionData = normalizeProfessionPayload(await response.json());
    renderProfessionView();
  } catch (error) {
    console.warn('Profession data could not be loaded from data/professions.json.', error);
  }
}

<<<<<<< HEAD
async function loadCrafts() {
  try {
    const response = await fetch('data/crafts.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Craft data request failed with HTTP ${response.status}.`);
    }

    craftData = normalizeCraftPayload(await response.json());
    renderProfessionView();
  } catch (error) {
    console.warn('Craft data could not be loaded from data/crafts.json.', error);
  }
}

async function loadProfessorStudents() {
  try {
    const response = await fetch('data/professor-students.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Professor student data request failed with HTTP ${response.status}.`);
    }

    professorStudentData = normalizeProfessorStudentsPayload(await response.json());
    renderProfessionView();
  } catch (error) {
    console.warn('Professor student data could not be loaded from data/professor-students.json.', error);
  }
}

=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
function renderProfessionLinkCard(link) {
  return `
    <article class="profession-link-card">
      <div class="profession-link-head">
        ${link.iconUrl ? `<img src="${link.iconUrl}" alt="${link.title}" loading="lazy">` : ''}
        <div>
          <span class="clan-note">${link.kind}</span>
          <strong>${link.title}</strong>
        </div>
      </div>
      <p>${link.summary || 'Loaded from the official wiki.'}</p>
      <a href="${link.sourceUrl}" target="_blank" rel="noreferrer">Wiki</a>
    </article>
  `;
}

<<<<<<< HEAD
function renderProfessionTabLinkCard(link, tabId) {
  return `
    <article class="profession-link-card">
      <div class="profession-link-head">
        ${link.iconUrl ? `<img src="${link.iconUrl}" alt="${link.title}" loading="lazy">` : ''}
        <div>
          <span class="clan-note">${link.kind}</span>
          <button class="profession-title-link" type="button" data-profession-tab="${tabId}">${link.title}</button>
        </div>
      </div>
      <p>${link.summary || 'Loaded from the official wiki.'}</p>
    </article>
  `;
}

function renderProfessionFeatureCard(title, summary, iconUrl, tabId, kind = 'caracteristica') {
  return `
    <article class="profession-link-card">
      <div class="profession-link-head">
        ${iconUrl ? `<img src="${iconUrl}" alt="${title}" loading="lazy">` : ''}
        <div>
          <span class="clan-note">${kind}</span>
          <button class="profession-title-link" type="button" data-profession-tab="${tabId}">${title}</button>
        </div>
      </div>
      <p>${summary}</p>
    </article>
  `;
}

function renderProfessionInternalBack(label) {
  return `
    <button class="profession-card-inline-link profession-section-back" type="button" data-profession-tab="overview">
      Voltar para ${label}
    </button>
  `;
}

=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
function renderProfessionLinkSection(title, links) {
  if (!Array.isArray(links) || !links.length) {
    return '';
  }

  return `
    <section class="clan-detail-section">
      <h4>${title}</h4>
      <div class="profession-link-grid">
        ${links.map(renderProfessionLinkCard).join('')}
      </div>
    </section>
  `;
}

<<<<<<< HEAD
function findProfessionLink(detail, slug) {
  return [
    ...(detail.specializations || []),
    ...(detail.subsections || []),
    ...(detail.crafts || []),
  ].find((link) => link.slug === slug);
}

function getProfessionCrafts(professionSlug, predicate = () => true) {
  return craftData.crafts.filter((craft) => craft.professionSlug === professionSlug && predicate(craft));
}

function renderCraftIngredientList(ingredients) {
  if (!Array.isArray(ingredients) || !ingredients.length) {
    return '<span class="empty-state">Ingredientes nao listados.</span>';
  }

  return `
    <ul class="craft-ingredient-list">
      ${ingredients.map((ingredient) => `
        <li>
          ${ingredient.iconUrl ? `<img src="${ingredient.iconUrl}" alt="${ingredient.name}" loading="lazy">` : ''}
          <span>${ingredient.quantity} ${ingredient.name}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function craftMatchesSearch(craft, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const searchable = [
    craft.itemName,
    craft.itemSlug,
    craft.category,
    craft.rank,
    ...(craft.ingredients || []).flatMap((ingredient) => [ingredient.name, ingredient.itemSlug]),
  ].join(' ');

  return normalizeText(searchable).includes(searchTerm);
}

function parseCraftSkillValue(skill) {
  const match = String(skill || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseCraftWaitMinutes(craftTime) {
  const normalized = normalizeText(craftTime).replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);

  if (/dia/.test(normalized)) {
    return amount * 24 * 60;
  }

  if (/hora/.test(normalized)) {
    return amount * 60;
  }

  if (/minuto/.test(normalized)) {
    return amount;
  }

  if (/segundo/.test(normalized)) {
    return amount / 60;
  }

  return amount;
}

function sortCrafts(crafts, sortMode) {
  const sorted = [...crafts];

  sorted.sort((a, b) => {
    if (sortMode === 'name-asc') {
      return String(a.itemName || '').localeCompare(String(b.itemName || ''), 'pt-BR');
    }

    if (sortMode === 'name-desc') {
      return String(b.itemName || '').localeCompare(String(a.itemName || ''), 'pt-BR');
    }

    if (sortMode === 'time-desc') {
      return parseCraftWaitMinutes(b.craftTime) - parseCraftWaitMinutes(a.craftTime);
    }

    if (sortMode === 'time-asc') {
      return parseCraftWaitMinutes(a.craftTime) - parseCraftWaitMinutes(b.craftTime);
    }

    if (sortMode === 'skill-desc') {
      return parseCraftSkillValue(b.skill) - parseCraftSkillValue(a.skill);
    }

    if (sortMode === 'skill-asc') {
      return parseCraftSkillValue(a.skill) - parseCraftSkillValue(b.skill);
    }

    return 0;
  });

  return sorted;
}

function getCraftRank(craft) {
  return craft.rank || (/^Rank\s+[A-Z]$/i.test(craft.category || '') ? craft.category : '');
}

function getCraftRankOptions(crafts) {
  const rankOrder = ['Rank E', 'Rank D', 'Rank C', 'Rank B', 'Rank A', 'Rank S'];
  const availableRanks = new Set((Array.isArray(crafts) ? crafts : [])
    .map(getCraftRank)
    .filter(Boolean));

  const orderedRanks = rankOrder.filter((rank) => availableRanks.has(rank));
  const extraRanks = [...availableRanks]
    .filter((rank) => !rankOrder.includes(rank))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return [...orderedRanks, ...extraRanks];
}

function renderCraftCards(crafts, options = {}) {
  const {
    limit = 24,
    filterId = 'default',
    placeholder = 'Buscar craft ou ingrediente...',
    showRankFilter = false,
  } = options;
  const searchValue = professionCraftFilters[filterId] || '';
  const sortValue = professionCraftSorts[filterId] || 'default';
  const rankValue = professionCraftRanks[filterId] || '';
  const searchTerm = normalizeText(searchValue);
  const rankOptions = getCraftRankOptions(crafts);
  const filteredCrafts = sortCrafts(
    (Array.isArray(crafts) ? crafts : [])
      .filter((craft) => !rankValue || getCraftRank(craft) === rankValue)
      .filter((craft) => craftMatchesSearch(craft, searchTerm)),
    sortValue,
  );

  if (!Array.isArray(crafts) || !crafts.length) {
    return `
      <div class="profession-craft-filter${showRankFilter ? ' has-rank-filter' : ''}">
        <input type="search" placeholder="${placeholder}" data-craft-filter="${filterId}" value="${searchValue}">
        ${showRankFilter ? `
          <select data-craft-rank="${filterId}" aria-label="Filtrar por rank">
            <option value="">Todos os ranks</option>
            ${rankOptions.map((rank) => `<option value="${rank}"${rankValue === rank ? ' selected' : ''}>${rank}</option>`).join('')}
          </select>
        ` : ''}
        <select data-craft-sort="${filterId}" aria-label="Ordenar crafts">
          <option value="default"${sortValue === 'default' ? ' selected' : ''}>Ordem original</option>
          <option value="name-asc"${sortValue === 'name-asc' ? ' selected' : ''}>Nome A-Z</option>
          <option value="name-desc"${sortValue === 'name-desc' ? ' selected' : ''}>Nome Z-A</option>
          <option value="time-desc"${sortValue === 'time-desc' ? ' selected' : ''}>Tempo: maior para menor</option>
          <option value="time-asc"${sortValue === 'time-asc' ? ' selected' : ''}>Tempo: menor para maior</option>
          <option value="skill-desc"${sortValue === 'skill-desc' ? ' selected' : ''}>Habilidade: maior para menor</option>
          <option value="skill-asc"${sortValue === 'skill-asc' ? ' selected' : ''}>Habilidade: menor para maior</option>
        </select>
      </div>
      <div class="empty-state">Nenhum craft encontrado nesta aba ainda.</div>
    `;
  }

  const visibleCrafts = filteredCrafts.slice(0, limit);
  return `
    <div class="profession-craft-filter${showRankFilter ? ' has-rank-filter' : ''}">
      <input type="search" placeholder="${placeholder}" data-craft-filter="${filterId}" value="${searchValue}">
      ${showRankFilter ? `
        <select data-craft-rank="${filterId}" aria-label="Filtrar por rank">
          <option value="">Todos os ranks</option>
          ${rankOptions.map((rank) => `<option value="${rank}"${rankValue === rank ? ' selected' : ''}>${rank}</option>`).join('')}
        </select>
      ` : ''}
      <select data-craft-sort="${filterId}" aria-label="Ordenar crafts">
        <option value="default"${sortValue === 'default' ? ' selected' : ''}>Ordem original</option>
        <option value="name-asc"${sortValue === 'name-asc' ? ' selected' : ''}>Nome A-Z</option>
        <option value="name-desc"${sortValue === 'name-desc' ? ' selected' : ''}>Nome Z-A</option>
        <option value="time-desc"${sortValue === 'time-desc' ? ' selected' : ''}>Tempo: maior para menor</option>
        <option value="time-asc"${sortValue === 'time-asc' ? ' selected' : ''}>Tempo: menor para maior</option>
        <option value="skill-desc"${sortValue === 'skill-desc' ? ' selected' : ''}>Habilidade: maior para menor</option>
        <option value="skill-asc"${sortValue === 'skill-asc' ? ' selected' : ''}>Habilidade: menor para maior</option>
      </select>
      <span>${filteredCrafts.length} de ${crafts.length} crafts</span>
    </div>
    ${filteredCrafts.length ? `
    <div class="profession-craft-grid">
      ${visibleCrafts.map((craft) => `
        <article class="profession-craft-card">
          <div class="profession-craft-head">
            ${craft.imageUrl ? `<img src="${craft.imageUrl}" alt="${craft.itemName}" loading="lazy">` : ''}
            <div>
              <span class="clan-note">${craft.category || craft.rank || 'Craft'}</span>
              <strong>${craft.itemName}</strong>
              <small>${[craft.skill ? `Habilidade: ${craft.skill}` : '', craft.craftTime ? `Tempo de espera: ${craft.craftTime}` : ''].filter(Boolean).join(' - ')}</small>
            </div>
          </div>
          ${renderCraftIngredientList(craft.ingredients)}
        </article>
      `).join('')}
    </div>
    ${filteredCrafts.length > limit ? `<p class="profession-more-note">Mostrando ${limit} de ${filteredCrafts.length} crafts filtrados.</p>` : ''}
    ` : '<div class="empty-state">Nenhum craft encontrado para esse filtro.</div>'}
  `;
}

function renderProfessionTabs(tabs) {
  return `
    <div class="profession-subtabs" role="tablist" aria-label="Abas da profissao">
      ${tabs.map((tab) => `
        <button
          class="profession-subtab${activeProfessionTab === tab.id ? ' active' : ''}"
          type="button"
          role="tab"
          aria-selected="${activeProfessionTab === tab.id}"
          data-profession-tab="${tab.id}"
        >${tab.label}</button>
      `).join('')}
    </div>
  `;
}

function renderProfessionResourceBlock(title, description) {
  return `
    <section class="profession-info-block">
      <h5>${title}</h5>
      ${Array.isArray(description)
        ? `<ul>${description.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : `<p>${description}</p>`}
    </section>
  `;
}

function renderEngineerProfessionDetail(detail) {
  const mechanic = findProfessionLink(detail, 'mecanico');
  const hacker = findProfessionLink(detail, 'hacker');
  const miniFactory = findProfessionLink(detail, 'mini-ammunition-factory');
  const generalCraftLink = detail.crafts?.[0];
  const tabs = [
    { id: 'overview', label: 'Engenheiro' },
    { id: 'mechanic', label: 'Mecanico' },
    { id: 'hacker', label: 'Hacker' },
    { id: 'mini-factory', label: 'Mini Ammunition Factory' },
    { id: 'general-crafts', label: 'Crafts gerais' },
  ];
  const generalCrafts = getProfessionCrafts('engenheiro', (craft) => !craft.subprofessionSlug && craft.sourcePage !== 'Mini Ammunition Factory');
  const mechanicCrafts = getProfessionCrafts('engenheiro', (craft) => craft.subprofessionSlug === 'mecanico' && craft.category !== 'Mini Ammunition Factory');
  const miniFactoryCrafts = getProfessionCrafts('engenheiro', (craft) => craft.sourcePage === 'Mini Ammunition Factory' || craft.category === 'Mini Ammunition Factory');
  const mechanicHighlights = generalCrafts.filter((craft) => ['mecha-device', 'enhancement-kit'].includes(craft.itemSlug));
  const hackerHighlights = generalCrafts.filter((craft) => ['nightmare-pokegear', 'nintendo-switch'].includes(craft.itemSlug));
  const activeTabExists = tabs.some((tab) => tab.id === activeProfessionTab);

  if (!activeTabExists) {
    activeProfessionTab = 'overview';
  }

  const tabContent = {
    overview: `
      <section class="clan-detail-section">
        <h4>Descricao</h4>
        <p>O Engenheiro e o mestre da tecnologia e producao de objetos mecanicos e eletronicos. O jogador que for engenheiro tera a habilidade de criar varios aparelhos eletronicos para ajudar na sua jornada, principalmente Pok&eacute;bolas que sao essenciais para qualquer treinador Pok&eacute;mon. Em niveis mais avancados, o Engenheiro ainda sera capaz de produzir Pok&eacute;bolas exclusivas e que possuem maior chance de capturar determinados Pok&eacute;mon.</p>
      </section>
      <section class="clan-detail-section">
        <h4>Lucro</h4>
        <p>O principal modo de lucrar como um Engenheiro e vendendo Pok&eacute;bolas, pois, em razao da sua necessidade no jogo, o comercio se torna estavel. Alem disso, engenheiros podem construir eletronicos de decoracao, addons e utilitarios importantes para jogadores experientes, como Smartphone, Health Check, Digital Clock, Duelist Radar, Boss Detector e outros equipamentos sofisticados.</p>
        <p><strong>Obs:</strong> Todos os itens produzidos podem ser vendidos no NPC Machvise que esta na mesma sala do Kurt.</p>
      </section>
      <section class="clan-detail-section">
        <h4>Especializacoes</h4>
        <div class="profession-link-grid">
          ${mechanic ? renderProfessionTabLinkCard({ ...mechanic, kind: 'especializacao' }, 'mechanic') : ''}
          ${hacker ? renderProfessionTabLinkCard({ ...hacker, kind: 'especializacao' }, 'hacker') : ''}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Caracteristicas</h4>
        <div class="profession-link-grid">
          ${miniFactory ? renderProfessionFeatureCard('Mini Ammunition Factory', 'Fabricacao de municoes usadas pelas turrets do Engenheiro.', miniFactory.iconUrl, 'mini-factory', 'sistema') : ''}
          ${renderProfessionFeatureCard('Crafts gerais', 'Crafts da profissao que nao dependem de especializacao, organizados por rank.', generalCraftLink?.iconUrl || detail.iconUrl, 'general-crafts', 'crafts')}
        </div>
      </section>
    `,
    mechanic: `
      <section class="clan-detail-section profession-subdetail">
        ${renderProfessionInternalBack('Engenheiro')}
        <div class="profession-link-head">
          ${mechanic?.iconUrl ? `<img src="${mechanic.iconUrl}" alt="${mechanic.title}" loading="lazy">` : ''}
          <div>
            <span class="clan-note">Especializacao</span>
            <h4>${mechanic?.title || 'Mecanico'}</h4>
          </div>
        </div>
        <p>O mecanico e alguem que possui habilidades e conhecimentos especializados na engenharia mecanica, abrindo espaco para a confeccao de diversos materiais uteis para os jogadores.</p>
        <div class="profession-resource-grid">
          ${renderProfessionResourceBlock('Recurso comum', [
            'Corrupted Iron Ore e compartilhado por Mecanico e Hacker.',
            'E obtido minerando os minerios da Nightmare World com a Pickaxe padrao do Engenheiro ou com a Blacksteel Pickaxe comprada no NPC Dustin.',
            'A Blacksteel Pickaxe coleta o recurso comum mais rapido dentro e fora da Nightmare World.',
            'Esse recurso entra em crafts como moveis tecnologicos, Nightmare Balls e Beast Balls.',
          ])}
          ${renderProfessionResourceBlock('Recurso exclusivo', [
            'Tech Data e o recurso exclusivo do Mecanico.',
            'Ele e obtido estudando criaturas robotizadas espalhadas pelo mapa com o Mechanic Tablet.',
            'O Mechanic Tablet deve ser comprado no NPC Billy depois que o jogador vira Mecanico.',
            'O High-Tech Device pode converter Tech Data em Corrupted Iron Ore.',
          ])}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Crafts Exclusivos</h4>
        <p>Os Mecanicos sao responsaveis pela criacao de itens como Mecha Device, Enhancement Kit e outros equipamentos mecanicos.</p>
        ${renderCraftCards([...mechanicCrafts, ...mechanicHighlights], {
          filterId: 'engineer-mechanic',
          placeholder: 'Buscar craft de Mecanico ou ingrediente...',
        })}
      </section>
    `,
    hacker: `
      <section class="clan-detail-section profession-subdetail">
        ${renderProfessionInternalBack('Engenheiro')}
        <div class="profession-link-head">
          ${hacker?.iconUrl ? `<img src="${hacker.iconUrl}" alt="${hacker.title}" loading="lazy">` : ''}
          <div>
            <span class="clan-note">Especializacao</span>
            <h4>${hacker?.title || 'Hacker'}</h4>
          </div>
        </div>
        <p>O Hacker tem conhecimentos avancados sobre tecnologia e e responsavel por obter informacoes de computadores existentes no Nightmare World.</p>
        <div class="profession-resource-grid">
          ${renderProfessionResourceBlock('Recurso comum', [
            'Corrupted Iron Ore e compartilhado por Hacker e Mecanico.',
            'E obtido nos minerios da Nightmare World com a Pickaxe do Engenheiro ou com a Blacksteel Pickaxe.',
            'A Blacksteel Pickaxe pode ser comprada no NPC Dustin e acelera a coleta do recurso comum.',
          ])}
          ${renderProfessionResourceBlock('Recurso exclusivo', [
            'Crypto Diamond Token e o recurso exclusivo do Hacker.',
            'Ele e obtido estudando computadores do Nightmare World com o Hacker Flash Drive.',
            'O Hacker Flash Drive deve ser comprado no NPC Billy depois de escolher a especializacao.',
            'Computadores possuem recarga de 50 minutos para nova coleta e 1 minuto para religar quando outro Hacker usa.',
            'A cada 5 computadores, o Hacker precisa fazer um minigame para continuar coletando.',
            'Hackers recebem bonus de coleta nos primeiros 80 computadores.',
            'O High-Tech Device pode converter Crypto Diamond Token em Corrupted Iron Ore.',
          ])}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Crafts Exclusivos</h4>
        <p>Os Hackers sao responsaveis pela criacao de itens como Nightmare Pok&eacute;gear, Nintendo Switch e outros dispositivos avancados.</p>
        ${renderCraftCards(getProfessionCrafts('engenheiro', (craft) => craft.subprofessionSlug === 'hacker'), {
          filterId: 'engineer-hacker',
          placeholder: 'Buscar craft de Hacker ou ingrediente...',
        })}
      </section>
    `,
    'mini-factory': `
      <section class="clan-detail-section profession-subdetail">
        ${renderProfessionInternalBack('Engenheiro')}
        <div class="profession-link-head">
          ${miniFactory?.iconUrl ? `<img src="${miniFactory.iconUrl}" alt="${miniFactory.title}" loading="lazy">` : ''}
          <div>
            <span class="clan-note">Turrets</span>
            <h4>Mini Ammunition Factory</h4>
          </div>
        </div>
        <p>O Mini Ammunition Factory e usado para fabricar municao.</p>
        ${miniFactory?.sourceUrl ? `<a class="profession-source-link" href="${miniFactory.sourceUrl}" target="_blank" rel="noreferrer">Abrir pagina da Wiki</a>` : ''}
      </section>
      <section class="clan-detail-section">
        <h4>Municoes das turrets</h4>
        ${renderCraftCards(miniFactoryCrafts, {
          filterId: 'engineer-mini-factory',
          placeholder: 'Buscar municao ou ingrediente...',
        })}
      </section>
    `,
    'general-crafts': `
      <section class="clan-detail-section">
        ${renderProfessionInternalBack('Engenheiro')}
        <h4>Crafts gerais</h4>
        <p>${generalCraftLink?.summary || 'Crafts da profissao que nao dependem de especializacao.'}</p>
        ${generalCraftLink?.sourceUrl ? `<a class="profession-source-link" href="${generalCraftLink.sourceUrl}" target="_blank" rel="noreferrer">Abrir lista completa na Wiki</a>` : ''}
        ${renderCraftCards(generalCrafts, {
          limit: 36,
          filterId: 'engineer-general',
          placeholder: 'Buscar craft geral ou ingrediente...',
          showRankFilter: true,
        })}
      </section>
    `,
  };

  return `
    <div class="profession-tab-panel">
      ${tabContent[activeProfessionTab] || tabContent.overview}
    </div>
  `;
}

function renderProfessorStudents() {
  const groups = professorStudentData.groups.length ? professorStudentData.groups : PROFESSOR_STUDENT_GROUPS;
  const selectedGroup = groups.find((group) => group.clan === activeProfessorStudentClan) || groups[0];

  return `
    <section class="clan-detail-section">
      <h4>Estudantes</h4>
      <p>Os estudantes sao cards de aluno usados pelo Professor. Eles podem realizar missoes e trazer recompensas, com resultados melhores conforme evoluem. O Professor pode manter ate 5 estudantes simultaneamente em missoes.</p>
      <div class="student-filter">
        <label>
          Cla
          <select data-professor-student-clan>
            ${groups.map((group) => `<option value="${group.clan}"${selectedGroup.clan === group.clan ? ' selected' : ''}>${group.clan}</option>`).join('')}
          </select>
        </label>
        <span>${selectedGroup.students.length} alunos</span>
      </div>
      <div class="student-table-wrap">
        <table class="student-table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Level</th>
              <th>Pokemon</th>
            </tr>
          </thead>
          <tbody>
            ${selectedGroup.students.map((student) => `
              <tr>
                <td>
                  <div class="student-card-cell">
                    ${student.iconUrl ? `<img src="${student.iconUrl}" alt="${student.name}" loading="lazy">` : ''}
                    <strong>${student.name}</strong>
                  </div>
                </td>
                <td>${student.level}</td>
                <td>
                  <div class="student-pokemon-list">
                    ${(student.pokemon || []).map((pokemon) => `
                      <span>
                        ${pokemon.iconUrl ? `<img src="${pokemon.iconUrl}" alt="${pokemon.name}" loading="lazy">` : ''}
                        <small>${pokemon.name}</small>
                      </span>
                    `).join('') || '<span class="empty-state">Pokemon nao listados.</span>'}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderProfessorProfessionDetail(detail) {
  const alchemist = findProfessionLink(detail, 'alquimista');
  const academic = findProfessionLink(detail, 'academico');
  const students = findProfessionLink(detail, 'estudantes');
  const philosopherStone = findProfessionLink(detail, 'philosopher-s-stone');
  const generalCraftLink = detail.crafts?.[0];
  const tabs = [
    { id: 'overview', label: 'Professor' },
    { id: 'alchemist', label: 'Alquimista' },
    { id: 'academic', label: 'Academico' },
    { id: 'students', label: 'Estudantes' },
    { id: 'general-crafts', label: 'Crafts gerais' },
  ];
  const generalCrafts = getProfessionCrafts('professor', (craft) => !craft.subprofessionSlug);
  const alchemistCrafts = getProfessionCrafts('professor', (craft) => craft.subprofessionSlug === 'alquimista');
  const academicCrafts = getProfessionCrafts('professor', (craft) => craft.subprofessionSlug === 'academico');
  const activeTabExists = tabs.some((tab) => tab.id === activeProfessionTab);

  if (!activeTabExists) {
    activeProfessionTab = 'overview';
  }

  const tabContent = {
    overview: `
      <section class="clan-detail-section">
        <h4>Descricao</h4>
        <p>Conhecido por ser um estudioso dos Pok&eacute;mon e da Natureza, mas tambem em razao de seus alunos, capazes de realizar missoes especiais sob seu comando. O professor e um amante da natureza e sempre estuda as plantas, produz arbustos estilizados de Pok&eacute;mon e sementes, berries, que possuem efeitos unicos no mundo Pok&eacute;mon.</p>
      </section>
      <section class="clan-detail-section">
        <h4>Lucro</h4>
        <p>No inicio da jornada o Professor nao tera tanta facilidade, mas quando atinge niveis mais altos o lucro se torna muito forte.</p>
        <div class="profession-resource-grid">
          ${renderProfessionResourceBlock('Estudantes', [
            'Ao realizar missoes, estudantes trazem recompensas ao Professor.',
            'Essas recompensas passam a ser mais valiosas quando os estudantes estao em niveis mais altos.',
            'O Professor pode ter no maximo 5 estudantes simultaneos realizando missoes.',
          ])}
          ${renderProfessionResourceBlock('Berries', [
            'Uma plantacao de berries bem controlada pode gerar otimos lucros.',
            'E necessario ter uma casa para planta-las.',
            'Cuidado para nao deixar as berries plantadas por muito tempo, pois elas podem apodrecer e toda a plantacao pode ser perdida.',
          ])}
          ${renderProfessionResourceBlock('Alquimia', [
            'Com conhecimentos de alquimia, o Professor pode construir laboratorio de Boost para Pok&eacute;mon.',
            'Esse caminho permite lucrar bastante com crafts de alto nivel.',
          ])}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Especializacoes</h4>
        <div class="profession-link-grid">
          ${alchemist ? renderProfessionTabLinkCard({ ...alchemist, kind: 'especializacao' }, 'alchemist') : ''}
          ${academic ? renderProfessionTabLinkCard({ ...academic, kind: 'especializacao' }, 'academic') : ''}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Caracteristicas</h4>
        <div class="profession-link-grid">
          ${students ? renderProfessionFeatureCard('Estudantes', 'Cards de aluno, missoes e filtros por cla para consultar os estudantes disponiveis.', students.iconUrl, 'students', 'sistema') : ''}
          ${renderProfessionFeatureCard('Crafts gerais', 'Crafts da profissao que nao dependem de especializacao, organizados por rank.', generalCraftLink?.iconUrl || detail.iconUrl, 'general-crafts', 'crafts')}
        </div>
      </section>
    `,
    alchemist: `
      <section class="clan-detail-section profession-subdetail">
        ${renderProfessionInternalBack('Professor')}
        <div class="profession-link-head">
          ${alchemist?.iconUrl ? `<img src="${alchemist.iconUrl}" alt="${alchemist.title}" loading="lazy">` : ''}
          <div>
            <span class="clan-note">Especializacao</span>
            <h4>${alchemist?.title || 'Alquimista'}</h4>
          </div>
        </div>
        <p>Os Alquimistas sao responsaveis pela criacao de itens muito importantes para jogadores de alto nivel, como Pink Star Piece, Philosopher's Stone, Elixires exclusivos, entre outros.</p>
        <div class="profession-resource-grid">
          ${renderProfessionResourceBlock('Recurso comum', [
            'O recurso base e compartilhado entre Alquimista e Academico.',
            'Com o Tablet, o jogador estuda Darkrai Minions para obter Darkrai Essences.',
            'Tambem e possivel estudar Nightmare Crystals destruidos para obter Black Darkrai Essence.',
            'O Mortar transforma Medicinal Leaves em Crushed Leaves; esse item pode ser usado por qualquer profissao.',
          ])}
          ${renderProfessionResourceBlock('Recurso exclusivo', [
            'Dew Beckers sao coletados com Alchemist Empty Becker em Wet Strange Plants.',
            'As Wet Strange Plants ficam espalhadas pela Nightmare World, especialmente entre cidades e ilhas como Cosmic Island e Lost Island.',
            'Os primeiros 50 recursos coletados no dia recebem bonus de 50%.',
            'Wet Strange Plants possuem cooldown interno de 30 minutos.',
            'Red Darkrai Essence vem de Darkrai Glimpse, criatura que pode aparecer apos certa quantidade de coletas de orvalho.',
            'O High-Tech Device pode transformar Dew Beckers em Darkrai Essences.',
          ])}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Craft Philosopher's Stone</h4>
        <p>${philosopherStone?.summary || 'Craft especial de Alquimista usado para produzir elixires importantes.'}</p>
        ${renderCraftCards(alchemistCrafts.filter((craft) => craft.sourcePage === "Philosopher's Stone" || craft.itemName === "Philosopher's Stone"), {
          filterId: 'professor-alchemist-stone',
          placeholder: 'Buscar craft ou ingrediente...',
        })}
      </section>
      <section class="clan-detail-section">
        <h4>Craft Workshop</h4>
        ${renderCraftCards(alchemistCrafts.filter((craft) => craft.sourcePage !== "Philosopher's Stone" && craft.itemName !== "Philosopher's Stone"), {
          filterId: 'professor-alchemist-workshop',
          placeholder: 'Buscar craft de Alquimista ou ingrediente...',
        })}
      </section>
    `,
    academic: `
      <section class="clan-detail-section profession-subdetail">
        ${renderProfessionInternalBack('Professor')}
        <div class="profession-link-head">
          ${academic?.iconUrl ? `<img src="${academic.iconUrl}" alt="${academic.title}" loading="lazy">` : ''}
          <div>
            <span class="clan-note">Especializacao</span>
            <h4>${academic?.title || 'Academico'}</h4>
          </div>
        </div>
        <p>A especializacao Academico tem como foco os alunos e disponibiliza missoes especiais de academico, permitindo que o jogador colete recursos fora do Nightmare World.</p>
        <div class="profession-resource-grid">
          ${renderProfessionResourceBlock('Recurso comum', [
            'O recurso base e compartilhado entre Academico e Alquimista.',
            'Com o Tablet, o jogador estuda Darkrai Minions para obter Darkrai Essences.',
            'Nightmare Crystals destruidos podem conceder Black Darkrai Essence.',
            'Medicinal Leaves podem ser transformadas em Crushed Leaves usando o Mortar.',
          ])}
          ${renderProfessionResourceBlock('Recurso exclusivo', [
            'Study Notes sao o recurso exclusivo do Academico.',
            'Eles sao obtidos ao concluir missoes especiais pelo Student Monitor.',
            'Cada missao academica concluida concede 20 Study Notes.',
            'E possivel concluir 10 missoes academicas por dia.',
            'O jogador pode substituir missoes academicas 3 vezes por dia.',
            'O High-Tech Device pode transformar Study Notes em Darkrai Essences.',
          ])}
        </div>
      </section>
      <section class="clan-detail-section">
        <h4>Crafts Exclusivos</h4>
        ${renderCraftCards(academicCrafts, {
          filterId: 'professor-academic',
          placeholder: 'Buscar craft de Academico ou ingrediente...',
        })}
      </section>
    `,
    students: `${renderProfessionInternalBack('Professor')}${renderProfessorStudents()}`,
    'general-crafts': `
      <section class="clan-detail-section">
        ${renderProfessionInternalBack('Professor')}
        <h4>Crafts gerais</h4>
        <p>${generalCraftLink?.summary || 'Crafts da profissao que nao dependem de especializacao.'}</p>
        ${generalCraftLink?.sourceUrl ? `<a class="profession-source-link" href="${generalCraftLink.sourceUrl}" target="_blank" rel="noreferrer">Abrir lista completa na Wiki</a>` : ''}
        ${renderCraftCards(generalCrafts, {
          limit: 36,
          filterId: 'professor-general',
          placeholder: 'Buscar craft geral ou ingrediente...',
          showRankFilter: true,
        })}
      </section>
    `,
  };

  return `
    <div class="profession-tab-panel">
      ${tabContent[activeProfessionTab] || tabContent.overview}
    </div>
  `;
}

=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
function renderProfessionDetail(detail) {
  const container = document.getElementById('profession-catalog');
  const toolbar = document.querySelector('.profession-toolbar');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = true;
  }

  container.classList.add('detail-mode');
  container.innerHTML = `
    <article class="clan-detail profession-detail">
      <div class="clan-detail-toolbar">
        <button class="clan-back-button" type="button" data-profession-back>Voltar as profissoes</button>
        <a href="${detail.sourceUrl}" target="_blank" rel="noreferrer">Abrir na Wiki</a>
      </div>
      <div class="profession-detail-header">
        ${detail.iconUrl ? `<img src="${detail.iconUrl}" alt="${detail.name}" loading="lazy">` : ''}
        <div>
          <span class="clan-note">Official wiki sync</span>
          <h3>${detail.name}</h3>
          <p>${detail.summary}</p>
        </div>
      </div>

<<<<<<< HEAD
      ${(detail.slug || slugifyProfessionName(detail.name)) === 'engenheiro' ? renderEngineerProfessionDetail(detail) : ''}
      ${(detail.slug || slugifyProfessionName(detail.name)) === 'professor' ? renderProfessorProfessionDetail(detail) : ''}
      ${!['engenheiro', 'professor'].includes(detail.slug || slugifyProfessionName(detail.name)) ? `
=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
      ${renderProfessionLinkSection('Crafts relacionados', detail.crafts)}
      ${renderProfessionLinkSection('Especializacoes e subprofissoes', detail.specializations)}
      ${renderProfessionLinkSection('Subsecoes', detail.subsections)}

      <section class="clan-detail-section">
        <h4>Secoes da pagina</h4>
        <div class="pill-list">
          ${detail.sections?.length ? detail.sections.map((section) => `<a class="data-pill" href="${detail.sourceUrl}#${section.anchor}" target="_blank" rel="noreferrer">${section.title}</a>`).join('') : '<span class="empty-state">Sem secoes listadas.</span>'}
        </div>
      </section>
<<<<<<< HEAD
      ` : ''}
=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
    </article>
  `;
}

function renderProfessionCatalog() {
  const container = document.getElementById('profession-catalog');
  const toolbar = document.querySelector('.profession-toolbar');
  const searchInput = document.getElementById('profession-search');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = false;
  }

  container.classList.remove('detail-mode');
  const searchTerm = normalizeText(searchInput?.value || '');
  const filteredProfessions = professionData.professions.filter((profession) => {
    const searchable = [
      profession.name,
      profession.summary,
      ...(profession.crafts || []).map((link) => link.title),
      ...(profession.specializations || []).map((link) => link.title),
      ...(profession.subsections || []).map((link) => link.title),
    ].join(' ');

    return !searchTerm || normalizeText(searchable).includes(searchTerm);
  });

  container.innerHTML = `
    ${professionData.intro ? `<p class="profession-intro">${professionData.intro}</p>` : ''}
    <div class="profession-grid">
      ${filteredProfessions.length ? filteredProfessions.map((profession) => `
        <article class="profession-card">
          <button class="profession-card-button" type="button" data-profession-open="${profession.slug || slugifyProfessionName(profession.name)}">
            ${profession.iconUrl ? `<img src="${profession.iconUrl}" alt="${profession.name}" loading="lazy">` : ''}
            <span>
              <strong>${profession.name}</strong>
              <small>${profession.specializations?.length || 0} especializacoes - ${profession.crafts?.length || 0} crafts</small>
            </span>
          </button>
          <p>${profession.summary}</p>
        </article>
      `).join('') : '<div class="empty-state">No professions found for this search.</div>'}
    </div>
<<<<<<< HEAD
=======
    ${professionData.relatedLinks.length ? `
      <section class="clan-detail-section profession-related">
        <h4>Links relacionados</h4>
        <div class="profession-link-grid">
          ${professionData.relatedLinks.map(renderProfessionLinkCard).join('')}
        </div>
      </section>
    ` : ''}
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
  `;
}

function renderProfessionView() {
  if (activeProfessionSlug) {
    const detail = professionData.professions.find((profession) => (profession.slug || slugifyProfessionName(profession.name)) === activeProfessionSlug);

    if (detail) {
      renderProfessionDetail(detail);
      return;
    }
  }

  renderProfessionCatalog();
}

function normalizePokemonPayload(payload) {
  return {
    generations: Array.isArray(payload?.generations) ? payload.generations : [],
    pokemon: Array.isArray(payload?.pokemon) ? payload.pokemon : [],
  };
}

async function loadPokemon() {
  try {
    const response = await fetch('data/pokemon.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Pokemon data request failed with HTTP ${response.status}.`);
    }

    pokemonData = normalizePokemonPayload(await response.json());
    renderPokemonGenerationOptions();
    renderPokemonCatalog();
  } catch (error) {
    console.warn('Pokemon data could not be loaded from data/pokemon.json.', error);
    renderPokemonCatalog();
  }
}

function renderPokemonGenerationOptions() {
  const select = document.getElementById('pokemon-generation-filter');

  if (!select) {
    return;
  }

  const selected = select.value;
  select.innerHTML = '<option value="">All generations</option>';
  pokemonData.generations.forEach((generation) => {
    const option = document.createElement('option');
    option.value = generation;
    option.textContent = generation;
    select.appendChild(option);
  });
  select.value = selected;
}

function renderPokemonTypeList(elements) {
  if (!Array.isArray(elements) || !elements.length) {
    return '<span class="empty-state compact">-</span>';
  }

  return `<div class="pokemon-types">${elements.map(renderTypeLabel).join('')}</div>`;
}

function getFilteredPokemon() {
  const searchTerm = normalizeText(document.getElementById('pokemon-search')?.value || '');
  const generation = document.getElementById('pokemon-generation-filter')?.value || '';

  return pokemonData.pokemon.filter((pokemon) => {
    const dex = pokemon.dex || `#${String(pokemon.dexNumber || '').padStart(3, '0')}`;
    const matchesSearch = !searchTerm || normalizeText(`${dex} ${pokemon.dexNumber} ${pokemon.name}`).includes(searchTerm);
    const matchesGeneration = !generation || pokemon.generation === generation;
    return matchesSearch && matchesGeneration;
  });
}

function renderPokemonCatalog() {
  const container = document.getElementById('pokemon-catalog');

  if (!container) {
    return;
  }

  const pokemon = getFilteredPokemon();
  container.innerHTML = `
    <div class="pokemon-summary-row">
      <strong>${pokemon.length}</strong>
      <span>${pokemon.length === 1 ? 'Pokemon found' : 'Pokemon found'}</span>
    </div>
    <div class="pokemon-table-wrap">
      <table class="result-table pokemon-table">
        <thead>
          <tr>
            <th>Dex</th>
            <th>Pokemon</th>
            <th>Generation</th>
            <th>Elements</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          ${pokemon.length ? pokemon.map((entry) => `
            <tr>
              <td>${entry.dex || `#${String(entry.dexNumber || '').padStart(3, '0')}`}</td>
              <td>
                <span class="pokemon-name-cell">
                  ${entry.spriteUrl ? `<img src="${entry.spriteUrl}" alt="${entry.name}" loading="lazy">` : ''}
                  <span>${entry.name}</span>
                </span>
              </td>
              <td>${entry.generation || '-'}</td>
              <td>${renderPokemonTypeList(entry.elements)}</td>
              <td>${entry.level || '-'}</td>
            </tr>
          `).join('') : '<tr><td colspan="5"><span class="empty-state">No Pokemon found for these filters.</span></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function normalizeItemPayload(payload) {
  return {
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
  };
}

async function loadItems() {
  try {
    const response = await fetch('data/items.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Item data request failed with HTTP ${response.status}.`);
    }

    itemData = normalizeItemPayload(await response.json());
    renderItemView();
  } catch (error) {
    console.warn('Item data could not be loaded from data/items.json.', error);
    renderItemView();
  }
}

function renderItemAttributeList(item) {
  const attributes = Object.entries(item.attributes || {})
    .filter(([, value]) => value)
    .slice(0, 4);

  if (!attributes.length) {
    return '<span class="empty-state compact">-</span>';
  }

  return `
    <div class="item-attribute-list">
      ${attributes.map(([name, value]) => `<span><strong>${name}:</strong> ${value}</span>`).join('')}
    </div>
  `;
}

function renderItemCategoryDetail(category) {
  const container = document.getElementById('item-catalog');
  const toolbar = document.querySelector('.item-toolbar');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = true;
  }

  container.classList.add('detail-mode');
  container.innerHTML = `
    <article class="clan-detail item-detail">
      <div class="clan-detail-toolbar">
        <button class="clan-back-button" type="button" data-item-back>Voltar aos itens</button>
        <a href="${category.sourceUrl}" target="_blank" rel="noreferrer">Abrir na Wiki</a>
      </div>
      <div class="profession-detail-header">
        ${category.iconUrl ? `<img src="${category.iconUrl}" alt="${category.title}" loading="lazy">` : ''}
        <div>
          <span class="clan-note">${category.group}</span>
          <h3>${category.title}</h3>
          <p>${category.summary || 'Loaded from the official wiki.'}</p>
        </div>
      </div>
      <section class="clan-detail-section">
        <h4>Itens</h4>
        <div class="pokemon-table-wrap item-table-wrap">
          <table class="result-table pokemon-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Section</th>
                <th>Description</th>
                <th>Attributes</th>
              </tr>
            </thead>
            <tbody>
              ${category.items?.length ? category.items.map((item) => `
                <tr>
                  <td>
                    <span class="pokemon-name-cell">
                      ${item.iconUrl ? `<img src="${item.iconUrl}" alt="${item.name}" loading="lazy">` : ''}
                      <span>${item.name}</span>
                    </span>
                  </td>
                  <td>${item.section || '-'}</td>
                  <td>${item.description || '-'}</td>
                  <td>${renderItemAttributeList(item)}</td>
                </tr>
              `).join('') : '<tr><td colspan="4"><span class="empty-state">No structured items were found in this category.</span></td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  `;
}

function renderItemCatalog() {
  const container = document.getElementById('item-catalog');
  const toolbar = document.querySelector('.item-toolbar');
  const searchInput = document.getElementById('item-search');

  if (!container) {
    return;
  }

  if (toolbar) {
    toolbar.hidden = false;
  }

  container.classList.remove('detail-mode');
  const searchTerm = normalizeText(searchInput?.value || '');
  const categories = itemData.categories.filter((category) => {
    const searchable = [
      category.title,
      category.group,
      category.summary,
      ...(category.items || []).map((item) => item.name),
    ].join(' ');

    return !searchTerm || normalizeText(searchable).includes(searchTerm);
  });

  container.innerHTML = `
    <div class="item-grid">
      ${categories.length ? categories.map((category) => `
        <article class="profession-card item-card">
          <button class="profession-card-button" type="button" data-item-open="${category.slug}">
            ${category.iconUrl ? `<img src="${category.iconUrl}" alt="${category.title}" loading="lazy">` : ''}
            <span>
              <strong>${category.title}</strong>
              <small>${category.group} - ${category.items?.length || 0} items</small>
            </span>
          </button>
          <p>${category.summary || 'Official wiki category ready for item lookup and future crafts.'}</p>
        </article>
      `).join('') : '<div class="empty-state">No item categories found for this search.</div>'}
    </div>
  `;
}

function renderItemView() {
  if (activeItemCategorySlug) {
    const category = itemData.categories.find((entry) => entry.slug === activeItemCategorySlug);

    if (category) {
      renderItemCategoryDetail(category);
      return;
    }
  }

  renderItemCatalog();
}
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

const clanTypeFilter = document.getElementById('clan-type-filter');
if (clanTypeFilter?.options.length) {
  clanTypeFilter.options[0].textContent = 'All types';
}

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
renderClanView();
renderProfessionView();
renderPokemonCatalog();
renderItemView();
loadClanCatalog();
loadClanDetails();
loadProfessions();
<<<<<<< HEAD
loadCrafts();
loadProfessorStudents();
=======
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
loadPokemon();
loadItems();

document.getElementById('clan-search')?.addEventListener('input', renderClanCatalog);
document.getElementById('clan-type-filter')?.addEventListener('change', renderClanCatalog);
document.getElementById('clan-catalog')?.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const openButton = event.target.closest('[data-clan-open]');
  const backButton = event.target.closest('[data-clan-back]');

  if (openButton) {
    activeClanSlug = openButton.dataset.clanOpen;
    renderClanView();
    document.getElementById('panel-clans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (backButton) {
    activeClanSlug = '';
    renderClanView();
  }
});

document.getElementById('profession-search')?.addEventListener('input', renderProfessionCatalog);
document.getElementById('profession-catalog')?.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const openButton = event.target.closest('[data-profession-open]');
  const backButton = event.target.closest('[data-profession-back]');
<<<<<<< HEAD
  const tabButton = event.target.closest('[data-profession-tab]');
  const craftFilter = event.target.closest('[data-craft-filter]');

  if (openButton) {
    activeProfessionSlug = openButton.dataset.professionOpen;
    activeProfessionTab = 'overview';
=======

  if (openButton) {
    activeProfessionSlug = openButton.dataset.professionOpen;
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
    renderProfessionView();
    document.getElementById('panel-professions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

<<<<<<< HEAD
  if (tabButton) {
    activeProfessionTab = tabButton.dataset.professionTab || 'overview';
    renderProfessionView();
    return;
  }

  if (craftFilter) {
    return;
  }

  if (backButton) {
    activeProfessionSlug = '';
    activeProfessionTab = 'overview';
    renderProfessionView();
  }
});

document.getElementById('profession-catalog')?.addEventListener('input', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const craftFilter = event.target.closest('[data-craft-filter]');
  if (!craftFilter) {
    return;
  }

  professionCraftFilters[craftFilter.dataset.craftFilter || 'default'] = craftFilter.value || '';
  renderProfessionView();
  const nextInput = document.querySelector(`[data-craft-filter="${craftFilter.dataset.craftFilter}"]`);
  nextInput?.focus();
  if (nextInput instanceof HTMLInputElement) {
    nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
  }
});

document.getElementById('profession-catalog')?.addEventListener('change', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const craftSort = event.target.closest('[data-craft-sort]');
  const craftRank = event.target.closest('[data-craft-rank]');
  const studentClan = event.target.closest('[data-professor-student-clan]');

  if (craftSort) {
    professionCraftSorts[craftSort.dataset.craftSort || 'default'] = craftSort.value || 'default';
    renderProfessionView();
    return;
  }

  if (craftRank) {
    professionCraftRanks[craftRank.dataset.craftRank || 'default'] = craftRank.value || '';
    renderProfessionView();
    return;
  }

  if (studentClan) {
    activeProfessorStudentClan = studentClan.value || (professorStudentData.groups[0]?.clan ?? PROFESSOR_STUDENT_GROUPS[0].clan);
=======
  if (backButton) {
    activeProfessionSlug = '';
>>>>>>> 6597e17301dacdc1c3b717d51999074d3cae4642
    renderProfessionView();
  }
});

document.getElementById('pokemon-search')?.addEventListener('input', renderPokemonCatalog);
document.getElementById('pokemon-generation-filter')?.addEventListener('change', renderPokemonCatalog);
document.getElementById('item-search')?.addEventListener('input', renderItemCatalog);
document.getElementById('item-catalog')?.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const openButton = event.target.closest('[data-item-open]');
  const backButton = event.target.closest('[data-item-back]');

  if (openButton) {
    activeItemCategorySlug = openButton.dataset.itemOpen;
    renderItemView();
    document.getElementById('panel-items')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (backButton) {
    activeItemCategorySlug = '';
    renderItemView();
  }
});

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





