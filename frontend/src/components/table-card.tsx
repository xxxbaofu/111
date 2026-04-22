import type { ReactNode } from "react";

type TableCardProps = {
  title: string;
  columns: string[];
  rows: ReactNode[][];
  desc?: string;
  description?: string;
};

export function TableCard({ title, columns, rows, desc, description }: TableCardProps) {
  const text = description ?? desc;
  return (
    <section className="card card-glow">
      <h3 className="text-base font-semibold tracking-wide text-[var(--text-main)]">{title}</h3>
      {text ? <p className="mb-3 mt-1 text-xs text-[var(--text-muted)]">{text}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              {columns.map((column) => (
                <th key={column} className="px-2 py-2 font-medium uppercase tracking-wide text-[11px]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t border-white/8">
                <td
                  colSpan={Math.max(1, columns.length)}
                  className="px-2 py-3 text-center text-xs text-[var(--text-muted)]"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${title}-${index}`}
                  className="border-t border-white/8 transition-colors hover:bg-white/[0.03]"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={`${title}-${index}-${cIdx}`}
                      className="px-2 py-2 text-[var(--text-main)]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
