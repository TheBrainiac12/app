import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportCard } from "@/components/ExportCard";
import { RENT } from "@/constants/testIds/rent";

const FORMATS = [
  { key: "square", label: "Square", size: "1080×1080", testid: RENT.shareSquare },
  { key: "story", label: "Story", size: "1080×1920", testid: RENT.shareStory },
];

const capture = async (node, opts) => {
  try {
    return await toPng(node, opts);
  } catch {
    return toPng(node, { ...opts, skipFonts: true });
  }
};

export const ShareDialog = ({ card, onClose, ...props }) => {
  const [format, setFormat] = useState("square");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const height = format === "story" ? 1920 : 1080;
  const fit = Math.min(1, (window.innerWidth - 64) / 389);
  const scale = (format === "story" ? 0.22 : 0.36) * fit;

  const download = async () => {
    setBusy(true);
    try {
      const url = await capture(ref.current, { width: 1080, height, pixelRatio: 1, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `rent-${props.origin.city}-vs-${card.city.city}-${format}.png`.toLowerCase().replace(/\s+/g, "-");
      a.click();
      toast.success("Image downloaded. Go flex it.");
    } catch {
      toast.error("Couldn't create the image. Please try again.");
    }
    setBusy(false);
  };

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={RENT.shareDialog} className="max-w-[calc(100vw-16px)] sm:max-w-md border-white/10 bg-[#121620] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Share this comparison</DialogTitle>
          <DialogDescription className="text-white/50">Made on your device. Nothing is uploaded.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              data-testid={f.testid}
              onClick={() => setFormat(f.key)}
              className={`rounded-2xl border p-3 text-left transition-colors ${format === f.key ? "border-[#10E39A] bg-[#10E39A]/10" : "border-white/10 hover:border-white/30"}`}
            >
              <p className="font-semibold">{f.label}</p>
              <p className="font-mono text-xs text-white/50">{f.size}</p>
            </button>
          ))}
        </div>
        {card && (
          <div className="mx-auto overflow-hidden rounded-xl" style={{ width: 1080 * scale, height: height * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <ExportCard ref={ref} card={card} format={format} {...props} />
            </div>
          </div>
        )}
        <button
          data-testid={RENT.downloadButton}
          onClick={download}
          disabled={busy}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#10E39A] font-bold text-[#03261A] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} Download PNG
        </button>
      </DialogContent>
    </Dialog>
  );
};
