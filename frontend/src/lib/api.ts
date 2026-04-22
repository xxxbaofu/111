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
  decision?: {
    conclusion: string;
    why: string;
    how: string;
    budget: {
      daily: number;
      test: number;
      scale: number;
    };
    risk: string;
  };
};

export type WorkbenchResponse = {
  region: Region;
  market: MarketResponse;
  top_categories: CategoryResponse["items"];
  top_products: ProductRow[];
  decisions: DecisionRow[];
};

export type WorkflowTaskRow = {
  id: number;
  product_id: number;
  product_name: string;
  market: string;
  status: "待测试" | "测试中" | "复盘中" | "停投";
  priority: number;
  owner: string;
  note: string;
  next_action: string;
  score: number;
  budget_daily: number;
  recommendation: string;
  updated_at: string | null;
};

export type WorkflowTasksResponse = {
  region: Region;
  count: number;
  items: WorkflowTaskRow[];
};

export type WorkflowHistoryRow = {
  id: number;
  task_id: number;
  market: string;
  product_name: string;
  action: string;
  from_status: string;
  to_status: string;
  note: string;
  created_at: string | null;
};

export type WorkflowHistoryResponse = {
  region: Region;
  count: number;
  items: WorkflowHistoryRow[];
};

export type BookmarkRow = {
  id: number;
  market: string;
  entity_type: "product" | "category";
  product_id: number | null;
  category_name: string;
  title: string;
  note: string;
  updated_at: string | null;
};

export type BookmarksResponse = {
  region: Region;
  count: number;
  items: BookmarkRow[];
};

export type DailyReportResponse = {
  region: Region;
  date: string;
  kpis: MarketResponse["kpis"];
  top_products: ProductRow[];
  decisions: DecisionRow[];
  workflow_summary: Record<string, number>;
  risk_alerts: DecisionRow[];
  budget_suggestion: {
    total_daily_budget: number;
    core_test_budget: number;
    explore_budget: number;
    reserve_budget: number;
  };
};

export type BudgetSimulatorResponse = {
  platform: string;
  inputs: {
    budget: number;
    cpm: number;
    ctr: number;
    cvr: number;
    aov: number;
  };
  outputs: {
    impressions: number;
    clicks: number;
    orders: number;
    revenue: number;
    roas: number;
    cpa: number;
  };
};

export type MultiPlatformBudgetSimulatorResponse = {
  total_budget: number;
  channels: BudgetSimulatorResponse[];
  summary: {
    revenue: number;
    orders: number;
    blended_roas: number;
    blended_cpa: number;
  };
};

export type OpportunityBriefResponse = {
  region: Region;
  top_n: number;
  opportunities: Array<{
    id: number;
    name_cn: string;
    name_en: string;
    score: number;
    growth_score: number;
    competition_score: number;
    budget_daily: number;
    recommendation: string;
  }>;
  quick_wins: Array<{
    id: number;
    name_cn: string;
    score: number;
    why: string;
  }>;
  risk_alerts: Array<{
    id: number;
    name_cn: string;
    score: number;
    risk: string;
  }>;
  category_momentum: Array<{
    category: string;
    avg_score: number;
    avg_growth: number;
    product_count: number;
  }>;
  budget_guardrail: {
    total_daily_budget: number;
    top1_budget_ratio: number;
    top3_budget_ratio: number;
    health: string;
    suggestion: string;
  };
};

export type ProductsCompareResponse = {
  region: Region;
  count: number;
  items: Array<{
    id: number;
    name_cn: string;
    name_en: string;
    score: number;
    growth_score: number;
    heat_score: number;
    discussion_score: number;
    competition_score: number;
    budget_daily: number;
    estimated_daily_revenue: number;
    efficiency: number;
    recommendation: string;
    risk_level: string;
    newbie_fit: boolean;
    strategy_type: string;
  }>;
  winner: {
    id: number;
    name_cn: string;
    score: number;
    why: string;
  };
  summary: {
    total_budget_daily: number;
    total_estimated_daily_revenue: number;
    avg_efficiency: number;
  };
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

export async function getWorkbench(region: Region): Promise<WorkbenchResponse> {
  return req(`/workbench?${toQuery({ region })}`);
}

export async function getWorkflowTasks(region: Region): Promise<WorkflowTasksResponse> {
  return req(`/workflow/tasks?${toQuery({ region })}`);
}

export async function getWorkflowHistory(params: {
  region: Region;
  limit?: number;
}): Promise<WorkflowHistoryResponse> {
  return req(`/workflow/history?${toQuery(params)}`);
}

export async function upsertWorkflowTask(payload: {
  product_id: number;
  region: Region;
  status: "待测试" | "测试中" | "复盘中" | "停投";
  priority?: number;
  owner?: string;
  note?: string;
  next_action?: string;
}): Promise<{ status: string; item: WorkflowTaskRow }> {
  return req("/workflow/task", { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteWorkflowTask(taskId: number): Promise<{ deleted: boolean; task_id: number }> {
  return req(`/workflow/task/${taskId}`, { method: "DELETE" });
}

export async function getBookmarks(region: Region): Promise<BookmarksResponse> {
  return req(`/bookmarks?${toQuery({ region })}`);
}

export async function upsertBookmark(payload: {
  region: Region;
  entity_type: "product" | "category";
  product_id?: number;
  category_name?: string;
  title?: string;
  note?: string;
}): Promise<{ status: string; item: BookmarkRow }> {
  return req("/bookmark", { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteBookmark(
  bookmarkId: number
): Promise<{ deleted: boolean; bookmark_id: number }> {
  return req(`/bookmark/${bookmarkId}`, { method: "DELETE" });
}

export async function getDailyReport(region: Region): Promise<DailyReportResponse> {
  return req(`/daily-report?${toQuery({ region })}`);
}

export async function getOpportunityBrief(params: {
  region: Region;
  budget_limit?: number;
}): Promise<OpportunityBriefResponse> {
  return req(`/opportunity-brief?${toQuery(params)}`);
}

export async function getProductsCompare(params: {
  region: Region;
  ids: string;
}): Promise<ProductsCompareResponse> {
  return req(`/products/compare?${toQuery(params)}`);
}

export async function simulateBudget(params: {
  platform: string;
  budget: number;
  cpm: number;
  ctr: number;
  cvr: number;
  aov: number;
}): Promise<BudgetSimulatorResponse> {
  return req(`/budget/simulate?${toQuery(params)}`);
}

export async function simulatePortfolioBudget(params: {
  total_budget: number;
  cpm_tiktok: number;
  cpm_meta: number;
  cpm_google: number;
  ctr_tiktok: number;
  ctr_meta: number;
  ctr_google: number;
  cvr_tiktok: number;
  cvr_meta: number;
  cvr_google: number;
  aov_tiktok: number;
  aov_meta: number;
  aov_google: number;
}): Promise<MultiPlatformBudgetSimulatorResponse> {
  return req(`/budget/simulate/portfolio?${toQuery(params)}`);
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
