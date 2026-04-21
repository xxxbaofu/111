import { TableCard } from "@/components/table-card";
import { getProducts, getAds } from "@/lib/api";

export default async function AdsPage() {
  const products = await getProducts({ region: "US" });
  const first = products.items[0];
  const ads = first ? await getAds(first.id) : { count: 0, items: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ads</h1>
      <p className="text-sm text-[var(--text-muted)]">
        广告素材、出现次数、增长参考（示例展示 US 首个产品）。
      </p>
      <TableCard
        title={`广告明细${first ? `（${first.name_cn}）` : ""}`}
        columns={["平台", "素材类型", "出现次数", "最后出现", "市场"]}
        rows={ads.items.map((item) => [
          String(item.platform ?? ""),
          String(item.creative_type ?? ""),
          String(item.appear_count ?? 0),
          String(item.last_seen ?? ""),
          String(item.market ?? ""),
        ])}
      />
    </div>
  );
}
