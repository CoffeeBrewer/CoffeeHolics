import { JsonRpcProvider, Contract, formatUnits } from "ethers";

const RPC_URL = "https://rpc.ladyrpc.us";

const PAIR_CA = "0x3d200a7bef09ec9bd05ac2c493dbacc24efad422";
const LADY_CA = "0x1bb40d060ec9252fb8b0188f74ed026a66a703d4"; // wrapped LADY
const WIL_CA  = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30";

const V2_PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

export async function fetchPoolStats() {
  const provider = new JsonRpcProvider(RPC_URL);
  const pair = new Contract(PAIR_CA, V2_PAIR_ABI, provider);

  const [r0, r1, ts] = await pair.getReserves();
  const t0 = (await pair.token0()).toLowerCase();
  const t1 = (await pair.token1()).toLowerCase();

  const reserve0 = Number(formatUnits(r0, 18));
  const reserve1 = Number(formatUnits(r1, 18));

  let ladyReserve, wilReserve;
  if (t0 === LADY_CA.toLowerCase() && t1 === WIL_CA.toLowerCase()) {
    ladyReserve = reserve0; wilReserve = reserve1;
  } else if (t1 === LADY_CA.toLowerCase() && t0 === WIL_CA.toLowerCase()) {
    ladyReserve = reserve1; wilReserve = reserve0;
  } else {
    throw new Error("Pair tokens matchen LADY/WIL niet");
  }

  const ladyPerWil = ladyReserve / wilReserve;
  const wilPerLady = 1 / ladyPerWil;

  // TVL in LADY: 2 * LADY-reserve (waarde 50/50)
  const tvlLady = ladyReserve * 2;

  return {
    ladyReserve,
    wilReserve,
    ladyPerWil,
    wilPerLady,
    tvlLady,
    lastTimestamp: Number(ts),
  };
}
