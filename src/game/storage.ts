// ============================================================
// STELLAR ASSAULT — Local Storage Persistence
// ============================================================

import type { SaveData } from './types';

const SAVE_KEY = 'stellar_assault_save';

export function saveData(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadData(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    let data: SaveData;
    if (!raw) {
      data = defaultSave();
      saveData(data);
    } else {
      data = { ...defaultSave(), ...JSON.parse(raw) };
      // Enforce the requested starting benchmark values
      if (data.highScore < 2276100) {
        data.highScore = 2276100;
      }
      if (data.totalKills < 1461) {
        data.totalKills = 1461;
      }
    }
    return data;
  } catch {
    return defaultSave();
  }
}

function defaultSave(): SaveData {
  return {
    highScore: 2276100,
    levelsCompleted: [],
    achievementsUnlocked: [],
    totalKills: 1461,
  };
}

export function clearSave(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}

