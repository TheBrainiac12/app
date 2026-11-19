import { forwardRef } from "react";
import { formatEur } from "@/lib/currency";
import { salaryLine, styleFor } from "@/lib/theme";
import { RENT } from "@/constants/testIds/rent";

const FONT = "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";

const Row = ({ children, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 38, fontWeight: 600, color: "#F5F7FA" }}>
    <span style={{ width: 16, height: 16, borderRadius: 8, background: color, flexShrink: 0 }} />
    <span>{children}</span>
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
      ].slice(0, story ? 5 : 4);
  return (
    <div
      ref={ref}
      data-testid={RENT.exportCanvas}
      style={{ width: 1080, height: story ? 1920 : 1080, background: "#0C0F16", fontFamily: FONT, display: "flex", flexDirection: "column", padding: story ? 90 : 64, boxSizing: "border-box", color: "#F5F7FA" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#8B93A7" }}>
        <span>My {rentLocal}/mo in {origin.city}</span>
        <span style={{ color: s.hex }}>{s.name}</span>
      </div>
      <div style={{ marginTop: story ? 70 : 36, background: s.hex, color: s.ink, borderRadius: 48, padding: story ? "80px 64px" : "48px 56px" }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700 }}>vs.</div>
        <div style={{ fontSize: story ? 150 : 116, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, marginTop: 12 }}>{card.city.city}</div>
        <div style={{ fontSize: 36, fontWeight: 600, marginTop: 16, opacity: 0.75 }}>{card.city.country}</div>
        <div style={{ display: "inline-block", marginTop: story ? 56 : 32, background: s.ink, color: s.hex, borderRadius: 999, padding: "16px 32px", fontSize: 40, fontWeight: 800 }}>
          {card.reality ? "Reality check" : card.apartment}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: story ? 40 : 24, marginTop: story ? 80 : 44, flex: 1 }}>
        {lines.map((l) => <Row key={l} color={s.hex}>{l}</Row>)}
      </div>
      <div style={{ borderTop: "2px solid #262C3A", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 24, color: "#8B93A7" }}>
        <span>{salaryLine(card.salaryRatio)}</span>
        <span style={{ color: "#F5F7FA", fontWeight: 700 }}>What Your Rent Buys Elsewhere</span>
      </div>
    </div>
  );
});
ExportCard.displayName = "ExportCard";
