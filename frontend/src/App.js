import { useMemo, useState } from "react";
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
import { currencyOf, formatMoney, toEur } from "@/lib/currency";

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

  const origin = batch ? batch.origin : null;
  const code = origin ? currencyOf(origin.country) : "USD";
  const rentEur = origin ? toEur(batch.rent, code) : 0;

  const flyTo = (c, altitude) => setFocus({ lat: c.coords.lat, lng: c.coords.lng, altitude, t: Date.now() });

  const setCity = (c) => {
    setCityState(c);
    if (c) flyTo(c, 1.6);
  };

  const makeBatch = (c, r, prev) => ({ origin: c, rent: r, ...generateBatch(c.id, toEur(r, currencyOf(c.country)), prev) });

  const compare = (c, r) => {
    setSelected(null);
    setLoading(true);
    setEditing(false);
    flyTo(c, 1.6);
    setTimeout(() => {
      setBatch(makeBatch(c, r));
      setLoading(false);
      flyTo(c, 2.6);
    }, 800);
  };

  const shuffle = () => {
    setSelected(null);
    setBatch(makeBatch(origin, batch.rent, batch.cards.map((x) => x.city.id)));
    flyTo(origin, 2.6);
  };

  const pick = (c, card, altitude) => {
    const inBatch = batch.cards.find((x) => x.city.id === c.id);
    setSelected(card || inBatch || cardFor(c, rentEur));
    flyTo(c, altitude);
  };

  const globeOrigin = editing || !batch ? city : origin;
  const cards = useMemo(() => (editing || !batch ? [] : batch.cards), [editing, batch]);
  const note = batch && (batch.allGap ? NOTES.allGap : batch.fewCovered ? NOTES.fewCovered : null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05070B]">
      <GlobeView origin={globeOrigin} cards={cards} explore={explore && !editing} rentEur={rentEur} focus={focus} onPick={pick} />
      <div className="glass-panel absolute left-3 right-3 top-3 z-20 max-h-[calc(100vh-110px)] overflow-y-auto rounded-[24px] p-5 sm:left-5 sm:right-auto sm:top-5 sm:w-[390px] sm:p-6">
        <div className="mb-4 flex items-center gap-2 font-display text-sm font-extrabold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10E39A] text-xs text-[#03261A]">R</span>
          RentBuys<span className="text-white/35">/elsewhere</span>
        </div>
        {editing || !batch ? (
          <RentHero city={city} setCity={setCity} rent={rent} setRent={setRent} onCompare={compare} />
        ) : (
          <SummaryChip origin={origin} rentLocal={formatMoney(batch.rent, code)} note={note} onEdit={() => { setEditing(true); setSelected(null); }} />
        )}
      </div>
      <AnimatePresence>{loading && <PlayfulLoader />}</AnimatePresence>
      {batch && !editing && !loading && !selected && <BottomDock onShuffle={shuffle} explore={explore} setExplore={setExplore} />}
      <CityDrawer card={selected} code={code} onClose={() => setSelected(null)} onShare={setShareCard} />
      {origin && <ShareDialog card={shareCard} onClose={() => setShareCard(null)} origin={origin} code={code} rentLocal={formatMoney(batch.rent, code)} />}
      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;
