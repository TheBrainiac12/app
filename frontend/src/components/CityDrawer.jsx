import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, X } from "lucide-react";
import { CityCard } from "@/components/CityCard";

export const CityDrawer = ({ card, code, onClose, onShare, onMakeOrigin, cycle, originName, onMoveIn }) => {
  const [shown, setShown] = useState(card);
  useEffect(() => {
    if (card) setShown(card);
  }, [card]);
  if (!shown) return null;
  const open = !!card;
  return (
    <motion.aside
      data-testid={open ? "city-drawer" : "city-drawer-closing"}
      initial={{ x: "105%" }}
      animate={{ x: open ? 0 : "105%" }}
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      onAnimationComplete={() => { if (!open) setShown(null); }}
      className="fixed bottom-0 right-0 top-0 z-40 flex w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0B0E15]/95 p-4 backdrop-blur-xl sm:w-[420px] sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Destination report</p>
          {cycle && (
            <span data-testid="drawer-keyboard-hint" className="hidden rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/55 sm:inline">← → Switch cities</span>
          )}
        </div>
        <button
          data-testid="city-drawer-close-button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="shrink-0">
        <CityCard key={shown.city.id} card={shown} code={code} index={0} onShare={onShare} originName={originName} />
      </div>
      <button
        data-testid="drawer-move-in-button"
        onClick={() => onMoveIn(shown.city)}
        className="mt-3 flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFB020] font-display text-sm font-bold text-[#2A1A00] transition-transform hover:-translate-y-0.5"
      >
        <Home className="h-4 w-4" /> Move In & Live a Day Here
      </button>
      <button
        data-testid="drawer-make-origin-button"
        onClick={() => onMakeOrigin(shown.city)}
        className="mt-3 flex h-10 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <MapPin className="h-4 w-4" /> Make this my origin city
      </button>
    </motion.aside>
  );
};
