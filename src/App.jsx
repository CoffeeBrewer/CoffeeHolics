// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import HamburgerMenu from "./components/HamburgerMenu";

// pages
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import StakeBeans from "./pages/StakeBeans";
import Skills from "./pages/Skills"; // ✅ hoofdletter fix
import ProjectStats from "./pages/ProjectStats";
import MyWallet from "./pages/MyWallet";
import Quest from "./pages/Quest";

// evm helpers
import {
  connectWallet,
  getNativeBalance,
  getBeansBalance,
} from "./lib/evm";

export default function App() {
  // 1 centrale wallet state
  const [wallet, setWallet] = useState({
    address: null,
    chainId: null,
    nativeBalance: null, // LADY
    beansBalance: null,  // BEANS
  });

  const refreshBalances = async (address) => {
    const [nativeBalance, beansBalance] = await Promise.all([
      getNativeBalance(address),
      getBeansBalance(address),
    ]);

    setWallet((w) => ({
      ...w,
      nativeBalance,
      beansBalance,
    }));
  };

  const onConnect = async () => {
    try {
      const { address, chainId } = await connectWallet();
      setWallet((w) => ({ ...w, address, chainId }));
      await refreshBalances(address);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Wallet connect failed");
    }
  };

  // auto-reconnect
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then(async (accs) => {
      if (!accs?.length) return;

      const address = accs[0];
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      setWallet((w) => ({
        ...w,
        address,
        chainId: parseInt(chainIdHex, 16),
      }));

      try {
        await refreshBalances(address);
      } catch {}
    });
  }, []);

  return (
    <>
      {/* topbar met wallet + connect */}
      <HamburgerMenu wallet={wallet} onConnect={onConnect} />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Home wallet={wallet} refreshBalances={refreshBalances} />}
          />
          <Route
            path="/swap"
            element={<Swap wallet={wallet} refreshBalances={refreshBalances} />}
          />
          <Route
            path="/stake-beans"
            element={
              <StakeBeans wallet={wallet} refreshBalances={refreshBalances} />
            }
          />
          <Route path="/skills" element={<Skills wallet={wallet} />} />
          <Route path="/quests" element={<Quest wallet={wallet} />} />
          <Route path="/project-stats" element={<ProjectStats />} />
          <Route
            path="/my-wallet"
            element={<MyWallet wallet={wallet} refreshBalances={refreshBalances} />}
          />
        </Routes>
      </main>
    </>
  );
}
