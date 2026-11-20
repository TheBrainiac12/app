import { useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { CITIES } from "@/lib/engine";
import { Flag } from "@/components/Flag";

export const DockCitySearch = ({ origin, onPick }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = (c) => (c.city.toLowerCase().startsWith(q) ? 0 : 1);
    return CITIES.filter((c) => c.id !== origin.id && c.label.toLowerCase().includes(q))
      .sort((a, b) => starts(a) - starts(b))
      .slice(0, 7);
  }, [query, origin]);

  const choose = (c, input) => {
    onPick(c);
    setQuery("");
    setOpen(false);
    input?.blur();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && matches[active]) { e.preventDefault(); choose(matches[active], e.currentTarget); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); setQuery(""); e.currentTarget.blur(); }
  };

  return (
    <div className="relative">
      <div className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 focus-within:border-[#22D3EE]/60">
        <Compass className="h-4 w-4 shrink-0 text-[#22D3EE]" />
        <input
          data-testid="dock-city-search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKey}
          placeholder="Compare vs. any city…"
          className="w-28 min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40 sm:w-44"
        />
      </div>
      {open && matches.length > 0 && (
        <ul data-testid="dock-city-search-list" className="glass-panel absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-2xl p-1.5">
          {matches.map((c, i) => (
            <li
              key={c.id}
              data-testid={`dock-city-option-${c.id}`}
              onMouseDown={(e) => { e.preventDefault(); choose(c); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${i === active ? "bg-white/10 text-white" : "text-white/75"}`}
            >
              <Flag country={c.country} height={14} />
              <span className="font-semibold">{c.city}</span>
              <span className="truncate text-xs text-white/45">{c.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
