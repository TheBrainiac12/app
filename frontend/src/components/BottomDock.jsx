import { useState } from "react";
import { motion } from "framer-motion";
import { Globe2, Shuffle } from "lucide-react";
import { RENT } from "@/constants/testIds/rent";

export const BottomDock = ({ onShuffle, explore, setExplore }) => {
  const [spin, setSpin] = useState(0);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-3">
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-testid="globe-bottom-dock"
      className="glass-panel pointer-events-auto flex items-center gap-2 rounded-full p-1.5"
    >
      <button
        data-testid={RENT.shuffleButton}
        onClick={() => { setSpin((s) => s + 1); onShuffle(); }}
        className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#FFB020] px-5 text-sm font-bold text-[#3A2400] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.5 }}><Shuffle className="h-4 w-4" /></motion.span>
        Shuffle 5 Cities
      </button>
      <button
        data-testid="explore-all-toggle"
        aria-pressed={explore}
        onClick={() => setExplore(!explore)}
        className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${explore ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
      >
        <Globe2 className="h-4 w-4" />
        <span className="hidden sm:inline">Explore all 160 cities</span>
        <span className="sm:hidden">All 160</span>
        <span className={`h-2 w-2 rounded-full ${explore ? "bg-[#10E39A]" : "bg-white/30"}`} />
      </button>
    </motion.div>
    </div>
  );
};
