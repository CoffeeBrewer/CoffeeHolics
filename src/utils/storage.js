// src/utils/storage.js

const XP_KEY = "coffeeholics_xp";
const QUESTS_KEY = "coffeeholics_quests";

// Alle skills die we tracken
export const ALL_SKILLS = [
  "brewing",
  "staking",
  "trading",
  "quests",
  "farming",
  "mining",
  "alchemy",
  "luck",
    "wisdom",
];

// Default XP: alles 0
const defaultXPState = ALL_SKILLS.reduce((acc, skill) => {
  acc[skill] = 0;
  return acc;
}, {});

// --- XP ---

export function loadXP() {
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (!raw) return { ...defaultXPState };
    const parsed = JSON.parse(raw);
    return { ...defaultXPState, ...parsed };
  } catch {
    return { ...defaultXPState };
  }
}

export function saveXP(xpState) {
  localStorage.setItem(XP_KEY, JSON.stringify(xpState));
}

export function addXP(rewards) {
  const current = loadXP();
  rewards.forEach(({ skill, xp }) => {
    if (!ALL_SKILLS.includes(skill)) return;
    current[skill] = (current[skill] || 0) + xp;
  });
  saveXP(current);
  return current;
}

// --- Quests ---

// Structuur: { [questId]: { completed: boolean, completedAt: string } }
export function loadQuestState() {
  try {
    const raw = localStorage.getItem(QUESTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveQuestState(state) {
  localStorage.setItem(QUESTS_KEY, JSON.stringify(state));
}

export function markQuestCompleted(questId) {
  const state = loadQuestState();
  if (state[questId]?.completed) return state;

  state[questId] = {
    completed: true,
    completedAt: new Date().toISOString(),
  };

  saveQuestState(state);
  return state;
}

export function isQuestCompleted(questId) {
  const state = loadQuestState();
  return !!state[questId]?.completed;
}
