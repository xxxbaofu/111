"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/badge";
import { getProducts, type ProductRow, type Region } from "@/lib/api";

const REGIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

export default function ProductsPage() {
  const [region, setRegion] = useState<Region>("US");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [maxCompetition, setMaxCompetition] = useState(100);
  const [beginnerOnly, setBeginnerOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    getProducts({ region })
      .then((res) => {
        if (!cancelled) setRows(res.items);
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products（产品库）</h1>
      <section className="card grid gap-3 lg:grid-cols-4">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="最低分"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value || 0))}
        />
        <input
          type="number"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="最高竞争"
          value={maxCompetition}
          onChange={(e) => setMaxCompetition(Number(e.target.value || 100))}
        />
        <label className="flex items-center gap-2 rounded border border-slate-700 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={beginnerOnly}
            onChange={(e) => setBeginnerOnly(e.target.checked)}
          />
          仅看新手友好
        </label>
      </section>

      <section className="card overflow-x-auto">
        {loading ? (
          <div className="text-sm text-slate-400">加载中...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2">产品</th>
                <th>市场</th>
                <th>分数</th>
                <th>热度</th>
                <th>增长</th>
                <th>讨论</th>
                <th>竞争</th>
                <th>预算</th>
                <th>标签</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="py-2">{item.name_cn}</td>
                  <td>{item.market}</td>
                  <td>{item.score.toFixed(1)}</td>
                  <td>{item.heat_score.toFixed(2)}</td>
                  <td>{item.growth_score.toFixed(3)}</td>
                  <td>{item.discussion_score.toFixed(2)}</td>
                  <td>{item.competition_score.toFixed(1)}</td>
                  <td>${item.budget_daily.toFixed(0)}/day</td>
                  <td>
                    <Badge text={item.recommendation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
