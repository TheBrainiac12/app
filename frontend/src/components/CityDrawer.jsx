import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CityCard } from "@/components/CityCard";

export const CityDrawer = ({ card, code, onClose, onShare }) => (
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
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Destination report</p>
          <button
            data-testid="city-drawer-close-button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CityCard card={card} code={code} index={0} onShare={onShare} />
      </motion.aside>
    )}
  </AnimatePresence>
);
