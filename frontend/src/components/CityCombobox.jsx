import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { CITIES } from "@/lib/engine";
import { RENT } from "@/constants/testIds/rent";

export const CityCombobox = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value ? value.label : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? CITIES.filter((c) => c.label.toLowerCase().includes(q)) : CITIES;
    const starts = (c) => (c.city.toLowerCase().startsWith(q) ? 0 : 1);
    return [...list].sort((a, b) => starts(a) - starts(b)).slice(0, 8);
  }, [query]);

  const choose = (city) => {
    onSelect(city);
    setQuery(city.label);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); setOpen(true); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && open && matches[active]) { e.preventDefault(); choose(matches[active]); }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
      <input
        data-testid={RENT.cityInput}
        value={query}
        placeholder="Start typing… Mumbai, London, New York"
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); if (value) onSelect(null); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#10E39A]/70 focus:bg-white/[0.07]"
      />
      {open && (
        <ul className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-white/10 bg-[#141924] p-1.5 shadow-2xl">
          {matches.length === 0 && (
            <li data-testid={RENT.cityEmpty} className="px-4 py-3 text-sm text-white/50">No city matches “{query}”</li>
          )}
          {matches.map((c, i) => (
            <li
              key={c.id}
              data-testid={`${RENT.cityOption}-${c.id}`}
              onMouseDown={(e) => { e.preventDefault(); choose(c); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors ${i === active ? "bg-white/10 text-white" : "text-white/75"}`}
            >
              <span className="font-medium">{c.city}</span>
              <span className="text-xs text-white/40">{c.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
