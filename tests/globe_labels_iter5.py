
MEASURE = """() => {
  const panel = document.querySelector('.glass-panel').getBoundingClientRect();
  const W = window.innerWidth, H = window.innerHeight;
  const els = Array.from(document.querySelectorAll('[data-testid^="globe-label-"], [data-testid="globe-origin-label"]'));
  const vis = (el) => { let e = el; while (e) { const s = getComputedStyle(e); if (s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0) return false; e = e.parentElement; } return true; };
  const items = els.map(el => { const r = el.getBoundingClientRect(); return {id: el.dataset.testid.replace('globe-label-',''), l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: r.width, shown: vis(el) && r.width>0}; });
  const inter = (a,b) => Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l)) * Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
  const res = items.map(it => ({...it, inView: it.l>=0 && it.t>=0 && it.r<=W && it.b<=H, underPanel: inter(it, {l:panel.left,t:panel.top,r:panel.right,b:panel.bottom})>0 }));
  const shown = res.filter(x=>x.shown);
  const overlaps = [];
  for (let i=0;i<shown.length;i++) for (let j=i+1;j<shown.length;j++) { const a=inter(shown[i],shown[j]); if (a>0) overlaps.push(`${shown[i].id}x${shown[j].id}:${Math.round(a)}`); }
  return {panelBottom: Math.round(panel.bottom), panelRight: Math.round(panel.right), items: res, overlaps};
}"""

PRESETS = ["bangalore-india", "mumbai-india", "london-united-kingdom", "new-york-ny-united-states"]

async def report(page, tag):
    m = await page.evaluate(MEASURE)
    shown = [i for i in m["items"] if i["shown"]]
    good = [i for i in shown if i["inView"] and not i["underPanel"]]
    origin = next((i for i in m["items"] if i["id"] == "globe-origin-label"), None)
    print(f"[{tag}] panel b={m['panelBottom']} r={m['panelRight']} dom={len(m['items'])} shown={len(shown)} good={len(good)} overlaps={m['overlaps']}")
    for i in m["items"]:
        print(f"    {i['id']:<32} shown={i['shown']} ({i['l']},{i['t']},{i['r']},{i['b']}) inView={i['inView']} underPanel={i['underPanel']}")
    return m

for vp in [{"width": 1920, "height": 1080}, {"width": 390, "height": 844}]:
    await page.set_viewport_size(vp)
    for p in PRESETS:
        try:
            await page.goto(page.url.split('#')[0], wait_until="domcontentloaded")
            await page.wait_for_timeout(3500)
            await page.click(f'[data-testid="hero-preset-{p}"]')
            await page.wait_for_timeout(4000)
            await report(page, f"{vp['width']} {p}")
            if p == "london-united-kingdom":
                await page.screenshot(path=f".screenshots/it5_{vp['width']}_{p}.jpg", quality=40, full_page=False)
            await page.click('[data-testid="shuffle-cities-button"]')
            await page.wait_for_timeout(3000)
            await report(page, f"{vp['width']} {p} SHUFFLE")
            if p == "bangalore-india":
                await page.screenshot(path=f".screenshots/it5_{vp['width']}_{p}_shuf.jpg", quality=40, full_page=False)
        except Exception as e:
            print(f"ERROR {vp} {p}: {e}")
