const BASE = "/ladyscan/api/v2"; 
// ^ als je Vite-proxy gebruikt. Anders zet je hier https://ladyscan.us/api/v2
const WIL_CA = "0xccc8ed0c208f3651a38e5ef7e1d609172d855d30";

function pickNumber(obj, paths) {
  for (const p of paths) {
    const v = p.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
    if (v !== undefined && v !== null) {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

export async function fetchWilStats() {
  // token details
  const tokenRes = await fetch(`${BASE}/tokens/${WIL_CA}`);
  if (!tokenRes.ok) throw new Error("Token details fetch failed");
  const tokenJson = await tokenRes.json();

  // holders list
  const holdersRes = await fetch(`${BASE}/tokens/${WIL_CA}/holders?page=1`);
  if (!holdersRes.ok) throw new Error("Holders fetch failed");
  const holdersJson = await holdersRes.json();

  // decimals zoeken (fallback 18)
  const decimals =
    pickNumber(tokenJson, [
      "decimals",
      "token.decimals",
      "token_info.decimals",
    ]) ?? 18;

  // raw supply uit mogelijke velden
  const totalSupplyRaw = pickNumber(tokenJson, [
    "total_supply",
    "totalSupply",
    "circulating_supply",
    "circulatingSupply",
    "token.total_supply",
    "token.totalSupply",
  ]);

  // ✅ normaliseren naar “human” supply
  const totalSupply =
    totalSupplyRaw != null ? totalSupplyRaw / Math.pow(10, decimals) : null;

  // holders count proberen uit token endpoint
  let holdersCount = pickNumber(tokenJson, [
    "holders",
    "holders_count",
    "holder_count",
    "token.holders",
    "token.holders_count",
  ]);

  // anders holders endpoint
  if (holdersCount == null) {
    holdersCount = pickNumber(holdersJson, [
      "holders",
      "holders_count",
      "holder_count",
      "total",
      "total_count",
      "totalCount",
      "meta.total",
      "meta.total_count",
      "pagination.total",
    ]);
  }

  // laatste fallback: lengte page 1
  if (holdersCount == null && Array.isArray(holdersJson.items)) {
    holdersCount = holdersJson.items.length;
  }

  const topHolders = Array.isArray(holdersJson.items)
    ? holdersJson.items.slice(0, 15)
    : [];

  return {
    decimals,
    totalSupplyRaw,
    totalSupply,     // 👈 human readable
    holdersCount,
    topHolders,
    rawToken: tokenJson,
    rawHolders: holdersJson,
  };
}
