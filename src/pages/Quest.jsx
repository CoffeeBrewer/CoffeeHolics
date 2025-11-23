// src/pages/QuestsPage.jsx
import React, { useEffect, useState } from "react";
import { QUESTS } from "../lib/quests";
import {
  addXP,
  loadXP,
  loadQuestState,
  markQuestCompleted,
} from "../utils/storage";
import { QuestCard } from "../components/QuestCard";

export default function Quest() {
  const [xpState, setXpState] = useState(loadXP);
  const [questState, setQuestState] = useState(loadQuestState);
  const [recentToast, setRecentToast] = useState(null);

  useEffect(() => {
    // kleine auto-dismiss voor toasts
    if (!recentToast) return;
    const id = setTimeout(() => setRecentToast(null), 2800);
    return () => clearTimeout(id);
  }, [recentToast]);

  const handleCompleteQuest = (quest) => {
    // already completed safeguard
    if (questState[quest.id]?.completed) return;

    const updatedXP = addXP(quest.rewards);
    const updatedQuestState = markQuestCompleted(quest.id);

    setXpState(updatedXP);
    setQuestState(updatedQuestState);

    const rewardSummary = quest.rewards
      .map((r) => `+${r.xp} XP ${r.skill}`)
      .join(" · ");

    setRecentToast({
      title: "Quest completed!",
      message: `${quest.name} — ${rewardSummary}`,
      emoji: quest.emoji,
    });
  };

  const completedCount = QUESTS.filter((q) => questState[q.id]?.completed).length;

  return (
    <main className="quests-page">
      <section className="quests-page__hero">
        <div className="quests-page__hero-text">
          <h1 className="quests-page__title">Quests</h1>
          <p className="quests-page__subtitle">
            Brew your journey one task at a time. Complete cozy quests to level up
            your CoffeeHolics skills.
          </p>
          <div className="quests-page__progress-pill">
            <span className="quests-page__progress-label">
              Quest log
            </span>
            <span className="quests-page__progress-value">
              {completedCount} / {QUESTS.length} completed
            </span>
          </div>
        </div>
        <div className="quests-page__hero-badge">
          <span className="quests-page__hero-emoji">📜</span>
          <span className="quests-page__hero-caption">
            Each quest is a fresh brew of XP.
          </span>
        </div>
      </section>

      <section className="quests-page__list">
        {QUESTS.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            completed={!!questState[quest.id]?.completed}
            onComplete={() => handleCompleteQuest(quest)}
          />
        ))}
      </section>

      {recentToast && (
        <div className="quest-toast">
          <div className="quest-toast__emoji">{recentToast.emoji}</div>
          <div className="quest-toast__content">
            <div className="quest-toast__title">{recentToast.title}</div>
            <div className="quest-toast__message">{recentToast.message}</div>
          </div>
        </div>
      )}
    </main>
  );
}
