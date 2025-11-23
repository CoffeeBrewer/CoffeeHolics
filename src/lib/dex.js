// src/lib/dex.js
import {
  BrowserProvider,
  Contract,
  parseUnits,
  formatUnits,
} from "ethers";

import { ERC20_ABI, BEANS_CA } from "./evm";

// ====== ADDRESSES (LadyChain) ======
export const PAIR_CA = "0x3d200a7bef09ec9bd05ac2c493dbacc24efad422";
export const WLADY_CA = "0x1bb40d060ec9252fb8b0188f74ed026a66a703d4";
export const BEANS_CA_DEX = BEANS_CA;

// ====== Uniswap V2 Pair minimal ABI ======
export const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function swap(uint amount0Out, uint amount1Out, address to, bytes data)",
];

// ====== WLADY ABI (WETH9-style) ======
export const WLADY_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 wad)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function decimals() view returns (uint8)",
];

// ====== Fee model (0.3% => 997/1000) ======
const FEE_NUM = 997n;
const FEE_DEN = 1000n;

// helper: provider + signer via MetaMask (CORS-safe)
export async function getProviderSigner() {
  if (!window.ethereum) throw new Error("MetaMask niet gevonden");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

// ====== Pair state: token0/1 + reserves ======
export async function getPairState() {
  const { provider } = await getProviderSigner();
  const pair = new Contract(PAIR_CA, PAIR_ABI, provider);

  const [token0, token1, reserves] = await Promise.all([
    pair.token0(),
    pair.token1(),
    pair.getReserves(),
  ]);

  return {
    token0: token0.toLowerCase(),
    token1: token1.toLowerCase(),
    reserve0: reserves.reserve0, // BigInt
    reserve1: reserves.reserve1, // BigInt
  };
}

// ====== Quote calculator ======
// amountInHuman: string/number (bv "10.5")
// inTokenCA: address van token dat je betaalt
export async function quoteSwap(amountInHuman, inTokenCA) {
  const amtNum = Number(amountInHuman);
  if (!amtNum || amtNum <= 0) {
    return { amountOut: 0, price: 0, inIsToken0: true };
  }

  const { provider } = await getProviderSigner();

  const inToken = new Contract(inTokenCA, ERC20_ABI, provider);
  const inDecimals = await inToken.decimals();

  const amountInRaw = parseUnits(String(amountInHuman), inDecimals);

  const { token0, token1, reserve0, reserve1 } = await getPairState();
  const inIsToken0 = inTokenCA.toLowerCase() === token0;

  const reserveIn = inIsToken0 ? reserve0 : reserve1;
  const reserveOut = inIsToken0 ? reserve1 : reserve0;

  if (reserveIn === 0n || reserveOut === 0n) {
    return { amountOut: 0, price: 0, inIsToken0 };
  }

  const amountInWithFee = amountInRaw * FEE_NUM;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * FEE_DEN + amountInWithFee;
  const amountOutRaw = numerator / denominator;

  const outTokenCA = inIsToken0 ? token1 : token0;
  const outToken = new Contract(outTokenCA, ERC20_ABI, provider);
  const outDecimals = await outToken.decimals();

  const amountOutHuman = Number(formatUnits(amountOutRaw, outDecimals));
  const price = amountOutHuman / amtNum;

  return { amountOut: amountOutHuman, price, inIsToken0 };
}

// ====== Allowance check ======
export async function getAllowance(owner, spender, tokenCA) {
  const { provider } = await getProviderSigner();
  const token = new Contract(tokenCA, ERC20_ABI, provider);
  return await token.allowance(owner, spender);
}

// ====== Approve max ======
export async function approveToken(spender, tokenCA) {
  const { signer } = await getProviderSigner();

  // ✅ kies ABI op basis van token
  const abiToUse =
    tokenCA.toLowerCase() === WLADY_CA.toLowerCase()
      ? WLADY_ABI
      : ERC20_ABI;

  const token = new Contract(tokenCA, abiToUse, signer);

  const maxUint =
    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

  const tx = await token.approve(spender, maxUint);
  return await tx.wait();
}


// ====== Transfer input token to pair ======
export async function transferToPair(tokenCA, amountHuman) {
  const { signer } = await getProviderSigner();
  const token = new Contract(tokenCA, ERC20_ABI, signer);
  const decimals = await token.decimals();

  const amountRaw = parseUnits(String(amountHuman), decimals);
  const tx = await token.transfer(PAIR_CA, amountRaw);
  return await tx.wait();
}

// ====== Execute swap on pair ======
export async function executeSwap({
  fromTokenCA,
  minOutHuman,
  toAddress,
}) {
  if (!toAddress) throw new Error("Missing toAddress");

  const { signer } = await getProviderSigner();
  const pair = new Contract(PAIR_CA, PAIR_ABI, signer);

  const { token0, token1 } = await getPairState();
  const fromIsToken0 = fromTokenCA.toLowerCase() === token0;

  const outTokenCA = fromIsToken0 ? token1 : token0;
  const outToken = new Contract(outTokenCA, ERC20_ABI, signer);
  const outDecimals = await outToken.decimals();

  const minOutRaw = parseUnits(String(minOutHuman), outDecimals);

  const amount0Out = fromIsToken0 ? 0n : minOutRaw;
  const amount1Out = fromIsToken0 ? minOutRaw : 0n;

  const tx = await pair.swap(amount0Out, amount1Out, toAddress, "0x");
  return await tx.wait();
}

// ======================================================================
// ✅ NATIVE LADY HELPERS (wrap/unwrap)
// ======================================================================

// wrap LADY -> wLADY
export async function wrapLady(amountHuman) {
  const { signer } = await getProviderSigner();
  const wlady = new Contract(WLADY_CA, WLADY_ABI, signer);

  const value = parseUnits(String(amountHuman), 18);
  const tx = await wlady.deposit({ value });
  return await tx.wait();
}

// unwrap wLADY -> LADY
export async function unwrapLady(amountRaw) {
  const { signer } = await getProviderSigner();
  const wlady = new Contract(WLADY_CA, WLADY_ABI, signer);

  const tx = await wlady.withdraw(amountRaw);
  return await tx.wait();
}

// ======================================================================
// ✅ HIGH-LEVEL SWAPS
// ======================================================================

// LADY (native) -> BEANS
export async function swapLadyToBeans({
  amountInLadyHuman,
  minOutBeansHuman,
  toAddress,
}) {
  // 1) wrap LADY -> wLADY
  await wrapLady(amountInLadyHuman);

  // 2) approve wLADY if needed
  const allowance = await getAllowance(toAddress, PAIR_CA, WLADY_CA);
  if (allowance === 0n) {
    await approveToken(PAIR_CA, WLADY_CA);
  }

  // 3) transfer wLADY to pair
  await transferToPair(WLADY_CA, amountInLadyHuman);

  // 4) swap for BEANS
  await executeSwap({
    fromTokenCA: WLADY_CA,
    minOutHuman: minOutBeansHuman,
    toAddress,
  });
}

// BEANS -> LADY (native)
export async function swapBeansToLady({
  amountInBeansHuman,
  minOutLadyHuman,
  toAddress,
}) {
  // 1) approve BEANS if needed
  const allowance = await getAllowance(toAddress, PAIR_CA, BEANS_CA_DEX);
  if (allowance === 0n) {
    await approveToken(PAIR_CA, BEANS_CA_DEX);
  }

  // 2) transfer BEANS to pair
  await transferToPair(BEANS_CA_DEX, amountInBeansHuman);

  // 3) swap to wLADY first
  const { signer } = await getProviderSigner();
  const wlady = new Contract(WLADY_CA, WLADY_ABI, signer);
  const outDecimals = await wlady.decimals();
  const minOutRaw = parseUnits(String(minOutLadyHuman), outDecimals);

  const { token0 } = await getPairState();
  const beansIsToken0 = BEANS_CA_DEX.toLowerCase() === token0;

  const amount0Out = beansIsToken0 ? 0n : minOutRaw;
  const amount1Out = beansIsToken0 ? minOutRaw : 0n;

  const pair = new Contract(PAIR_CA, PAIR_ABI, signer);
  const tx = await pair.swap(amount0Out, amount1Out, toAddress, "0x");
  const receipt = await tx.wait();

  // 4) unwrap full wLADY balance received (simple approach)
  const wBal = await wlady.balanceOf(toAddress);
  if (wBal > 0n) {
    await unwrapLady(wBal);
  }

  return receipt;
}
