import { useState } from "react";
import { motion } from "framer-motion";
import { cardWithSize } from "@/lib/engine";
import { BedDouble, Check, PiggyBank, Share2, Sparkles, TrendingUp, Wifi } from "lucide-react";
import { formatEur, formatUsd } from "@/lib/currency";
import { salaryLine, styleFor } from "@/lib/theme";
import { flagOf } from "@/lib/flags";
import { RENT } from "@/constants/testIds/rent";

const VIBE = [
  { key: "dinner_for_two", icon: "🍽️", label: "Dinner for 2" },
  { key: "cappuccino", icon: "☕", label: "Cappuccino" },
  { key: "gym_membership", icon: "🏋️", label: "Gym / mo" },
  { key: "monthly_pass", icon: "🚇", label: "Transit pass" },
];

const VibeGrid = ({ card, code, id }) => (
  <div data-testid={`${id}-vibe`} className="space-y-2">
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Local vibe snapshot</p>
    <div className="grid grid-cols-2 gap-2">
      {VIBE.map((v) => (
        <div key={v.key} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] text-white/50"><span className="mr-1">{v.icon}</span>{v.label}</p>
          <p className="font-display text-sm font-bold text-white">{formatEur(card.city.lifestyle[v.key], code)}</p>
        </div>
      ))}
    </div>
  </div>
);

const TIERS = [
  { key: "1_bed_center", label: "1-Bed · Centre" },
  { key: "1_bed_outside", label: "1-Bed · Outside" },
  { key: "3_bed_center", label: "3-Bed · Centre" },
  { key: "3_bed_outside", label: "3-Bed · Outside" },
];

const SizeToggle = ({ size, setSize, color, id }) => (
  <div data-testid={`${id}-size-toggle`} className="grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
    {["1", "3"].map((s) => (
      <button
        key={s}
        data-testid={`${id}-size-${s}bed`}
        aria-pressed={size === s}
        onClick={() => setSize(s)}
        className="h-9 rounded-full text-sm font-bold transition-colors"
        style={size === s ? { background: color, color: "#0B0E15" } : { color: "rgba(255,255,255,0.6)" }}
      >
        {s}-Bed
      </button>
    ))}
  </div>
);

const TierRef = ({ card, code, color, id }) => (
  <div data-testid={`${id}-tiers`} className="space-y-2">
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">All housing tiers</p>
    <div className="grid grid-cols-2 gap-2">
      {TIERS.map((t) => {
        const price = card.city.housing[t.key];
        const active = card.tierKey === t.key;
        const ok = price <= card.rentEur;
        return (
          <div key={t.key} className="rounded-xl border px-3 py-2" style={{ borderColor: active ? color : "rgba(255,255,255,0.07)", background: active ? `${color}14` : "rgba(255,255,255,0.03)" }}>
            <p className="text-[11px] text-white/50">{t.label}</p>
            <p className={`font-display text-sm font-bold ${ok ? "text-white" : "text-white/40 line-through decoration-[#FF5A7A]/60"}`}>{formatEur(price, code)}</p>
          </div>
        );
      })}
    </div>
  </div>
);

const RentBar = ({ card, code, color }) => {
  const local = card.reality ? card.needed : card.housingCost;
  const pct = card.reality ? Math.min(100, (card.rentEur / local) * 100) : Math.min(100, (local / card.rentEur) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-white/45">
        <span>Your rent {formatEur(card.rentEur, code)}</span>
        <span>{card.reality ? "Cheapest" : "Local"} {formatEur(local, code)}</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%`, background: color }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

const Perks = ({ card, code, color, id }) => (
  <div className="space-y-2.5">
    {card.billsCovered && (
      <span data-testid={`${id}-bills-badge`} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: `${color}55`, color }}>
        <Wifi className="h-3.5 w-3.5" /> Utilities + Wi-Fi covered
      </span>
    )}
    {card.perks.length === 0 && <p className="text-sm text-white/55">All-in on space: every bit goes to the apartment.</p>}
    <ul className="space-y-2">
      {card.perks.map((p) => (
        <li key={p.type} data-testid={`${id}-perk-${p.type}`} className="flex items-start gap-2.5 text-sm text-white/85">
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} /> <span>Plus {p.text}</span>
        </li>
      ))}
    </ul>
    {card.savings >= 1 && (
      <p data-testid={`${id}-savings`} className="flex items-center gap-2 font-display text-lg font-bold" style={{ color }}>
        <PiggyBank className="h-5 w-5" /> + {formatEur(card.savings, code)} saved every month
      </p>
    )}
  </div>
);

const RealityBody = ({ card, code, color, id }) => (
  <div className="space-y-3">
    <p data-testid={`${id}-gap`} className="font-display text-2xl font-extrabold" style={{ color }}>
      You'd need <span className="whitespace-nowrap">+{formatEur(card.gap, code)}/mo</span>
    </p>
    <p className="text-xs font-mono text-white/45">≈ +{formatUsd(card.gap)}/mo for a {card.size}-bed outside the centre</p>
    <p className="text-sm text-white/75">{card.tradeOff}</p>
  </div>
);

export const CityCard = ({ card: baseCard, code, index, onShare }) => {
  const [size, setSize] = useState(baseCard.size);
  const card = cardWithSize(baseCard, size);
  const s = styleFor(baseCard);
  const bar = card.reality ? "#FF5A7A" : s.hex;
  const id = `${RENT.card}-${card.city.id}`;
  return (
    <motion.article
      layout
      data-testid={id}
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
      transition={{ type: "spring", damping: 18, stiffness: 120, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`city-card group flex flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#121620] ${index === 3 ? "hidden md:flex" : "flex"}`}
    >
      <div className="relative overflow-hidden p-5 pb-6" style={{ background: s.hex, color: s.ink }}>
        <div className="gloss" />
        <div className="relative flex items-center justify-between">
          <span className="rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ background: s.ink, color: s.hex }}>
            {s.name}
          </span>
          {card.reality ? <TrendingUp className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <h3 className="relative mt-8 break-words font-display text-3xl font-extrabold leading-none tracking-tight">
          {card.city.city} <span className="align-middle text-2xl">{flagOf(card.city.country)}</span>
        </h3>
        <p className="relative mt-1 text-sm font-medium opacity-75">{card.city.country}</p>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-center gap-2.5">
          <BedDouble className="h-6 w-6 shrink-0" style={{ color: s.hex }} />
          <p data-testid={`${id}-apartment`} className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {card.reality ? `Not even a ${card.size}-bed… yet` : card.apartment}
          </p>
        </div>
        <SizeToggle size={size} setSize={setSize} color={s.hex} id={id} />
        <RentBar card={card} code={code} color={bar} />
        <TierRef card={card} code={code} color={s.hex} id={id} />
        {card.reality ? <RealityBody card={card} code={code} color={bar} id={id} /> : <Perks card={card} code={code} color={s.hex} id={id} />}
        <div className="mt-auto space-y-4">
          <VibeGrid card={card} code={code} id={id} />
          <p data-testid={`${id}-salary`} className="rounded-full px-3.5 py-2 text-center text-xs font-semibold" style={{ background: `${s.hex}1A`, color: s.hex, border: `1px solid ${s.hex}40` }}>
            {salaryLine(card.salaryRatio)}
          </p>
        </div>
        <button
          data-testid={`${RENT.shareButton}-${card.city.id}`}
          onClick={() => onShare(card)}
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-white transition-[background-color,border-color] hover:border-transparent hover:bg-white hover:text-black"
        >
          <Share2 className="h-4 w-4" /> Share Card
        </button>
      </div>
    </motion.article>
  );
};
