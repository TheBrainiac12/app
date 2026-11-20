# Iteration 14: Guess Mode flow (hero entry, answers via keys/buttons, correctness, streak, rounds, no repeats)
import re
errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
page.on("console", lambda m: errors.append("CONSOLE " + m.text) if m.type == "error" else None)
await page.set_viewport_size({"width": 1920, "height": 1080})
num = lambda s: float(re.sub(r"[^\d.]", "", s.replace(",", "")) or 0)
try:
    await page.wait_for_timeout(3000)
    await page.evaluate("localStorage.removeItem('elsewhere-best-streak')")
    await page.fill('[data-testid="city-autocomplete-input"]', "Mumbai")
    await page.wait_for_timeout(500)
    await page.click('[data-testid="city-autocomplete-option-mumbai-india"]')
    await page.wait_for_timeout(500)
    print("rent value:", await page.input_value('[data-testid="monthly-rent-input"]'))
    print("hero guess btn visible:", await page.is_visible('[data-testid="hero-guess-mode-button"]'))
    await page.click('[data-testid="hero-guess-mode-button"]')
    await page.wait_for_timeout(2500)
    print("card visible:", await page.is_visible('[data-testid="guess-card"]'))
    print("dock visible:", await page.is_visible('[data-testid="dock-guess-mode-button"]'), "panel visible:", await page.is_visible('[data-testid="brand-name"]'))
    print("Q:", await page.text_content('[data-testid="guess-question"]'))
    print("labels:", await page.evaluate("Array.from(document.querySelectorAll('[data-testid^=globe-label-]')).map(e=>e.dataset.testid+':'+e.textContent)"))
    await page.screenshot(path=".screenshots/g1_q.jpg", quality=40, full_page=False)
    cid = await page.evaluate("(()=>{const e=document.querySelector('[data-testid^=globe-label-]'); if(!e) return null; e.click(); return e.dataset.testid})()")
    await page.wait_for_timeout(800)
    print("clicked label pre-reveal", cid, "drawer open:", await page.is_visible('[data-testid="city-drawer"]'))
    # ArrowRight before reveal should answer (denied) not cycle
    seen = []; aff = 0; correct_ok = True; streak_ok = True; prev = 0; tiers = set()
    N = int(globals().get("N", 12))
    for i in range(N):
        cityname = await page.text_content('[data-testid="guess-city"]')
        rnd = await page.text_content('[data-testid="guess-round"]')
        q = await page.text_content('[data-testid="guess-question"]')
        tiers.add(re.search(r"afford a (.*) in", q).group(1))
        seen.append(cityname)
        mode = i % 6
        keymap = {0: ("a", True), 1: ("d", False), 4: ("ArrowLeft", True), 5: ("ArrowRight", False)}
        if mode in keymap:
            await page.keyboard.press(keymap[mode][0]); said = keymap[mode][1]
        elif mode == 2:
            await page.click('[data-testid="guess-approved-button"]'); said = True
        else:
            await page.click('[data-testid="guess-denied-button"]'); said = False
        await page.wait_for_timeout(600)
        banner = await page.text_content('[data-testid="guess-result-banner"]')
        local = await page.text_content('[data-testid="guess-local-rent"]')
        yours = await page.evaluate("document.querySelector('[data-testid=guess-local-rent]').parentElement.nextElementSibling.querySelector('p:last-child').textContent")
        diff = await page.text_content('[data-testid="guess-diff"]')
        cd = await page.is_visible('[data-testid="guess-countdown"]')
        s = int(re.search(r"\d+", await page.text_content('[data-testid="guess-streak"]')).group())
        affordable = num(local) <= num(yours)
        aff += affordable
        correct = "Nailed" in banner
        if (said == affordable) != correct: correct_ok = False; print("  !! correctness mismatch")
        if ("left over" in diff) != affordable or cd == affordable: print("  !! diff/countdown mismatch")
        if s != (prev + 1 if correct else 0): streak_ok = False
        prev = s
        lab = await page.evaluate("Array.from(document.querySelectorAll('[data-testid^=globe-label-]')).map(e=>e.textContent)")
        print(f"{rnd} {cityname} said={'A' if said else 'D'} local={local} yours={yours} | {diff} | cd={cd} | {banner} | streak={s} | label={lab}")
        if i == 0: await page.screenshot(path=".screenshots/g1_reveal.jpg", quality=40, full_page=False)
        if i == 3:
            await page.focus('[data-testid="guess-next-button"]')
            await page.keyboard.press("Enter")
            await page.wait_for_timeout(600)
            print("  after Enter on focused next btn round:", await page.text_content('[data-testid="guess-round"]'))
        else:
            await page.keyboard.press("Enter" if i % 2 == 0 else " ")
            await page.wait_for_timeout(600)
    print("seen unique:", len(set(seen)), "/", len(seen), "tiers:", tiers)
    print("affordable count", aff, "/", N, "correctness ok:", correct_ok, "streak ok:", streak_ok)
    print("best LS:", await page.evaluate("localStorage.getItem('elsewhere-best-streak')"), "best text:", await page.text_content('[data-testid="guess-best"]'))
except Exception as e:
    print("ERR", e)
print("ERRORS:", errors[:10])
