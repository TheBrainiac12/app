# Iteration 15: Guess Mode Streak & History Share Card (stats, rows, highlight, stamp, caption, download, exit toast, key isolation)
import re
errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
page.on("console", lambda m: errors.append("CONSOLE " + m.text) if m.type == "error" else None)
await page.set_viewport_size({"width": 1920, "height": 1080})
AFF = """(()=>{const el=document.querySelector('[data-testid=guess-card]'); const k=Object.keys(el).find(x=>x.startsWith('__reactFiber')); let f=el[k]; while(f){ if(f.memoizedProps&&f.memoizedProps.guess) return f.memoizedProps.guess.ch.affordable; f=f.return;} return null})()"""
D = '[data-testid="share-card-dialog"]'
async def play(pattern):
    log = []
    for want_correct in pattern:
        aff = await page.evaluate(AFF)
        say = aff if want_correct else (not aff)
        city = await page.text_content('[data-testid="guess-city"]')
        await page.keyboard.press("a" if say else "d")
        await page.wait_for_timeout(500)
        banner = await page.text_content('[data-testid="guess-result-banner"]')
        diff = await page.text_content('[data-testid="guess-diff"]')
        log.append((city, aff, "Nailed" in banner, diff))
        if len(log) < len(pattern):
            await page.keyboard.press("Enter"); await page.wait_for_timeout(500)
    for l in log: print("   ", l)
    return log
async def card_info():
    return await page.evaluate("""(()=>{const c=document.querySelector('[data-testid=guess-export-canvas]'); if(!c) return null;
      const rows=Array.from(c.querySelectorAll('div')).filter(d=>d.style.borderBottom&&d.style.borderBottom.includes('dashed')).map(r=>r.innerText.replace(/\\n/g,' | '));
      const st=c.querySelector('[data-testid=guess-export-stamp]');
      return {h:c.style.height, text:c.innerText.slice(0,260).replace(/\\n/g,' / '), rows, tiles:c.querySelector('[data-testid=guess-export-tiles]').children.length,
        more:(c.querySelector('[data-testid=guess-export-more]')||{}).textContent||null, hl:(c.querySelector('[data-testid=guess-export-highlight]')||{}).textContent||null,
        stamp: st? st.getAttribute('data-variant'):null}})()""")
async def caption(): return await page.text_content('[data-testid="share-caption-text"]')
try:
    await page.wait_for_timeout(3000)
    await page.fill('[data-testid="city-autocomplete-input"]', "Mumbai")
    await page.wait_for_timeout(500)
    await page.click('[data-testid="city-autocomplete-option-mumbai-india"]')
    await page.wait_for_timeout(500)
    await page.click('[data-testid="hero-guess-mode-button"]')
    await page.wait_for_timeout(2500)
    print("== Session 1: CCCCC W CC")
    log1 = await play([1,1,1,1,1,0,1,1])
    await page.click('[data-testid="guess-share-streak-card-button"]')
    await page.wait_for_timeout(1200)
    print("dialog:", await page.is_visible(D), "title:", await page.text_content(f'{D} h2'))
    ci = await card_info(); print("SQUARE:", ci)
    print("expect 7/8 88% best 5 RENT ARBITRAGEUR, hl breaker", log1[5][0], "stamp verified, 6 rows +2 more, tiles 8")
    await page.screenshot(path=".screenshots/s15_square.jpg", quality=40, full_page=False)
    c1 = await caption(); print("CAP1:", c1); print("grid len:", len(re.findall("🟩|🟥", c1)))
    await page.click('[data-testid="share-shuffle-caption-button"]'); await page.wait_for_timeout(200)
    c2 = await caption(); print("CAP2 differs:", c1 != c2, c2[:80])
    await page.click('[data-testid="share-shuffle-caption-button"]'); await page.wait_for_timeout(200)
    print("CAP3 == CAP1:", (await caption()) == c1)
    await page.wait_for_selector('[data-testid="download-card-png-button"]:not([disabled])', timeout=10000)
    async with page.expect_download() as dl:
        await page.click('[data-testid="download-card-png-button"]')
    d = await dl.value; print("square download:", d.suggested_filename)
    await page.click('[data-testid="share-format-story-radio"]'); await page.wait_for_timeout(1200)
    ci = await card_info(); print("STORY:", ci)
    await page.screenshot(path=".screenshots/s15_story.jpg", quality=40, full_page=False)
    await page.wait_for_selector('[data-testid="download-card-png-button"]:not([disabled])', timeout=10000)
    async with page.expect_download() as dl:
        await page.click('[data-testid="download-card-png-button"]')
    d = await dl.value; print("story download:", d.suggested_filename)
    await page.click('[data-testid="share-copy-image-button"]'); await page.wait_for_timeout(800)
    print("toasts after copy:", await page.evaluate("Array.from(document.querySelectorAll('[data-sonner-toast]')).map(t=>t.innerText)"))
    try:
        async with page.context.expect_page(timeout=5000) as pp:
            await page.click('[data-testid="share-x-button"]')
        np = await pp.value; print("X popup url:", np.url[:160]); await np.close()
    except Exception as e: print("X popup ERR", e)
    # key isolation
    rnd = await page.text_content('[data-testid="guess-round"]')
    for k in ["a", "d", "Enter"]:
        await page.keyboard.press(k); await page.wait_for_timeout(200)
    print("round unchanged with dialog open:", rnd == await page.text_content('[data-testid="guess-round"]'), "dialog still:", await page.is_visible(D))
    await page.keyboard.press("Escape"); await page.wait_for_timeout(700)
    print("after Esc: dialog", await page.is_visible(D), "guess card", await page.is_visible('[data-testid="guess-card"]'))
    # exit via Escape -> toast
    await page.keyboard.press("Escape"); await page.wait_for_timeout(1000)
    print("guess card after 2nd Esc:", await page.is_visible('[data-testid="guess-card"]'))
    print("toasts:", await page.evaluate("Array.from(document.querySelectorAll('[data-sonner-toast]')).map(t=>t.innerText)"))
    await page.get_by_role("button", name="Share Streak Card").first.click()
    await page.wait_for_timeout(1200)
    print("dialog from toast:", await page.is_visible(D), "title:", await page.text_content(f'{D} h2'))
    print("toast card:", await card_info())
    await page.keyboard.press("Escape"); await page.wait_for_timeout(700)
    print("== Session 2: W W C W (via dock)")
    await page.click('[data-testid="dock-guess-mode-button"]'); await page.wait_for_timeout(2500)
    log2 = await play([0,0,1,0])
    await page.click('[data-testid="guess-share-streak-card-button"]'); await page.wait_for_timeout(1200)
    print("S2 card:", await card_info()); print("expect 1/4 25% best1 NEEDS A PASSPORT humbled, hl breaker", log2[3][0])
    c = await caption(); print("S2 CAP:", c)
    await page.screenshot(path=".screenshots/s15_humbled.jpg", quality=40, full_page=False)
    await page.keyboard.press("Escape"); await page.wait_for_timeout(500)
    await page.click('[data-testid="guess-exit-button"]'); await page.wait_for_timeout(1000)
    print("== Session 3: CCC")
    await page.click('[data-testid="dock-guess-mode-button"]'); await page.wait_for_timeout(2500)
    log3 = await play([1,1,1])
    await page.click('[data-testid="guess-share-streak-card-button"]'); await page.wait_for_timeout(1200)
    print("S3 card:", await card_info()); print("expect 3/3 100% WEEKEND NOMAD, hl steal among approved:", [l[0] for l in log3 if l[1]])
    print("S3 CAP:", await caption())
    await page.keyboard.press("Escape"); await page.wait_for_timeout(500)
    await page.click('[data-testid="guess-exit-button"]'); await page.wait_for_timeout(1000)
    # regression: city share card from drawer
    await page.evaluate("document.querySelector('[data-testid^=globe-label-]').click()"); await page.wait_for_timeout(1500)
    print("drawer:", await page.is_visible('[data-testid="city-drawer"]'))
    await page.click('[data-testid="open-share-modal-button"]'); await page.wait_for_timeout(1500)
    print("city share title:", await page.text_content(f'{D} h2'), "export-card present:", await page.evaluate("!!document.querySelector('[data-testid=city-export-canvas]')"), "guess canvas:", await page.evaluate("!!document.querySelector('[data-testid=guess-export-canvas]')"))
    await page.wait_for_selector('[data-testid="download-card-png-button"]:not([disabled])', timeout=10000)
    async with page.expect_download() as dl:
        await page.click('[data-testid="download-card-png-button"]')
    d = await dl.value; print("city download:", d.suggested_filename)
    print("city caption:", (await caption())[:100])
except Exception as e:
    print("ERR", e)
print("ERRORS:", errors[:10])
