import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Shuffle } from "lucide-react";
import { CityCard } from "@/components/CityCard";
import { ShareDialog } from "@/components/ShareDialog";
import { currencyOf, formatMoney } from "@/lib/currency";
import { RENT } from "@/constants/testIds/rent";

export const ResultsView = ({ origin, rent, batch, onShuffle, onEdit }) => {
  const [shareCard, setShareCard] = useState(null);
  const [spin, setSpin] = useState(0);
  const code = currencyOf(origin.country);
  const rentLocal = formatMoney(rent, code);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">From {origin.city}, {origin.country}</p>
          <h2 data-testid={RENT.resultsHeadline} className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Your <span className="text-[#10E39A]">{rentLocal}</span>/mo buys…
          </h2>
        </motion.div>
        <div className="flex gap-3">
          <button
            data-testid={RENT.editButton}
            onClick={onEdit}
            className="flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Edit inputs
          </button>
          <button
            data-testid={RENT.shuffleButton}
            onClick={() => { setSpin((s) => s + 1); onShuffle(); }}
            className="flex h-12 items-center gap-2 rounded-full bg-[#FFB020] px-6 text-sm font-bold text-[#3A2400] transition-transform hover:scale-[1.03] active:scale-95"
          >
            <motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.5 }}><Shuffle className="h-4 w-4" /></motion.span>
            Shuffle Cities
          </button>
        </div>
      </div>
      {(batch.allGap || batch.fewCovered) && (
        <p data-testid={RENT.allGapNote} className="mb-6 rounded-2xl border border-[#FF5A7A]/30 bg-[#FF5A7A]/10 px-5 py-4 text-sm text-white/80">
          {batch.allGap
            ? "That rent is a real bargain already. No other city in our list beats it, so here are the closest ones."
            : "That rent already goes far. Only a few cities beat it, so we added the closest ones you'd almost afford."}
        </p>
      )}
      <div data-testid={RENT.resultsGrid} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {batch.cards.map((c, i) => (
            <CityCard key={`${batch.id}-${c.city.id}`} card={c} code={code} index={i} onShare={setShareCard} />
          ))}
        </AnimatePresence>
      </div>
      <ShareDialog card={shareCard} onClose={() => setShareCard(null)} origin={origin} code={code} rentLocal={rentLocal} />
    </section>
  );
};
