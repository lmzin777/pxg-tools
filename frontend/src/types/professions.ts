export type ProfessionSummary = {
  slug: string;
  name: string;
  summary: string;
  iconUrl: string;
  sourceUrl: string;
};

export type ProfessionSection = {
  title: string;
  anchor: string;
  level: number;
};

export type ProfessionLink = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  iconUrl: string;
  sourceUrl: string;
  sections: ProfessionSection[];
};

export type ProfessionDetail = ProfessionSummary & {
  sections: ProfessionSection[];
  crafts: ProfessionLink[];
  specializations: ProfessionLink[];
  subsections: ProfessionLink[];
};

export type ProfessionsOverview = {
  professions: ProfessionSummary[];
  relatedLinks: ProfessionLink[];
};

export type ProfessorStudentPokemon = {
  name: string;
  iconUrl: string;
};

export type ProfessorStudent = {
  name: string;
  level: string | number;
  iconUrl: string;
  pokemon: ProfessorStudentPokemon[];
};

export type ProfessorStudentGroup = {
  clan: string;
  students: ProfessorStudent[];
};

export type ProfessorStudentsPayload = {
  groups: ProfessorStudentGroup[];
};

export type Monument = {
  number: string;
  coordinates: string;
};

export type MonumentGroup = {
  area: string;
  monuments: Monument[];
};

export type MonumentsPayload = {
  sourceUrl: string;
  intro: string;
  groups: MonumentGroup[];
};

export type AdventurerMap = {
  id: string;
  local: string;
  coordinates: string;
  tags: string[];
  imageUrl: string;
};

export type AdventurerMapLocation = {
  name: string;
  maps: AdventurerMap[];
};

export type AdventurerMapType = {
  id: string;
  label: string;
  locations: AdventurerMapLocation[];
};

export type AdventurerMapsPayload = {
  sourceUrl: string;
  mapTypes: AdventurerMapType[];
};
