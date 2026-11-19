import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Loader2, Share2, Shuffle } from "lucide-react";
import { FaFacebookF, FaInstagram, FaThreads, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportCard } from "@/components/ExportCard";
import { buildCaption, captionTemplates, copyImage, downloadBlob, fileName, renderBlob } from "@/lib/share";
import { RENT } from "@/constants/testIds/rent";

const FORMATS = [
  { key: "square", label: "Square", size: "1080×1080", testid: RENT.shareSquare },
  { key: "story", label: "Story", size: "1080×1920", testid: RENT.shareStory },
];

const PASTE_TOAST = "Image copied! Paste (Ctrl/Cmd+V) into your post";

const useCaption = (card, props) => {
  const templates = useMemo(() => (card ? captionTemplates(card) : []), [card]);
  const [i, setI] = useState(0);
  useEffect(() => setI(Math.floor(Math.random() * 10)), [card]);
  const caption = card && templates.length ? buildCaption(templates[i % templates.length], { card, ...props }) : "";
  return [caption, () => setI((x) => x + 1 + Math.floor(Math.random() * (templates.length - 1 || 1)))];
};

const SocialButton = ({ testid, label, onClick, children }) => (
  <button
    data-testid={testid}
    onClick={onClick}
    title={label}
    aria-label={label}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white transition-[transform,background-color,border-color] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
  >
    {children}
  </button>
);

export const ShareDialog = ({ card, onClose, ...props }) => {
  const [format, setFormat] = useState("square");
  const [file, setFile] = useState(null);
  const ref = useRef(null);
  const height = format === "story" ? 1920 : 1080;
  const fit = Math.min(1, (window.innerWidth - 64) / 300);
  const scale = (format === "story" ? 0.16 : 0.28) * fit;
  const [caption, shuffleCaption] = useCaption(card, props);

  useEffect(() => {
    if (!card) return undefined;
    let live = true;
    setFile(null);
    const t = setTimeout(async () => {
      if (!ref.current) return;
      const blob = await renderBlob(ref.current, { width: 1080, height, pixelRatio: 1, cacheBust: true });
      if (live && blob) setFile(new File([blob], fileName(card.city.city), { type: "image/png" }));
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [card, format, height]);

  const canNativeShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
  const ready = !!file;

  const nativeShare = async () => {
    try {
      await navigator.share({ files: [file], title: "What Your Rent Buys Elsewhere", text: caption });
    } catch (e) {
      if (e && e.name !== "AbortError") toast.error("Sharing was cancelled or isn't available.");
    }
  };

  const copyThenOpen = (url) => {
    const copying = copyImage(file);
    window.open(url, "_blank", "noopener,noreferrer");
    copying.then((ok) => (ok ? toast.success(PASTE_TOAST) : toast.message("Opened the post window. Download the PNG to attach it.")));
  };

  const actions = {
    x: () => copyThenOpen(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`),
    threads: () => copyThenOpen(`https://www.threads.net/intent/post?text=${encodeURIComponent(caption)}`),
    whatsapp: () => copyThenOpen(`https://wa.me/?text=${encodeURIComponent(caption)}`),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer"),
    instagram: () => {
      if (canNativeShare) return nativeShare();
      downloadBlob(file, file.name);
      toast.success("Saved! Upload this PNG to your Instagram Story or Feed.");
    },
    copy: async () => ((await copyImage(file)) ? toast.success("Image copied! Paste it anywhere.") : toast.error("Your browser can't copy images. Try Download PNG.")),
    download: () => { downloadBlob(file, file.name); toast.success("Image downloaded. Go flex it."); },
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Caption copied!");
    } catch {
      toast.error("Couldn't copy the caption.");
    }
  };

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={RENT.shareDialog} className="max-h-[92vh] max-w-[calc(100vw-16px)] overflow-y-auto border-white/10 bg-[#121620] text-white sm:max-w-md">
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
              className={`rounded-2xl border p-2.5 text-left transition-colors ${format === f.key ? "border-[#10E39A] bg-[#10E39A]/10" : "border-white/10 hover:border-white/30"}`}
            >
              <p className="text-sm font-semibold">{f.label}</p>
              <p className="font-mono text-[11px] text-white/50">{f.size}</p>
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
        <div data-testid="share-caption-box" className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Roast caption</p>
            <div className="flex gap-1">
              <button data-testid="share-copy-caption-button" onClick={copyCaption} className="flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                <Copy className="h-3 w-3" /> Copy
              </button>
              <button data-testid="share-shuffle-caption-button" onClick={shuffleCaption} className="flex h-7 items-center gap-1 rounded-full bg-[#FFB020] px-2.5 text-xs font-bold text-[#3A2400] transition-transform hover:scale-[1.03]">
                <Shuffle className="h-3 w-3" /> Shuffle Caption
              </button>
            </div>
          </div>
          <p data-testid="share-caption-text" className="text-sm leading-snug text-white/85">{caption}</p>
        </div>
        {canNativeShare && (
          <button
            data-testid="share-native-button"
            onClick={nativeShare}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-white font-bold text-black transition-opacity hover:opacity-90"
          >
            <Share2 className="h-5 w-5" /> Share to Apps (Insta, WhatsApp, X...)
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            data-testid={RENT.downloadButton}
            onClick={actions.download}
            disabled={!ready}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#10E39A] text-sm font-bold text-[#03261A] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {ready ? <Download className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />} Download PNG
          </button>
          <SocialButton testid="share-copy-image-button" label="Copy image" onClick={() => ready && actions.copy()}><Copy className="h-4 w-4" /></SocialButton>
        </div>
        <div data-testid="share-social-row" className={`flex flex-wrap justify-between gap-2 ${ready ? "" : "pointer-events-none opacity-50"}`}>
          <SocialButton testid="share-x-button" label="Post on X" onClick={actions.x}><FaXTwitter className="h-4 w-4" /></SocialButton>
          <SocialButton testid="share-threads-button" label="Post on Threads" onClick={actions.threads}><FaThreads className="h-4 w-4" /></SocialButton>
          <SocialButton testid="share-whatsapp-button" label="Send on WhatsApp" onClick={actions.whatsapp}><FaWhatsapp className="h-4 w-4" /></SocialButton>
          <SocialButton testid="share-facebook-button" label="Share on Facebook" onClick={actions.facebook}><FaFacebookF className="h-4 w-4" /></SocialButton>
          <SocialButton testid="share-instagram-button" label="Share to Instagram" onClick={actions.instagram}><FaInstagram className="h-4 w-4" /></SocialButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
