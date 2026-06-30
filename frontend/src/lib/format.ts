export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function parseSkillValue(skill: string) {
  const match = skill.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function parseCraftTimeMinutes(craftTime: string) {
  const normalized = normalizeText(craftTime).replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;

  const amount = Number(match[1]);
  if (normalized.includes('dia')) return amount * 24 * 60;
  if (normalized.includes('hora')) return amount * 60;
  if (normalized.includes('minuto')) return amount;
  if (normalized.includes('segundo')) return amount / 60;
  return amount;
}

export const rankOrder = ['Rank E', 'Rank D', 'Rank C', 'Rank B', 'Rank A', 'Rank S'];
