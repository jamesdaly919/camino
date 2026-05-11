# Camino Companion · PWA

A single-folder Progressive Web App for your full Manila → Camino → Manila trip. Built around the Portuguese Coastal Camino (Vigo → Santiago de Compostela, 100.6 km in 8 stages), with travel legs, weather, and curated POI data baked in. Installs on your phone like a native app, works offline, and runs entirely from static files.

## What's in the app

### 🗺 Live map view
- Your GPS position with accuracy ring
- The full route line, color-coded by stage status (passed / current / upcoming)
- Town markers (Vigo, Redondela, Arcade, Pontevedra, San Amaro, Caldas, Padrón, Teo, Santiago)
- **Three center buttons**: locate me / fit whole route / zoom
- **Weather strip** at the top: today + tomorrow forecast for the end of your current stage (via Open-Meteo, free, no key)
- **Layers panel** (collapsible top-left): toggle 295 Wise Pilgrim POIs and 6 alternative tracks; filter POIs by category (lodging, food, water, church, shop, historic, viewpoint, bridge, rest area)
- Automatic stage tracking — your `% complete` and km-remaining update from your GPS position projected onto the route line

### 🧭 Trip / Itinerary view
19 cards in chronological order:
1. ✈️ Manila (MNL) → Dubai (DXB)
2. 🛬 Layover in Dubai
3. ✈️ Dubai (DXB) → Madrid (MAD)
4. 🏛️ Explore Madrid
5. 🚄 Madrid → Vigo (train / plane / bus options)
6. **Stage 1** Vigo → Redondela · 14.5 km
7. **Stage 2** Redondela → Arcade · 8.4 km
8. **Stage 3** Arcade → Pontevedra · 12.4 km
9. **Stage 4** Pontevedra → San Amaro · 16.3 km
10. **Stage 5** San Amaro → Caldas de Reis · 4.7 km
11. **Stage 6** Caldas de Reis → Padrón · 18.7 km
12. **Stage 7** Padrón → Teo · 11.4 km
13. **Stage 8** Teo → Santiago · 14.2 km
14. ⛪ Explore Santiago
15. ✈️ Santiago → Barcelona
16. 🏖️ Explore Barcelona
17. ✈️ Barcelona → Dubai
18. 🛬 Layover in Dubai
19. ✈️ Dubai → Manila

Each travel leg has tap-through deep-links to Google Flights, Skyscanner, Renfe, ALSA, Vueling, etc. (Live timetable scraping needs a paid API — these links land you on the real booking sites with the route pre-filled.)

Each walking stage shows feature counts at a glance: `🛏 25 🍴 5 💧 4 ⛪ 4` — curated albergues/hotels, food spots, water fountains, and churches along that day.

### 📍 Nearby view
Seven big buttons (restroom, hotel, food, transit, pharmacy, water, church) and a "Near Me Now" panic panel. Each search returns **two sets** of results:
- 🐚 **On the Camino** — curated Wise Pilgrim POIs within 5 km of you (with prices and Booking.com links for albergues)
- 📡 **Live nearby** — fresh OpenStreetMap results within 1.5 km via Overpass API

Plus a one-tap "Share my location with family" via Web Share API.

### ⏰ Time view
Spain (Madrid) ↔ Philippines (Manila) clocks with "Good time to call home" indicator. Town history cards for each major stop with curated highlights.

### ⚙️ More view
Emergency contacts (112, Guardia Civil, PH Embassy Madrid, your insurance, family), walking-mode toggle (keeps screen on), reset button.

## Q&A

**Can I use it from home before traveling?**
Yes. The map, all 8 stages, 295 POIs, 6 alternative tracks, town history, and full itinerary load from anywhere. The only things that need you to be physically in Spain are the GPS-relative features: your blue dot, "% through today's stage", and the live Overpass nearby search.

**Can I center the map on the start of the route?**
Yes — the second map button (target-box icon) is "Fit Route". It snaps back to show all of Vigo → Santiago. The first button (crosshair) is "Locate me".

**Are live flight / train timetables shown?**
No — that requires a paid API (Amadeus, Skyscanner Partners, Trainline). What's there instead: one tap per leg opens the real booking site with the route already filled in. Faster than typing the route every time, and gives you real prices/times.

**Is today's and tomorrow's weather shown?**
Yes — a small strip at the top of the map shows current temp + tomorrow's high/low + rain probability, for the destination town of your current stage. Auto-refreshes every 30 minutes. Powered by Open-Meteo (free, no API key, accurate).

## Deploy to Vercel (5 minutes)

### Option A — Drag & drop (fastest)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag the entire `camino` folder onto the page
3. Click **Deploy**
4. Open the URL on your phone, then tap "Add to Home Screen" (Safari) or "Install app" (Chrome)

### Option B — GitHub + Vercel
```bash
cd camino
git init
git add .
git commit -m "Camino Companion PWA v1.2"
git remote add origin git@github.com:YOURUSER/camino-companion.git
git push -u origin main
```
Then on Vercel: New Project → Import this repo → Deploy. No build step.

### Option C — Local test
```bash
cd camino
python3 -m http.server 8080
```
Open on your phone over the same Wi-Fi. PWA install needs `https://` or `localhost`.

## File structure
```
camino/
├── index.html              # The whole app
├── sw.js                   # Service worker (offline cache)
├── manifest.webmanifest    # PWA install metadata
├── route.json              # 8 stages, 100.6 km, simplified waypoints
├── features.json           # 295 curated POIs along the route
├── itinerary.json          # 19-item full trip
├── icon.svg / .png         # App icons (scallop shell)
└── README.md
```

## Customize

**Hotel & emergency edits** — done inside the app on your phone. Tap any stage → fill in hotel name, address, phone. Saved to your phone's local storage.

**Itinerary edits** — edit `itinerary.json` directly (it's plain JSON). Useful for adding hotel names in Madrid/Barcelona, locking in flight times, or noting layover gate info. After editing, push to git and Vercel auto-redeploys.

**Route customization** — `route.json` is generated from the two Wise Pilgrim KML files. To re-split stages or change the route, see `build_data.py` in the parent folder.

**Switch to Google Sheets backend** — same POST architecture as the Operations Hub tool. Sketch:
```js
async function loadFromSheets(){
  const r = await fetch(GAS_URL);
  const data = await r.json();
  state.hotels = data.hotels;
  renderItinerary();
}
```

## Data sources & attribution
- Route tracks and POIs derived from Wise Pilgrim KML files for the Portuguese Coastal and Central routes
- Map tiles © OpenStreetMap contributors
- Live "nearby" search © Overpass API
- Weather © Open-Meteo
- All free, no-API-key, attribution-respecting

## Known limits
- **GPS battery drain** — keep walking mode on only while actually walking.
- **Overpass rate limits** — auto-retries on a backup endpoint; if all three fail, retry button is shown.
- **iOS Safari wake lock** — works best when the app is added to the home screen.
- **No turn-by-turn navigation** — by design. Tap "Go" / "Walk here" on any POI to open Google Maps with walking directions.

---

Buen Camino. 🐚 The shell points the way home.
