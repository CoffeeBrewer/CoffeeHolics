// src/lib/evm.js
import { BrowserProvider, JsonRpcProvider, Contract, formatUnits } from "ethers";

export const RPC_URL = "https://rpc.ladyrpc.us";
export const CHAIN_ID_DEC = 589;
export const CHAIN_ID_HEX = "0x24D";

export const BEANS_CA = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30"; // on-chain BEANS (voorheen WIL)

// Minimal ERC-20 ABI (incl approve)
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

// ---- connect wallet + switch to LadyChain ----
export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask niet gevonden");

  const provider = new BrowserProvider(window.ethereum);

  const accounts = await provider.send("eth_requestAccounts", []);
  const address = accounts[0];

  const chainIdHex = await provider.send("eth_chainId", []);
  const chainId = parseInt(chainIdHex, 16);

  if (chainId !== CHAIN_ID_DEC) {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: CHAIN_ID_HEX },
      ]);
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: CHAIN_ID_HEX,
            chainName: "LadyChain",
            rpcUrls: [RPC_URL],
            nativeCurrency: { name: "LADY", symbol: "LADY", decimals: 18 },
            blockExplorerUrls: ["https://ladyscan.us"],
          },
        ]);
      } else {
        throw switchErr;
      }
    }
  }

  const newChainIdHex = await provider.send("eth_chainId", []);
  return { address, chainId: parseInt(newChainIdHex, 16) };
}

// ---- native LADY balance ----
export async function getNativeBalance(address) {
  const provider = new BrowserProvider(window.ethereum);
  const bal = await provider.getBalance(address);
  return Number(formatUnits(bal, 18));
}

// ---- BEANS balance (ERC20) ----
export async function getBeansBalance(address) {
  // gebruik MetaMask als die er is
  if (window.ethereum) {
    const browserProvider = new BrowserProvider(window.ethereum);
    const beans = new Contract(BEANS_CA, ERC20_ABI, browserProvider);

    const decimals = await beans.decimals();
    const bal = await beans.balanceOf(address);
    return Number(formatUnits(bal, decimals));
  }

  // fallback (als je ooit server-side runt)
  const rpcProvider = new JsonRpcProvider(RPC_URL);
  const beans = new Contract(BEANS_CA, ERC20_ABI, rpcProvider);

  const decimals = await beans.decimals();
  const bal = await beans.balanceOf(address);
  return Number(formatUnits(bal, decimals));
}
