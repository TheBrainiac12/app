import { motion } from "framer-motion";
import { Check, Flame, Share2, Trophy, X } from "lucide-react";
import { Flag } from "@/components/Flag";
import { InkStamp } from "@/components/CityCard";
import { formatEur } from "@/lib/currency";
import { headerRoast } from "@/lib/share";
import { buildCard } from "@/lib/engine";

const TopBar = ({ streak, best, round, onExit }) => (
  <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-xs font-semibold">
    <span data-testid="guess-streak" className="flex items-center gap-1 text-[#FFB020]"><Flame className="h-4 w-4" /> {streak} in a row</span>
    <span data-testid="guess-best" className="flex items-center gap-1 text-white/60"><Trophy className="h-3.5 w-3.5" /> Best {best}</span>
    <span data-testid="guess-round" className="font-mono text-white/40">Round {round}</span>
    <span className="flex-1" />

    <button data-testid="guess-exit-button" onClick={onExit} className="flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-white/70 hover:text-white">
      <X className="h-3.5 w-3.5" /> Exit
    </button>
  </div>
);

const Reveal = ({ ch, correct, rentEur, code, originName }) => {
  const diff = rentEur - ch.price;
  const roast = headerRoast(buildCard(ch.city, rentEur, "mid", ch.key[0]), originName);
  const raise = Math.ceil((ch.price / rentEur - 1) * 100);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p data-testid="guess-result-banner" className={`font-display text-2xl font-extrabold ${correct ? "text-[#10E39A]" : "text-[#FF5A7A]"}`}>
            {correct ? <span className="flex items-center gap-1.5">Nailed it! <Flame className="h-6 w-6" /></span> : "Humbled! Streak reset."}
          </p>
          <p data-testid="guess-roast" className="mt-1 text-sm italic text-white/70">{roast}</p>
        </div>
        <InkStamp denied={!ch.affordable} ink={ch.affordable ? "#10E39A" : "#FF5A7A"} id="guess" sound={false} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-white/[0.04] px-3 py-2"><p className="text-[11px] text-white/50">Local rent</p><p data-testid="guess-local-rent" className="font-display font-bold text-white">{formatEur(ch.price, code)}</p></div>
        <div className="rounded-xl bg-white/[0.04] px-3 py-2"><p className="text-[11px] text-white/50">Your rent</p><p className="font-display font-bold text-white">{formatEur(rentEur, code)}</p></div>
      </div>
      <p data-testid="guess-diff" className={`font-display text-lg font-bold ${diff >= 0 ? "text-[#10E39A]" : "text-[#FF5A7A]"}`}>
        {diff >= 0 ? `+${formatEur(diff, code)} left over every month` : `You'd need +${formatEur(-diff, code)}/mo`}
      </p>
      {diff < 0 && <p data-testid="guess-countdown" className="font-mono text-xs text-white/50">Affordability countdown: a {raise}% rent raise away.</p>}
    </div>
  );
};

export const GuessCard = ({ guess, best, rentEur, code, rentLabel, originName, onAnswer, onNext, onReport, onExit, onShareStreak }) => {
  const { ch, revealed, streak, round } = guess;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <motion.div
        key={`${round}-${revealed ? "r" : "q"}`}
        data-testid="guess-card"
        initial={{ y: 30, opacity: 0 }}
        animate={revealed && !revealed.correct ? { y: 0, opacity: 1, x: [0, -10, 10, -6, 6, 0] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="glass-panel pointer-events-auto w-full max-w-[460px] space-y-4 rounded-[26px] p-5"
        style={revealed && revealed.correct ? { boxShadow: "0 0 40px -10px rgba(16,227,154,0.55)" } : undefined}
      >
        <TopBar streak={streak} best={best} round={round} onExit={onExit} />
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
            <Flag country={ch.city.country} height={18} /> <span data-testid="guess-city">{ch.city.city}</span>
            <span className="text-sm font-medium text-white/50">{ch.city.country}</span>
          </p>
          <p data-testid="guess-question" className="mt-1.5 text-sm text-white/75">
            Can your {rentLabel}/mo afford a <b className="text-white">{ch.label}</b> in <b className="text-white">{ch.city.city}</b>?
          </p>
        </div>
        {!revealed ? (
          <div className="grid grid-cols-2 gap-3">
            <button data-testid="guess-approved-button" onClick={() => onAnswer(true)} className="flex h-14 flex-col items-center justify-center rounded-2xl bg-[#10E39A] font-display text-sm font-extrabold text-[#03261A] transition-transform hover:scale-[1.03] active:scale-95">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> RENT APPROVED</span>
              <span className="font-mono text-[10px] font-normal opacity-70">A or ←</span>
            </button>
            <button data-testid="guess-denied-button" onClick={() => onAnswer(false)} className="flex h-14 flex-col items-center justify-center rounded-2xl bg-[#FF5A7A] font-display text-sm font-extrabold text-[#3D0412] transition-transform hover:scale-[1.03] active:scale-95">
              <span className="flex items-center gap-1.5"><X className="h-4 w-4" /> ENTRY DENIED</span>
              <span className="font-mono text-[10px] font-normal opacity-70">D or →</span>
            </button>
          </div>
        ) : (
          <>
            <Reveal ch={ch} correct={revealed.correct} rentEur={rentEur} code={code} originName={originName} />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button data-testid="guess-next-button" onClick={onNext} className="h-12 rounded-full bg-white font-display text-sm font-extrabold text-black transition-transform hover:scale-[1.02] active:scale-95">
                Next City → <span className="ml-1 font-mono text-[10px] font-normal text-black/50">Enter</span>
              </button>
              <button data-testid="guess-full-report-button" onClick={onReport} className="h-12 rounded-full border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/10">
                Full Report
              </button>
            </div>
            <button data-testid="guess-share-streak-card-button" onClick={onShareStreak} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#FFB020]/15 text-sm font-bold text-[#FFB020] transition-colors hover:bg-[#FFB020]/25">
              <Share2 className="h-4 w-4" /> Share Streak Card
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
