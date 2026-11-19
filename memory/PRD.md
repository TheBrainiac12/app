# What Your Rent Buys Elsewhere — PRD

## Original problem
A viral single-page app for a hackathon. A renter picks their city and monthly rent and sees what that money buys in 3–4 contrasting cities around the world: apartment tier, lifestyle perks, savings or the gap, and a salary stat. The result can be shared as a Square or Story PNG. Frontend only: static JSON (160 cities, prices in EUR), no backend, no login, no live APIs.

## Architecture
- React (CRA/craco) + Tailwind + Framer Motion + html-to-image. The backend server is unused.
- `src/data/global_rent_data.json`: data from the user.
- `src/lib/currency.js`: fixed EUR-based exchange rates and currency for each country.
- `src/lib/engine.js`: city tiers, housing tier, perks calculator and batch generation.
- `src/lib/theme.js`: tier colours and the salary line.
- Components: RentHero, CityCombobox, PlayfulLoader, ResultsView, CityCard, ShareDialog, ExportCard.

## Implemented (Jun 2026)
- Hero with city autocomplete (cities starting with the typed text are listed first), local-currency rent input with slider and USD equivalent.
- Loader of about 0.8 seconds; staggered card reveal; Shuffle that avoids repeating cities; Edit inputs keeps the previous values.
- Balanced batches (Affordable / Mid / Dream / Wildcard), at most 1 Reality Check card, allGap and fewCovered fallbacks with a note.
- Perks: bills badge, gym, transit, cappuccino, then date nights / meals / movies with caps, and savings. Correct plurals.
- Share dialog: Square 1080×1080 and Story 1080×1920 PNG export.
- Polish (Jun 2026): long city names auto-scale in the export image; Story adds a rent breakdown, a salary stat box and a boarding-pass divider; cards get a Local Vibe 2×2 price grid, flag emoji, a bigger apartment tier and a salary pill; lead perks are unique across a batch (best-assignment search, craft beers added); hero quick-try presets; Compare button contrast; dot-grid background; share dialog fits mobile.

## Backlog
- P1: compare against a chosen city; region filter; 1-bed vs 3-bed preference.
- P2: native share sheet and shareable link; multi-slide story in the style of Spotify Wrapped; privacy-friendly analytics.

## Globe upgrade (Jun 2026)
- Full-screen react-globe.gl globe with local textures (/public/textures: earth-night, topology, night sky), atmosphere glow, auto-rotate until the user interacts, minDistance 150.
- Top-left glass panel (search, rent, presets) changes to a summary with Edit after Compare. The camera flies to the origin city, which gets an emerald pulsing ring.
- 5 matched cities (engine count = 5), tier-coloured animated arcs, pulsing rings, and clickable HTML label pills. A screen-space rAF layout keeps pills from overlapping, keeps them on screen and clear of the panels, and adds leader lines.
- Clicking a pill or point flies to the city and opens a right slide-over drawer with the full CityCard and Share PNG. Closing the drawer returns the camera to the overview.
- Bottom dock: Shuffle 5 Cities, plus a toggle that shows all 160 cities as points (emerald = covered, coral = reality check) with a tooltip; clicking a point zooms to altitude 0.6.
- The camera overview centres on the middle of the origin and the destinations, with an altitude based on how far apart they are.
