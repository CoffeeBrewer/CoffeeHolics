import { useEffect, useMemo, useState } from "react";
import { connectWallet, getNativeBalance, getBeansBalance } from "../lib/evm";

import { JsonRpcProvider, Contract, formatUnits } from "ethers";

const DISPLAY = {
  token: "BEANS",
  chain: "LadyChain",
};

const RPC_URL = "https://rpc.ladyrpc.us";

// V2 pair CA (LADY/BEANS)
const PAIR_CA = "0x3d200a7bef09ec9bd05ac2c493dbacc24efad422";

const V2_PAIR_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

export default function MyWallet() {
  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  const [wallet, setWallet] = useState({
    address: null,
    chainId: null,
    myLady: null,
    myBeans: null,
  });

  const [lp, setLp] = useState({
    lpBalance: null,
    lpTotalSupply: null,
    sharePct: null,
  });

  const [loading, setLoading] = useState(true);

  const refreshBalances = async (address) => {
   const [myLady, myBeans] = await Promise.all([
  getNativeBalance(address),
  getBeansBalance(address),
]);

    setWallet((w) => ({ ...w, myLady, myBeans }));
  };

  const refreshLpShare = async (address) => {
    try {
      const provider = new JsonRpcProvider(RPC_URL);
      const pair = new Contract(PAIR_CA, V2_PAIR_ABI, provider);

      const [lpBalBN, lpTotalBN] = await Promise.all([
        pair.balanceOf(address),
        pair.totalSupply(),
      ]);

      const lpBalance = Number(formatUnits(lpBalBN, 18));
      const lpTotalSupply = Number(formatUnits(lpTotalBN, 18));

      const sharePct =
        lpTotalSupply > 0 ? (lpBalance / lpTotalSupply) * 100 : 0;

      setLp({ lpBalance, lpTotalSupply, sharePct });
    } catch (e) {
      console.error("LP share fetch failed", e);
      setLp({ lpBalance: null, lpTotalSupply: null, sharePct: null });
    }
  };

  const onConnect = async () => {
    try {
      const { address, chainId } = await connectWallet();
      setWallet((w) => ({ ...w, address, chainId }));
      await Promise.all([refreshBalances(address), refreshLpShare(address)]);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Wallet connect failed");
    }
  };

  // Auto-reconnect
  useEffect(() => {
  if (!window.ethereum) return;

  const onAcc = (accs) => {
    const a = accs?.[0];
    if (a) {
      setWallet((w) => ({ ...w, address: a }));
      refreshBalances(a);
      refreshLpShare(a);
    } else {
      setWallet({ address: null, chainId: null, myLady: null, myBeans: null });
    }
  };

  const onChain = () => window.location.reload();

  window.ethereum.on("accountsChanged", onAcc);
  window.ethereum.on("chainChanged", onChain);

  return () => {
    window.ethereum.removeListener("accountsChanged", onAcc);
    window.ethereum.removeListener("chainChanged", onChain);
  };
}, []);
  useEffect(() => {
    let alive = true;
    const boot = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }
      const accs = await window.ethereum.request({ method: "eth_accounts" });
      if (!accs?.length) {
        setLoading(false);
        return;
      }
      const address = accs[0];
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });

      if (!alive) return;
      setWallet((w) => ({
        ...w,
        address,
        chainId: parseInt(chainIdHex, 16),
      }));

      try {
        await Promise.all([refreshBalances(address), refreshLpShare(address)]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    boot();
    return () => (alive = false);
  }, []);

  const fmt = (n, d = 4) =>
    n === null || n === undefined || Number.isNaN(Number(n))
      ? "—"
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: d });

  const hasWallet = !!wallet.address;

  return (
    <div className="wallet-page">
      {/* HEADER */}
      <section className="card wallet-hero">
        <div className="wallet-hero-row">
          <div>
            <h1 className="wallet-title">My Wallet</h1>
            <p className="wallet-sub">
              Your balances and progress on {DISPLAY.chain}.
            </p>
          </div>

          {!hasWallet ? (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect Wallet
            </button>
          ) : (
            <div className="pill">
              {short(wallet.address)}
            </div>
          )}
        </div>
      </section>

      {/* BALANCES GRID */}
      <section className="wallet-grid">
        <section className="wallet-grid wallet-grid-single">
  <div className="card stat-card stat-card-wide">
    <div className="stat-card-label">Total Value ($)</div>
    <div className="stat-card-value">$—</div>
    <div className="stat-card-sub">
      Portfolio value in USD 
    </div>
  </div>
</section>
        <div className="card stat-card">
          <div className="stat-card-label">My {DISPLAY.token}</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(wallet.myBeans, 4)}
          </div>
          <div className="stat-card-sub">${DISPLAY.token}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">My Lady</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(wallet.myLady, 4)}
          </div>
          <div className="stat-card-sub">$LADY</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">My LP Share</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : (lp.sharePct != null ? `${fmt(lp.sharePct, 4)}%` : "—")}
          </div>
          <div className="stat-card-sub">
            {lp.lpBalance != null ? `${fmt(lp.lpBalance, 4)} LP tokens` : "LP tokens"}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">My Stake</div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-sub">{DISPLAY.token} staked </div>
        </div>
      </section>

      {/* NFTs */}
      <section className="card">
        <div className="section-title">NFT’s</div>
        <div className="section-sub">Coming soon — your LadyChain collectibles.</div>

        <div className="nft-grid">
          {[1,2,3].map((i) => (
            <div className="nft-card" key={i}>
              <div className="nft-placeholder">🖼️</div>
              <div className="nft-title">NFT #{i}</div>
              <div className="nft-sub">Coming soon</div>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Quests */}
      <section className="card">
        <div className="section-title">Completed Quests</div>
        <div className="section-sub">Your completed missions and streaks.</div>

<div className="quest-done-list">
  <div className="quest-done">
    <div className="quest-done-left">
      <div className="quest-done-emoji">🧾</div>
      <div>
        <div className="quest-done-title">Made a tx on LadyChain</div>
        <div className="quest-done-sub">Completed, well done!</div>
      </div>
    </div>
    <div className="quest-done-reward">+500 BEANS</div>
  </div>

  <div className="quest-done">
    <div className="quest-done-left">
      <div className="quest-done-emoji">🔁</div>
      <div>
        <div className="quest-done-title">Swapped LADY to BEANS</div>
        <div className="quest-done-sub">Completed, well done!</div>
      </div>
    </div>
    <div className="quest-done-reward">+1500 BEANS</div>
  </div>

  <div className="quest-done">
    <div className="quest-done-left">
      <div className="quest-done-emoji">⚙️</div>
      <div>
        <div className="quest-done-title">Interacted with a contract on LadyChain</div>
        <div className="quest-done-sub">Completed, well done!</div>
      </div>
    </div>
    <div className="quest-done-reward">+1000 BEANS</div>
  </div>
</div>

      </section>
    </div>
  );
}
