import { useEffect, useMemo, useState } from "react";
import {
  approveBeans,
  stakeBeans,
  withdrawBeans,
  claimRewards,
  fetchStakeData,
  CHAIN_ID_DEC,
} from "../lib/stake";
import { connectWallet, getNativeBalance, getBeansBalance } from "../lib/evm";
export default function StakeBeans() {
  const DISPLAY = { symbol: "BEANS", chain: "LadyChain" };

  const [wallet, setWallet] = useState({ address: null, chainId: null });

  // staking-related data (can be placeholder if staking CA not set yet)
  const [data, setData] = useState({
    decimals: 18,
    allowance: null,
    staked: null,
    earned: null,
    totalStaked: null,
  });

  // ✅ always live from token CA
  const [myBeans, setMyBeans] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

  const fmt = (n, d = 4) =>
    n === null || n === undefined
      ? "—"
      : Number(n).toLocaleString(undefined, {
          maximumFractionDigits: d,
        });

  const chainOk = wallet.chainId === CHAIN_ID_DEC;

const refresh = async (address) => {
  setLoading(true);

  // 1) My BEANS altijd proberen te laden
  try {
    const beansBal = await getBeansBalance(address);
    setMyBeans(beansBal);
  } catch (e) {
    console.error("getBeansBalance failed:", e);
    // laat myBeans staan, maar crash niet
  }

  // 2) Staking data apart en veilig
  try {
    const d = await fetchStakeData(address);
    setData((prev) => ({ ...prev, ...d }));
  } catch (e) {
    console.error("fetchStakeData failed:", e);
  }

  setLoading(false);
};

  const onConnect = async () => {
    try {
      const { address, chainId } = await connectWallet();
      setWallet({ address, chainId });
      await refresh(address);
    } catch (e) {
      console.error("connect failed", e);
    }
  };

  // auto reconnect on load
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
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (!alive) return;
      setWallet({ address, chainId: parseInt(chainIdHex, 16) });
      await refresh(address);
    };

    boot();
    return () => {
      alive = false;
    };
  }, []);

  // listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const onAcc = (accs) => {
      const a = accs?.[0];
      if (a) {
        setWallet((w) => ({ ...w, address: a }));
        refresh(a);
      } else {
        setWallet({ address: null, chainId: null });
        setMyBeans(null);
        setData({
          decimals: 18,
          allowance: null,
          staked: null,
          earned: null,
          totalStaked: null,
        });
      }
    };

    const onChain = (chainIdHex) => {
      setWallet((w) => ({ ...w, chainId: parseInt(chainIdHex, 16) }));
      if (wallet.address) refresh(wallet.address);
    };

    window.ethereum.on("accountsChanged", onAcc);
    window.ethereum.on("chainChanged", onChain);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAcc);
      window.ethereum.removeListener("chainChanged", onChain);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address]);

  const needsApprove = useMemo(() => {
    const a = Number(amount);
    if (!a || !data.allowance) return false;
    return a > data.allowance + 1e-9;
  }, [amount, data.allowance]);

  const setMax = () => {
    if (myBeans != null) setAmount(String(myBeans));
  };

  const doApprove = async () => {
    if (!amount || !wallet.address) return;
    setBusy(true);
    try {
      await approveBeans(amount, data.decimals);
      await refresh(wallet.address);
    } catch (e) {
      console.error("approve failed", e);
    } finally {
      setBusy(false);
    }
  };

  const doStake = async () => {
    if (!amount || !wallet.address) return;
    setBusy(true);
    try {
      await stakeBeans(amount, data.decimals);
      setAmount("");
      await refresh(wallet.address);
    } catch (e) {
      console.error("stake failed", e);
    } finally {
      setBusy(false);
    }
  };

  const doWithdraw = async () => {
    if (!amount || !wallet.address) return;
    setBusy(true);
    try {
      await withdrawBeans(amount, data.decimals);
      setAmount("");
      await refresh(wallet.address);
    } catch (e) {
      console.error("withdraw failed", e);
    } finally {
      setBusy(false);
    }
  };

  const doClaim = async () => {
    if (!wallet.address) return;
    setBusy(true);
    try {
      await claimRewards();
      await refresh(wallet.address);
    } catch (e) {
      console.error("claim failed", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stake-page">
      {/* HERO / HEADER */}
      <section className="card stake-hero">
        <div className="stake-hero-row">
          <div className="stake-hero-copy">
            <h1 className="stake-title">Stake {DISPLAY.symbol}</h1>
            <p className="stake-sub">
              Stake your {DISPLAY.symbol} to earn rewards on {DISPLAY.chain}.
            </p>
          </div>

          {!wallet.address ? (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect Wallet
            </button>
          ) : (
            <div className="pill">{short(wallet.address)}</div>
          )}
        </div>

        {wallet.address && !chainOk && (
          <div className="error-box" style={{ marginTop: 10 }}>
            Wrong network. Switch to LadyChain (ChainId 589).
          </div>
        )}
      </section>

      {/* STATS GRID */}
      <section className="stake-grid">
        <div className="card stat-card">
          <div className="stat-card-label">My {DISPLAY.symbol}</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(myBeans)}
          </div>
          <div className="stat-card-sub">In wallet</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">My Stake</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(data.staked)}
          </div>
          <div className="stat-card-sub">{DISPLAY.symbol} staked</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">Rewards</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(data.earned)}
          </div>
          <div className="stat-card-sub">Claimable</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-label">Total Staked</div>
          <div className="stat-card-value">
            {loading ? "Loading…" : fmt(data.totalStaked)}
          </div>
          <div className="stat-card-sub">Pool TVL</div>
        </div>
      </section>

      {/* STAKE BOX */}
      <section className="card stake-box">
        <div className="section-title">Manage Stake</div>
        <div className="section-sub">
          Approve once, then stake anytime.
        </div>

        <div className="stake-input-row">
          <input
            className="stake-input"
            placeholder="0.0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!wallet.address || !chainOk || busy}
          />

          <button
            className="max-btn"
            onClick={setMax}
            disabled={!wallet.address || !chainOk || busy}
          >
            MAX
          </button>

          <div className="token-chip beans">
            <span className="token-icon">🫘</span>
            <span>{DISPLAY.symbol}</span>
          </div>
        </div>

        <div className="stake-actions">
          {needsApprove ? (
            <button
              className="btn btn-primary btn-full"
              onClick={doApprove}
              disabled={busy || !chainOk}
            >
              {busy ? "Approving…" : "Approve BEANS"}
            </button>
          ) : (
            <button
              className="btn btn-primary btn-full"
              onClick={doStake}
              disabled={busy || !chainOk}
            >
              {busy ? "Staking…" : "Stake BEANS"}
            </button>
          )}

          <button
            className="btn btn-ghost btn-full"
            onClick={doWithdraw}
            disabled={busy || !chainOk}
          >
            {busy ? "Withdrawing…" : "Withdraw BEANS"}
          </button>

          <button
            className="btn btn-ghost btn-full"
            onClick={doClaim}
            disabled={busy || !chainOk}
          >
            {busy ? "Claiming…" : "Claim Rewards"}
          </button>
        </div>

        <div className="stake-hint">
          Tip: Approval is only needed once per wallet.
        </div>
      </section>
    </div>
  );
}