export type CraftIngredient = {
  name: string;
  itemSlug: string;
  quantity: string;
  iconUrl: string;
};

export type Craft = {
  slug: string;
  itemName: string;
  itemSlug: string;
  imageUrl: string;
  profession: string;
  professionSlug: string;
  subprofession: string;
  subprofessionSlug: string;
  category: string;
  rank: string;
  skill: string;
  craftTime: string;
  requirements: string;
  sourcePage: string;
  sourceUrl: string;
  ingredients: CraftIngredient[];
};

export type CraftsOverview = {
  crafts: Craft[];
};
