import { CITIES } from "@/lib/engine";
import { isoOf } from "@/lib/flags";

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
  const want = Math.random() < 0.5;
  let pool = CITIES.filter((c) => c.id !== originId && !used.includes(c.id));
  if (!pool.length) pool = CITIES.filter((c) => c.id !== originId);
  const pairs = (ks) => pool.flatMap((city) => ks.map((key) => ({ city, key, price: city.housing[key] })));
  const ok = (p) => (p.price <= rentEur) === want;
  const near = (p) => p.price >= rentEur * 0.5 && p.price <= rentEur * 2;
  const base = pairs(keys);
  const extra = want ? [] : pairs(["3_bed_outside", "3_bed_center"]);
  const tiers = [base.filter((p) => ok(p) && near(p)), base.filter(ok), extra.filter((p) => ok(p) && near(p)), extra.filter(ok), base];
  const { city, key, price } = any(tiers.find((t) => t.length));
  return { city, key, label: TIER_QUESTION[key], price, affordable: price <= rentEur };
};

export const BEST_KEY = "elsewhere-best-streak";

export const loadBest = () => Number(window.localStorage.getItem(BEST_KEY)) || 0;

export const streakCaption = (best, originName) =>
  `I guessed ${best} ${best === 1 ? "city" : "cities"} in a row on elsewhere — turns out my ${originName} rent goes way further than I thought. Beat my streak: ${window.location.href}`;

const SHORT = { "1_bed_center": "1-Bed Centre", "1_bed_outside": "1-Bed Outside", "3_bed_center": "3-Bed Centre", "3_bed_outside": "3-Bed Outside" };

export const historyEntry = (ch, userCorrect, rentEur) => ({
  city: ch.city.city,
  country: ch.city.country,
  countryCode: isoOf(ch.city.country),
  tierLabel: SHORT[ch.key],
  actualStatus: ch.affordable ? "approved" : "denied",
  userCorrect,
  rentDiff: rentEur - ch.price,
});

export const rankFor = (streak) =>
  streak >= 8 ? "Global Market Oracle" : streak >= 5 ? "Rent Arbitrageur" : streak >= 2 ? "Weekend Nomad" : "Needs a Passport";

export const sessionStats = (history, currentStreak) => {
  let run = 0;
  let best = 0;
  history.forEach((h) => { run = h.userCorrect ? run + 1 : 0; best = Math.max(best, run); });
  const correct = history.filter((h) => h.userCorrect).length;
  const total = history.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const wrongIdx = history.map((h, i) => (!h.userCorrect && i > 0 && history[i - 1].userCorrect ? i : -1)).filter((i) => i >= 0);
  const breaker = wrongIdx.length ? history[wrongIdx[wrongIdx.length - 1]] : null;
  const steals = history.filter((h) => h.actualStatus === "approved").sort((a, b) => b.rentDiff - a.rentDiff);
  const highlight = breaker ? { kind: "breaker", entry: breaker } : steals.length ? { kind: "steal", entry: steals[0] } : null;
  return { correct, total, accuracy, best, streak: currentStreak, rank: rankFor(best), highlight };
};

const STREAK_TEMPLATES = {
  high: [
    "🔥 {best} in a row on elsewhere! {grid} Testing my {rent}/mo from {origin} — apparently I know global rent better than my own landlord. Beat my streak: {url}",
    "{grid} {best} straight on elsewhere's Guess Mode. My {rent}/mo from {origin} has better travel instincts than my landlord has a conscience. Beat it: {url}",
  ],
  low: [
    "Humbled by global rent prices ({correct}/{total}) {grid} on elsewhere. Turns out my {rent}/mo from {origin} does NOT go where I thought. Try your luck: {url}",
    "{grid} {correct}/{total} on elsewhere's Guess Mode. My {rent}/mo from {origin} is a terrible travel agent. Your turn: {url}",
  ],
};

export const streakTemplates = (session) => STREAK_TEMPLATES[session.stats.best >= 4 ? "high" : "low"];

export const buildStreakCaption = (template, session) => {
  const vars = {
    best: session.stats.best,
    correct: session.stats.correct,
    total: session.stats.total,
    grid: session.history.slice(-12).map((h) => (h.userCorrect ? "🟩" : "🟥")).join(""),
    rent: session.rentLocal,
    origin: session.origin.city,
    url: window.location.href,
  };
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
};
