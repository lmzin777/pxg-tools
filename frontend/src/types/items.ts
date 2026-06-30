export type ItemCategorySummary = {
  slug: string;
  title: string;
  group: string;
  summary: string;
  iconUrl: string;
  sourceUrl: string;
  itemCount: number;
};

export type ItemCategorySection = {
  title: string;
  anchor: string;
  level: number;
};

export type ItemAttribute = {
  name: string;
  value: string;
};

export type ItemSummary = {
  slug: string;
  name: string;
  iconUrl: string;
  description: string;
  section: string;
  table: string;
  sourceUrl: string;
  attributes: ItemAttribute[];
};

export type ItemDetail = ItemSummary & {
  categorySlug: string;
  categoryTitle: string;
  categoryGroup: string;
};

export type ItemCategoryDetail = {
  slug: string;
  title: string;
  group: string;
  summary: string;
  iconUrl: string;
  sourceUrl: string;
  sections: ItemCategorySection[];
  items: ItemSummary[];
};

export type ItemsOverview = {
  categories: ItemCategorySummary[];
};
