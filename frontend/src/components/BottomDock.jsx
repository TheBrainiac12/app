import { useState } from "react";
import { motion } from "framer-motion";
import { Globe2, Shuffle, Target } from "lucide-react";
import { RENT } from "@/constants/testIds/rent";
import { DockCitySearch } from "@/components/DockCitySearch";

export const BottomDock = ({ onShuffle, explore, setExplore, origin, onPickCity, onGuess }) => {
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
        className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#FFB020] px-4 sm:px-5 text-sm font-bold text-[#3A2400] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.5 }}><Shuffle className="h-4 w-4" /></motion.span>
        <span className="hidden sm:inline">Shuffle 5 Cities</span>
        <span className="sm:hidden">Shuffle</span>
      </button>
      <DockCitySearch origin={origin} onPick={onPickCity} />
      <button
        data-testid="dock-guess-mode-button"
        onClick={onGuess}
        className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FFD36E]/50 px-3 text-sm font-bold text-[#FFD36E] transition-colors hover:bg-[#FFD36E]/10 sm:px-4"
      >
        <Target className="h-4 w-4" /> <span className="hidden sm:inline">Guess Mode</span><span className="sm:hidden">Guess</span>
      </button>
      <button
        data-testid="explore-all-toggle"
        aria-pressed={explore}
        onClick={() => setExplore(!explore)}
        className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-colors sm:px-5 ${explore ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
      >
        <Globe2 className="h-4 w-4" />
        <span className="hidden lg:inline">Explore all 160 cities</span>
        <span className="lg:hidden">All</span>
        <span className={`h-2 w-2 rounded-full ${explore ? "bg-[#10E39A]" : "bg-white/30"}`} />
      </button>
      <span data-testid="dock-keyboard-hint" className="hidden pr-3 font-mono text-[11px] text-white/45 xl:inline">← → Switch cities</span>
    </motion.div>
    </div>
  );
};
