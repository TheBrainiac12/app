import data from "@/data/global_rent_data.json";

export const CITIES = [...data].sort((a, b) => a.label.localeCompare(b.label));

const HOUSING_ORDER = [
  { key: "3_bed_center", label: "3-Bed · City Centre" },
  { key: "3_bed_outside", label: "3-Bed · Outside Centre" },
  { key: "1_bed_center", label: "1-Bed · City Centre" },
  { key: "1_bed_outside", label: "1-Bed · Outside Centre" },
];

const CAPS = { dates: 12, meals: 30, movies: 12, beers: 20, cappuccino: 30 };

const TIER_OF = (() => {
  const sorted = [...data].sort((a, b) => a.housing["1_bed_center"] - b.housing["1_bed_center"]);
  const third = Math.ceil(sorted.length / 3);
  const map = {};
  sorted.forEach((c, i) => {
    map[c.id] = i < third ? "affordable" : i < third * 2 ? "mid" : "dream";
  });
  return map;
})();

const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const TEMPLATES = {
  dates: [(n) => pl(n, "three-course date night", "three-course date nights"), (n) => pl(n, "dinner for two on the town", "dinners for two on the town"), (n) => pl(n, "fancy date night out", "fancy date nights out")],
  meals: [(n) => pl(n, "casual meal out", "casual meals out"), (n) => pl(n, "lunch you don't have to pack", "lunches you don't have to pack"), (n) => pl(n, "easy bite at a local spot", "easy bites at local spots")],
  movies: [(n) => pl(n, "movie night", "movie nights"), (n) => pl(n, "trip to the cinema", "trips to the cinema"), (n) => pl(n, "big-screen evening", "big-screen evenings")],
  beers: [(n) => pl(n, "craft beer", "craft beers"), (n) => pl(n, "cold pint at the local", "cold pints at the local"), (n) => pl(n, "round of beer", "rounds of beer")],
  gym: [() => "a monthly gym membership", () => "a gym pass, sorted", () => "unlimited gym sessions"],
  transit: [() => "an unlimited monthly transit pass", () => "a monthly metro pass", () => "free transit rides all month"],
  cappuccino: [(n) => (n >= 30 ? "a cappuccino every single day" : pl(n, "café cappuccino", "café cappuccinos")), (n) => (n >= 30 ? "your daily cappuccino, every day" : pl(n, "cappuccino a month", "cappuccinos a month"))],
};

const TRADE_OFFS = [
  "Nice to visit. Living here? Find a very friendly roommate.",
  "Dream big, live small: think shared flat with a great view.",
  "Your rent covers the commute in, not the keys.",
  "Bookmark it for the next pay rise.",
];

const phrase = (type, n, seed) => {
  const list = TEMPLATES[type];
  return list[hash(seed + type) % list.length](n);
};

const calcPerks = (city, leftover) => {
  const { housing: h, lifestyle: l } = city;
  const perks = [];
  let left = leftover;
  let billsCovered = false;
  const bills = h.utilities + h.internet;
  if (left >= bills) { left -= bills; billsCovered = true; }
  if (left >= l.gym_membership) { left -= l.gym_membership; perks.push({ type: "gym", n: 1, value: l.gym_membership }); }
  if (left >= l.monthly_pass) { left -= l.monthly_pass; perks.push({ type: "transit", n: 1, value: l.monthly_pass }); }
  const cups = Math.min(CAPS.cappuccino, Math.floor(left / l.cappuccino));
  if (cups > 0) { left -= cups * l.cappuccino; perks.push({ type: "cappuccino", n: cups, value: cups * l.cappuccino }); }

  const counts = { dates: 0, meals: 0, movies: 0, beers: 0 };
  const price = { dates: l.dinner_for_two, meals: l.inexpensive_meal, movies: l.cinema_ticket, beers: l.beer };
  let progress = true;
  while (progress) {
    progress = false;
    for (const k of ["dates", "meals", "movies", "beers"]) {
      if (counts[k] < CAPS[k] && left >= price[k]) { counts[k] += 1; left -= price[k]; progress = true; }
    }
  }
  Object.entries(counts).forEach(([k, n]) => n > 0 && perks.push({ type: k, n, value: n * price[k] }));

  const top = perks
    .sort((a, b) => b.value - a.value)
    .map((p) => ({ ...p, text: phrase(p.type, p.n, city.id) }));
  return { perks: top, billsCovered, savings: Math.max(0, left) };
};

export const buildCard = (city, rentEur, slot) => {
  const tier = HOUSING_ORDER.find((t) => city.housing[t.key] <= rentEur);
  const salaryRatio = rentEur / city.economy.avg_monthly_salary;
  const base = { city, slot, tier: TIER_OF[city.id], salaryRatio, rentEur };
  if (!tier) {
    const needed = city.housing["1_bed_outside"];
    return { ...base, reality: true, needed, gap: needed - rentEur, tradeOff: TRADE_OFFS[hash(city.id) % TRADE_OFFS.length] };
  }
  const cost = city.housing[tier.key];
  return { ...base, reality: false, apartment: tier.label, housingCost: cost, ...calcPerks(city, rentEur - cost) };
};

const pick = (pool, chosen, prevIds) => {
  const usedIds = chosen.map((c) => c.id);
  const usedCountries = chosen.map((c) => c.country);
  const avail = pool.filter((c) => !usedIds.includes(c.id));
  const tries = [
    avail.filter((c) => !prevIds.includes(c.id) && !usedCountries.includes(c.country)),
    avail.filter((c) => !prevIds.includes(c.id)),
    avail.filter((c) => !usedCountries.includes(c.country)),
    avail,
  ];
  const list = tries.find((t) => t.length > 0);
  return list ? list[Math.floor(Math.random() * list.length)] : null;
};

const rawBatch = (originId, rentEur, prevIds = []) => {
  const others = data.filter((c) => c.id !== originId);
  const covered = others.filter((c) => c.housing["1_bed_outside"] <= rentEur);
  const inTier = (list, t) => list.filter((c) => TIER_OF[c.id] === t);

  if (covered.length === 0) {
    const closest = [...others].sort((a, b) => a.housing["1_bed_outside"] - b.housing["1_bed_outside"]).slice(0, 8);
    const chosen = [];
    for (let i = 0; i < 4; i++) chosen.push(pick(closest, chosen, prevIds));
    return { allGap: true, cards: chosen.map((c) => buildCard(c, rentEur, TIER_OF[c.id])) };
  }

  if (covered.length < 3) {
    const closest = [...others].filter((c) => !covered.includes(c)).sort((a, b) => a.housing["1_bed_outside"] - b.housing["1_bed_outside"]).slice(0, 6);
    const chosen = [...covered];
    while (chosen.length < 4) chosen.push(pick(closest, chosen, prevIds));
    return { allGap: false, fewCovered: true, cards: chosen.map((c) => buildCard(c, rentEur, TIER_OF[c.id])) };
  }

  const chosen = [];
  const slots = [];
  const add = (city, slot) => { if (city) { chosen.push(city); slots.push(slot); } };
  const affPool = inTier(covered, "affordable");
  add(pick(affPool.length ? affPool : covered, chosen, prevIds), "affordable");
  const midPool = inTier(covered, "mid");
  const midPick = pick(midPool, chosen, prevIds);
  add(midPick || pick(covered, chosen, prevIds), midPick ? "mid" : "affordable");
  add(pick(inTier(others, "dream"), chosen, prevIds), "dream");
  add(pick(covered, chosen, prevIds), "wildcard");

  return { allGap: false, cards: chosen.map((c, i) => buildCard(c, rentEur, slots[i])) };
};

const diversify = (cards) => {
  const used = new Set();
  return cards.map((card) => {
    if (card.reality) return card;
    const perks = [...card.perks];
    const idx = perks.findIndex((p) => !used.has(p.type));
    if (idx > 0) perks.unshift(...perks.splice(idx, 1));
    if (perks[0]) used.add(perks[0].type);
    return { ...card, perks: perks.slice(0, 3) };
  });
};

export const generateBatch = (...args) => {
  const batch = rawBatch(...args);
  return { ...batch, cards: diversify(batch.cards) };
};
