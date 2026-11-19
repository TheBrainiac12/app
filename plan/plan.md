# What Your Rent Buys Elsewhere

A one-page web app where a renter enters their city and monthly rent and sees, in under 30 seconds, what that same money gets them in 3–4 contrasting cities around the world: a bigger apartment, bills covered, and everyday luxuries.
Every result can be downloaded as a bold, branded image ready to post on Instagram, X or WhatsApp.

## Who it's for
- Renters in expensive cities (NYC, London, SF, Mumbai, Bangalore and similar) who feel "house-poor" and are curious what else is out there.
- Hackathon judges and live-demo audiences, so it has to load instantly and never crash.
- Social media users who share the result images and bring new visitors in.

## Core features and experience
**1. Smart input hero**
- A city box that searches as you type, filled from the 160 cities in the provided `global_rent_data.json`.
- A monthly rent box paired with a smooth slider. They stay in sync, and the slider range adjusts to sensible amounts for the chosen city.
- Rent is entered in the user's local currency (for example ₹ for Mumbai, £ for London). The USD equivalent is shown next to it.
- A "Compare" button, disabled until both a city and a rent are filled in.

**2. Playful transition**
- A loading moment of about 0.8 seconds with rotating lines such as "Packing your bags…", "Checking global listings…" and "Converting currencies…".

**3. Matching engine (runs entirely in the browser)**
- **Currency:** all data prices are in EUR. The user's rent is converted from local currency → EUR for matching. Cards show local currency first and USD second. Fixed exchange rates are based on EUR and include an accurate INR (₹) rate.
- **City tiers:** cities are grouped into Affordable / Mid-range / Dream by their 1-bed city-centre rent, split into rough thirds. The user's own city is never included.
- **Housing tier:** the app picks the best apartment the rent covers, checking in this order: 3-bed city centre → 3-bed outside centre → 1-bed city centre → 1-bed outside centre.
- **Batch balance (no depressing batches):**
  - Each batch has 1 Affordable, 1 Mid-range and 1 Dream city, plus a 4th wildcard on desktop.
  - At most **1 "Reality Check" card** per batch, and only in the Dream slot.
  - The Affordable, Mid-range and wildcard slots only use cities the rent actually covers. If no Mid-range city is covered, that slot is filled with another covered city from a cheaper tier. Every batch therefore has at least 2–3 real upgrades whenever cheaper cities exist.
  - Where possible, a batch avoids two cities from the same country. A shuffle avoids repeating cities from the previous batch until a tier runs out.
- **Perks calculator (believable by design):**
  1. **Fixed monthly costs are deducted first, once each, in this order:** utilities + internet → gym membership → monthly transit pass → daily cappuccino (max 30 a month). Each one the leftover covers becomes a perk. When utilities + internet are covered, a **"Utilities + Wi-Fi covered"** badge appears on the card.
  2. **Whatever is left after that** is split across date nights (dinner for two), casual meals out and movie nights (cinema tickets), with caps so the numbers stay believable: up to 12 date nights, 30 casual meals and 12 movie nights a month.
  3. **Any remaining surplus** is shown as cash saved, for example "+ ₹38,000 saved every month".
  4. Perks with a count of 0 are hidden. Each card shows the 2–3 strongest perks and the badge. Counts are rounded down to whole numbers, and each perk has a few wording templates so cards don't sound the same.
- **Salary stat:** each card has a fun line comparing the user's rent with that city's `avg_monthly_salary`, for example "Your rent = 1.8× the local average salary" (or "= 60% of the local average salary" when it's lower).
- **Reality Check card (Dream slot only):** if even a 1-bed outside the centre costs more than the user's rent, the card shows the monthly gap ("You'd need +$640/mo") and a light-hearted trade-off line instead of perks.

**4. Comparison cards**
- Each card shows: city and country, a tier badge, the apartment they'd get (for example "3-Bed · City Centre"), their rent compared with the local rent (bar or split view), the "Utilities + Wi-Fi covered" badge when it applies, 2–3 perks, savings and the salary stat.
- A "Shuffle Cities" button reshuffles all cards at once with an animated swap.
- A "Share Card" button on each card.

**5. Share image export**
- Clicking "Share Card" opens a preview where the user chooses **Square (1080×1080)** or **Story (1080×1920)** and downloads a PNG.
- The image is a separate, purpose-built version of the card: "My ₹X/mo in [Origin] vs. [Target]", the apartment upgrade, the bills badge, top perks, the salary stat, and the app name in the footer.
- To render reliably in every browser, the export version uses only plain hex/RGB colours and simple gradients. It has no blur or glass effects and no interface buttons.
- The image is created on the user's device. Nothing is uploaded.

## User flow
1. Land on the hero → type and pick the current city → set rent with the box or slider → tap Compare.
2. The playful loader runs for about 0.8 seconds.
3. Cards appear one after another (3 on mobile, 4 on desktop).
4. Shuffle for a new balanced mix, or tap Share Card on one → choose Square or Story → PNG downloads.
5. "Edit inputs" at the top goes back to the hero with the previous values kept.

## UI/UX feel
- Clean and premium like a Zillow listing card, combined with the bold, colour-blocked, poster style of Spotify Wrapped.
- Each tier has its own strong accent colour so a batch looks varied at a glance. Big, confident numbers, glossy card surfaces on screen and generous spacing.
- Framer Motion is used for the staggered card reveal, hover lift/tilt, the shuffle animation and the loader.
- Works fully on desktop (demo screen: cards side by side) and mobile (cards stacked, share flow tuned for phones).

## Implementation phases
**Phase 1 – MVP (built now)**
- Everything above: smart input hero, loader, balanced tiered matching, housing tier logic, perks calculator with fixed costs deducted first, bills badge, salary stat, savings line, Reality Check (max 1, Dream slot only), local currency + USD, comparison cards, shuffle, and Square/Story PNG export.
- Single page, no backend, no login, no live API calls.
- Built on the user's enriched `global_rent_data.json` (160 cities, no missing values). Building starts once that file is uploaded.

**Phase 2 – Delight**
- Compare against a chosen city ("vs. Lisbon") in addition to the random mix.
- Filter by region or continent, and a 1-bed vs 3-bed preference.
- Native mobile share sheet in addition to download, and a shareable link that recreates the same comparison.

**Phase 3 – Reach**
- "Wrapped-style" multi-slide story sequence for a single destination.
- Light analytics on most-compared cities (privacy-friendly, still no accounts).

## Assumptions
- `global_rent_data.json` follows the enriched schema (housing incl. utilities and internet, lifestyle incl. cappuccino, gym and cinema, plus economy `avg_monthly_salary`), with all prices in EUR.
- Exchange rates are fixed, EUR-based values stored in the app (not live), taken from mid-2026 reference rates. Each city's currency comes from its country. Countries without a known rate fall back to USD only.
- The salary stat uses the user's rent converted to EUR divided by the target city's average monthly salary.
- Perk caps (12 date nights, 30 casual meals, 12 movie nights, 30 cappuccinos) can be tweaked later without other changes.
- If the user's rent is so low that no other city is covered, the batch shows the closest cities with gap cards and a friendly note. This is the only case where more than one Reality Check card can appear.
- Slider range: from roughly 0.3× to 3× the chosen city's typical 1-bed rent. The typed box accepts any positive amount.
- The perk wording is written by hand in the app (no AI writing).
- The platform builds this with React + Tailwind + Framer Motion as a single-page frontend (not Next.js). The included backend server is left unused.
- No accounts, database, payments or live data, as requested.
