import { normalizeText } from '@/lib/format';
import type { Craft } from '@/types/crafts';
import type { ItemCategoryDetail, ItemSummary } from '@/types/items';
import type { PokemonDetail } from '@/types/pokemon';
import type { ProfessionDetail } from '@/types/professions';

export type RelatedProfession = {
  name: string;
  slug: string;
  subprofession?: string;
  subprofessionSlug?: string;
};

export function matchesEntity(value: string | undefined, slug: string | undefined, name: string | undefined) {
  const normalizedValue = normalizeText(value || '');
  const normalizedSlug = normalizeText(slug || '');
  const normalizedName = normalizeText(name || '');

  return Boolean(
    normalizedValue &&
      ((normalizedSlug && normalizedValue === normalizedSlug) ||
        (normalizedName && normalizedValue === normalizedName) ||
        (normalizedName && normalizedValue.includes(normalizedName)) ||
        (normalizedValue && normalizedName.includes(normalizedValue))),
  );
}

export function findCraftsCreatingItem(crafts: Craft[], item: { slug?: string; name?: string }) {
  return crafts.filter((craft) => matchesEntity(craft.itemSlug || craft.itemName, item.slug, item.name));
}

export function findCraftsUsingItem(crafts: Craft[], item: { slug?: string; name?: string }) {
  return crafts.filter((craft) =>
    craft.ingredients.some((ingredient) => matchesEntity(ingredient.itemSlug || ingredient.name, item.slug, item.name)),
  );
}

export function findProfessionsForItem(crafts: Craft[], item: { slug?: string; name?: string }): RelatedProfession[] {
  const related = [...findCraftsCreatingItem(crafts, item), ...findCraftsUsingItem(crafts, item)];
  const byKey = new Map<string, RelatedProfession>();

  for (const craft of related) {
    const key = `${craft.professionSlug}:${craft.subprofessionSlug || 'general'}`;
    byKey.set(key, {
      name: craft.profession,
      slug: craft.professionSlug,
      subprofession: craft.subprofession || undefined,
      subprofessionSlug: craft.subprofessionSlug || undefined,
    });
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function flattenItems(category: ItemCategoryDetail): ItemSummary[] {
  return category.items;
}

export function findItemsForCraft(category: ItemCategoryDetail, craft: Craft) {
  return flattenItems(category).filter((item) =>
    matchesEntity(item.slug || item.name, craft.itemSlug, craft.itemName) ||
    craft.ingredients.some((ingredient) => matchesEntity(item.slug || item.name, ingredient.itemSlug, ingredient.name)),
  );
}

export function findCraftsForPokemonMaterials(pokemon: PokemonDetail, crafts: Craft[]) {
  const materialNames = [pokemon.material, pokemon.evolutionStone, pokemon.boost]
    .flatMap((value) => splitMaterialText(value))
    .filter(Boolean);

  const bySlug = new Map<string, Craft>();
  for (const material of materialNames) {
    for (const craft of findCraftsUsingItem(crafts, { name: material })) {
      bySlug.set(craft.slug, craft);
    }
  }

  return [...bySlug.values()];
}

export function findSimilarCrafts(craft: Craft, crafts: Craft[]) {
  return crafts
    .filter((candidate) => candidate.slug !== craft.slug)
    .filter((candidate) =>
      candidate.professionSlug === craft.professionSlug &&
      (candidate.subprofessionSlug === craft.subprofessionSlug ||
        candidate.category === craft.category ||
        candidate.rank === craft.rank),
    )
    .slice(0, 6);
}

function splitMaterialText(value: string) {
  return value
    .split(/[,;/+]| e | ou /i)
    .map((part) => part.replace(/\(.+?\)/g, '').trim())
    .filter((part) => part.length > 2 && normalizeText(part) !== 'nao listado');
}
