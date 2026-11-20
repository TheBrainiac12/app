export const TIER_STYLES = {
  affordable: { name: "Affordable", hex: "#10E39A", ink: "#03261A" },
  mid: { name: "Mid-range", hex: "#4D8DFF", ink: "#04173D" },
  dream: { name: "Dream", hex: "#B98BFF", ink: "#1E0745" },
  wildcard: { name: "Wildcard", hex: "#FFB020", ink: "#3A2400" },
  custom: { name: "Custom Pick", hex: "#22D3EE", ink: "#032A33" },
  reality: { name: "Reality Check", hex: "#FF5A7A", ink: "#3D0412" },
};

export const styleFor = (card) => (card.slot === "custom" ? TIER_STYLES.custom : card.reality ? TIER_STYLES.reality : TIER_STYLES[card.slot]);

export const salaryLine = (ratio) =>
  ratio >= 1
    ? `Your rent = ${ratio.toFixed(1)}× the local average salary`
    : `Your rent = ${Math.round(ratio * 100)}% of the local average salary`;
