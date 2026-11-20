import { CITIES } from "@/lib/engine";

export const TIER_QUESTION = {
  "1_bed_center": "1-Bed in the City Centre",
  "1_bed_outside": "1-Bed Outside Centre",
  "3_bed_center": "3-Bed in the City Centre",
  "3_bed_outside": "3-Bed Outside Centre",
};

const any = (list) => list[Math.floor(Math.random() * list.length)];

export const pickChallenge = (originId, rentEur, used) => {
  const keys = ["1_bed_center", "1_bed_outside"];
  if (rentEur >= 1400) keys.push("3_bed_outside", "3_bed_center");
  const key = any(keys);
  const want = Math.random() < 0.5;
  let pool = CITIES.filter((c) => c.id !== originId && !used.includes(c.id));
  if (!pool.length) pool = CITIES.filter((c) => c.id !== originId);
  const ok = (c) => (c.housing[key] <= rentEur) === want;
  const near = (c) => c.housing[key] >= rentEur * 0.5 && c.housing[key] <= rentEur * 2;
  const tiers = [pool.filter((c) => ok(c) && near(c)), pool.filter(ok), pool.filter(near), pool];
  const city = any(tiers.find((t) => t.length));
  const price = city.housing[key];
  return { city, key, label: TIER_QUESTION[key], price, affordable: price <= rentEur };
};

export const BEST_KEY = "elsewhere-best-streak";

export const loadBest = () => Number(window.localStorage.getItem(BEST_KEY)) || 0;

export const streakCaption = (best, originName) =>
  `I guessed ${best} ${best === 1 ? "city" : "cities"} in a row on elsewhere — turns out my ${originName} rent goes way further than I thought. Beat my streak: ${window.location.href}`;
