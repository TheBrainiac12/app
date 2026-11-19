import { AnimatePresence, motion } from "framer-motion";
import { Home, X } from "lucide-react";
import { CityCard } from "@/components/CityCard";

export const CityDrawer = ({ card, code, onClose, onShare, onMakeOrigin, cycle }) => (
  <AnimatePresence>
    {card && (
      <motion.aside
        key={card.city.id}
        data-testid="city-drawer"
        initial={{ x: "105%" }}
        animate={{ x: 0 }}
        exit={{ x: "105%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
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
        <CityCard card={card} code={code} index={0} onShare={onShare} />
        <button
          data-testid="drawer-make-origin-button"
          onClick={() => onMakeOrigin(card.city)}
          className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Home className="h-4 w-4" /> Make this my origin city
        </button>
      </motion.aside>
    )}
  </AnimatePresence>
);
