import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  parseUnits,
  formatUnits,
} from "ethers";

export const RPC_URL = "https://rpc.ladyrpc.us";
export const CHAIN_ID_DEC = 589;
export const CHAIN_ID_HEX = "0x24D";

// token CA (WIL on-chain)
export const BEANS_CA = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30";

// ✅ TODO: plak hier straks je staking CA
export const STAKING_CA = "0xYOUR_STAKING_CONTRACT";

// Minimal ERC20 ABI
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)"
];

// ✅ TODO: vervang door jouw echte staking ABI
export const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function getReward()",
  "function earned(address account) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("No wallet found");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getBeansContract(signerOrProvider) {
  return new Contract(BEANS_CA, ERC20_ABI, signerOrProvider);
}

export async function getStakingContract(signerOrProvider) {
  return new Contract(STAKING_CA, STAKING_ABI, signerOrProvider);
}

// export async function fetchStakeData(address) {
//   const { provider } = await getProviderAndSigner();
//   const beans = await getBeansContract(provider);
//   const staking = await getStakingContract(provider);

//   const decimals = await beans.decimals();

//   const [
//     walletBalBN,
//     allowanceBN,
//     stakedBN,
//     earnedBN,
//     totalStakedBN
//   ] = await Promise.all([
//     beans.balanceOf(address),
//     beans.allowance(address, STAKING_CA),
//     staking.balanceOf(address),
//     staking.earned(address),
//     staking.totalSupply()
//   ]);

//   return {
//     decimals,
//     walletBal: Number(formatUnits(walletBalBN, decimals)),
//     allowance: Number(formatUnits(allowanceBN, decimals)),
//     staked: Number(formatUnits(stakedBN, decimals)),
//     earned: Number(formatUnits(earnedBN, decimals)),
//     totalStaked: Number(formatUnits(totalStakedBN, decimals))
//   };
// }

export async function approveBeans(amountHuman, decimals) {
  const { signer } = await getProviderAndSigner();
  const beans = await getBeansContract(signer);
  const amt = parseUnits(String(amountHuman), decimals);
  const tx = await beans.approve(STAKING_CA, amt);
  return tx.wait();
}

export async function stakeBeans(amountHuman, decimals) {
  const { signer } = await getProviderAndSigner();
  const staking = await getStakingContract(signer);
  const amt = parseUnits(String(amountHuman), decimals);
  const tx = await staking.stake(amt);
  return tx.wait();
}

export async function withdrawBeans(amountHuman, decimals) {
  const { signer } = await getProviderAndSigner();
  const staking = await getStakingContract(signer);
  const amt = parseUnits(String(amountHuman), decimals);
  const tx = await staking.withdraw(amt);
  return tx.wait();
}

export async function claimRewards() {
  const { signer } = await getProviderAndSigner();
  const staking = await getStakingContract(signer);
  const tx = await staking.getReward();
  return tx.wait();
}
const provider = new JsonRpcProvider(RPC_URL);

const isPlaceholder = (addr) =>
  !addr || addr.toLowerCase().includes("your_staking_contract");

export async function fetchStakeData(address) {
  const beans = new Contract(BEANS_CA, ERC20_ABI, provider);

  const decimals = await beans.decimals();
  const walletBalBN = await beans.balanceOf(address);

  // ✅ My Beans altijd live
  const walletBal = Number(formatUnits(walletBalBN, decimals));

  // staking defaults (werkend UI, ook zonder staking live)
  let allowance = 0;
  let staked = 0;
  let earned = 0;
  let totalStaked = 0;

  // ✅ Alleen staking calls als contract echt bestaat
  if (!isPlaceholder(STAKING_CA)) {
    const staking = new Contract(STAKING_CA, STAKING_ABI, provider);

    const [allowanceBN, stakedBN, earnedBN, totalStakedBN] = await Promise.all([
      beans.allowance(address, STAKING_CA),
      staking.balanceOf(address),
      staking.earned(address),
      staking.totalSupply(),
    ]);

    allowance = Number(formatUnits(allowanceBN, decimals));
    staked = Number(formatUnits(stakedBN, decimals));
    earned = Number(formatUnits(earnedBN, decimals));
    totalStaked = Number(formatUnits(totalStakedBN, decimals));
  }

  return { decimals, walletBal, allowance, staked, earned, totalStaked };
}