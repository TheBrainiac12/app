# Helper snippet (pasted into browser_automation scripts): coarse-grid hover search for a WebGL city dot
CUR = "document.querySelector('[data-testid=globe-container]').style.cursor"

async def find_dot(page, xs=(1000, 1260, 7), ys=(220, 380, 7)):
    for y in range(*ys):
        for x in range(*xs):
            await page.mouse.move(x, y)
            await page.wait_for_timeout(15)
            if await page.evaluate(CUR) == "pointer":
                return (x, y)
    return None
