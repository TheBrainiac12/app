import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { RENT } from "@/constants/testIds/rent";

export const SummaryChip = ({ origin, rentLocal, note, onEdit }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">From {origin.city}, {origin.country}</p>
    <h2 data-testid={RENT.resultsHeadline} className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
      Your <span className="text-[#10E39A]">{rentLocal}</span>/mo buys…
    </h2>
    <p className="text-xs text-white/55">Tap a glowing city on the globe to open its full report.</p>
    {note && <p data-testid={RENT.allGapNote} className="rounded-xl border border-[#FF5A7A]/30 bg-[#FF5A7A]/10 px-3 py-2 text-xs text-white/80">{note}</p>}
    <button
      data-testid={RENT.editButton}
      onClick={onEdit}
      className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <Pencil className="h-3.5 w-3.5" /> Edit inputs
    </button>
  </motion.div>
);
