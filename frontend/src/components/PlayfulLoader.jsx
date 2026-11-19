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
    <div data-testid={RENT.loader} className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-8 px-6">
      <motion.div
        animate={{ x: [-60, 60], rotate: [0, 8, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFB020] text-[#3A2400]"
      >
        <Plane className="h-9 w-9" />
      </motion.div>
      <div className="h-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            data-testid={RENT.loaderLine}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display text-2xl font-bold text-white sm:text-3xl"
          >
            {LINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, ease: "easeInOut" }} className="h-full bg-[#10E39A]" />
      </div>
    </div>
  );
};
