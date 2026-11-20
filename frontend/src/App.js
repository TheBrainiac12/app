import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { RentHero } from "@/components/RentHero";
import { PlayfulLoader } from "@/components/PlayfulLoader";
import { GlobeView } from "@/components/GlobeView";
import { CityDrawer } from "@/components/CityDrawer";
import { BottomDock } from "@/components/BottomDock";
import { SummaryChip } from "@/components/SummaryChip";
import { ShareDialog } from "@/components/ShareDialog";
import { cardFor, generateBatch } from "@/lib/engine";
import { currencyOf, formatMoney, fromEur, niceRound, toEur } from "@/lib/currency";

const NOTES = {
  allGap: "That rent is a real bargain already. No other city beats it, so here are the closest ones.",
  fewCovered: "That rent already goes far. Only a few cities beat it, so we added the closest ones you'd almost afford.",
};

function App() {
  const [city, setCityState] = useState(null);
  const [rent, setRent] = useState(0);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(true);
  const [explore, setExplore] = useState(false);
  const [focus, setFocus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [shareCard, setShareCard] = useState(null);
  const [focusKey, setFocusKey] = useState(0);

  const origin = batch ? batch.origin : null;
  const code = origin ? currencyOf(origin.country) : "USD";
  const rentEur = origin ? toEur(batch.rent, code) : 0;

  const overview = (c, list) => {
    const narrow = window.innerWidth < 640;
    const rad = Math.PI / 180;
    const v = [c, ...list.map((x) => x.city)].reduce((a, p) => {
      const la = p.coords.lat * rad, ln = p.coords.lng * rad;
      return [a[0] + Math.cos(la) * Math.cos(ln), a[1] + Math.cos(la) * Math.sin(ln), a[2] + Math.sin(la)];
    }, [0, 0, 0]);
    const lat = Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad;
    const lng = Math.atan2(v[1], v[0]) / rad;
    const spread = Math.max(...[c, ...list.map((x) => x.city)].map((p) => {
      const cos = Math.sin(lat * rad) * Math.sin(p.coords.lat * rad) + Math.cos(lat * rad) * Math.cos(p.coords.lat * rad) * Math.cos((lng - p.coords.lng) * rad);
      return Math.acos(Math.min(1, Math.max(-1, cos))) / rad;
    }));
    const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
    const altitude = narrow ? clamp(2.4 + spread / 30, 3.2, 4.8) : clamp(1.9 + spread / 45, 2.2, 2.8);
    setFocus({ lat: lat + (narrow ? 12 : 0), lng, altitude, t: Date.now() });
  };

  const flyTo = (c, altitude) => setFocus({ lat: c.coords.lat, lng: c.coords.lng, altitude, t: Date.now() });

  const setCity = (c) => {
    setCityState(c);
    if (c) flyTo(c, 1.6);
  };

  const makeBatch = (c, r, prev) => ({ origin: c, rent: r, ...generateBatch(c.id, toEur(r, currencyOf(c.country)), prev) });

  const compare = (c, r) => {
    setSelected(null);
    setExplore(false);
    setLoading(true);
    setEditing(false);
    flyTo(c, 1.6);
    setTimeout(() => {
      const b = makeBatch(c, r);
      setBatch(b);
      setLoading(false);
      overview(c, b.cards);
    }, 800);
  };

  const shuffle = () => {
    setSelected(null);
    const b = makeBatch(origin, batch.rent, batch.cards.map((x) => x.city.id));
    setBatch(b);
    overview(origin, b.cards);
  };

  const allCards = batch ? (batch.custom ? [...batch.cards, batch.custom] : batch.cards) : [];

  const pickCustom = (c) => {
    const existing = allCards.find((x) => x.city.id === c.id);
    if (existing) return pick(c, existing, 1.1);
    const card = { ...cardFor(c, rentEur), slot: "custom" };
    setBatch((b) => ({ ...b, custom: card }));
    setSelected(card);
    flyTo(c, 1.1);
  };

  const pick = (c, card, altitude) => {
    const inBatch = allCards.find((x) => x.city.id === c.id);
    setSelected(card || inBatch || cardFor(c, rentEur));
    flyTo(c, altitude);
  };

  const selectOrigin = (c) => {
    setEditing(true);
    setSelected(null);
    setExplore(false);
    setCityState(c);
    setRent(niceRound(fromEur(c.housing["1_bed_center"], currencyOf(c.country))));
    flyTo(c, 1.6);
    setFocusKey(Date.now());
  };

  const closeDrawer = () => {
    setSelected(null);
    overview(origin, allCards);
  };

  const keys = useRef({});
  keys.current = { batch, allCards, editing, selected, shareCard, loading, pick, closeDrawer };
  useEffect(() => {
    const onKey = (e) => {
      const k = keys.current;
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.getAttribute("role") === "slider" || t.isContentEditable);
      if (e.key === "Escape") {
        if (e.defaultPrevented || k.shareCard || typing) return;
        if (k.selected) k.closeDrawer();
        return;
      }
      if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || typing || !k.batch || k.editing || k.loading || k.shareCard) return;
      e.preventDefault();
      const list = k.allCards;
      const i = k.selected ? list.findIndex((x) => x.city.id === k.selected.city.id) : -1;
      const step = e.key === "ArrowRight" ? 1 : -1;
      const next = i === -1 ? (step === 1 ? 0 : list.length - 1) : (i + step + list.length) % list.length;
      k.pick(list[next].city, list[next], 1.1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const globeOrigin = editing || !batch ? city : origin;
  const cards = useMemo(() => (editing || !batch ? [] : batch.custom ? [...batch.cards, batch.custom] : batch.cards), [editing, batch]);
  const note = batch && (batch.allGap ? NOTES.allGap : batch.fewCovered ? NOTES.fewCovered : null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05070B]">
      <GlobeView origin={globeOrigin} cards={cards} explore={explore && !editing} rentEur={rentEur} focus={focus} onPick={pick} selectMode={editing || !batch} onSelectOrigin={selectOrigin} />
      <div className="glass-panel absolute left-3 right-3 top-3 z-20 max-h-[calc(100vh-110px)] overflow-y-auto rounded-[24px] p-5 sm:left-5 sm:right-auto sm:top-5 sm:w-[390px] sm:p-6">
        <div className="mb-4 flex items-center gap-2 font-display text-sm font-extrabold text-white">
          <img src="/logo-mark.png" alt="" data-testid="brand-logo" className="h-7 w-7" />
          <span data-testid="brand-name" className="text-base tracking-tight">Elsewhere</span>
        </div>
        {editing || !batch ? (
          <RentHero city={city} setCity={setCity} rent={rent} setRent={setRent} onCompare={compare} focusKey={focusKey} />
        ) : (
          <SummaryChip origin={origin} rentLocal={formatMoney(batch.rent, code)} note={note} onEdit={() => { setEditing(true); setSelected(null); }} />
        )}
      </div>
      <AnimatePresence>{loading && <PlayfulLoader />}</AnimatePresence>
      {batch && !editing && !loading && !selected && <BottomDock onShuffle={shuffle} explore={explore} setExplore={setExplore} origin={origin} onPickCity={pickCustom} />}
      <CityDrawer card={selected} code={code} originName={origin ? origin.city : ""} onClose={closeDrawer} onShare={setShareCard} onMakeOrigin={selectOrigin} cycle={!!(selected && allCards.some((x) => x.city.id === selected.city.id))} />
      {origin && <ShareDialog card={shareCard} onClose={() => setShareCard(null)} origin={origin} code={code} rentLocal={formatMoney(batch.rent, code)} />}
      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;
