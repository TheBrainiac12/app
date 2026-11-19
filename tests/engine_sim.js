const { generateBatch } = require("/tmp/engine.js");
const data = require("/app/frontend/src/data/global_rent_data.json");
let issues = { originIn: 0, multiReality: 0, lessThan4: 0, dupe: 0, shuffleOverlap: 0, nullCard: 0, total: 0 };
const ex = {};
for (const o of data) for (const mult of [0.05, 0.3, 0.6, 1, 1.5, 3]) for (let r = 0; r < 5; r++) {
  const rent = o.housing["1_bed_center"] * mult;
  let b; try { b = generateBatch(o.id, rent); } catch (e) { issues.nullCard++; ex.nullCard = ex.nullCard || `${o.id} x${mult} ${e.message}`; continue; }
  issues.total++;
  const ids = b.cards.map(c => c.city.id);
  if (ids.includes(o.id)) issues.originIn++;
  if (b.cards.length < 4) { issues.lessThan4++; ex.lessThan4 = ex.lessThan4 || `${o.id} x${mult}`; }
  if (new Set(ids).size !== ids.length) { issues.dupe++; ex.dupe = ex.dupe || `${o.id} x${mult}`; }
  if (!b.allGap && b.cards.filter(c => c.reality).length > 1) { issues.multiReality++; ex.multi = ex.multi || `${o.id} x${mult}`; }
  const b2 = generateBatch(o.id, rent, ids);
  const ov = b2.cards.filter(c => ids.includes(c.city.id)).length;
  if (ov > 0) { issues.shuffleOverlap++; ex.shuf = ex.shuf || `${o.id} x${mult} allGap=${b.allGap} ov=${ov}`; }
}
console.log(issues, ex);
// Mumbai 2000 INR
const m = data.find(c => c.city === "Mumbai");
const b = generateBatch(m.id, 2000 / 99.5);
console.log("mumbai", b.allGap, b.cards.map(c => c.city.id + ":" + c.reality));
