# Night Safari: design

Dark, like a night safari: torchlight in the bush. Sightings glow amber like eye-shine in the dark.

## Colours (`:root` in `web/assets/css/app.css`)

| Token | Hex | Use |
|-------|-----|-----|
| `--night` | `#0A1210` | page background, theme colour |
| `--bush` | `#111D19` | cards, map frame |
| `--bush-raised` | `#18281F` | hovers, popups |
| `--line` | `#24382F` | borders |
| `--moon` | `#E9EEE6` | main text |
| `--mist` | `#9DB0A6` | secondary text |
| `--eyeshine` | `#FFB547` | the accent: buttons, links, markers, globe points, focus rings |
| `--ember` | `#FF7A3D` | spare warm accent |
| `--moss` | `#7FD1A8` | small labels (eyebrows, dates), globe halo |

The globe reads `--globe-*` and the map reads `--map-marker*`; they point at the palette.

## Lettering

- Headings: Outfit (clean, geometric), 600–800.
- Body: Work Sans, 400/500.
- Both from Google Fonts in the layout.

## Shape and spacing

- `--radius: 14px` on cards and the map; buttons and nav links are pills.
- `--space: clamp(1rem, 3vw, 2rem)`, content max width `--wrap: 1200px`.

## Page

1. Sticky blurred header: logo (amber eyes over a treeline, `assets/images/logo.svg`) and "Night Safari", nav to `#map` and `#sightings`.
2. Banner: three.js globe (`assets/js/scenes/globe.js`) behind the headline, one glowing point per sighting, slow turn, tilts with the pointer; stats and a pill button.
3. Map: Leaflet with dark tiles and amber clustered markers.
4. Sightings: cards in tiles, photo at 4:3 with credit, date in moss, name, scientific name in italics, place, count, observers.

## Motion

Gentle lifts and amber glow on hover (≈250ms). Everything respects reduced motion.
