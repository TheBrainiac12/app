import { forwardRef } from "react";
import { formatEur } from "@/lib/currency";
import { salaryLine, styleFor } from "@/lib/theme";
import { flagOf } from "@/lib/flags";
import { RENT } from "@/constants/testIds/rent";

const FONT = "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const BG = "#0C0F16";

const nameSize = (name, story) => {
  const n = name.length;
  const base = n <= 7 ? 116 : n <= 10 ? 96 : n <= 13 ? 80 : 66;
  return story ? Math.round(base * 1.2) : base;
};

const Row = ({ children, color, size }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: size, fontWeight: 600, color: "#F5F7FA" }}>
    <span style={{ width: 16, height: 16, borderRadius: 8, background: color, flexShrink: 0 }} />
    <span>{children}</span>
  </div>
);

const Breakdown = ({ card, code, color }) => {
  const local = card.reality ? card.needed : card.housingCost;
  const pct = card.reality ? Math.min(100, (card.rentEur / local) * 100) : Math.min(100, (local / card.rentEur) * 100);
  return (
    <div style={{ background: "#151A25", borderRadius: 32, padding: "40px 44px" }}>
      <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#8B93A7" }}>Rent breakdown</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 36, fontWeight: 700 }}>
        <span>You pay {formatEur(card.rentEur, code)}</span>
        <span style={{ color }}>{card.reality ? "Needed" : "Local"} {formatEur(local, code)}</span>
      </div>
      <div style={{ height: 24, borderRadius: 12, background: "#262C3A", marginTop: 20, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 12, background: color }} />
      </div>
    </div>
  );
};

const SalaryBox = ({ card, s }) => (
  <div style={{ border: `3px solid ${s.hex}`, borderRadius: 32, padding: "36px 44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#8B93A7", maxWidth: 360 }}>vs. local avg salary</div>
    <div style={{ fontSize: 88, fontWeight: 800, color: s.hex, letterSpacing: -2 }}>
      {card.salaryRatio >= 1 ? `${card.salaryRatio.toFixed(1)}×` : `${Math.round(card.salaryRatio * 100)}%`}
    </div>
  </div>
);

const BoardingDivider = () => (
  <div style={{ position: "relative", height: 60, margin: "0 -90px" }}>
    <div style={{ position: "absolute", left: -30, top: 0, width: 60, height: 60, borderRadius: 30, background: BG, border: "3px solid #2E3546", boxSizing: "border-box" }} />
    <div style={{ position: "absolute", right: -30, top: 0, width: 60, height: 60, borderRadius: 30, background: BG, border: "3px solid #2E3546", boxSizing: "border-box" }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 29, borderTop: "3px dashed #2E3546" }} />
  </div>
);

export const ExportCard = forwardRef(({ card, origin, code, rentLocal, format }, ref) => {
  const s = styleFor(card);
  const story = format === "story";
  const lines = card.reality
    ? [`You'd need +${formatEur(card.gap, code)}/mo`, card.tradeOff]
    : [
        ...(card.billsCovered ? ["Utilities + Wi-Fi covered"] : []),
        ...card.perks.map((p) => `Plus ${p.text}`),
        ...(card.savings >= 1 ? [`+ ${formatEur(card.savings, code)} saved every month`] : []),
      ].slice(0, 4);
  return (
    <div
      ref={ref}
      data-testid={RENT.exportCanvas}
      style={{ width: 1080, height: story ? 1920 : 1080, background: BG, fontFamily: FONT, display: "flex", flexDirection: "column", padding: story ? 90 : 64, boxSizing: "border-box", color: "#F5F7FA", overflow: "hidden" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#8B93A7" }}>
        <span>My {rentLocal}/mo in {origin.city}</span>
        <span style={{ color: s.hex }}>{s.name}</span>
      </div>
      <div style={{ marginTop: story ? 56 : 36, background: s.hex, color: s.ink, borderRadius: 48, padding: story ? "64px 64px" : "44px 56px", overflow: "hidden" }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700 }}>vs.</div>
        <div data-testid="export-city-name" style={{ fontSize: nameSize(card.city.city, story), fontWeight: 800, lineHeight: 1, letterSpacing: -3, marginTop: 12, overflowWrap: "break-word" }}>
          {card.city.city}
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, marginTop: 16, opacity: 0.8 }}>{flagOf(card.city.country)} {card.city.country}</div>
        <div style={{ display: "inline-block", marginTop: story ? 44 : 28, background: s.ink, color: s.hex, borderRadius: 999, padding: "16px 32px", fontSize: 40, fontWeight: 800 }}>
          {card.reality ? "Reality check" : card.apartment}
        </div>
      </div>
      {story && <div style={{ marginTop: 48 }}><Breakdown card={card} code={code} color={s.hex} /></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: story ? 30 : 22, marginTop: story ? 52 : 40, flex: 1 }}>
        {lines.map((l) => <Row key={l} color={s.hex} size={story ? 40 : 36}>{l}</Row>)}
      </div>
      {story ? (
        <>
          <SalaryBox card={card} s={s} />
          <div style={{ marginTop: 40 }}><BoardingDivider /></div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 26, color: "#8B93A7" }}>
            <span>{origin.city.toUpperCase()} → {card.city.city.toUpperCase()}</span>
            <span style={{ color: "#F5F7FA", fontWeight: 700 }}>What Your Rent Buys Elsewhere</span>
          </div>
        </>
      ) : (
        <div style={{ borderTop: "2px solid #262C3A", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 24, color: "#8B93A7" }}>
          <span>{salaryLine(card.salaryRatio)}</span>
          <span style={{ color: "#F5F7FA", fontWeight: 700 }}>What Your Rent Buys Elsewhere</span>
        </div>
      )}
    </div>
  );
});
ExportCard.displayName = "ExportCard";
