import { getProducts } from "@/lib/api";

export default async function CategoryPage() {
  const products = await getProducts({ region: "US" });
  const map = new Map<
    number,
    { heat: number; growth: number; price: number; competition: number; count: number }
  >();

  for (const item of products.items) {
    const curr = map.get(item.category_id) ?? {
      heat: 0,
      growth: 0,
      price: 0,
      competition: 0,
      count: 0,
    };
    curr.heat += item.heat_score;
    curr.growth += item.growth_score;
    curr.price += item.price_avg;
    curr.competition += item.competition_score;
    curr.count += 1;
    map.set(item.category_id, curr);
  }

  const rows = [...map.entries()].map(([categoryId, v]) => ({
    category: `品类-${categoryId}`,
    heat: v.heat / v.count,
    growth: v.growth / v.count,
    price: v.price / v.count,
    competition: v.competition / v.count,
    count: v.count,
  }));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Category（品类）</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="py-2">品类</th>
              <th>热度</th>
              <th>增长</th>
              <th>均价</th>
              <th>竞争度</th>
              <th>产品数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-t border-slate-800">
                <td className="py-2">{row.category}</td>
                <td>{row.heat.toFixed(2)}</td>
                <td>{row.growth.toFixed(3)}</td>
                <td>${row.price.toFixed(2)}</td>
                <td>{row.competition.toFixed(2)}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
