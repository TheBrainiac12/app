import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plane } from "lucide-react";
import { RENT } from "@/constants/testIds/rent";

const LINES = ["Packing your bags…", "Checking global listings…", "Converting currencies…"];

export const PlayfulLoader = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, LINES.length - 1)), 270);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-30 flex justify-center px-3">
    <motion.div
      data-testid={RENT.loader}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-panel flex items-center gap-4 rounded-full py-3 pl-3 pr-6"
    >
      <motion.div
        animate={{ rotate: [0, 12, 0], x: [-3, 3, -3] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB020] text-[#3A2400]"
      >
        <Plane className="h-5 w-5" />
      </motion.div>
      <div className="h-7 w-56 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            data-testid={RENT.loaderLine}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display text-lg font-bold text-white"
          >
            {LINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
    </div>
  );
};
