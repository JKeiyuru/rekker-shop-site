/* eslint-disable react/prop-types */
// client/src/components/shopping-view/filter.jsx
// The shop filter: exactly two things — Category and Brand. Options come from
// the server with live counts, so you can never click into an empty page.
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function Row({ active, onClick, label, count, indent = false, strong = false, partial = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${indent ? "pl-8" : ""} ${
        active || partial ? "bg-primary/10 font-semibold text-primary" : `text-ink hover:bg-secondary ${strong ? "font-medium" : ""}`
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${active ? "border-primary bg-primary text-white" : partial ? "border-primary bg-white text-primary" : "border-border bg-white"}`}>
          {partial && !active && <span className="h-0.5 w-2 rounded bg-primary" />}
          {active && <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.2l2.2 2.2 4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        {label}
      </span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  );
}

export default function ProductFilter({ options, selected, onToggleCategory, onToggleBrand, onClear }) {
  const [open, setOpen] = useState({});
  const cats = options?.categories || [];
  const brands = options?.brands || [];
  const hasAny = (selected.category?.length || 0) + (selected.brand?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Filter</h2>
        {hasAny && <button onClick={onClear} className="text-sm font-medium text-primary hover:underline">Clear all</button>}
      </div>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Category</h3>
        <div className="space-y-0.5">
          {cats.map((c) => {
            const topActive = selected.category?.includes(c.slug);
            const childActive = c.children.some((s) => selected.category?.includes(s.slug));
            const expanded = open[c._id] ?? (topActive || childActive);
            return (
              <div key={c._id}>
                <div className="flex items-center">
                  <div className="flex-1"><Row strong active={topActive && !childActive} partial={topActive && childActive} onClick={() => onToggleCategory(c.slug)} label={c.name} count={c.count} /></div>
                  {c.children.length > 0 && (
                    <button type="button" aria-label="Show subcategories" onClick={() => setOpen((o) => ({ ...o, [c._id]: !expanded }))} className="rounded p-1.5 text-muted-foreground hover:bg-secondary">
                      {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {expanded && c.children.map((s) => (
                  <Row key={s._id} indent active={selected.category?.includes(s.slug)} onClick={() => onToggleCategory(s.slug)} label={s.name} count={s.count} />
                ))}
              </div>
            );
          })}
          {cats.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No categories match.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Brand</h3>
        <div className="space-y-0.5">
          {brands.map((b) => (
            <Row key={b._id} active={selected.brand?.includes(b.slug)} onClick={() => onToggleBrand(b.slug)} label={b.name} count={b.count} />
          ))}
          {brands.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No brands match.</p>}
        </div>
      </section>
    </div>
  );
}
