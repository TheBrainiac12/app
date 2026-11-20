import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const buildUrl = (homeCity, monthlyRent, destCity) => {
  let url = `/escape.html?home=${encodeURIComponent(homeCity)}&rent=${encodeURIComponent(monthlyRent)}`;
  if (destCity) url += `&dest=${encodeURIComponent(destCity)}`;
  return url;
};

export const EscapeModal = ({ isOpen, onClose, homeCity, monthlyRent, destCity }) => {
  const frameRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const onLoad = () => {
    const win = frameRef.current && frameRef.current.contentWindow;
    if (!win) return;
    try {
      win.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeRef.current();
      });
      win.focus();
    } catch (err) {
      // cross-origin frames cannot be wired; the window listener still works
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="escape-modal"
          data-testid="escape-modal"
          className="fixed inset-0 z-50 bg-[#090B10]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
            <p data-testid="escape-modal-title" className="font-display text-sm font-bold text-white">
              elsewhere <span className="text-white/40">·</span> <span className="text-white/70">Apartment & Neighborhood</span>
            </p>
            <button
              data-testid="escape-modal-back-button"
              onClick={onClose}
              className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to 3D Globe
            </button>
          </div>
          <iframe
            ref={frameRef}
            data-testid="escape-modal-iframe"
            src={buildUrl(homeCity, monthlyRent, destCity)}
            onLoad={onLoad}
            title="elsewhere Escape"
            className="h-[calc(100vh-3rem)] w-full border-0"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
