// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../lib/evm";
import BeanBrewer from "../assets/BeanBrewer.png";

// ✅ gedeelde skills + XP helpers
import { SKILLS } from "../lib/skills";
import { loadXP } from "../utils/storage";
import { getSkillStatsForXP } from "../utils/skills";

export default function Home() {
  const nav = useNavigate();

  // -------- Branding --------
  const DISPLAY_TOKEN_NAME = "BEANS";
  const DISPLAY_TOKEN_SYMBOL = "BEANS";

  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  // -------- Wallet state (licht, alleen voor account koppeling) --------
  const [wallet, setWallet] = useState({
    address: null,
    chainId: null,
  });

  const onConnect = async () => {
    try {
      const { address, chainId } = await connectWallet();
      setWallet({ address, chainId });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Wallet connect failed");
    }
  };

  // Auto-reconnect
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then(async (accs) => {
      if (!accs?.length) return;
      const address = accs[0];
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      setWallet({
        address,
        chainId: parseInt(chainIdHex, 16),
      });
    });
  }, []);

  // -------- XP/Skills: zelfde bron als Skills.jsx --------
  const [xp, setXp] = useState(() => loadXP());

  // luister naar wijzigingen in localStorage (bijv. andere tab / actions)
  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key) return;
      if (event.key !== "coffeeholics_xp") return;
      setXp(loadXP());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Total level via gedeelde level-logica
  const totalLevel = useMemo(
    () =>
      SKILLS.reduce((sum, skill) => {
        const stats = getSkillStatsForXP(xp[skill.id] || 0);
        return sum + stats.level;
      }, 0),
    [xp]
  );

  return (
    <div className="home">
      {/* ================= HERO ================= */}
      <section className="hero card hero-pro">
        <div className="hero-toprow">
          <div className="hero-trust">
            <div className="trust-chip">V2 Pool Live</div>
            <div className="trust-chip">ERC-20 Verified</div>
            <div className="trust-chip">LadyChain</div>
          </div>
        </div>

        <div className="hero-grid hero-grid-single">
          {/* Copy */}
          <div className="hero-copy">
            <h1 className="hero-title">
              BeanBrewer’s journey starts here
              <span className="hero-accent">.</span>
            </h1>
            <div className="hero-mascot">
              <img
                src={BeanBrewer}
                alt="BeanBrewer mascot"
                className="hero-mascot-img"
                loading="lazy"
              />
            </div>

            <p className="hero-sub hero-sub-lg">
              BeanBrewer isn’t an ordinary bean. He dreams of becoming a
              legendary master brewer, but the road ahead is full of
              challenges — wild markets, magical brews, and daily missions.
              <br />
              <br />
              He can’t do it alone. <b>You’re his party.</b>
              By staking, swapping, and completing quests, you help him train
              skills and gain levels. The further you go, the stronger
              BeanBrewer becomes.
              <br />
              <br />
              🫘 <b>Grab your coffee… and lead him forward.</b>
            </p>
          </div>
        </div>
      </section>

      {/* ================= LEVEL HEART / SKILLS OVERVIEW ================= */}
      <section className="card">
        <div className="stats-hero-top">
          <div>
            <h2 className="stats-title">Your Skills</h2>
            <p className="stats-sub">
              Total level: <b>{totalLevel}</b>
            </p>
          </div>

          {!wallet.address ? (
            <button className="btn btn-primary btn-connect" onClick={onConnect}>
              Connect Wallet
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-connected"
              onClick={() => nav("/my-wallet")}
              title={wallet.address}
            >
              {short(wallet.address)}
            </button>
          )}
        </div>

        <div className="skills-grid-compact" style={{ marginTop: 10 }}>
          {SKILLS.map((skill) => {
            const stats = getSkillStatsForXP(xp[skill.id] || 0);

            return (
              <div className="skill-tile" key={skill.id}>
                <div className="skill-icon">{skill.emoji}</div>

                <div className="skill-meta">
                  <div className="skill-row">
                    <div className="skill-name">{skill.label}</div>
                    <div className="skill-lvl">Lvl {stats.level}</div>
                  </div>

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
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => nav("/skills")}>
            View Skills
          </button>
          <button className="btn btn-ghost" onClick={() => nav("/quests")}>
            Earn XP
          </button>
        </div>
      </section>

      {/* ================= QUESTS PREVIEW (blijft onderin) ================= */}
      <section className="quests card">
        <div className="quests-header">
          <h2 className="quests-title">Quests preview</h2>
          <button className="btn btn-ghost tiny" onClick={() => nav("/quests")}>
            View all
          </button>
        </div>

        <div className="quests-list">
          <div className="quest-item">
            <div className="quest-emoji">☕</div>
            <div className="quest-body">
              <div className="quest-name">Morning Brew</div>
              <div className="quest-desc">Do your first swap of the day.</div>
            </div>
            <div className="quest-reward">+5 {DISPLAY_TOKEN_SYMBOL}</div>
          </div>

          <div className="quest-item">
            <div className="quest-emoji">🫘</div>
            <div className="quest-body">
              <div className="quest-name">Bean Staker</div>
              <div className="quest-desc">
                Stake any amount of {DISPLAY_TOKEN_SYMBOL}.
              </div>
            </div>
            <div className="quest-reward">+20 {DISPLAY_TOKEN_SYMBOL}</div>
          </div>

          <div className="quest-item">
            <div className="quest-emoji">🔥</div>
            <div className="quest-body">
              <div className="quest-name">Hot Streak</div>
              <div className="quest-desc">Complete 3 quests this week.</div>
            </div>
            <div className="quest-reward">+50 {DISPLAY_TOKEN_SYMBOL}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
