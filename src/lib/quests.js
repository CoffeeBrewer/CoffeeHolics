// src/lib/quests.js

// Each quest:
// - id: string (unique, kebab-case)
// - emoji: visual marker
// - name: quest title
// - category: main skill or theme
// - description: what the player should do (lore only; logic is elsewhere)
// - rewards: array of { skill: string, xp: number }
// - difficulty: "Easy" | "Medium" | "Hard" | "Elite"

export const QUESTS = [
  // =========================
  // ONBOARDING / CORE FLOW
  // =========================

  {
    id: "brewing-first-brew",
    emoji: "☕",
    name: "First Brew on LadyChain",
    category: "Brewing",
    description:
      "Open CoffeeHolics on LadyChain and visit at least two core sections, such as Home, Skills, Quests or Swap.",
    rewards: [
      { skill: "brewing", xp: 50 },
      { skill: "quests", xp: 20 }
    ],
    difficulty: "Easy"
  },

  {
    id: "brewing-full-tour",
    emoji: "🧭",
    name: "Café Full Tour",
    category: "Brewing",
    description:
      "In a single session, open Home → Skills → Quests → Swap to complete a full CoffeeHolics tour.",
    rewards: [
      { skill: "brewing", xp: 80 },
      { skill: "wisdom", xp: 30 }
    ],
    difficulty: "Medium"
  },

  {
    id: "brewing-feature-explorer",
    emoji: "🔍",
    name: "Feature Explorer",
    category: "Brewing",
    description:
      "Try a brand-new CoffeeHolics feature within a few days of it going live on LadyChain.",
    rewards: [
      { skill: "brewing", xp: 120 },
      { skill: "alchemy", xp: 40 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // STAKING
  // =========================

  {
    id: "staking-first-deposit",
    emoji: "🧉",
    name: "Stake Your First BEANS",
    category: "Staking",
    description:
      "Open the Stake Beans page and lock any amount of BEANS into a staking pool on LadyChain.",
    rewards: [
      { skill: "staking", xp: 80 },
      { skill: "brewing", xp: 30 }
    ],
    difficulty: "Easy"
  },

  {
    id: "staking-compound-loop",
    emoji: "♻️",
    name: "Compound Loop",
    category: "Staking",
    description:
      "Claim staking rewards and immediately restake them in the same session to build a compounding loop.",
    rewards: [
      { skill: "staking", xp: 120 },
      { skill: "farming", xp: 60 }
    ],
    difficulty: "Medium"
  },

  {
    id: "staking-long-hold",
    emoji: "⏳",
    name: "Long-Term Holder",
    category: "Staking",
    description:
      "Keep a staking position open across multiple days on LadyChain without fully exiting the pool.",
    rewards: [
      { skill: "staking", xp: 160 },
      { skill: "wisdom", xp: 80 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // TRADING
  // =========================

  {
    id: "trading-first-swap",
    emoji: "💱",
    name: "First Swap Brew",
    category: "Trading",
    description:
      "Execute your first token swap using the CoffeeHolics DEX on LadyChain.",
    rewards: [
      { skill: "trading", xp: 70 },
      { skill: "brewing", xp: 25 }
    ],
    difficulty: "Easy"
  },

  {
    id: "trading-pair-hunter",
    emoji: "🧾",
    name: "Pair Hunter",
    category: "Trading",
    description:
      "Swap into a token pair you haven’t traded before within the CoffeeHolics interface.",
    rewards: [
      { skill: "trading", xp: 110 },
      { skill: "mining", xp: 40 }
    ],
    difficulty: "Medium"
  },

  {
    id: "trading-liquidity-provider",
    emoji: "🌊",
    name: "Liquidity Provider",
    category: "Trading",
    description:
      "Provide liquidity to a LadyChain pool that is surfaced inside CoffeeHolics or its partner UI.",
    rewards: [
      { skill: "trading", xp: 140 },
      { skill: "farming", xp: 80 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // QUESTS / META PROGRESSION
  // =========================

  {
    id: "quests-daily-streak",
    emoji: "🔥",
    name: "Daily Ritual",
    category: "Quests",
    description:
      "Complete at least one CoffeeHolics quest on two different days in a row.",
    rewards: [
      { skill: "quests", xp: 100 },
      { skill: "luck", xp: 40 }
    ],
    difficulty: "Medium"
  },

  {
    id: "quests-weekly-grind",
    emoji: "📆",
    name: "Weekly Grind",
    category: "Quests",
    description:
      "Complete at least five different quests within a single week on LadyChain.",
    rewards: [
      { skill: "quests", xp: 160 },
      { skill: "brewing", xp: 60 }
    ],
    difficulty: "Hard"
  },

  {
    id: "quests-season-opener",
    emoji: "🎟️",
    name: "Season Opener",
    category: "Quests",
    description:
      "Finish any special event or seasonal quest chain when a new CoffeeHolics season starts.",
    rewards: [
      { skill: "quests", xp: 220 },
      { skill: "wisdom", xp: 80 }
    ],
    difficulty: "Elite"
  },

  // =========================
  // FARMING
  // =========================

  {
    id: "farming-first-yield",
    emoji: "🌱",
    name: "First Yield Sprout",
    category: "Farming",
    description:
      "Join a yield farm on LadyChain and claim your very first farming rewards.",
    rewards: [
      { skill: "farming", xp: 90 },
      { skill: "staking", xp: 40 }
    ],
    difficulty: "Easy"
  },

  {
    id: "farming-rotation",
    emoji: "🔄",
    name: "Farm Rotation",
    category: "Farming",
    description:
      "Exit a low-yield farm and move your liquidity or stake to a better opportunity on LadyChain.",
    rewards: [
      { skill: "farming", xp: 130 },
      { skill: "wisdom", xp: 60 }
    ],
    difficulty: "Medium"
  },

  {
    id: "farming-long-season",
    emoji: "🌾",
    name: "Seasonal Harvester",
    category: "Farming",
    description:
      "Maintain at least one active farming or yield position across an entire CoffeeHolics season.",
    rewards: [
      { skill: "farming", xp: 180 },
      { skill: "staking", xp: 80 },
      { skill: "wisdom", xp: 60 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // MINING (EXPLORATION / TECH)
  // =========================

  {
    id: "mining-chain-explorer",
    emoji: "⛏️",
    name: "Chain Explorer",
    category: "Mining",
    description:
      "Open a LadyChain block explorer from CoffeeHolics and inspect at least one transaction in detail.",
    rewards: [
      { skill: "mining", xp: 80 },
      { skill: "wisdom", xp: 40 }
    ],
    difficulty: "Easy"
  },

  {
    id: "mining-secret-entrance",
    emoji: "🚪",
    name: "Secret Entrance",
    category: "Mining",
    description:
      "Discover a hidden, non-obvious page or interaction flow inside the CoffeeHolics app.",
    rewards: [
      { skill: "mining", xp: 140 },
      { skill: "brewing", xp: 60 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // ALCHEMY (COMBOS)
  // =========================

  {
    id: "alchemy-basic-combo",
    emoji: "🧪",
    name: "Basic On-Chain Combo",
    category: "Alchemy",
    description:
      "In a single session, perform a flow like Swap → Stake → Complete a quest using CoffeeHolics.",
    rewards: [
      { skill: "alchemy", xp: 120 },
      { skill: "trading", xp: 60 },
      { skill: "staking", xp: 60 }
    ],
    difficulty: "Medium"
  },

  {
    id: "alchemy-yield-chain",
    emoji: "🧬",
    name: "Yield Chain",
    category: "Alchemy",
    description:
      "Execute a multi-step sequence on LadyChain involving a swap, a farming pool, and at least one quest.",
    rewards: [
      { skill: "alchemy", xp: 180 },
      { skill: "farming", xp: 80 },
      { skill: "quests", xp: 60 }
    ],
    difficulty: "Hard"
  },

  // =========================
  // LUCK
  // =========================

  {
    id: "luck-first-surprise",
    emoji: "✨",
    name: "First Surprise",
    category: "Luck",
    description:
      "Trigger any randomized or surprise-style reward inside CoffeeHolics or a linked LadyChain module.",
    rewards: [
      { skill: "luck", xp: 90 },
      { skill: "brewing", xp: 30 }
    ],
    difficulty: "Easy"
  },

  {
    id: "luck-jackpot-shot",
    emoji: "🎰",
    name: "Jackpot Shot",
    category: "Luck",
    description:
      "Participate in any jackpot, roll, lootbox or similar chance-based mechanic tied to CoffeeHolics.",
    rewards: [
      { skill: "luck", xp: 140 },
      { skill: "alchemy", xp: 60 }
    ],
    difficulty: "Medium"
  },

  // =========================
  // WISDOM
  // =========================

  {
    id: "wisdom-read-the-docs",
    emoji: "📘",
    name: "Read the Docs",
    category: "Wisdom",
    description:
      "Open the CoffeeHolics or LadyChain documentation from within the app and spend time browsing key sections.",
    rewards: [
      { skill: "wisdom", xp: 120 },
      { skill: "brewing", xp: 40 }
    ],
    difficulty: "Easy"
  },

  {
    id: "wisdom-tokenomics-dive",
    emoji: "📊",
    name: "Tokenomics Deep Dive",
    category: "Wisdom",
    description:
      "Study the BEANS or CoffeeHolics token model and use that understanding to adjust how you interact on LadyChain.",
    rewards: [
      { skill: "wisdom", xp: 180 },
      { skill: "staking", xp: 80 },
      { skill: "farming", xp: 60 }
    ],
    difficulty: "Hard"
  }
];
