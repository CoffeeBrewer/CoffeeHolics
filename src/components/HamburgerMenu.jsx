// src/components/HamburgerMenu.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

/**
 * Modern, compact topbar + slide-out menu.
 * Props:
 *  - wallet: { address, ... }
 *  - onConnect: async connect handler
 */
export default function HamburgerMenu({ wallet, onConnect }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const nav = useNavigate();
  const loc = useLocation();

  // close on route change
  useEffect(() => setOpen(false), [loc.pathname]);

  // close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const short = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const items = [
    { to: "/", label: "Home"},
    { to: "/swap", label: "Buy Beans"},
    { to: "/stake-beans", label: "Stake" },
    { to: "/skills", label: "Skills"},
    { to: "/quests", label: "Quests" },
    { to: "/project-stats", label: "Stats" },
    { to: "/my-wallet", label: "Wallet" },
  ];

  return (
    <>
      {/* ===== TOPBAR ===== */}
      <header className="topbar">
        <div className="topbar-inner">
          {/* Left: hamburger + brand */}
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <span className={`hamburger-icon ${open ? "is-open" : ""}`}>
                <span />
                <span />
                <span />
              </span>
            </button>

            <button className="brand" onClick={() => nav("/")}>
              <span className="brand-dot">☕</span>
              <span className="brand-text">
                Coffee<span className="brand-accent">Holics</span>
              </span>
            </button>
          </div>

          {/* Center: compact tabs (only most-used) */}
          <nav className="topbar-tabs" aria-label="Primary">
            <NavLink to="/swap" className="topbar-tab">
              Swap
            </NavLink>
            <NavLink to="/stake-beans" className="topbar-tab">
              Stake
            </NavLink>
            <NavLink to="/skills" className="topbar-tab">
              Skills
            </NavLink>
          </nav>

          {/* Right: wallet connect / address (smaller text) */}
          <div className="topbar-right">
            {!wallet?.address ? (
              <button
                className="btn btn-primary btn-connect btn-connect--small"
                onClick={onConnect}
              >
                Connect
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-connected btn-connected--small"
                title={wallet.address}
                onClick={() => nav("/my-wallet")}
              >
                {short(wallet.address)}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== BACKDROP ===== */}
      <div
        className={`menu-backdrop ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* ===== SLIDE PANEL ===== */}
      <aside
        className={`menu-panel ${open ? "open" : ""}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="menu-panel-header">
          <div className="menu-panel-title">
            <div className="menu-panel-logo">☕</div>
            <div>
              <div className="menu-panel-brand">CoffeeHolics</div>
              <div className="menu-panel-sub">Menu</div>
            </div>
          </div>

          <button
            className="menu-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="menu-section">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <span className="menu-emoji">{it.emoji}</span>
              <span className="menu-label">{it.label}</span>
              <span className="menu-arrow">›</span>
            </NavLink>
          ))}
        </div>

        <div className="menu-footer">
          {!wallet?.address ? (
            <button className="btn btn-primary btn-full" onClick={onConnect}>
              Connect Wallet
            </button>
          ) : (
            <div className="menu-wallet">
              <div className="menu-wallet-row">
                <span className="menu-wallet-label">Connected</span>
                <span className="menu-wallet-value mono">
                  {short(wallet.address)}
                </span>
              </div>

              <button
                className="btn btn-ghost btn-full"
                onClick={() => nav("/my-wallet")}
              >
                Open My Wallet
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
