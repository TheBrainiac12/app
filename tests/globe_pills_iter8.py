# Iteration 8: pill placement (upward preference) measured over 3 presets + shuffle, 2 viewports
MEASURE = """() => {
  const vis = (el) => el.offsetParent !== null;
  const box = (el) => { const r = el.getBoundingClientRect(); return {id: el.dataset.testid, shown: vis(el), l: r.left, t: r.top, r: r.right, b: r.bottom}; };
  const pins = Array.from(document.querySelectorAll('.globe-pin')).map(box);
  const pills = Array.from(document.querySelectorAll('.globe-pill')).map(box);
  const inter = (a,b) => Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l)) * Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
  const sp = pills.filter(p=>p.shown), spin = pins.filter(p=>p.shown);
  const pp = [], ppin = [], below = [], offTop = [];
  for (let i=0;i<sp.length;i++) for (let j=i+1;j<sp.length;j++) { const a=inter(sp[i],sp[j]); if (a>0) pp.push(`${sp[i].id}x${sp[j].id}:${Math.round(a)}`); }
  for (const p of sp) for (const q of spin) { const a=inter(p,q); if (a>0) ppin.push(`${p.id}x${q.id}:${Math.round(a)}`); }
  for (const p of sp) { if (p.t < 0) offTop.push(p.id); const pin = pins.find(q => q.id === p.id.replace('label','pin')); if (pin && pin.shown && p.t > pin.t) below.push(p.id); }
  return {shownPills: sp.length, shownPins: spin.length, pillPill: pp, pillPin: ppin, pillTopBelowPinTop: below, offTop};
}"""

errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
PRESETS = ["bangalore-india", "london-united-kingdom", "new-york-ny-united-states"]
tot = {"states": 0, "pp": 0, "ppin": 0, "below": 0, "pills": 0}
for vp in [{"width": 1920, "height": 1080}, {"width": 390, "height": 844}]:
    await page.set_viewport_size(vp)
    for p in PRESETS:
        try:
            await page.goto(page.url.split('#')[0], wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            await page.click(f'[data-testid="hero-preset-{p}"]')
            await page.wait_for_timeout(4500)
            for tag in ["preset", "shuffle"]:
                if tag == "shuffle":
                    await page.click('[data-testid="shuffle-cities-button"]')
                    await page.wait_for_timeout(3500)
                m = await page.evaluate(MEASURE)
                tot["states"] += 1; tot["pp"] += len(m["pillPill"]); tot["ppin"] += len(m["pillPin"]); tot["below"] += len(m["pillTopBelowPinTop"]); tot["pills"] += m["shownPills"]
                print(f"[{vp['width']} {p} {tag}] pins={m['shownPins']} pills={m['shownPills']} pillPill={m['pillPill']} pillPin={m['pillPin']} below={m['pillTopBelowPinTop']} offTop={m['offTop']}")
                if p == "london-united-kingdom" and tag == "shuffle":
                    await page.screenshot(path=f".screenshots/it8_{vp['width']}_london_shuffle.jpg", quality=40, full_page=False)
        except Exception as e:
            print(f"ERROR {vp} {p}: {e}")
print("TOTALS:", tot)
print("PAGE ERRORS:", errors)
