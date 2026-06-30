export type WikiDomain = {
  domain: string;
  title: string;
  description: string;
  priority: number;
  sourceUrl: string;
  scraperScript: string;
  loaderScript: string;
  status: string;
  updatedAt: string;
  recordCount: number;
};

export type WikiEntity = {
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  scrapedAt: string;
  metadata: Record<string, string>;
};

export type WikiDomainsOverview = {
  domains: WikiDomain[];
};

export type WikiDomainDetail = WikiDomain & {
  entities: WikiEntity[];
};
