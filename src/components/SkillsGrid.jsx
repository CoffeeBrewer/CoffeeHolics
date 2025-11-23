// src/components/SkillsGrid.jsx
import React, { useEffect, useState } from "react";
import { SKILLS, SKILL_MAP } from "../data/skills";
import { loadXP, ALL_SKILLS } from "../utils/storage";
import { getSkillStatsForXP } from "../utils/skills";

export function SkillsGrid({ compact = false }) {
  const [xpState, setXpState] = useState(loadXP);

  // Optioneel: reageren op localStorage wijzigingen (andere tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "coffeeholics_xp") {
        setXpState(loadXP());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const skillCards = ALL_SKILLS.map((id) => {
    const meta = SKILL_MAP[id];
    const stats = getSkillStatsForXP(xpState[id] || 0);
    return { id, meta, stats };
  });

  return (
    <section
      className={`skills-grid ${compact ? "skills-grid--compact" : ""}`}
      aria-label="Skill levels"
    >
      {skillCards.map(({ id, meta, stats }) => (
        <article key={id} className="skill-tile">
          <header className="skill-tile__header">
            <span className="skill-tile__emoji">{meta.emoji}</span>
            <div className="skill-tile__title-group">
              <h3 className="skill-tile__label">{meta.label}</h3>
              <span className="skill-tile__level">
                Lv. {stats.level}
                {stats.isMaxLevel && " (MAX)"}
              </span>
            </div>
          </header>

          {!compact && (
            <p className="skill-tile__description">{meta.description}</p>
          )}

          <div className="skill-tile__progress">
            <div className="skill-tile__bar">
              <div
                className="skill-tile__bar-fill"
                style={{ width: `${stats.progress * 100}%` }}
              />
            </div>
            <div className="skill-tile__numbers">
              {stats.isMaxLevel ? (
                <span className="skill-tile__xp">
                  {stats.xp.toLocaleString()} XP · Max level
                </span>
              ) : (
                <span className="skill-tile__xp">
                  {stats.xpIntoLevel.toLocaleString()} /{" "}
                  {stats.xpNeededForNext.toLocaleString()} XP
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
