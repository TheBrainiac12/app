import { forwardRef } from "react";
import { Flame } from "lucide-react";
import { Flag } from "@/components/Flag";
import { PassportStamp } from "@/components/PassportStamp";
import { fromEur } from "@/lib/currency";

const BG = "#090B10";
const PANEL = "#121620";
const EMERALD = "#10E39A";
const CORAL = "#FF5A7A";
const AMBER = "#FFB020";
const FONT = "'DM Sans', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const compact = (eur, code) => {
  const local = fromEur(Math.abs(eur), code);
  const txt = new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, notation: "compact", maximumFractionDigits: local >= 1000 ? 0 : 0, currencyDisplay: "narrowSymbol" }).format(local);
  return `${eur < 0 ? "-" : "+"}${txt}/mo`;
};

const Pill = ({ color, children, size }) => (
  <span style={{ fontFamily: MONO, fontSize: size, fontWeight: 700, letterSpacing: 3, color, border: `2px solid ${color}`, borderRadius: 999, padding: "6px 16px", whiteSpace: "nowrap" }}>{children}</span>
);

const Row = ({ h, story }) => {
  const color = h.userCorrect ? EMERALD : CORAL;
  const status = h.actualStatus === "approved" ? EMERALD : CORAL;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: story ? 82 : 54, borderBottom: "2px dashed #232938", fontSize: story ? 32 : 26 }}>
      <Flag country={h.country} height={story ? 30 : 24} />
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, color: "#F5F7FA", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.city}</span>
      <span style={{ fontFamily: MONO, fontSize: story ? 22 : 18, color: "#8B93A7", whiteSpace: "nowrap" }}>{h.tierLabel}</span>
      <Pill color={status} size={story ? 18 : 15}>{h.actualStatus === "approved" ? "APPROVED" : "DENIED"}</Pill>
      <span style={{ width: story ? 44 : 36, height: story ? 44 : 36, borderRadius: 999, background: color, color: BG, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: story ? 26 : 22 }}>{h.userCorrect ? "✓" : "✕"}</span>
    </div>
  );
};

export const GuessShareCard = forwardRef(({ session, format }, ref) => {
  const story = format === "story";
  const { stats, history, origin, rentLocal, code } = session;
  const limit = story ? 8 : 6;
  const shown = history.slice(-limit);
  const more = history.length - shown.length;
  const tiles = history.slice(-(story ? 24 : 20));
  const good = stats.accuracy >= 60;
  const hl = stats.highlight;
  return (
    <div
      ref={ref}
      data-testid="guess-export-canvas"
      style={{ width: 1080, height: story ? 1920 : 1080, background: BG, fontFamily: FONT, color: "#F5F7FA", padding: story ? 90 : 60, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: story ? 44 : 22, overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/logo-mark.png" alt="" style={{ width: story ? 56 : 44, height: story ? 56 : 44 }} />
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: story ? 44 : 36 }}>elsewhere</span>
        <span style={{ flex: 1 }} />
        <Pill color={AMBER} size={story ? 22 : 18}>GUESS MODE REPORT</Pill>
      </div>
      <div style={{ fontSize: story ? 34 : 26, color: "#B4BBCB" }}>
        Testing <b style={{ color: "#F5F7FA" }}>{rentLocal}/mo</b> from <b style={{ color: "#F5F7FA" }}>{origin.city}</b>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 36, background: PANEL, borderRadius: 32, padding: story ? "48px 48px" : "26px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Flame color={AMBER} size={story ? 120 : 84} strokeWidth={2.4} />
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: story ? 170 : 120, lineHeight: 0.9, color: AMBER }}>{stats.best}</div>
            <div style={{ fontFamily: MONO, fontSize: story ? 26 : 20, letterSpacing: 6, color: "#B4BBCB" }}>STREAK</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: story ? 22 : 14, alignItems: "flex-start" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: story ? 60 : 46 }}>{stats.correct}/{stats.total} · {stats.accuracy}%</div>
          <div style={{ fontFamily: MONO, fontSize: story ? 22 : 17, letterSpacing: 4, color: "#8B93A7" }}>ACCURACY</div>
          <span style={{ background: EMERALD, color: "#03261A", fontFamily: DISPLAY, fontWeight: 800, fontSize: story ? 30 : 24, borderRadius: 14, padding: "8px 18px", letterSpacing: 1 }}>{stats.rank.toUpperCase()}</span>
        </div>
      </div>
      <div data-testid="guess-export-tiles" style={{ display: "flex", flexWrap: "wrap", gap: story ? 12 : 9 }}>
        {tiles.map((h, i) => (
          <span key={i} style={{ width: story ? 44 : 36, height: story ? 44 : 36, borderRadius: 8, background: h.userCorrect ? EMERALD : CORAL }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {shown.map((h, i) => <Row key={`${h.city}-${i}`} h={h} story={story} />)}
        {more > 0 && (
          <div style={{ marginTop: story ? 20 : 12 }}>
            <span data-testid="guess-export-more" style={{ fontFamily: MONO, fontSize: story ? 22 : 18, color: "#B4BBCB", background: PANEL, borderRadius: 999, padding: "8px 18px" }}>+{more} more {more === 1 ? "city" : "cities"}</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: story ? 24 : 14, minWidth: 0 }}>
          {hl && (
            <div data-testid="guess-export-highlight" style={{ background: PANEL, borderLeft: `8px solid ${hl.kind === "breaker" ? CORAL : EMERALD}`, borderRadius: 16, padding: story ? "22px 26px" : "14px 20px", fontSize: story ? 30 : 23, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {hl.kind === "breaker" ? "Streak ended by: " : "Biggest steal: "}
              <b>{hl.entry.city}</b> ({compact(hl.entry.rentDiff, code)})
            </div>
          )}
          <div style={{ fontFamily: MONO, fontSize: story ? 24 : 19, color: "#8B93A7" }}>what-rent-buys.emergent.host</div>
        </div>
        <PassportStamp variant={good ? "verified" : "humbled"} accentColor={good ? EMERALD : CORAL} size={story ? 230 : 160} opacity={0.85} testId="guess-export-stamp" />
      </div>
    </div>
  );
});
GuessShareCard.displayName = "GuessShareCard";
