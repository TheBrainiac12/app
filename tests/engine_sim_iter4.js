// Iteration 4: globe batch = 5 cards, origin excluded, max 1 reality check (normal path), unique ids, shuffle novelty
const { generateBatch } = require("/tmp/engine.js");
const data = require("/app/frontend/src/data/global_rent_data.json");
let total = 0, bad5 = 0, hasOrigin = 0, multiReal = 0, dupIds = 0, nulls = 0, normal = 0, allGap = 0, few = 0, shuffleSame = 0, ex = [];
for (const o of data) for (const mult of [0.2, 0.3, 0.6, 1, 1.5, 3, 6]) for (let r = 0; r < 4; r++) {
  const rent = o.housing["1_bed_center"] * mult;
  const b = generateBatch(o.id, rent); total++;
  if (b.cards.some((c) => !c || !c.city)) { nulls++; continue; }
  const ids = b.cards.map((c) => c.city.id);
  if (b.cards.length !== 5) { bad5++; if (ex.length < 5) ex.push("len " + o.id + " x" + mult + " " + b.cards.length); }
  if (ids.includes(o.id)) hasOrigin++;
  if (new Set(ids).size !== ids.length) dupIds++;
  if (b.allGap) allGap++; else if (b.fewCovered) few++; else {
    normal++;
    if (b.cards.filter((c) => c.reality).length > 1) { multiReal++; if (ex.length < 5) ex.push("real " + o.id + " x" + mult); }
  }
  const s = generateBatch(o.id, rent, ids);
  const overlap = s.cards.filter((c) => ids.includes(c.city.id)).length;
  if (overlap === 5) shuffleSame++;
}
console.log({ total, bad5, hasOrigin, multiReal, dupIds, nulls, normal, allGap, few, shuffleSame, ex });
