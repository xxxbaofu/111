"use client";

export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start";
  return (
    <div className={"flex flex-col " + alignment}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-title mt-4 text-balance">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  );
}
