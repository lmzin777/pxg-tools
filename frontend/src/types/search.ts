export type SearchResult = {
  type: string;
  title: string;
  slug: string;
  url: string;
  imageUrl: string;
  summary: string;
};

export type SearchOverview = {
  results: SearchResult[];
};
