// src/pages/Skills.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SKILLS } from "../lib/skills";
import { loadXP, loadQuestState } from "../utils/storage";
import { getSkillStatsForXP } from "../utils/skills";
import WorldMap from "../assets/WorldMap.png";
import { QUESTS } from "../lib/quests";

// Achievements specifiek voor Brewing
const BREWING_ACHIEVEMENTS = [
  { level: 3, label: "Warm-Up Brewer", hint: "Reach Brewing level 3." },
  { level: 7, label: "Consistent Pour", hint: "Reach Brewing level 7." },
  { level: 12, label: "Signature Recipe", hint: "Reach Brewing level 12." },
  { level: 20, label: "Master Brewer", hint: "Reach Brewing level 20." },
];

export default function Skills() {
  const nav = useNavigate();

  // XP vanuit shared storage
  const [xp, setXp] = useState(() => loadXP());

  // Welke skill is actief (aangeklikt)
  const [activeSkillId, setActiveSkillId] = useState(null);

  // Quest-state voor completed-status
  const [questState, setQuestState] = useState(() => {
    try {
      return loadQuestState ? loadQuestState() : {};
    } catch {
      return {};
    }
  });

  const totalXP = Object.values(xp).reduce((sum, val) => sum + (val || 0), 0);

  // Luister naar localStorage-wijzigingen (XP + quests)
  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key) return;

      if (event.key.startsWith("coffeeholics_xp")) {
        setXp(loadXP());
      }

      if (event.key.startsWith("coffeeholics_quests") && loadQuestState) {
        try {
          setQuestState(loadQuestState());
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
 
  // Total level = som van levels van alle skills
  const totalLevel = useMemo(
    () =>
      SKILLS.reduce((sum, skill) => {
        const stats = getSkillStatsForXP(xp[skill.id] || 0);
        return sum + stats.level;
      }, 0),
    [xp]
  );

  // Suggested actions per skill (buttons in detailpanel)
  const getSkillActions = (id) => {
    switch (id) {
      case "brewing":
        return [
          { label: "Open Home", path: "/" },
          { label: "View Skills", path: "/skills" },
        ];
      case "staking":
        return [
          { label: "Go to Stake Beans", path: "/stake-beans" },
          { label: "See Quests", path: "/quests" },
        ];
      case "trading":
        return [
          { label: "Open Swap", path: "/swap" },
          { label: "See Quests", path: "/quests" },
        ];
      case "quests":
        return [{ label: "Open Quest Log", path: "/quests" }];
      case "farming":
        return [
          { label: "Check Stake Beans", path: "/stake-beans" },
          { label: "See Quests", path: "/quests" },
        ];
      case "mining":
        return [{ label: "Explore CoffeeHolics", path: "/" }];
      case "alchemy":
        return [
          { label: "Swap + Stake Combo", path: "/swap" },
          { label: "Stake Beans", path: "/stake-beans" },
        ];
      case "luck":
        return [{ label: "Check Quests", path: "/quests" }];
      case "wisdom":
        return [
          { label: "Explore CoffeeHolics", path: "/" },
          { label: "Open Quest Log", path: "/quests" },
        ];
      default:
        return [];
    }
  };

  const activeSkill =
    activeSkillId && SKILLS.find((s) => s.id === activeSkillId);
  const activeStats =
    activeSkill && getSkillStatsForXP(xp[activeSkill.id] || 0);
  const activeActions = activeSkill ? getSkillActions(activeSkill.id) : [];

  // Alle quests die XP geven voor de actieve skill
  const relatedQuestsRaw =
    activeSkill
      ? QUESTS.filter(
          (q) =>
            Array.isArray(q.rewards) &&
            q.rewards.some((r) => r.skill === activeSkill.id)
        )
      : [];

  // per quest: reward voor deze skill + completed-flag
  const relatedQuests = relatedQuestsRaw.map((q) => {
    const rewardForThisSkill =
      q.rewards.find((r) => r.skill === activeSkill.id) || null;
    const completed = !!questState?.[q.id]?.completed;
    return {
      quest: q,
      rewardForThisSkill,
      completed,
    };
  });

  // Recommended next quest (nog niet completed, hoogste XP voor deze skill)
  const recommendedQuestEntry =
    relatedQuests
      .filter((rq) => rq.rewardForThisSkill && !rq.completed)
      .sort(
        (a, b) =>
          (b.rewardForThisSkill?.xp || 0) -
          (a.rewardForThisSkill?.xp || 0)
      )[0] || null;

  return (
    <div className="stats-page">
      {/* ============= HERO / HEADER ============= */}
<section className="skills-hero-upgraded">
  <div className="skills-hero-up-inner">
    
    <div className="skills-hero-title-row">
      <div className="skills-hero-icon">⚡</div>
      <h2 className="skills-hero-up-title">Skills Module</h2>
    </div>

    <div className="skills-hero-stats">
      <div className="skills-hero-stat">
        Total Level <span>{totalLevel}</span>
      </div>
      <div className="skills-hero-stat">
        Total XP <span>{totalXP.toLocaleString()}</span>
      </div>
    </div>

    <p className="skills-hero-up-desc">
      Your on-chain progression across LadyChain.
      Every swap, stake, quest, farm action and discovery contributes  
      to your CoffeeHolics profile.
    </p>
  </div>
</section>



      {/* ============= SKILLS GRID ============= */}
      <section>
        <div className="skills-grid-compact">
          {SKILLS.map((skill) => {
            const stats = getSkillStatsForXP(xp[skill.id] || 0);
            const isActive = activeSkillId === skill.id;

            return (
              <button
                type="button"
                key={skill.id}
                className={
                  "skill-tile skill-tile-clickable" +
                  (isActive ? " skill-tile--active" : "")
                }
                onClick={() =>
                  setActiveSkillId(isActive ? null : skill.id)
                }
              >
                <div className="skill-icon">{skill.emoji}</div>

                <div className="skill-meta">
                  <div className="skill-row">
                    <div className="skill-name">{skill.label}</div>
                    <div className="skill-lvl">Lvl {stats.level}</div>
                  </div>

                  {skill.description && (
                    <div className="skill-desc">{skill.description}</div>
                  )}

                  <div className="skill-bar">
                    <div
                      className="skill-bar-fill"
                      style={{ width: `${stats.progress * 100}%` }}
                    />
                  </div>

                  <div className="skill-xp">
                    {Math.max(0, Math.floor(stats.xpIntoLevel)).toLocaleString()}{" "}
                    / {Math.floor(stats.xpNeededForNext).toLocaleString()} XP
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

            {/* ============= DETAILPANEL ACTIEVE SKILL (COHERENT + WOW) ============= */}
      {activeSkill && activeStats && (
        <section className="card skill-detail-card">
          {/* TOP: icon + title + pills + level ring + metrics */}
          <div className="skill-detail-top">
            <div className="skill-detail-top-left">
              <div className="skill-detail-icon">{activeSkill.emoji}</div>

              <div className="skill-detail-heading">
                <div className="skill-detail-pill-row">
                  <span className="skill-detail-pill">Active skill</span>
                  <span className="skill-detail-pill skill-detail-pill-id">
                    {activeSkill.label}
                  </span>
                </div>

                <h3 className="skill-detail-title">
                  {activeSkill.label} · Lvl {activeStats.level}
                </h3>

                <p className="skill-detail-sub">
                  {activeSkill.longDescription || activeSkill.description}
                </p>
              </div>
            </div>

            <div className="skill-detail-top-right">
              <div
                className="skill-detail-level-ring"
                style={{
                  "--level-deg": `${
                    (activeStats.isMaxLevel ? 1 : activeStats.progress) * 360
                  }deg`,
                }}
              >
                <div className="skill-detail-level-inner">
                  <span className="skill-detail-level-label">Lvl</span>
                  <span className="skill-detail-level-value">
                    {activeStats.level}
                  </span>
                </div>
              </div>

              <div className="skill-detail-top-metrics">
                <div className="skill-detail-xp-mini">
                  <span className="skill-detail-xp-mini-label">Total XP</span>
                  <span className="skill-detail-xp-mini-value">
                    {activeStats.xp.toLocaleString()}
                  </span>
                </div>

                {!activeStats.isMaxLevel && (
                  <div className="skill-detail-xp-mini">
                    <span className="skill-detail-xp-mini-label">
                      To next level
                    </span>
                    <span className="skill-detail-xp-mini-value">
                      {activeStats.xpNeededForNext.toLocaleString()} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE: 2 kolommen - left = progression, right = quests */}
          <div className="skill-detail-body-grid">
            {/* LEFT: progression / milestones / focus */}
            <div className="skill-detail-section">
              <div className="skill-detail-section-label">
                Progress & mastery
              </div>

              {/* Brewing heeft z'n eigen achievements + focus */}
              {activeSkill.id === "brewing" ? (
                <div className="skill-detail-brewing-extra">
                  <div className="skill-detail-brewing-columns">
                    <div className="skill-detail-brewing-col">
                      <div className="skill-detail-subheading">
                        Brewing milestones
                      </div>
                      <ul className="skill-detail-achievements">
                        {BREWING_ACHIEVEMENTS.map((ach) => {
                          const reached = activeStats.level >= ach.level;
                          return (
                            <li
                              key={ach.level}
                              className={
                                "skill-detail-achievement" +
                                (reached
                                  ? " skill-detail-achievement--reached"
                                  : "")
                              }
                            >
                              <span className="skill-detail-ach-badge">
                                {reached ? "✓" : ach.level}
                              </span>
                              <div className="skill-detail-ach-text">
                                <div className="skill-detail-ach-title">
                                  {ach.label}
                                </div>
                                <div className="skill-detail-ach-hint">
                                  {ach.hint}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {Array.isArray(activeSkill.focusAreas) &&
                      activeSkill.focusAreas.length > 0 && (
                        <div className="skill-detail-brewing-col">
                          <div className="skill-detail-subheading">
                            How to grow Brewing
                          </div>
                          <ul className="skill-detail-focus">
                            {activeSkill.focusAreas.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                /* Voor andere skills: gewoon focusAreas netjes tonen */
                Array.isArray(activeSkill.focusAreas) &&
                activeSkill.focusAreas.length > 0 && (
                  <div className="skill-detail-generic-focus">
                    <ul className="skill-detail-focus">
                      {activeSkill.focusAreas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>

            {/* RIGHT: quests + recommended */}
            {relatedQuests.length > 0 && (
              <div className="skill-detail-section">
                <div className="skill-detail-section-label">
                  Quests for this skill
                </div>

                {recommendedQuestEntry && (
                  <div className="skill-detail-recommended">
                    <div className="skill-detail-recommended-label">
                      Recommended next quest
                    </div>
                    <div className="skill-detail-recommended-body">
                      <div className="skill-detail-recommended-main">
                        <span className="skill-detail-quest-emoji">
                          {recommendedQuestEntry.quest.emoji}
                        </span>
                        <div className="skill-detail-quest-text">
                          <div className="skill-detail-quest-name">
                            {recommendedQuestEntry.quest.name}
                          </div>
                          <div className="skill-detail-quest-desc">
                            {recommendedQuestEntry.quest.description}
                          </div>
                        </div>
                      </div>
                      {recommendedQuestEntry.rewardForThisSkill && (
                        <div className="skill-detail-quest-right">
                          <div className="skill-detail-quest-reward">
                            +{recommendedQuestEntry.rewardForThisSkill.xp} XP
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="skill-detail-quests-list skill-detail-quests-list-scroll">
                  {relatedQuests.map(
                    ({ quest, rewardForThisSkill, completed }) => (
                      <div
                        key={quest.id}
                        className={
                          "skill-detail-quest-item" +
                          (completed
                            ? " skill-detail-quest-item--completed"
                            : "")
                        }
                      >
                        <div className="skill-detail-quest-main">
                          <span className="skill-detail-quest-emoji">
                            {quest.emoji}
                          </span>
                          <div className="skill-detail-quest-text">
                            <div className="skill-detail-quest-name">
                              {quest.name}
                            </div>
                            <div className="skill-detail-quest-desc">
                              {quest.description}
                            </div>
                          </div>
                        </div>

                        <div className="skill-detail-quest-right">
                          {rewardForThisSkill && (
                            <div className="skill-detail-quest-reward">
                              +{rewardForThisSkill.xp} XP
                            </div>
                          )}
                          {completed && (
                            <div className="skill-detail-quest-status">
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => nav("/quests")}
                  style={{ marginTop: "0.6rem" }}
                >
                  View all quests
                </button>
              </div>
            )}
          </div>

          {/* BOTTOM: suggested actions */}
          {activeActions.length > 0 && (
            <div className="skill-detail-footer">
              <div className="skill-detail-actions">
                <div className="skill-detail-actions-label">
                  Suggested actions on LadyChain
                </div>
                <div className="skill-detail-actions-row">
                  {activeActions.map((act) => (
                    <button
                      key={act.label}
                      className="btn btn-primary btn-sm skill-detail-action-btn"
                      onClick={() => nav(act.path)}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}


      {/* ============= WORLD MAP ============= */}
      {/* 
      <section className="card worldmap-card">
        <h3 className="worldmap-title">LadyChain Skill World</h3>
        <img
          src={WorldMap}
          alt="CoffeeHolics Skill World Map"
          className="worldmap-img"
        />
      </section> 
      */}

      {/* ============= EXTRA UITLEG ============= */}
      <section className="card">
        <div className="section-title">How to level up on LadyChain</div>

        <p className="section-sub">
          CoffeeHolics blends cozy gameplay with real on-chain actions.
          XP is earned by using LadyChain protocols and interacting with the
          CoffeeHolics ecosystem.
        </p>

        <ul className="section-list">
          <li>
            <b>Brewing</b> – boosted by using CoffeeHolics features, opening
            new pages, learning the ecosystem and performing core actions.
          </li>
          <li>
            <b>Staking</b> – increases when you lock BEANS or interact with
            LadyChain staking contracts.
          </li>
          <li>
            <b>Trading</b> – grows as you explore swaps, liquidity pools or
            on-chain price movements.
          </li>
          <li>
            <b>Quests</b> – levels up by completing tasks, tutorials and
            progress-based LadyChain missions.
          </li>
          <li>
            <b>Farming</b> – tied to yield-generating actions, passive earnings,
            APR exploration or auto-compound strategies.
          </li>
          <li>
            <b>Mining</b> – earned by discovering new features, uncovering hidden
            sections or interacting with low-level on-chain data.
          </li>
          <li>
            <b>Alchemy</b> – progresses when you combine multiple systems:
            swapping → staking → questing → compounding.
          </li>
          <li>
            <b>Luck</b> – boosted by random events, jackpots, surprise drops
            or chance-based mechanics in the CoffeeHolics world.
          </li>
          <li>
            <b>Wisdom</b> – earned through long-term ecosystem understanding,
            reading docs, exploring tokenomics, or consistently interacting
            across LadyChain.
          </li>
        </ul>

        <p className="section-sub">
          Your total level reflects your full footprint on LadyChain — a cozy
          but meaningful summary of your on-chain activity.
        </p>
      </section>
    </div>
  );
}
