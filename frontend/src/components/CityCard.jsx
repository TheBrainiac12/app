import { motion } from "framer-motion";
import { BedDouble, Check, PiggyBank, Share2, Sparkles, TrendingUp, Wifi } from "lucide-react";
import { formatEur, formatUsd } from "@/lib/currency";
import { salaryLine, styleFor } from "@/lib/theme";
import { RENT } from "@/constants/testIds/rent";

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
          animate={{ width: `${pct}%` }}
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
    <p className="text-xs font-mono text-white/45">≈ +{formatUsd(card.gap)}/mo for a 1-bed outside the centre</p>
    <p className="text-sm text-white/75">{card.tradeOff}</p>
  </div>
);

export const CityCard = ({ card, code, index, onShare }) => {
  const s = styleFor(card);
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
        <h3 className="relative mt-8 font-display text-3xl font-extrabold leading-none tracking-tight">{card.city.city}</h3>
        <p className="relative mt-1 text-sm font-medium opacity-75">{card.city.country}</p>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-center gap-2.5">
          <BedDouble className="h-5 w-5 text-white/50" />
          <p data-testid={`${id}-apartment`} className="font-display text-lg font-bold text-white">
            {card.reality ? "Not even a 1-bed… yet" : card.apartment}
          </p>
        </div>
        <RentBar card={card} code={code} color={s.hex} />
        {card.reality ? <RealityBody card={card} code={code} color={s.hex} id={id} /> : <Perks card={card} code={code} color={s.hex} id={id} />}
        <p data-testid={`${id}-salary`} className="mt-auto border-t border-white/10 pt-4 font-mono text-xs text-white/55">{salaryLine(card.salaryRatio)}</p>
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
