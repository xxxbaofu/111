type TableCardProps = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
};

export function TableCard({ title, columns, rows }: TableCardProps) {
  return (
    <section className="card">
      <h3 className="mb-3 text-base font-semibold text-[var(--text-main)]">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              {columns.map((column) => (
                <th key={column} className="px-2 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-white/5">
                {row.map((cell, cIdx) => (
                  <td
                    key={`${title}-${index}-${cIdx}`}
                    className="px-2 py-2 text-[var(--text-main)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
