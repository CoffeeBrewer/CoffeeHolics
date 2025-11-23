// src/pages/Swap.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { connectWallet, getNativeBalance, getBeansBalance } from "../lib/evm";
import { fetchWilPerLadySpot } from "../lib/price";
import { quoteSwap, swapLadyToBeans, WLADY_CA } from "../lib/dex";

export default function Swap() {
  const nav = useNavigate();

  const DISPLAY_TOKEN_SYMBOL = "BEANS";
  const ONCHAIN_SYMBOL = "$BEANS";
  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  const [wallet, setWallet] = useState({
    address: null,
    chainId: null,
    nativeBalance: null,
    beansBalance: null,
  });

  const refreshBalances = async (address) => {
    const [nativeBalance, beansBalance] = await Promise.all([
      getNativeBalance(address),
      getBeansBalance(address),
    ]);
    setWallet((w) => ({ ...w, nativeBalance, beansBalance }));
  };

  const onConnect = async () => {
    const { address, chainId } = await connectWallet();
    setWallet((w) => ({ ...w, address, chainId }));
    await refreshBalances(address);
  };

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then(async (accs) => {
      if (!accs?.length) return;
      const address = accs[0];
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      setWallet((w) => ({
        ...w,
        address,
        chainId: parseInt(chainIdHex, 16),
      }));
      await refreshBalances(address);
    });
  }, []);

  // spot price
  const [wilPerLady, setWilPerLady] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const p = await fetchWilPerLadySpot();
        if (alive) setWilPerLady(p);
      } catch {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // swap state
  const [fromAmount, setFromAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState({ amountOut: 0, price: 0 });
  const [swapBusy, setSwapBusy] = useState(false);
  const [swapErr, setSwapErr] = useState("");
  const slippageBps = 50;

  // live quote
  useEffect(() => {
    let alive = true;
    const doQuote = async () => {
      try {
        setSwapErr("");
        if (!fromAmount || Number(fromAmount) <= 0) {
          setSwapQuote({ amountOut: 0, price: 0 });
          return;
        }
        const q = await quoteSwap(fromAmount, WLADY_CA);
        if (alive) setSwapQuote(q);
      } catch {
        if (alive) {
          setSwapQuote({ amountOut: 0, price: 0 });
          setSwapErr("Quote failed");
        }
      }
    };
    doQuote();
    return () => (alive = false);
  }, [fromAmount]);

  const minOut = useMemo(() => {
    const out = Number(swapQuote.amountOut || 0);
    return out * (1 - slippageBps / 10000);
  }, [swapQuote.amountOut]);

  const priceImpactPct = useMemo(() => {
    const spot = Number(wilPerLady);
    const quoted = Number(swapQuote.price);
    if (!fromAmount || !spot || !quoted) return null;
    const impact = (1 - quoted / spot) * 100;
    if (!isFinite(impact)) return null;
    return Math.max(0, impact);
  }, [fromAmount, wilPerLady, swapQuote.price]);

  const setMaxLady = () => {
    if (!wallet.nativeBalance) return;
    setFromAmount(Number(wallet.nativeBalance).toFixed(4));
  };

  const onSwap = async () => {
    if (!wallet.address) return setSwapErr("Connect wallet first");
    if (!fromAmount || Number(fromAmount) <= 0)
      return setSwapErr("Enter an amount");

    setSwapBusy(true);
    setSwapErr("");

    try {
      await swapLadyToBeans({
        amountInLadyHuman: fromAmount,
        minOutBeansHuman: minOut,
        toAddress: wallet.address,
      });
      setFromAmount("");
      await refreshBalances(wallet.address);
    } catch (e) {
      setSwapErr(e?.shortMessage || e?.message || "Swap failed");
    } finally {
      setSwapBusy(false);
    }
  };

  return (
    <div className="stats-page">
      <section className="card dex" id="dex">
        <div className="dex-header">
          <div>
            <h2 className="dex-title">Swap</h2>
            <p className="dex-sub">Swap $LADY → {DISPLAY_TOKEN_SYMBOL}</p>
          </div>

          {!wallet.address ? (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect Wallet
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => nav("/my-wallet")}>
              {short(wallet.address)}
            </button>
          )}
        </div>

        {/* FROM */}
        <div className="swap-box">
          <div className="swap-row">
            <label className="swap-label">You pay</label>
            <div className="swap-balance">
              Balance: {wallet.address ? Number(wallet.nativeBalance || 0).toFixed(4) : "0.0000"} LADY
            </div>
          </div>

          <div className="swap-input-row">
            <input
              className="swap-input"
              inputMode="decimal"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              disabled={swapBusy}
            />
            <button className="max-btn" onClick={setMaxLady} disabled={!wallet.address || swapBusy}>
              MAX
            </button>
            <div className="token-chip lady">$LADY</div>
          </div>
        </div>

        {/* TO */}
        <div className="swap-box" style={{ marginTop: 8 }}>
          <div className="swap-row">
            <label className="swap-label">You receive</label>
            <div className="swap-balance">
              Balance: {wallet.address ? Number(wallet.beansBalance ?? 0).toFixed(2) : "0.0000"} {ONCHAIN_SYMBOL}
            </div>
          </div>

          <div className="swap-input-row">
            <input
              className="swap-input"
              value={fromAmount ? (swapQuote.amountOut || 0).toFixed(4) : ""}
              readOnly
            />
            <div className="token-chip beans">{DISPLAY_TOKEN_SYMBOL}</div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="dex-details">
          <div className="detail-row">
            <span>Slippage</span><span>0.5%</span>
          </div>
          <div className="detail-row">
            <span>Price impact</span>
            <span>{priceImpactPct === null ? "—" : `~${priceImpactPct.toFixed(2)}%`}</span>
          </div>
          <div className="detail-row">
            <span>Minimum received</span>
            <span>{minOut.toFixed(4)} {DISPLAY_TOKEN_SYMBOL}</span>
          </div>
        </div>

        {swapErr && <div className="error-box">{swapErr}</div>}

        <button
          className="btn btn-primary btn-full"
          onClick={onSwap}
          disabled={!wallet.address || swapBusy || !fromAmount}
        >
          {swapBusy ? "Swapping…" : "Swap"}
        </button>
      </section>
    </div>
  );
}
