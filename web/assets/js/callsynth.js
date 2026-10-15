// The animal calls, synthesised with the Web Audio API. NightSynth(ctx) builds
// them on any audio context, live or offline, so the soundboard can measure
// them. Each is modelled on the real call's pitch, rhythm and length; the
// whales below hearing range are pitched up so a laptop can play them.

window.NightSynth = function (ctx) {
	const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
	const data = noise.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

	// An attack, a hold and a release on a gain, from t for len seconds.
	function env(param, t, len, peak, attack, release) {
		param.setValueAtTime(0.0001, t);
		param.exponentialRampToValueAtTime(peak, t + attack);
		param.setValueAtTime(peak, t + Math.max(attack, len - release));
		param.exponentialRampToValueAtTime(0.0001, t + len);
	}

	function tone(type, freq, t, len, out, peak = 0.3, attack = 0.02, release = 0.1) {
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = type;
		o.frequency.setValueAtTime(freq, t);
		env(g.gain, t, len, peak, attack, release);
		o.connect(g).connect(out);
		o.start(t);
		o.stop(t + len + 0.05);
		return o;
	}

	function hiss(t, len, out, type, freq, q, peak = 0.4, attack = 0.02, release = 0.2) {
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		src.loopStart = Math.random();
		const f = ctx.createBiquadFilter();
		f.type = type;
		f.frequency.setValueAtTime(freq, t);
		f.Q.value = q;
		const g = ctx.createGain();
		env(g.gain, t, len, peak, attack, release);
		src.connect(f).connect(g).connect(out);
		src.start(t, Math.random());
		src.stop(t + len + 0.05);
		return f;
	}

	function filter(type, freq, q, out) {
		const f = ctx.createBiquadFilter();
		f.type = type;
		f.frequency.value = freq;
		f.Q.value = q;
		f.connect(out);
		return f;
	}

	// Grit for rough calls: soft clipping adds the harmonics of a throat.
	// An odd number of points, so silence maps to exactly zero.
	function grit(out, amount) {
		const shaper = ctx.createWaveShaper();
		const curve = new Float32Array(257);
		for (let i = 0; i < 257; i++) {
			const x = i / 128 - 1;
			curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
		}
		shaper.curve = curve;
		shaper.connect(out);
		return shaper;
	}

	// A wobble on the volume: the rumble of a roar, the pulses of an orca.
	function tremolo(t, len, rate, depth, out) {
		const g = ctx.createGain();
		g.gain.value = 1 - depth;
		const lfo = ctx.createOscillator();
		const lg = ctx.createGain();
		lfo.frequency.value = rate;
		lg.gain.value = depth;
		lfo.connect(lg).connect(g.gain);
		lfo.start(t);
		lfo.stop(t + len + 0.1);
		g.connect(out);
		return g;
	}

	function vibrato(o, t, len, rate, depth) {
		const lfo = ctx.createOscillator();
		const g = ctx.createGain();
		lfo.frequency.value = rate;
		g.gain.value = depth;
		lfo.connect(g).connect(o.frequency);
		lfo.start(t);
		lfo.stop(t + len + 0.05);
	}

	// Water or open air: a few fading repeats.
	function echo(out, time, feedback) {
		const d = ctx.createDelay(2);
		const fb = ctx.createGain();
		d.delayTime.value = time;
		fb.gain.value = feedback;
		d.connect(fb).connect(d);
		d.connect(out);
		const input = ctx.createGain();
		input.connect(out);
		input.connect(d);
		return input;
	}

	function glide(param, points, t) {
		points.forEach(([at, v]) => param.exponentialRampToValueAtTime(v, t + at));
	}

	// A big cat's roar: a rising, rumbling bellow from the chest.
	function roar(out, t, len, from, peak, to) {
		const body = tremolo(t, len, 30, 0.45, grit(out, 6));
		const o = tone('sawtooth', from, t, len, body, 0.35, 0.18, len * 0.45);
		glide(o.frequency, [[len * 0.25, peak], [len, to]], t);
		const f = hiss(t, len, body, 'lowpass', 350, 1, 0.55, 0.15, len * 0.5);
		glide(f.frequency, [[len * 0.25, 1300], [len, 300]], t);
	}

	const calls = {
		// Lion: a full roar, then a run of grunts that trail off.
		lion(out, t) {
			roar(out, t, 1.6, 170, 260, 120);
			const f = filter('lowpass', 750, 1, grit(out, 4));
			[2.0, 2.55, 3.0, 3.38, 3.7].forEach((at, i) => {
				const o = tone('sawtooth', 150, t + at, 0.32, f, 0.35 - i * 0.05, 0.04, 0.18);
				o.frequency.exponentialRampToValueAtTime(95, t + at + 0.32);
			});
		},
		// Tiger: one long "aaungh", no grunts after.
		tiger(out, t) {
			roar(out, t, 1.5, 150, 230, 105);
		},
		// Leopard and jaguar: a hoarse rasp in and out, like a saw through wood.
		saw(out, t) {
			const body = grit(out, 5);
			for (let i = 0; i < 9; i++) {
				const at = i * 0.34;
				const outward = i % 2 === 0;
				hiss(t + at, outward ? 0.24 : 0.16, body, 'bandpass', outward ? 520 : 900, 1.4, outward ? 0.7 : 0.35, 0.03, 0.12);
				if (outward) tone('sawtooth', 130, t + at, 0.24, body, 0.08, 0.03, 0.12);
			}
		},
		// Cheetah: a bird-like chirp, not a roar.
		cheetah(out, t) {
			const f = filter('bandpass', 1500, 1.5, out);
			[0, 0.38, 0.76, 1.1].forEach((at) => {
				const o = tone('triangle', 1100, t + at, 0.14, f, 0.5, 0.01, 0.07);
				glide(o.frequency, [[0.05, 1850], [0.14, 1250]], t + at);
			});
		},
		// Puma: a raw, wavering scream.
		scream(out, t) {
			const f = filter('bandpass', 1500, 0.9, grit(out, 4));
			const body = tremolo(t, 1.7, 45, 0.35, f);
			const o = tone('sawtooth', 850, t, 1.6, body, 0.4, 0.12, 0.6);
			glide(o.frequency, [[0.4, 1300], [1.6, 650]], t);
			vibrato(o, t, 1.6, 6, 35);
		},
		// Spotted hyena: a climbing, nasal giggle.
		laugh(out, t) {
			const f = filter('bandpass', 1300, 1.5, grit(out, 3));
			let at = 0;
			for (let i = 0; i < 11; i++) {
				const pitch = 520 + i * 45 + (i % 2 ? 60 : 0);
				const len = 0.075 + (i % 3) * 0.012;
				const o = tone('sawtooth', pitch, t + at, len, f, 0.35, 0.008, 0.04);
				glide(o.frequency, [[len * 0.4, pitch * 1.35], [len, pitch * 0.85]], t + at);
				at += len + 0.035 + (i === 4 ? 0.12 : 0);
			}
		},
		// Bears: a low, rough growl.
		growl(out, t) {
			const body = tremolo(t, 1.7, 22, 0.6, grit(out, 4));
			const o = tone('sawtooth', 70, t, 1.6, body, 0.32, 0.1, 0.5);
			glide(o.frequency, [[0.6, 100], [1.6, 60]], t);
			hiss(t, 1.6, body, 'lowpass', 500, 1, 0.4, 0.1, 0.5);
		},
		// Platypus: a soft, low grumble, like a broody hen.
		platypus(out, t) {
			const body = tremolo(t, 1.0, 14, 0.6, grit(out, 2));
			const o = tone('triangle', 160, t, 0.9, body, 0.3, 0.1, 0.3);
			glide(o.frequency, [[0.4, 190], [0.9, 140]], t);
		},
		// Wombat: huffing hisses with a grunt behind them.
		wombat(out, t) {
			[0, 0.4, 0.75].forEach((at) => {
				hiss(t + at, 0.25, out, 'lowpass', 1100, 0.8, 0.45, 0.02, 0.12);
				tone('sawtooth', 90, t + at, 0.18, filter('lowpass', 400, 1, out), 0.25, 0.02, 0.1);
			});
		},
		// Hippo: a wheeze that breaks into a run of deep honks.
		hippo(out, t) {
			const w = hiss(t, 0.55, out, 'bandpass', 900, 1.5, 0.4, 0.2, 0.15);
			w.frequency.exponentialRampToValueAtTime(1600, t + 0.55);
			const f = filter('lowpass', 900, 1, grit(out, 5));
			let at = 0.6;
			for (let i = 0; i < 6; i++) {
				const o = tone('sawtooth', 230 - i * 10, t + at, 0.22, f, 0.4 - i * 0.03, 0.02, 0.1);
				o.frequency.exponentialRampToValueAtTime(160 - i * 8, t + at + 0.22);
				at += 0.34 - i * 0.025;
			}
		},
		// Rhino: snorts through the nose.
		snort(out, t) {
			[0, 0.55].forEach((at) => {
				hiss(t + at, 0.28, out, 'lowpass', 900, 1.2, 0.7, 0.01, 0.2);
				tone('sawtooth', 75, t + at, 0.15, filter('lowpass', 300, 1, out), 0.3, 0.01, 0.1);
			});
		},
		// Impala: a sharp alarm snort-bark.
		impala(out, t) {
			const f = filter('bandpass', 700, 1, grit(out, 3));
			[0, 0.5].forEach((at) => {
				hiss(t + at, 0.18, out, 'bandpass', 1400, 1, 0.6, 0.005, 0.1);
				const o = tone('sawtooth', 260, t + at, 0.18, f, 0.35, 0.005, 0.1);
				o.frequency.exponentialRampToValueAtTime(180, t + at + 0.18);
			});
		},
		// Buffalo and bison: a deep, cattle-like bellow.
		bellow(out, t) {
			const f = filter('lowpass', 650, 1, grit(out, 3));
			[[0, 1.0], [1.2, 0.6]].forEach(([at, len]) => {
				const o = tone('sawtooth', 105, t + at, len, f, 0.42, 0.08, 0.35);
				glide(o.frequency, [[len * 0.3, 125], [len, 85]], t + at);
			});
		},
		// Wildebeest: nasal "gnu" grunts, like a big frog.
		gnu(out, t) {
			const f = filter('bandpass', 850, 3, grit(out, 3));
			for (let i = 0; i < 5; i++) {
				const o = tone('sawtooth', 320, t + i * 0.32, 0.18, f, 0.45, 0.01, 0.08);
				o.frequency.exponentialRampToValueAtTime(240, t + i * 0.32 + 0.18);
			}
		},
		// Moose: a long, nasal moan that rises and falls.
		moan(out, t) {
			const f = filter('bandpass', 800, 1.2, out);
			const o = tone('sawtooth', 240, t, 1.8, f, 0.45, 0.25, 0.6);
			glide(o.frequency, [[0.7, 420], [1.8, 260]], t);
			vibrato(o, t, 1.8, 5, 8);
		},
		// Plains zebra: a barking "kwa-ha", in and out.
		kwaha(out, t) {
			const f = filter('bandpass', 1200, 1, grit(out, 4));
			for (let i = 0; i < 5; i++) {
				const at = i * 0.42;
				const a = tone('sawtooth', 900, t + at, 0.15, f, 0.35, 0.01, 0.06);
				a.frequency.exponentialRampToValueAtTime(1150, t + at + 0.15);
				const b = tone('sawtooth', 520, t + at + 0.18, 0.18, f, 0.4, 0.01, 0.08);
				b.frequency.exponentialRampToValueAtTime(360, t + at + 0.36);
			}
		},
		// Grevy's zebra and the African "jackass" penguin: a donkey's hee-haw.
		donkey(out, t) {
			const f = filter('bandpass', 1000, 1, grit(out, 3));
			for (let i = 0; i < 3; i++) {
				const at = i * 0.8;
				const hee = tone('square', 780, t + at, 0.32, f, 0.25, 0.03, 0.1);
				hee.frequency.exponentialRampToValueAtTime(880, t + at + 0.32);
				const haw = tone('sawtooth', 320, t + at + 0.36, 0.38, f, 0.4, 0.03, 0.15);
				haw.frequency.exponentialRampToValueAtTime(240, t + at + 0.74);
			}
		},
		// Elephant: a brassy trumpet blast.
		trumpet(out, t) {
			const f = filter('bandpass', 1400, 1.2, grit(out, 3));
			[0, 7].forEach((detune) => {
				const o = tone('sawtooth', 380, t, 1.1, f, 0.35, 0.06, 0.35);
				o.detune.value = detune;
				glide(o.frequency, [[0.25, 620], [0.8, 540], [1.1, 420]], t);
				vibrato(o, t, 1.1, 7, 18);
			});
		},
		// Capybara: a low purr, with clicks.
		purr(out, t) {
			const body = tremolo(t, 1.3, 26, 0.9, out);
			hiss(t, 1.2, body, 'lowpass', 450, 1, 0.8, 0.1, 0.3);
			[1.35, 1.5, 1.62].forEach((at) => hiss(t + at, 0.02, out, 'bandpass', 2200, 4, 0.9, 0.002, 0.012));
		},
		// Three-toed sloth: a long, high "ahh-eee" whistle.
		sloth(out, t) {
			const o = tone('sine', 2300, t, 1.2, out, 0.3, 0.15, 0.4);
			glide(o.frequency, [[0.7, 2900], [1.2, 2700]], t);
		},
		// Orangutan: a long call of rising bellows that ends in sighs.
		longcall(out, t) {
			const f = filter('lowpass', 900, 1, grit(out, 4));
			for (let i = 0; i < 6; i++) {
				const at = i * 0.42;
				const o = tone('sawtooth', 150 + i * 14, t + at, 0.32, f, 0.18 + i * 0.04, 0.05, 0.12);
				o.frequency.exponentialRampToValueAtTime(220 + i * 18, t + at + 0.32);
			}
			[2.6, 3.1].forEach((at) => {
				const o = tone('sawtooth', 210, t + at, 0.45, f, 0.25, 0.05, 0.25);
				o.frequency.exponentialRampToValueAtTime(120, t + at + 0.45);
			});
		},
		// Koala: a snoring inhale and a belching exhale, very deep.
		koala(out, t) {
			const f = filter('bandpass', 380, 1.5, grit(out, 6));
			for (let i = 0; i < 3; i++) {
				const at = i * 0.95;
				tone('square', 32, t + at, 0.5, f, 0.5, 0.05, 0.1);
				tone('square', 44, t + at + 0.55, 0.32, f, 0.6, 0.03, 0.1);
			}
		},
		// Dolphins: rising and falling whistles, then a buzz of clicks.
		whistle(out, t) {
			const wet = echo(out, 0.18, 0.3);
			[0, 0.34, 0.66].forEach((at, i) => {
				const o = tone('sine', 5000 + i * 400, t + at, 0.28, wet, 0.15, 0.02, 0.08);
				glide(o.frequency, [[0.12, 9500 - i * 600], [0.28, 6000]], t + at);
			});
			calls.clicks(out, t + 1.05, 12, 0.06, 0);
		},
		// Orca: pulsed calls with a metallic, screaming edge.
		orca(out, t) {
			const wet = echo(out, 0.25, 0.35);
			const f = filter('bandpass', 1600, 1.2, wet);
			[0, 0.85].forEach((at) => {
				const body = tremolo(t + at, 0.7, 140, 0.8, f);
				const o = tone('sawtooth', 1100, t + at, 0.7, body, 0.35, 0.03, 0.2);
				glide(o.frequency, [[0.22, 2000], [0.7, 1050]], t + at);
			});
		},
		// Beluga, the "sea canary": chirps, squeaks and a squeal.
		beluga(out, t) {
			const wet = echo(out, 0.15, 0.3);
			const sweeps = [[1500, 3200], [3000, 2000], [2200, 4200], [4000, 2600], [1800, 2800], [3500, 5000]];
			sweeps.forEach(([a, b], i) => {
				const o = tone('sine', a, t + i * 0.17, 0.11, wet, 0.18, 0.01, 0.04);
				o.frequency.exponentialRampToValueAtTime(b, t + i * 0.17 + 0.11);
			});
			const s = tone('triangle', 2500, t + 1.15, 0.6, wet, 0.15, 0.05, 0.2);
			glide(s.frequency, [[0.3, 3800], [0.6, 3000]], t + 1.15);
		},
		// Sperm whale: a coda of loud clicks, "click, click, click-click-click".
		clicks(out, t, n, gap, thud = 0.4) {
			const times = n ? Array.from({ length: n }, (_, i) => i * gap) : [0, 0.32, 0.64, 0.78, 0.92, 1.6, 1.92, 2.24, 2.38, 2.52];
			times.forEach((at) => {
				hiss(t + at, 0.012, out, 'bandpass', 3500, 1.5, 1, 0.001, 0.008);
				if (thud) tone('sine', 320, t + at, 0.03, out, thud, 0.001, 0.02);
			});
		},
		// Humpback: long moans and whoops of its song.
		song(out, t) {
			const wet = echo(out, 0.42, 0.45);
			const o = tone('sine', 180, t, 2.2, wet, 0.4, 0.5, 0.8);
			glide(o.frequency, [[0.8, 440], [1.4, 260], [2.2, 150]], t);
			const h = tone('sine', 360, t, 2.2, wet, 0.08, 0.6, 0.8);
			glide(h.frequency, [[0.8, 880], [2.2, 300]], t);
			const w = tone('sine', 300, t + 2.4, 0.7, wet, 0.3, 0.1, 0.3);
			w.frequency.exponentialRampToValueAtTime(900, t + 3.1);
		},
		// Blue whale: a moan far below hearing, pitched up so it can be heard.
		lowmoan(out, t) {
			const wet = echo(out, 0.6, 0.35);
			[[75, 0.45], [150, 0.2], [225, 0.1]].forEach(([freq, peak]) => {
				const o = tone('sine', freq, t, 3.0, wet, peak, 0.6, 1.0);
				o.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 3.0);
			});
		},
		// Fin whale: steady, deep downsweep pulses, pitched up like the blue whale.
		pulse(out, t) {
			const wet = echo(out, 0.5, 0.3);
			for (let i = 0; i < 4; i++) {
				const o = tone('sine', 115, t + i * 0.75, 0.55, wet, 0.5, 0.05, 0.25);
				o.frequency.exponentialRampToValueAtTime(65, t + i * 0.75 + 0.55);
				tone('sine', 230, t + i * 0.75, 0.55, wet, 0.12, 0.05, 0.25).frequency.exponentialRampToValueAtTime(130, t + i * 0.75 + 0.55);
			}
		},
		// Minke whale: the "boing", a fast buzz of pulses with a metallic ring.
		boing(out, t) {
			const wet = echo(out, 0.3, 0.3);
			const body = tremolo(t, 2.4, 115, 0.9, wet);
			const o = tone('sine', 1400, t, 2.3, body, 0.6, 0.1, 0.9);
			vibrato(o, t, 2.3, 3, 60);
			tone('sine', 120, t, 0.25, wet, 0.12, 0.01, 0.15);
		},
		// Gray whale: low grunts and knocks.
		knock(out, t) {
			const wet = echo(out, 0.3, 0.18);
			[0, 0.25, 0.5, 0.75, 1.05, 1.3].forEach((at) => {
				const o = tone('sine', 140, t + at, 0.14, wet, 0.55, 0.005, 0.1);
				o.frequency.exponentialRampToValueAtTime(80, t + at + 0.14);
				hiss(t + at, 0.03, wet, 'lowpass', 900, 1, 0.5, 0.002, 0.02);
			});
		},
		// Harbour seal: a male's low, gurgling roar under water.
		sealgrowl(out, t) {
			const wet = echo(out, 0.3, 0.35);
			const body = tremolo(t, 1.5, 14, 0.7, grit(wet, 3));
			hiss(t, 1.4, body, 'lowpass', 320, 1, 0.8, 0.2, 0.5);
			const o = tone('sawtooth', 65, t, 1.4, body, 0.3, 0.2, 0.5);
			o.frequency.exponentialRampToValueAtTime(48, t + 1.4);
		},
		// Leopard seal: an eerie trill that slides down.
		trill(out, t) {
			const wet = echo(out, 0.3, 0.3);
			const body = tremolo(t, 1.9, 18, 0.8, wet);
			const o = tone('sine', 1300, t, 1.8, body, 0.35, 0.1, 0.5);
			o.frequency.exponentialRampToValueAtTime(320, t + 1.8);
		},
		// Walrus: a run of knocks, then a ringing, bell-like note.
		walrus(out, t) {
			for (let i = 0; i < 8; i++) hiss(t + i * 0.11, 0.02, out, 'bandpass', 1300, 3, 1, 0.001, 0.015);
			const wet = echo(out, 0.3, 0.3);
			[[480, 0.35], [1250, 0.15], [2100, 0.06]].forEach(([freq, peak]) => {
				tone('sine', freq, t + 1.05, 1.4, wet, peak, 0.005, 1.3);
			});
		},
		// Sharks make no sound: just bubbles in the water around them.
		bubbles(out, t) {
			const wet = echo(out, 0.2, 0.25);
			[0, 0.12, 0.2, 0.41, 0.5, 0.58, 0.8, 0.95, 1.02, 1.3, 1.42, 1.6].forEach((at, i) => {
				const base = 380 + ((i * 137) % 500);
				const o = tone('sine', base, t + at, 0.05, wet, 0.25, 0.004, 0.03);
				o.frequency.exponentialRampToValueAtTime(base * 2.6, t + at + 0.05);
			});
		},
		// Sea turtles are near silent: a breath taken at the surface.
		breath(out, t) {
			const a = hiss(t, 0.5, out, 'lowpass', 900, 0.7, 0.35, 0.05, 0.2);
			a.frequency.exponentialRampToValueAtTime(1800, t + 0.5);
			const b = hiss(t + 0.65, 1.1, out, 'lowpass', 1500, 0.7, 0.35, 0.1, 0.5);
			b.frequency.exponentialRampToValueAtTime(600, t + 1.75);
		},
		// Crocodiles: a long, threatening hiss.
		hiss(out, t) {
			hiss(t, 1.1, out, 'highpass', 2500, 0.7, 0.4, 0.08, 0.4);
			hiss(t, 1.1, out, 'bandpass', 900, 1, 0.15, 0.08, 0.4);
		},
		// Alligator: a bellow so deep the water trembles.
		gator(out, t) {
			const f = filter('lowpass', 380, 1, grit(out, 7));
			const body = tremolo(t, 2.1, 9, 0.5, f);
			tone('sawtooth', 42, t, 2.0, body, 0.6, 0.2, 0.6);
			tone('sawtooth', 84, t, 2.0, body, 0.2, 0.2, 0.6);
		},
		// Bald eagle: a weak, high piping, "kleek kik-ik-ik-ik".
		piping(out, t) {
			const f = filter('bandpass', 2800, 2, out);
			const first = tone('sine', 2500, t, 0.18, f, 0.35, 0.01, 0.06);
			first.frequency.exponentialRampToValueAtTime(3200, t + 0.12);
			for (let i = 0; i < 6; i++) {
				const at = 0.3 + i * 0.1;
				const o = tone('sine', 3000 - i * 110, t + at, 0.06, f, 0.3, 0.005, 0.03);
				o.frequency.exponentialRampToValueAtTime(2600 - i * 110, t + at + 0.06);
			}
		},
		// Puffin: a low, purring "arr-arr", like an idling chainsaw.
		puffin(out, t) {
			const f = filter('lowpass', 1000, 1, grit(out, 3));
			[[0, 0.75], [0.95, 0.5]].forEach(([at, len]) => {
				const body = tremolo(t + at, len, 32, 0.8, f);
				const o = tone('sawtooth', 210, t + at, len, body, 0.4, 0.05, 0.2);
				o.frequency.exponentialRampToValueAtTime(180, t + at + len);
			});
		},
		// Shoebill: a machine-gun clatter of its bill.
		clatter(out, t) {
			const f = filter('bandpass', 1500, 4, out);
			let at = 0;
			for (let i = 0; i < 28; i++) {
				hiss(t + at, 0.012, f, 'bandpass', 1500, 2, 1, 0.001, 0.008);
				tone('triangle', 750, t + at, 0.02, out, 0.2, 0.001, 0.015);
				at += 0.045 + i * 0.0015;
			}
		},
		// Flamingo: goose-like honks and chatter.
		honk(out, t) {
			const f = filter('lowpass', 1600, 1, grit(out, 2));
			[0, 0.24, 0.48, 0.85].forEach((at, i) => {
				const last = i === 3;
				const o = tone('square', last ? 360 : 440, t + at, last ? 0.38 : 0.16, f, 0.25, 0.01, 0.06);
				o.frequency.linearRampToValueAtTime(last ? 280 : 400, t + at + 0.16);
			});
		},
		// Scarlet macaw: a harsh, loud squawk.
		squawk(out, t) {
			const f = filter('bandpass', 2000, 1, grit(out, 8));
			[0, 0.6].forEach((at) => {
				const body = tremolo(t + at, 0.45, 70, 0.4, f);
				const o = tone('sawtooth', 1200, t + at, 0.45, body, 0.4, 0.02, 0.15);
				glide(o.frequency, [[0.15, 1650], [0.45, 1000]], t + at);
			});
		},
		// King penguin: a two-voiced trumpeting warble.
		warble(out, t) {
			const f = filter('bandpass', 900, 1, out);
			[0, 0.55, 1.1].forEach((at, i) => {
				const len = i === 2 ? 0.8 : 0.45;
				[620, 668].forEach((freq) => {
					const o = tone('sawtooth', freq, t + at, len, f, 0.18, 0.04, 0.15);
					vibrato(o, t + at, len, 24, 45);
				});
			});
		},
		// Snowy owl: deep, booming hoots.
		hoot(out, t) {
			const wet = echo(out, 0.25, 0.15);
			[[0, 0.38], [0.52, 0.38], [1.04, 0.38], [1.56, 0.5]].forEach(([at, len]) => {
				const o = tone('sine', 360, t + at, len, wet, 0.45, 0.07, 0.15);
				o.frequency.linearRampToValueAtTime(330, t + at + len);
			});
		},
		// Small birds: quick, bright chirps.
		chirp(out, t) {
			[0, 0.13, 0.26, 0.5, 0.62].forEach((at) => {
				const o = tone('sine', 2600, t + at, 0.09, out, 0.25, 0.005, 0.04);
				glide(o.frequency, [[0.04, 4600], [0.09, 3000]], t + at);
			});
		},
		// Anything else: a rustle in the leaves.
		rustle(out, t) {
			[0, 0.18, 0.4].forEach((at) => hiss(t + at, 0.14, out, 'bandpass', 2000, 0.8, 0.3, 0.02, 0.08));
		},
	};

	return calls;
};
