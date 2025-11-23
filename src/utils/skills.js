// src/utils/skills.js
import { loadXP, ALL_SKILLS } from "./storage";

// Hoeveel levels je wilt ondersteunen
export const MAX_LEVEL = 60;

// XP_TABLE[level] = totale XP die je nodig hebt om dat level te bereiken
// index 0 wordt niet gebruikt
function buildXpTable() {
  const table = [0]; // level 0 dummy
  let cumulative = 0;

  for (let level = 1; level <= MAX_LEVEL; level++) {
    // Je kunt deze formule tweaken voor snellere/langzamere progression
    const neededForThisLevel = Math.floor(30 * Math.pow(1.18, level - 1));
    cumulative += neededForThisLevel;
    table[level] = cumulative;
  }

  return table;
}

export const XP_TABLE = buildXpTable();

// Geef het level dat hoort bij een bepaalde hoeveelheid XP
export function getLevelFromXP(xp) {
  if (xp <= 0) return 1;

  let level = 1;
  for (let i = 1; i <= MAX_LEVEL; i++) {
    if (xp >= XP_TABLE[i]) {
      level = i;
    } else {
      break;
    }
  }
  return level;
}

// Totale XP drempel voor een bepaald level
export function getXPThresholdForLevel(level) {
  if (level <= 1) return 0;
  if (level >= MAX_LEVEL) return XP_TABLE[MAX_LEVEL];
  return XP_TABLE[level];
}

// Alle stats voor één skill op basis van zijn XP
export function getSkillStatsForXP(xpValue) {
  const xp = Math.max(0, xpValue || 0);
  const level = getLevelFromXP(xp);
  const currentFloor = getXPThresholdForLevel(level);
  const nextLevel = Math.min(MAX_LEVEL, level + 1);
  const nextFloor =
    level >= MAX_LEVEL ? currentFloor : getXPThresholdForLevel(nextLevel);

  const intoLevel = xp - currentFloor;
  const neededForNext = nextFloor - currentFloor || 1;
  const progress =
    level >= MAX_LEVEL ? 1 : Math.min(1, Math.max(0, intoLevel / neededForNext));

  return {
    level,
    xp,
    currentLevelFloor: currentFloor,
    nextLevelFloor: nextFloor,
    xpIntoLevel: intoLevel,
    xpNeededForNext: neededForNext,
    progress, // 0–1
    isMaxLevel: level >= MAX_LEVEL,
  };
}

// Full snapshot van alle skills (handig in components)
export function getAllSkillStats() {
  const xpState = loadXP();

  return ALL_SKILLS.map((id) => {
    const stats = getSkillStatsForXP(xpState[id] || 0);
    return {
      id,
      ...stats,
    };
  });
}
