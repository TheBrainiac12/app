import { useState } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { RentHero } from "@/components/RentHero";
import { PlayfulLoader } from "@/components/PlayfulLoader";
import { ResultsView } from "@/components/ResultsView";
import { generateBatch } from "@/lib/engine";
import { currencyOf, toEur } from "@/lib/currency";

function App() {
  const [phase, setPhase] = useState("hero");
  const [city, setCity] = useState(null);
  const [rent, setRent] = useState(0);
  const [batch, setBatch] = useState(null);

  const rentEur = () => toEur(rent, currencyOf(city.country));

  const compare = () => {
    setBatch({ id: Date.now(), ...generateBatch(city.id, rentEur()) });
    setPhase("loading");
    setTimeout(() => setPhase("results"), 800);
  };

  const shuffle = () => {
    const prev = batch.cards.map((c) => c.city.id);
    setBatch({ id: Date.now(), ...generateBatch(city.id, rentEur(), prev) });
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => setPhase("hero")} data-testid="brand-home-button" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10E39A] text-sm text-[#03261A]">R</span>
          RentBuys<span className="text-white/35">/elsewhere</span>
        </button>
        <span className="hidden font-mono text-xs text-white/40 sm:block">No login · No tracking · Instant</span>
      </header>
      {phase === "hero" && <RentHero city={city} setCity={setCity} rent={rent} setRent={setRent} onCompare={compare} />}
      {phase === "loading" && <PlayfulLoader />}
      {phase === "results" && batch && (
        <ResultsView origin={city} rent={rent} batch={batch} onShuffle={shuffle} onEdit={() => setPhase("hero")} />
      )}
      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;
