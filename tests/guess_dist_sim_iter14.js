// Iteration 14: pickChallenge affordable distribution over 20-round sessions (copy of lib/guess.js logic)
const CITIES = require("/app/frontend/src/data/global_rent_data.json");
const any = (l) => l[Math.floor(Math.random() * l.length)];
const pick = (originId, rentEur, used) => {
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
  used.push(city.id); return city.housing[key] <= rentEur;
};
const ids = process.argv.slice(2);
for (const id of ids.length ? ids : ["mumbai-india", "london-united-kingdom", "zurich-switzerland", "new-york-ny-united-states", "lagos-nigeria"]) {
  const o = CITIES.find((c) => c.id === id);
  if (!o) { console.log("missing", id); continue; }
  for (const mult of [0.5, 1, 1.5, 2]) {
    const rent = o.housing["1_bed_center"] * mult;
    let aff = 0, n = 0;
    for (let s = 0; s < 500; s++) { const used = []; for (let r = 0; r < 20; r++) { aff += pick(o.id, rent, used) ? 1 : 0; n++; } }
    console.log(`${id} x${mult} rent=${Math.round(rent)}EUR affordable=${(aff / n * 100).toFixed(1)}%`);
  }
}
