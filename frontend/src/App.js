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
import { cardFor, cardWithSize, generateBatch } from "@/lib/engine";
import { GuessCard } from "@/components/GuessCard";
import { EscapeModal } from "@/components/EscapeModal";
import { SoundToggle } from "@/components/SoundToggle";
import { BEST_KEY, historyEntry, loadBest, pickChallenge, sessionStats } from "@/lib/guess";
import { playPop, playVerdict } from "@/lib/soundEffects";
import { toast } from "sonner";
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
  const [guess, setGuess] = useState(null);
  const [best, setBest] = useState(loadBest);
  const [streakShare, setStreakShare] = useState(null);
  const [escape, setEscape] = useState(null);

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
  const flyGuess = (c) => setFocus({ lat: c.coords.lat - 14, lng: c.coords.lng, altitude: 1.6, t: Date.now() });

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
    playPop();
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
    if (guess && !guess.revealed) return;
    playPop();
    const inBatch = allCards.find((x) => x.city.id === c.id);
    setSelected(card || inBatch || cardFor(c, rentEur));
    flyTo(c, altitude);
  };

  const selectOrigin = (c) => {
    playPop();
    setGuess(null);
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
    if (guess) flyGuess(guess.ch.city);
    else overview(origin, allCards);
  };

  const startGuess = (c = origin, r = batch && batch.rent) => {
    if (editing || !batch) {
      setBatch(makeBatch(c, r));
      setEditing(false);
    }
    const ch = pickChallenge(c.id, toEur(r, currencyOf(c.country)), []);
    setSelected(null);
    setExplore(false);
    setGuess({ round: 1, streak: 0, used: [], ch, revealed: null, history: [] });
    flyGuess(ch.city);
    playPop();
  };

  const answer = (sayApproved) => {
    if (!guess || guess.revealed) return;
    const correct = sayApproved === guess.ch.affordable;
    const streak = correct ? guess.streak + 1 : 0;
    if (streak > best) {
      setBest(streak);
      window.localStorage.setItem(BEST_KEY, String(streak));
    }
    setGuess({ ...guess, streak, revealed: { correct }, history: [...guess.history, historyEntry(guess.ch, correct, rentEur)] });
    setTimeout(() => playVerdict(correct, streak), 260);
  };

  const nextRound = () => {
    if (!guess || !guess.revealed) return;
    const used = [...guess.used, guess.ch.city.id];
    const ch = pickChallenge(origin.id, rentEur, used);
    setGuess({ ...guess, round: guess.round + 1, used, ch, revealed: null });
    setSelected(null);
    flyGuess(ch.city);
    playPop();
  };

  const sessionOf = (g) => ({ history: g.history, stats: sessionStats(g.history, g.streak), origin, code, rentLocal: formatMoney(batch.rent, code) });

  const shareStreak = (g = guess) => {
    playPop();
    setStreakShare(sessionOf(g));
  };

  const exitGuess = () => {
    const g = guess;
    setGuess(null);
    setSelected(null);
    overview(origin, allCards);
    if (g.history.length) {
      const st = sessionStats(g.history, g.streak);
      toast(`Session: ${st.correct}/${st.total} correct · best streak ${st.best}`, { action: { label: "Share Streak Card", onClick: () => shareStreak(g) } });
    }
  };

  const keys = useRef({});
  keys.current = { escape, batch, allCards, editing, selected, shareCard, streakShare, loading, pick, closeDrawer, guess, answer, nextRound, exitGuess };
  useEffect(() => {
    const onKey = (e) => {
      const k = keys.current;
      const t = e.target;
      if (k.escape) return;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.getAttribute("role") === "slider" || t.isContentEditable);
      if (e.key === "Escape") {
        if (e.defaultPrevented || k.shareCard || k.streakShare || typing) return;
        if (k.selected) k.closeDrawer();
        else if (k.guess) k.exitGuess();
        return;
      }
      if (k.guess) {
        if (typing || k.selected || k.shareCard || k.streakShare) return;
        const key = e.key.toLowerCase();
        if (!k.guess.revealed && (key === "a" || key === "arrowleft")) { e.preventDefault(); k.answer(true); }
        else if (!k.guess.revealed && (key === "d" || key === "arrowright")) { e.preventDefault(); k.answer(false); }
        else if (k.guess.revealed && (key === "enter" || key === " ") && t.tagName !== "BUTTON") { e.preventDefault(); k.nextRound(); }
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
  const cards = useMemo(() => {
    if (guess) {
      const { ch, revealed } = guess;
      const sub = revealed ? (ch.affordable ? "Rent approved" : "Entry denied") : "Can you afford it?";
      return [{ city: ch.city, slot: revealed ? (ch.affordable ? "affordable" : "mystery") : "mystery", reality: !!revealed && !ch.affordable, apartment: sub }];
    }
    return editing || !batch ? [] : batch.custom ? [...batch.cards, batch.custom] : batch.cards;
  }, [editing, batch, guess]);
  const note = batch && (batch.allGap ? NOTES.allGap : batch.fewCovered ? NOTES.fewCovered : null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05070B]">
      <GlobeView origin={globeOrigin} cards={cards} explore={explore && !editing} rentEur={rentEur} focus={focus} onPick={pick} selectMode={editing || !batch} onSelectOrigin={selectOrigin} paused={!!escape} />
      <SoundToggle />
      {!guess && <div className="glass-panel absolute left-3 right-16 top-3 z-20 max-h-[calc(100vh-110px)] overflow-y-auto rounded-[24px] p-5 sm:left-5 sm:right-auto sm:top-5 sm:w-[390px] sm:p-6">
        <div className="mb-4 flex items-center gap-2 font-display text-sm font-extrabold text-white">
          <img src="/logo-mark.png" alt="" data-testid="brand-logo" className="h-7 w-7" />
          <span data-testid="brand-name" className="text-base tracking-tight">Elsewhere</span>
        </div>
        {editing || !batch ? (
          <RentHero city={city} setCity={setCity} rent={rent} setRent={setRent} onCompare={compare} focusKey={focusKey} onGuess={startGuess} />
        ) : (
          <SummaryChip origin={origin} rentLocal={formatMoney(batch.rent, code)} note={note} onEdit={() => { setEditing(true); setSelected(null); }} />
        )}
      </div>}
      <AnimatePresence>{loading && <PlayfulLoader />}</AnimatePresence>
      {batch && !editing && !loading && !selected && !guess && <BottomDock onShuffle={shuffle} explore={explore} setExplore={setExplore} origin={origin} onPickCity={pickCustom} onGuess={() => startGuess()} onBoard={() => { playPop(); setEscape({}); }} />}
      {guess && !selected && (
        <GuessCard
          guess={guess}
          best={best}
          rentEur={rentEur}
          code={code}
          rentLabel={formatMoney(batch.rent, code)}
          originName={origin.city}
          onAnswer={answer}
          onNext={nextRound}
          onReport={() => setSelected(cardWithSize(cardFor(guess.ch.city, rentEur), guess.ch.key[0]))}
          onExit={exitGuess}
          onShareStreak={() => shareStreak()}
        />
      )}
      <CityDrawer onMoveIn={(c) => { playPop(); setEscape({ dest: c.city }); }} card={selected} code={code} originName={origin ? origin.city : ""} onClose={closeDrawer} onShare={setShareCard} onMakeOrigin={selectOrigin} cycle={!guess && !!(selected && allCards.some((x) => x.city.id === selected.city.id))} />
      {origin && <ShareDialog card={shareCard} session={streakShare} onClose={() => { setShareCard(null); setStreakShare(null); }} origin={origin} code={code} rentLocal={formatMoney(batch.rent, code)} />}
      {origin && batch && (
        <EscapeModal isOpen={!!escape} onClose={() => setEscape(null)} homeCity={origin.city} monthlyRent={batch.rent} destCity={escape && escape.dest} />
      )}
      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;
