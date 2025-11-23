// src/lib/price.js
import { BrowserProvider, JsonRpcProvider, Contract, formatUnits } from "ethers";

const RPC_URL = "https://rpc.ladyrpc.us";

// V2 pair + token adressen
const LADY_WIL_PAIR = "0x3d200a7bef09ec9bd05ac2c493dbacc24efad422";
const LADY_TOKEN = "0x1bb40d060ec9252fb8b0188f74ed026a66a703d4"; // WLADY
const WIL_TOKEN  = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30";  // BEANS/WIL

const V2_PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

const ERC20_DEC_ABI = ["function decimals() view returns (uint8)"];

async function getProvider() {
  // als MetaMask er is: die gebruiken (geen CORS ellende)
  if (window.ethereum) return new BrowserProvider(window.ethereum);
  return new JsonRpcProvider(RPC_URL);
}

export async function fetchLadyPerWilSpot() {
  const provider = await getProvider();
  const pair = new Contract(LADY_WIL_PAIR, V2_PAIR_ABI, provider);

  // ✅ ethers v6: object destructuring
  const { reserve0: r0, reserve1: r1 } = await pair.getReserves();
  const t0 = (await pair.token0()).toLowerCase();
  const t1 = (await pair.token1()).toLowerCase();

  // decimals live ophalen (niet aannemen)
  const token0 = new Contract(t0, ERC20_DEC_ABI, provider);
  const token1 = new Contract(t1, ERC20_DEC_ABI, provider);
  const [d0, d1] = await Promise.all([token0.decimals(), token1.decimals()]);

  const reserve0 = Number(formatUnits(r0, d0));
  const reserve1 = Number(formatUnits(r1, d1));

  let ladyReserve, wilReserve;

  const LADY = LADY_TOKEN.toLowerCase();
  const WIL  = WIL_TOKEN.toLowerCase();

  if (t0 === LADY && t1 === WIL) {
    ladyReserve = reserve0;
    wilReserve  = reserve1;
  } else if (t1 === LADY && t0 === WIL) {
    ladyReserve = reserve1;
    wilReserve  = reserve0;
  } else {
    throw new Error("Pair tokens matchen LADY/WIL niet");
  }

  if (!ladyReserve || !wilReserve) return null;

  return ladyReserve / wilReserve; // LADY per BEANS
}

export async function fetchWilPerLadySpot() {
  const p = await fetchLadyPerWilSpot();
  return p ? 1 / p : null; // BEANS per LADY
}
