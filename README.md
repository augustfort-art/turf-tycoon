# Turf & Tycoon

A horse racing ownership sim: buy at the sales, hire trainers, race the US calendar, breed and stand stallions.

Single-file web app (`index.html`) that works offline once loaded (service worker in `sw.js`). Add it to your home screen from Safari (Share → Add to Home Screen) or Chrome (⋮ → Install app). Progress saves on the device; use Office → Export save to back it up or move it.

## Data sources (v5 research build)
- **Stallions:** 250 real sires with 2026 advertised fees, lifetime AEI/CI, average winning distance and 2026 book sizes (Jockey Club Report of Mares Bred). Fees marked "est." were not published and are estimated from book size.
- **Calendar:** 2027 meet dates for every track, from the 2026 racing-dates tables and announced 2026–27 calendars.
- **Purses:** overnight purse ladders from 20 real 2026–27 condition books, including state-bred splits (KTDF, Florida fund, NY parity, LA/PA/CA/WV).
- **Sales:** price model fitted on 6,311 real hips (Keeneland September, OBS April, Fasig Eastern Fall, LTBA): fee elasticity, dam, sex, breeze time, book medians, RNA and withdrawal rates.
- **Figures:** Beyer-style pars from DRF par charts and Breeders' Cup past performances.
