import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CityCombobox } from "@/components/CityCombobox";
import { CITIES } from "@/lib/engine";
import { currencyOf, formatMoney, formatUsd, fromEur, niceRound, sliderStep, toEur } from "@/lib/currency";
import { RENT } from "@/constants/testIds/rent";

const rise = (d) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] } });

export const RentField = ({ city, rent, setRent, focusKey }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    if (!focusKey || !inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.select();
  }, [focusKey, city]);
  const code = currencyOf(city.country);
  const typical = fromEur(city.housing["1_bed_center"], code);
  const min = niceRound(typical * 0.3);
  const max = niceRound(typical * 3);
  const step = sliderStep(max);
  return (
    <motion.div {...rise(0)} className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-[#10E39A]/70">
        <span className="font-mono text-sm text-white/50">{code}</span>
        <input
          ref={inputRef}
          data-testid={RENT.rentInput}
          inputMode="numeric"
          value={rent ? Math.round(rent).toLocaleString(code === "INR" ? "en-IN" : "en-US") : ""}
          placeholder="Monthly rent"
          onChange={(e) => setRent(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          className="h-14 min-w-0 flex-1 bg-transparent font-display text-2xl font-bold text-white outline-none placeholder:text-white/30 placeholder:text-base placeholder:font-normal"
        />
        <span data-testid={RENT.usdEquivalent} className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white/70">
          ≈ {formatUsd(toEur(rent || 0, code))}
        </span>
      </div>
      <Slider
        data-testid={RENT.rentSlider}
        min={min}
        max={max}
        step={step}
        value={[Math.min(Math.max(rent || min, min), max)]}
        onValueChange={([v]) => setRent(v)}
        className="rent-slider py-2"
      />
      <div className="flex justify-between font-mono text-[11px] text-white/40">
        <span>{formatMoney(min, code)}</span>
        <span>typical 1-bed: {formatMoney(typical, code)}</span>
        <span>{formatMoney(max, code)}</span>
      </div>
    </motion.div>
  );
};

const PRESETS = [
  { id: "bangalore-india", label: "Bangalore · ₹45,000", rent: 45000 },
  { id: "mumbai-india", label: "Mumbai · ₹65,000", rent: 65000 },
  { id: "london-united-kingdom", label: "London · £2,200", rent: 2200 },
  { id: "new-york-ny-united-states", label: "New York · $3,500", rent: 3500 },
];

export const Presets = ({ onPick }) => (
  <motion.div {...rise(0.32)} className="flex flex-wrap items-center gap-2 pt-1">
    <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Quick try</span>
    {PRESETS.map((p) => (
      <button
        key={p.id}
        type="button"
        data-testid={`hero-preset-${p.id}`}
        onClick={() => onPick(CITIES.find((c) => c.id === p.id), p.rent)}
        className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 transition-[background-color,border-color,color] hover:border-[#10E39A]/60 hover:bg-[#10E39A]/10 hover:text-white"
      >
        {p.label}
      </button>
    ))}
  </motion.div>
);

export const RentHero = ({ city, setCity, rent, setRent, onCompare, focusKey, onGuess }) => {
  const pickCity = (c) => {
    setCity(c);
    if (c) setRent(niceRound(fromEur(c.housing["1_bed_center"], currencyOf(c.country))));
  };
  const ready = city && rent > 0;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-4xl">
          What your rent buys <span className="text-[#FFB020]">elsewhere.</span>
        </h1>
        <p className="mt-2 text-sm text-white/55">Same money, different map. Search or click your city on the globe.</p>
      </div>
      <form
        data-testid={RENT.heroForm}
        onSubmit={(e) => { e.preventDefault(); if (ready) onCompare(city, rent); }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">I live in</label>
          <CityCombobox value={city} onSelect={pickCity} />
        </div>
        {city && (
          <div className="space-y-2">
            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">I pay every month</label>
            <RentField city={city} rent={rent} setRent={setRent} focusKey={focusKey} />
          </div>
        )}
        <button
          type="submit"
          data-testid={RENT.compareButton}
          disabled={!ready}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-full border border-transparent bg-[#0B9E6C] font-display text-base font-bold text-white shadow-[0_0_40px_-8px_rgba(16,227,154,0.6)] transition-[transform,background-color,box-shadow] hover:bg-[#0DB57C] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-transparent disabled:text-white/35 disabled:shadow-none"
        >
          Compare on the globe <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
      {ready && (
        <button
          type="button"
          data-testid="hero-guess-mode-button"
          onClick={() => onGuess(city, rent)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#FFD36E]/50 font-display text-sm font-bold text-[#FFD36E] transition-colors hover:bg-[#FFD36E]/10"
        >
          <Target className="h-4 w-4" /> Guess Mode: can your rent survive?
        </button>
      )}
      <Presets onPick={(c, r) => { setCity(c); setRent(r); onCompare(c, r); }} />
    </div>
  );
};
