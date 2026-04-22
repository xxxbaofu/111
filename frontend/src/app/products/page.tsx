"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/badge";
import { TableCard } from "@/components/table-card";
import {
  getDecisions,
  getProducts,
  upsertBookmark,
  type DecisionRow,
  type ProductRow,
  type Region,
} from "@/lib/api";

const REGIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

export default function ProductsPage() {
  const [region, setRegion] = useState<Region>("US");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [decisions, setDecisions] = useState<DecisionRow[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [maxCompetition, setMaxCompetition] = useState(100);
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    Promise.all([getProducts({ region }), getDecisions({ region, top_n: 8 })])
      .then(([productRes, decisionRes]) => {
        if (!cancelled) {
          setRows(productRes.items);
          setDecisions(decisionRes.items);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [region]);

  const list = useMemo(() => {
    return rows.filter((item) => {
      if (item.score < minScore) return false;
      if (item.competition_score > maxCompetition) return false;
      if (beginnerOnly && item.budget_daily > 50) return false;
      return true;
    });
  }, [rows, minScore, maxCompetition, beginnerOnly]);

  const addBookmark = async (item: ProductRow) => {
    setBookmarkingId(item.id);
    try {
      await upsertBookmark({
        region,
        entity_type: "product",
        product_id: item.id,
        note: "来自产品池快捷收藏",
      });
    } finally {
      setBookmarkingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold">产品库（可执行版）- {region}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          先用筛选锁定可测试产品，再看下方“决策解释”快速判断是否开测。
        </p>
      </section>
      <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]">
        使用建议：先按区域筛选，再把最低分拉到 65+，优先测试“建议测试/强烈推荐”的产品。
      </section>

      <section className="card grid gap-3 lg:grid-cols-4">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          className="rounded border border-white/10 bg-[#0e1529] px-3 py-2"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="rounded border border-white/10 bg-[#0e1529] px-3 py-2"
          placeholder="最低分"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value || 0))}
        />
        <input
          type="number"
          className="rounded border border-white/10 bg-[#0e1529] px-3 py-2"
          placeholder="最高竞争"
          value={maxCompetition}
          onChange={(e) => setMaxCompetition(Number(e.target.value || 100))}
        />
        <label className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={beginnerOnly}
            onChange={(e) => setBeginnerOnly(e.target.checked)}
          />
          仅看新手友好
        </label>
      </section>

      {loading ? (
        <section className="card text-sm text-[var(--text-muted)]">加载中...</section>
      ) : (
        <>
          <TableCard
            title={`产品列表（${region}）`}
            description="字段不求多，重点看：分数、预算、推荐等级。点击产品可进入作战详情。"
            columns={["产品", "市场", "分数", "热度", "增长", "竞争", "预算", "建议", "操作"]}
            rows={list.map((item) => [
              `${item.name_cn}（${item.name_en}）`,
              item.market,
              item.score.toFixed(1),
              item.heat_score.toFixed(2),
              item.growth_score.toFixed(3),
              item.competition_score.toFixed(1),
              `$${item.budget_daily.toFixed(0)}/day`,
              item.recommendation,
              `查看 /product/${item.id}?region=${region}`,
            ])}
          />

          <section className="card">
            <h2 className="text-lg font-semibold">快捷入口</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Link
                className="rounded-md border border-white/15 px-2 py-1 hover:border-white/30"
                href={`/workflow?region=${region}`}
              >
                打开执行看板
              </Link>
              <Link
                className="rounded-md border border-white/15 px-2 py-1 hover:border-white/30"
                href={`/bookmarks?region=${region}`}
              >
                打开收藏与备注
              </Link>
              {list.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  className="rounded-md border border-white/15 px-2 py-1 hover:border-white/30"
                  href={`/workflow?region=${region}&add_product=${item.id}`}
                >
                  加入看板：{item.name_cn}
                </Link>
              ))}
              {list.slice(0, 3).map((item) => (
                <button
                  key={`bookmark-${item.id}`}
                  className="rounded-md border border-white/15 px-2 py-1 hover:border-white/30"
                  onClick={() => addBookmark(item)}
                  disabled={bookmarkingId === item.id}
                >
                  {bookmarkingId === item.id ? "收藏中..." : `收藏：${item.name_cn}`}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">AI 决策解释（Top 8）</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              结论 -&gt; 原因 -&gt; 怎么做 -&gt; 预算 -&gt; 风险，直接用于当天执行。
            </p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {decisions.map((item) => (
                <div key={item.product_id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{item.name_cn}</h3>
                    <Badge
                      text={item.conclusion}
                      variant={
                        item.conclusion.includes("强烈推荐")
                          ? "up"
                          : item.conclusion.includes("不建议")
                          ? "down"
                          : "default"
                      }
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">原因：{item.why}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">做法：{item.how}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">预算：{item.budget}</p>
                  <p className="mt-1 text-xs text-[var(--danger)]">风险：{item.risk}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
