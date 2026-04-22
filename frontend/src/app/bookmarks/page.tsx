import Link from "next/link";

import { TableCard } from "@/components/table-card";
import {
  deleteBookmark,
  getBookmarks,
  getCategories,
  getProducts,
  upsertBookmark,
  type Region,
} from "@/lib/api";

type BookmarksPageProps = {
  searchParams?: Promise<{
    region?: Region;
    action?: "add_product" | "add_category" | "delete";
    product_id?: string;
    category?: string;
    title?: string;
    note?: string;
    bookmark_id?: string;
  }>;
};

const REGION_OPTIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

async function _applyAction(
  region: Region,
  action?: "add_product" | "add_category" | "delete",
  params?: {
    product_id?: string;
    category?: string;
    title?: string;
    note?: string;
    bookmark_id?: string;
  }
): Promise<void> {
  if (!action) return;

  if (action === "delete" && params?.bookmark_id) {
    const bookmarkId = Number(params.bookmark_id);
    if (Number.isFinite(bookmarkId) && bookmarkId > 0) {
      await deleteBookmark(bookmarkId);
    }
    return;
  }

  if (action === "add_product" && params?.product_id) {
    const productId = Number(params.product_id);
    if (Number.isFinite(productId) && productId > 0) {
      await upsertBookmark({
        region,
        entity_type: "product",
        product_id: productId,
        title: params.title || "",
        note: params.note || "重点关注该单品测试窗口与素材表现。",
      });
    }
    return;
  }

  if (action === "add_category" && params?.category) {
    const categoryName = params.category.trim();
    if (categoryName) {
      await upsertBookmark({
        region,
        entity_type: "category",
        category_name: categoryName,
        title: params.title || `${categoryName} 跟踪`,
        note: params.note || "持续跟踪该品类周增长和竞争变化。",
      });
    }
  }
}

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  await _applyAction(region, params.action, params);

  const [bookmarks, products, categories] = await Promise.all([
    getBookmarks(region),
    getProducts({ region, min_score: 65 }),
    getCategories({ region }),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold">收藏与备注（{region}）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          把“值得跟踪”的产品与品类收进私有清单，并写上你的判断与下一步动作。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/bookmarks?region=${r}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                r === region
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </section>

      <TableCard
        title="我的收藏清单"
        description="支持收藏产品与品类。删除可通过链接快速执行。"
        columns={["类型", "标题", "备注", "更新时间", "快捷操作"]}
        rows={bookmarks.items.map((item) => [
          item.entity_type === "product" ? "产品" : "品类",
          item.title || item.category_name || `产品#${item.product_id}`,
          item.note || "-",
          item.updated_at ? item.updated_at.slice(0, 16).replace("T", " ") : "-",
          `删除：/bookmarks?region=${region}&action=delete&bookmark_id=${item.id}`,
        ])}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <TableCard
          title="高分产品快捷收藏"
          description="点击链接可直接把产品加入收藏并附默认备注。"
          columns={["产品", "评分", "建议", "操作"]}
          rows={products.items.slice(0, 8).map((item) => [
            `${item.name_cn}（${item.name_en}）`,
            item.score.toFixed(1),
            item.recommendation,
            `收藏：/bookmarks?region=${region}&action=add_product&product_id=${item.id}`,
          ])}
        />
        <TableCard
          title="高增长品类快捷收藏"
          description="先收藏品类，再持续跟踪品类周增长变化。"
          columns={["品类", "增长", "热度", "操作"]}
          rows={categories.items.slice(0, 8).map((item) => [
            item.name,
            `${(item.growth_score * 100).toFixed(1)}%`,
            item.heat_score.toFixed(2),
            <Link
              key={`bookmark-category-${item.id}`}
              href={`/bookmarks?region=${region}&action=add_category&category=${encodeURIComponent(item.name)}`}
              className="text-[var(--accent-blue)] hover:underline"
            >
              收藏该品类
            </Link>,
          ])}
        />
      </section>
    </div>
  );
}
