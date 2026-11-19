# Iteration 7: pins + pills + textures + explore flush points + regressions
MEASURE = """() => {
  const W = window.innerWidth, H = window.innerHeight;
  const vis = (el) => el.offsetParent !== null;
  const pins = Array.from(document.querySelectorAll('.globe-pin')).map(el => {
    const r = el.getBoundingClientRect(); const a = el.parentElement.getBoundingClientRect();
    return {id: el.dataset.testid, shown: vis(el), l: r.left, t: r.top, r: r.right, b: r.bottom,
      tipDx: Math.round((r.left + r.width/2) - a.left), tipDy: Math.round(r.bottom - a.top)};
  });
  const pills = Array.from(document.querySelectorAll('.globe-pill')).map(el => {
    const r = el.getBoundingClientRect(); return {id: el.dataset.testid, shown: vis(el), l: r.left, t: r.top, r: r.right, b: r.bottom};
  });
  const inter = (a,b) => Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l)) * Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
  const sp = pills.filter(p=>p.shown), spin = pins.filter(p=>p.shown);
  const pp = [], ppin = [], above = [];
  for (let i=0;i<sp.length;i++) for (let j=i+1;j<sp.length;j++) { const a=inter(sp[i],sp[j]); if (a>0) pp.push(`${sp[i].id}x${sp[j].id}:${Math.round(a)}`); }
  for (const p of sp) for (const q of spin) { const a=inter(p,q); if (a>0) ppin.push(`${p.id}x${q.id}:${Math.round(a)}`); }
  for (const p of sp) { const pin = pins.find(q => q.id === p.id.replace('label','pin')); if (pin && pin.shown && p.b > pin.t + 1) above.push(`${p.id} pillB=${Math.round(p.b)} pinT=${Math.round(pin.t)}`); }
  return {pins, pills: pills.length, shownPills: sp.length, shownPins: spin.length, pillPill: pp, pillPin: ppin, notAbove: above};
}"""

errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
tex = {}
page.on("response", lambda r: tex.__setitem__(r.url.split('/')[-1], r.status) if '/textures/' in r.url else None)

PRESETS = ["bangalore-india", "london-united-kingdom", "new-york-ny-united-states"]
for vp in [{"width": 1920, "height": 1080}, {"width": 390, "height": 844}]:
    await page.set_viewport_size(vp)
    for p in PRESETS:
        try:
            await page.goto(page.url.split('#')[0], wait_until="domcontentloaded")
            await page.wait_for_timeout(3500)
            await page.click(f'[data-testid="hero-preset-{p}"]')
            await page.wait_for_timeout(4500)
            for tag in ["preset", "shuffle"]:
                if tag == "shuffle":
                    await page.click('[data-testid="shuffle-cities-button"]')
                    await page.wait_for_timeout(3500)
                m = await page.evaluate(MEASURE)
                tips = [(x['id'], x['tipDx'], x['tipDy']) for x in m['pins'] if x['shown']]
                badtips = [t for t in tips if abs(t[1]) > 1 or abs(t[2]) > 1]
                print(f"[{vp['width']} {p} {tag}] pinsDOM={len(m['pins'])} shownPins={m['shownPins']} shownPills={m['shownPills']} pillPill={m['pillPill']} pillPin={m['pillPin']} notAbove={m['notAbove']} badTips={badtips}")
            if p == "london-united-kingdom":
                await page.screenshot(path=f".screenshots/it7_{vp['width']}_{p}.jpg", quality=40, full_page=False)
        except Exception as e:
            print(f"ERROR {vp} {p}: {e}")

print("TEXTURES:", tex)
print("PAGE ERRORS:", errors)
