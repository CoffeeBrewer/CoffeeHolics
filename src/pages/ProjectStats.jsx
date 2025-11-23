import { useEffect, useMemo, useState } from "react";
import { fetchWilStats } from "../lib/stats";
import { fetchPoolStats } from "../lib/pool";
import { getNativeBalance } from "../lib/evm";
const WIL_CA = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30";
const PAIR_CA = "0x3d200a7bef09ec9bd05ac2c493dbacc24efad422";

export default function ProjectStats() {
  const [loading, setLoading] = useState(true);
  const [wil, setWil] = useState({
    totalSupply: null,
    holdersCount: null,
    decimals: 18,
    topHolders: [],
    rawToken: null,
  });

  const [pool, setPool] = useState({
    ladyReserve: null,
    wilReserve: null,
    ladyPerWil: null,
    wilPerLady: null,
    tvlLady: null,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setError(null);
        const [wilStats, poolStats] = await Promise.all([
          fetchWilStats(),
          fetchPoolStats(),
        ]);
        if (!alive) return;

        setWil(wilStats);
        setPool(poolStats);
        setLoading(false);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError(e?.message || "Stats fetch failed");
        setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 60000); // refresh elke minuut
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const marketCapLady = useMemo(() => {
    if (!wil.totalSupply || !pool.ladyPerWil) return null;
    return wil.totalSupply * pool.ladyPerWil;
  }, [wil.totalSupply, pool.ladyPerWil]);

  const fmt = (n, d = 4) =>
    n === null || n === undefined || Number.isNaN(Number(n))
      ? "—"
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: d });

  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  return (
    <div className="stats-page">
      {/* HEADER */}
      <section className="card stats-hero">
        <div className="stats-hero-top">
          <div>
            <h1 className="stats-title">Project Stats</h1>
            <p className="stats-sub">
              Live metrics for <b>$BEANS</b> on LadyChain.
            </p>
          </div>

          <div className="stats-badges">
            <div className="badge">ERC-20</div>
            <div className="badge">V2 Pool</div>
            <div className="badge">ChainId 589</div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            {error} — check RPC/Ladyscan availability.
          </div>
        )}

        {/* KPI GRID */}
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">Price</div>
            <div className="kpi-value">
              {fmt(pool.ladyPerWil, 8)} <span className="kpi-unit">LADY / BEANS</span>
            </div>
            <div className="kpi-sub">spot from pool reserves</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Market Cap</div>
            <div className="kpi-value">
              {marketCapLady ? fmt(marketCapLady, 0) : "—"}{" "}
              <span className="kpi-unit">LADY</span>
            </div>
            <div className="kpi-sub">supply × price</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Total Supply</div>
            <div className="kpi-value">
              {wil.totalSupply ? fmt(wil.totalSupply, 0) : "—"}{" "}
              <span className="kpi-unit">BEANS</span>
            </div>
            <div className="kpi-sub">from Ladyscan</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Holders</div>
            <div className="kpi-value">
              {wil.holdersCount ? fmt(wil.holdersCount, 0) : "—"}
            </div>
            <div className="kpi-sub">wallets holding BEANS</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Liquidity</div>
            <div className="kpi-value-small">
              {pool.ladyReserve ? fmt(pool.ladyReserve, 2) : "—"} LADY
              <span className="kpi-dot">•</span>
              {pool.wilReserve ? fmt(pool.wilReserve, 2) : "—"} BEANS
            </div>
            <div className="kpi-sub">current reserves</div>
          </div>
        </div>
      </section>

      {/* TOKEN + POOL META */}
      <section className="split">
        <div className="card meta">
          <h2 className="section-title">Token</h2>

          <div className="meta-row">
            <span>Name</span>
            <span>{wil.rawToken?.name || "COFFEEHOLICS"}</span>
          </div>
          <div className="meta-row">
            <span>Symbol</span>
            <span>{wil.rawToken?.symbol || "BEANS"}</span>
          </div>
          <div className="meta-row">
            <span>Decimals</span>
            <span>{wil.decimals ?? 18}</span>
          </div>
          <div className="meta-row">
            <span>Contract</span>
            <span className="mono">{short(WIL_CA)}</span>
          </div>

          <div className="meta-actions">
            <a
              className="btn btn-ghost tiny"
              href={`https://ladyscan.us/token/${WIL_CA}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Ladyscan
            </a>
          </div>
        </div>

        <div className="card meta">
          <h2 className="section-title">LADY/BEANS Pool</h2>

          <div className="meta-row">
            <span>Pair</span>
            <span className="mono">{short(PAIR_CA)}</span>
          </div>
          <div className="meta-row">
            <span>Spot price</span>
            <span>{fmt(pool.ladyPerWil, 8)} LADY / BEANS</span>
          </div>
          <div className="meta-row">
            <span>Inverse</span>
            <span>{fmt(pool.wilPerLady, 4)} BEANS / LADY</span>
          </div>
          <div className="meta-row">
            <span>LADY reserve</span>
            <span>{fmt(pool.ladyReserve, 2)} LADY</span>
          </div>
          <div className="meta-row">
            <span>BEANS reserve</span>
            <span>{fmt(pool.wilReserve, 2)} BEANS</span>
          </div>

          <div className="meta-actions">
            <a
              className="btn btn-ghost tiny"
              href={`https://ladyscan.us/address/${PAIR_CA}`}
              target="_blank"
              rel="noreferrer"
            >
              Pool contract
            </a>
          </div>
        </div>
      </section>

      {/* TOP HOLDERS TABLE */}
      <section className="card">
        <div className="table-header">
          <h2 className="section-title">Top Holders</h2>
          <div className="table-sub">live from Ladyscan</div>
        </div>

        {loading ? (
          <div className="skeleton">Loading holders…</div>
        ) : wil.topHolders?.length ? (
          <div className="holders-table">
            <div className="holders-row holders-head">
              <div>#</div>
              <div>Address</div>
              <div className="right">Balance (BEANS)</div>
            </div>

            {wil.topHolders.map((h, i) => {
              const addr =
                h.address || h.holder || h.owner || h.hash || "—";
              const bal =
                Number(h.value ?? h.balance ?? h.amount ?? 0) /
                Math.pow(10, wil.decimals ?? 18);

              return (
                <div className="holders-row" key={`${addr}-${i}`}>
                  <div>{i + 1}</div>
                  <div className="mono">{short(addr)}</div>
                  <div className="right">{fmt(bal, 2)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="muted">No holders data yet.</div>
        )}
      </section>

      {/* FUTURE WOW SECTION (placeholders for later) */}
      <section className="card wow">
        <h2 className="section-title">What’s next</h2>
        <div className="wow-grid">
          <div className="wow-card">
            <div className="wow-emoji">📈</div>
            <div className="wow-title">24h Volume</div>
            <div className="wow-sub">swap events → coming soon</div>
          </div>
          <div className="wow-card">
            <div className="wow-emoji">🔥</div>
            <div className="wow-title">Price Change</div>
            <div className="wow-sub">24h delta → coming soon</div>
          </div>
          <div className="wow-card">
            <div className="wow-emoji">🫘</div>
            <div className="wow-title">Staked BEANS</div>
            <div className="wow-sub">after staking launch</div>
          </div>
        </div>
      </section>
    </div>
  );
}
