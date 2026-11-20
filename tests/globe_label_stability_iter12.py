# Iteration 12: globe label stability while dragging (occlusion hysteresis, viewport clamp, pill-pill overlap, clickability)
START = """() => { window.__s = []; window.__t = setInterval(() => {
  const ws = [...document.querySelectorAll('.globe-wrap')];
  window.__s.push({v: ws.map(w => w.classList.contains('globe-wrap-hidden') ? '0' : '1').join(''),
    none: ws.filter(w => getComputedStyle(w.querySelector('.globe-pill')).display === 'none' || getComputedStyle(w).display === 'none').length});
}, 40); }"""
STOP = """() => { clearInterval(window.__t); const s = window.__s; const n = s.length ? s[0].v.length : 0; const ch = [];
  for (let i = 0; i < n; i++) { let c = 0; for (let k = 1; k < s.length; k++) if (s[k].v[i] !== s[k-1].v[i]) c++; ch.push(c); }
  return {samples: s.length, changes: ch, maxNone: Math.max(0, ...s.map(x => x.none)), first: s[0] && s[0].v, last: s[s.length-1] && s[s.length-1].v}; }"""
SETTLED = """() => { const W = innerWidth, H = innerHeight;
  const ws = [...document.querySelectorAll('.globe-wrap')].filter(w => !w.classList.contains('globe-wrap-hidden'));
  const b = ws.map(w => { const r = w.querySelector('.globe-pill').getBoundingClientRect(); return {id: w.querySelector('.globe-pill').dataset.testid, l: r.left, t: r.top, r: r.right, b: r.bottom, op: getComputedStyle(w).opacity, pe: getComputedStyle(w.querySelector('.globe-pill')).pointerEvents}; });
  const inter = (a, c) => Math.max(0, Math.min(a.r, c.r) - Math.max(a.l, c.l)) * Math.max(0, Math.min(a.b, c.b) - Math.max(a.t, c.t));
  const pp = []; for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) { const a = inter(b[i], b[j]); if (a > 0) pp.push(`${b[i].id}x${b[j].id}:${Math.round(a)}`); }
  const out = b.filter(p => p.l < 15.5 || p.t < 15.5 || p.r > W - 15.5 || p.b > H - 15.5).map(p => `${p.id}(${Math.round(p.l)},${Math.round(p.t)},${Math.round(p.r)},${Math.round(p.b)})`);
  const pe = b.filter(p => p.pe === 'none').map(p => p.id);
  return {visible: b.length, total: document.querySelectorAll('.globe-wrap').length, pp, out, peNone: pe}; }"""

errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
PRESETS = ["london-united-kingdom", "mumbai-india", "new-york-ny-united-states"]
tot = {"drags": 0, "flicker": 0, "none": 0, "pp": 0, "out": 0, "pe": 0}
base = page.url.split('#')[0]
for vp in [{"width": 1920, "height": 1000}, {"width": 390, "height": 844}]:
    await page.set_viewport_size(vp)
    cx, cy = vp["width"] / 2, vp["height"] / 2
    amp = 320 if vp["width"] > 1000 else 140
    for p in PRESETS:
        try:
            await page.goto(base, wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            await page.click(f'[data-testid="hero-preset-{p}"]')
            await page.wait_for_timeout(4500)
            for name, (dx, dy) in {"left": (-amp, 0), "right": (amp, 0), "up": (0, -amp * 0.8), "down": (0, amp * 0.8), "diag": (amp, amp * 0.6)}.items():
                await page.mouse.move(cx, cy)
                await page.evaluate(START)
                await page.mouse.down()
                for i in range(1, 41):
                    await page.mouse.move(cx + dx * i / 40, cy + dy * i / 40)
                    await page.wait_for_timeout(16)
                await page.mouse.up()
                await page.wait_for_timeout(600)
                r = await page.evaluate(STOP)
                await page.wait_for_timeout(300)
                s = await page.evaluate(SETTLED)
                tot["drags"] += 1
                flick = [c for c in r["changes"] if c > 1]
                tot["flicker"] += len(flick); tot["none"] += r["maxNone"]; tot["pp"] += len(s["pp"]); tot["out"] += len(s["out"]); tot["pe"] += len(s["peNone"])
                print(f"[{vp['width']} {p} {name}] samples={r['samples']} changes={r['changes']} {r['first']}->{r['last']} noneMax={r['maxNone']} vis={s['visible']}/{s['total']} pp={s['pp']} out={s['out']} peNone={s['peNone']}")
            if p == "mumbai-india":
                await page.screenshot(path=f".screenshots/it12_{vp['width']}_mumbai.jpg", quality=40, full_page=False)
            # clickability: JS click on first visible non-origin pill
            ok = await page.evaluate("""() => { const w = [...document.querySelectorAll('.globe-wrap')].find(w => !w.classList.contains('globe-wrap-hidden') && w.querySelector('.globe-pill:not([data-testid=globe-origin-label])'));
              if (!w) return null; const b = w.querySelector('.globe-pill'); b.click(); return b.dataset.testid; }""")
            await page.wait_for_timeout(1200)
            drawer = await page.locator('[data-testid="city-drawer"]').count()
            print(f"  click {ok} -> city-drawer count={drawer}")
        except Exception as e:
            print(f"ERROR {vp} {p}: {e}")
print("TOTALS:", tot)
print("PAGE ERRORS:", errors)
