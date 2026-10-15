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
| `--moss` | `#7FD1A8` | spare cool accent |
| `--firefly` | `#B8F36B` | the neon touch: eyebrows, card dates, hover glows, globe halo and fireflies, headline shimmer |

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

Lively but gentle. Everything stops under reduced motion.

- Banner: headline, stats and button fade up one after another (`reveal`); "animal" shimmers amber→firefly; a pulsing firefly dot by "Live from the wild"; the button breathes a glow; a scroll cue bobs at the bottom.
- Globe: sighting points blink on their own beats, stars twinkle, ~70 firefly-green specks drift in front, a shooting star every few seconds, the halo pulses.
- Sections and the map fade up as you reach them (`reveal`); tiles rise in as they scroll into view (CSS scroll-driven animation, so browsers without it just show them).
- Photos are windows: they tilt towards the pointer with a moving glare, and the animal shifts the other way (parallax). Resting on a tile for 250ms makes the animal lunge out of its frame at you, by kind: pounce with a snarling shake, a stomping charge, swimming in, hopping in, swinging in, or a wiggle. With sound on, the call plays as it lunges. Photos are still images, so nothing moves inside them (no mouths opening).
- Each tile reacts to hover by kind of animal (`components/call.go` maps family/class to a motion and a sound): big cats and predators pounce, heavy grazers stomp, sea animals sway, birds flutter, primates swing, the rest wiggle. The photo drifts slowly like a camera following it.
- Sound: 47 synthesised calls in `assets/js/callsynth.js`, each modelled on the real animal's call (only lions and tigers roar; leopards saw, cheetahs chirp, zebras bark "kwa-ha", bald eagles pipe, sharks are silent so they get bubbles; blue and fin whales are pitched up into hearing). `components/call.go` picks a call by species, then genus, then family. `assets/js/calls.js` plays them on the page. `/assets/soundboard.html` plays and measures every call against the real call's pitch and length; `call_test.go` checks every mapped sound exists. Off until the header's "Sound" pill is clicked; then resting on a tile for 250ms plays its call, ripples sound waves from the photo and pulses the name in firefly green. Remembered between visits.
- Tiles lift with a firefly glow on hover and the photo zooms slightly; clicking a photo opens it big (`lightbox`) with its animal, place and credit.
