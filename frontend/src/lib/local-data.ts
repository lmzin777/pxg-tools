import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type {
  AdventurerMapsPayload,
  MonumentsPayload,
  ProfessorStudentsPayload,
} from '@/types/professions';

const ROOT_DIR = resolve(process.cwd(), '..');

async function readDataFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(resolve(ROOT_DIR, 'data', fileName), 'utf8');
    return JSON.parse(content.replace(/^\uFEFF/, '')) as T;
  } catch {
    return fallback;
  }
}

export function getProfessorStudentsData() {
  return readDataFile<ProfessorStudentsPayload>('professor-students.json', { groups: [] });
}

export function getMonumentsData() {
  return readDataFile<MonumentsPayload>('monuments.json', {
    sourceUrl: '',
    intro: '',
    groups: [],
  });
}

export function getAdventurerMapsData() {
  return readDataFile<AdventurerMapsPayload>('adventurer-maps.json', {
    sourceUrl: '',
    mapTypes: [],
  });
}
