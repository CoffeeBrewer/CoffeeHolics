// src/components/QuestCard.jsx
import React from "react";

export function QuestCard({ quest, completed, onComplete }) {
  const totalXP = quest.rewards.reduce((sum, r) => sum + r.xp, 0);

  return (
    <article
      className={`quest-card ${completed ? "quest-card--completed" : ""}`}
    >
      <header className="quest-card__header">
        <div className="quest-card__emoji">{quest.emoji}</div>
        <div className="quest-card__title-group">
          <h3 className="quest-card__title">{quest.name}</h3>
          <div className="quest-card__meta">
            <span className="quest-card__badge quest-card__badge--category">
              {quest.category}
            </span>
            <span className="quest-card__badge quest-card__badge--difficulty">
              {quest.difficulty}
            </span>
          </div>
        </div>
      </header>

      <p className="quest-card__description">{quest.description}</p>

      <div className="quest-card__rewards">
        <span className="quest-card__rewards-label">Rewards</span>
        <div className="quest-card__rewards-list">
          {quest.rewards.map((r) => (
            <span
              key={r.skill}
              className="quest-card__reward-chip"
              title={`${r.xp} XP to ${r.skill}`}
            >
              +{r.xp} XP <span className="quest-card__reward-skill">{r.skill}</span>
            </span>
          ))}
        </div>
        <span className="quest-card__rewards-total">
          Total: {totalXP} XP
        </span>
      </div>

      <footer className="quest-card__footer">
        {completed ? (
          <button className="quest-card__button quest-card__button--completed" disabled>
            ✓ Completed
          </button>
        ) : (
          <button
            className="quest-card__button"
            onClick={onComplete}
          >
            Claim XP
          </button>
        )}
      </footer>
    </article>
  );
}
