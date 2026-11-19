// Iteration 2: lead-perk diversity, flag coverage, long names, and the 'avoidable' duplicate check
const { generateBatch } = require("/tmp/engine.js");
const { flagOf } = require("/tmp/flags.js");
const data = require("/app/frontend/src/data/global_rent_data.json");
const noFlag = [...new Set(data.filter(c => !flagOf(c.country)).map(c => c.country))];
console.log("countries without flag:", noFlag);
console.log("longest names:", [...data].sort((a,b)=>b.city.length-a.city.length).slice(0,10).map(c=>c.city+"("+c.city.length+")"));
let total=0, dupLead=0, avoidable=0, ex=[];
for (const o of data) for (const mult of [0.3,0.6,1,1.5,3,6]) for (let r=0;r<5;r++){
  const b = generateBatch(o.id, o.housing["1_bed_center"]*mult); total++;
  const nr = b.cards.filter(c=>!c.reality && c.perks.length);
  const leads = nr.map(c=>c.perks[0].type);
  if (new Set(leads).size !== leads.length) { dupLead++;
    // check whether a perfect assignment existed (bipartite matching)
    const opts = nr.map(c=>c.perks.map(p=>p.type));
    const match={}; const tryK=(i,seen)=>{for(const t of opts[i]){if(seen.has(t))continue;seen.add(t);if(match[t]===undefined||tryK(match[t],seen)){match[t]=i;return true;}}return false;};
    let m=0; opts.forEach((_,i)=>{if(tryK(i,new Set()))m++;});
    if (m===nr.length){avoidable++; if(ex.length<3) ex.push(o.id+" x"+mult+" "+JSON.stringify(b.cards.map(c=>c.reality?"R":c.perks.map(p=>p.type).join("/"))));}
  }
}
console.log({total,dupLead,avoidable,ex});
