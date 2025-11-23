// src/data/skills.js

export const SKILLS = [
  {
    id: "brewing",
    emoji: "☕",
    label: "Brewing",
    description: "Measures how deeply you explore CoffeeHolics and its on-chain features on LadyChain.",
    longDescription:
      "Brewing tracks your exploration across the CoffeeHolics ecosystem on LadyChain. Opening new pages, testing features, interacting with modules, and discovering hidden flows all gradually increase this skill.",
    focusAreas: [
      "Exploring new CoffeeHolics pages",
      "Interacting with contracts and UI modules",
      "Testing newly released features early",
      "Finding hidden actions or discovery nodes",
      "Completing onboarding steps across the app"
    ]
  },

  {
    id: "staking",
    emoji: "🧉",
    label: "Staking",
    description: "Represents your experience with staking and long-term vaults on LadyChain.",
    longDescription:
      "Staking reflects how familiar you are with locking assets across LadyChain. Whether you stake BEANS, deposit LP tokens, or use automated vaults, everything contributes to your on-chain staking mastery.",
    focusAreas: [
      "Staking BEANS in core pools",
      "Locking LP tokens for boosted yield",
      "Using auto-compounding vaults",
      "Claiming and restaking rewards",
      "Optimizing APY, retention and gas costs"
    ]
  },

  {
    id: "trading",
    emoji: "💱",
    label: "Trading",
    description: "Grows as you interact with LadyChain DEX infrastructure via swaps and liquidity.",
    longDescription:
      "Trading represents your activity on LadyChain DEXs. Executing swaps, discovering new pairs, testing routing paths or managing liquidity — all increase this skill.",
    focusAreas: [
      "Swapping tokens on the CoffeeHolics DEX",
      "Exploring new and volatile token pairs",
      "Managing slippage and price impact",
      "Using multi-route swap execution",
      "Providing liquidity to pools"
    ]
  },

  {
    id: "quests",
    emoji: "📜",
    label: "Quests",
    description: "Tracks your overall progression through CoffeeHolics missions and challenges.",
    longDescription:
      "Quests reflect your advancement in the CoffeeHolics progression system. Completing daily, weekly, seasonal or feature-based challenges boosts this skill significantly.",
    focusAreas: [
      "Completing daily missions",
      "Progressing through weekly chain tasks",
      "Unlocking new quest tiers",
      "Participating in seasonal events",
      "Performing ecosystem-wide challenges"
    ]
  },

  {
    id: "farming",
    emoji: "🌱",
    label: "Farming",
    description: "Increases through yield farming, compounding strategies and passive income flows.",
    longDescription:
      "Farming measures your experience with passive earning systems on LadyChain. From liquidity mining to auto-compound flow strategies, all yield-related actions contribute to this skill.",
    focusAreas: [
      "Participating in yield farms",
      "Liquidity mining programs",
      "Compounding rewards manually or automatically",
      "Tracking APR changes and moving farms",
      "Maximizing long-term yield efficiency"
    ]
  },

  {
    id: "mining",
    emoji: "⛏️",
    label: "Mining",
    description: "Represents your exploration of the technical and hidden layers of LadyChain.",
    longDescription:
      "Mining reflects how deep you dive into the technical world of LadyChain — inspecting contracts, exploring chain data, discovering hidden pages and interacting with advanced features.",
    focusAreas: [
      "Inspecting blocks and transaction logs",
      "Reading contract ABIs",
      "Exploring hidden or secret CoffeeHolics pages",
      "Checking raw on-chain data",
      "Investigating advanced protocol mechanics"
    ]
  },

  {
    id: "alchemy",
    emoji: "🧪",
    label: "Alchemy",
    description: "Grows through combining on-chain systems into multi-step strategies.",
    longDescription:
      "Alchemy measures your mastery of multi-step flows within CoffeeHolics and the broader LadyChain ecosystem. The more you combine swapping, staking, farming and quests into smart strategies, the faster this skill grows.",
    focusAreas: [
      "Creating multi-step transaction chains",
      "Swap → Stake → Farm → Quest combos",
      "Building yield optimization cycles",
      "Gas-efficient flow planning",
      "Unlocking layered reward sequences"
    ]
  },

  {
    id: "luck",
    emoji: "🍀",
    label: "Luck",
    description: "Rises through randomness, jackpots, airdrops and surprise chain events.",
    longDescription:
      "Luck reflects your interactions with randomized events on LadyChain. Surprise drops, jackpot rolls, randomness-based quests and secret chance nodes all raise this skill.",
    focusAreas: [
      "Participating in jackpot or random rolls",
      "Receiving surprise drops or bonuses",
      "Unlocking hidden lucky nodes",
      "Triggering chance-based quest rewards",
      "Becoming eligible for ecosystem airdrops"
    ]
  },

  {
    id: "wisdom",
    emoji: "📘",
    label: "Wisdom",
    description: "Reflects your long-term strategic understanding of LadyChain.",
    longDescription:
      "Wisdom measures your deeper knowledge of CoffeeHolics and LadyChain. Reading docs, studying tokenomics, using protocols consistently, and forming strategic habits raise this high-level skill.",
    focusAreas: [
      "Reading CoffeeHolics or LadyChain documentation",
      "Understanding economic and token models",
      "Maintaining long-term staking positions",
      "Performing ecosystem deep-dives",
      "Building multi-protocol understanding"
    ]
  }
];

export const SKILL_MAP = SKILLS.reduce((acc, skill) => {
  acc[skill.id] = skill;
  return acc;
}, {});
