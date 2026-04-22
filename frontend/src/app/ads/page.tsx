import { TableCard } from "@/components/table-card";
import { getAds, getProducts, type Region } from "@/lib/api";

type AdsPageProps = {
  searchParams?: Promise<{ region?: Region; product_id?: string }>;
};

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const selectedProductId = params.product_id ? Number(params.product_id) : null;
  const products = await getProducts({ region, min_score: 55 });
  const first =
    products.items.find((item) => selectedProductId !== null && item.id === selectedProductId) ??
    products.items[0];
  const ads = first ? await getAds(first.id) : { count: 0, items: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Ads（广告）- {region}</h1>
      <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]">
        先选一个高分产品，再看素材出现频次；出现次数越高，越值得先复刻测试。
      </section>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-[var(--text-muted)]">
          看广告页的目标不是“看热闹”，而是找可复制素材方向：平台、素材形态、出现频次。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {products.items.slice(0, 8).map((item) => (
            <a
              key={item.id}
              href={`/ads?region=${region}&product_id=${item.id}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                first && item.id === first.id
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {item.name_cn}
            </a>
          ))}
        </div>
      </div>

      <TableCard
        title={`广告素材线索${first ? `（${first.name_cn}）` : ""}`}
        description={`同平台重复出现的素材，通常代表该角度有转化潜力（当前区域：${region}）。`}
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
