export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export type Region = "US" | "UK" | "EU" | "SEA" | "JP" | "KR" | "XHS";

type Query = Record<string, string | number | undefined>;

function toQuery(params: Query): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      sp.set(k, String(v));
    }
  });
  return sp.toString();
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return (await res.json()) as T;
}

export type ProductRow = {
  id: number;
  name_en: string;
  name_cn: string;
  category_id: number;
  market: string;
  price_avg: number;
  price_min: number;
  price_max: number;
  heat_score: number;
  growth_score: number;
  discussion_score: number;
  competition_score: number;
  score: number;
  recommendation: string;
  strategy_type: string;
  budget_daily: number;
  budget_test: number;
  budget_scale: number;
  estimated_daily_revenue: number;
  data_level: string;
};

export type MarketResponse = {
  region: string;
  kpis: {
    product_count: number;
    category_count: number;
    ads_count: number;
    new_trend_count: number;
    avg_growth: number;
    avg_heat: number;
  };
};

export type ProductsResponse = {
  region: string;
  count: number;
  items: ProductRow[];
};

export type GrowthResponse = {
  region: string;
  category_growth: Array<{
    category: string;
    growth_score: number;
    heat_score: number;
    discussion_score: number;
  }>;
  product_growth: Array<{
    product_id: number;
    name_cn: string;
    name_en: string;
    growth_score: number;
    heat_score: number;
    discussion_score: number;
    total_score: number;
  }>;
  platform_growth: Array<{
    platform: string;
    ads_count: number;
    avg_appear: number;
  }>;
};

export type LeaderRow = {
  name: string;
  market: string;
  score: number;
  growth: number;
};

export type LeadersResponse = {
  region: string;
  leaders: Record<string, LeaderRow[]>;
};

export type AdsResponse = {
  product_id: number;
  count: number;
  items: Array<{
    id: number;
    platform: string;
    creative_type: string;
    appear_count: number;
    last_seen: string;
    market: string;
  }>;
};

export type CategoryResponse = {
  region: string;
  count: number;
  items: Array<{
    id: number;
    name: string;
    market: string;
    heat_score: number;
    growth_score: number;
    avg_price: number;
    product_count: number;
  }>;
};

export type RegionOverviewResponse = {
  count: number;
  items: Array<{
    region: string;
    product_count: number;
    avg_growth: number;
    avg_score: number;
    avg_budget_daily: number;
    judgement: string;
  }>;
};

export type DecisionResponse = {
  region: string;
  count: number;
  items: Array<{
    product_id: number;
    name_cn: string;
    name_en: string;
    region: string;
    score: number;
    conclusion: string;
    why: string;
    how: string;
    budget: string;
    risk: string;
  }>;
};

export type DecisionRow = DecisionResponse["items"][number];

export type SystemStatusResponse = {
  database: string;
  products: number;
  categories: number;
  ads: number;
  daily_metrics: number;
  latest_metric_date: string | null;
};

export type ProductDetailResponse = ProductRow & {
  category: { id: number; name: string; market: string };
  daily_metrics: Array<{
    date: string;
    heat: number;
    discussion: number;
    ads_count: number;
    mention_count: number;
  }>;
  ads: AdsResponse["items"];
};

export async function getMarket(region: Region): Promise<MarketResponse> {
  return req(`/market?${toQuery({ region })}`);
}

export async function getMarketsOverview(): Promise<RegionOverviewResponse> {
  return req("/markets/overview");
}

export async function getProducts(params: {
  region: Region;
  category?: string;
  min_score?: number;
}): Promise<ProductsResponse> {
  return req(`/products?${toQuery(params)}`);
}

export async function getCategories(params: {
  region: Region;
  keyword?: string;
  min_price?: number;
  max_price?: number;
}): Promise<CategoryResponse> {
  return req(`/categories?${toQuery(params)}`);
}

export async function getGrowth(region: Region): Promise<GrowthResponse> {
  return req(`/growth?${toQuery({ region })}`);
}

export async function getLeaders(region: Region): Promise<LeadersResponse> {
  return req(`/leaders?${toQuery({ region })}`);
}

export async function getDecisions(params: {
  region: Region;
  top_n?: number;
}): Promise<DecisionResponse> {
  return req(`/decisions?${toQuery(params)}`);
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  return req("/system/status");
}

export async function getProduct(id: number): Promise<ProductDetailResponse> {
  return req(`/product/${id}`);
}

export async function getAds(productId: number): Promise<AdsResponse> {
  return req(`/ads?${toQuery({ product_id: productId })}`);
}

export async function getAIExplain(payload: {
  product: string;
  category: string;
  market: string;
  score: number;
  budget_daily: number;
}) {
  return req<{
    结论: string;
    原因: string[];
    打法: string;
    预算: string;
    风险: string;
  }>("/ai/explain", { method: "POST", body: JSON.stringify(payload) });
}

export async function seedDemoData() {
  return req<{ status: string; inserted: Record<string, number> }>("/seed", {
    method: "POST",
  });
}
