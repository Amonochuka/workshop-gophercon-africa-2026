// Animal calls, synthesised with the Web Audio API: no recordings, nothing to
// download. Sound is off until the header button turns it on, since browsers
// only allow audio after a click. Once on, resting on a tile plays its call.

(function () {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	const toggle = document.querySelector('.sound-toggle');
	if (!Ctx || !toggle) return;

	const KEY = 'night-safari-sound';
	let ctx = null;
	let master = null;
	let noise = null;
	let current = null;
	let on = false;

	// Built on the first click, which is when browsers allow it.
	function audio() {
		if (ctx) return ctx;
		ctx = new Ctx();
		const comp = ctx.createDynamicsCompressor();
		master = ctx.createGain();
		master.gain.value = 0.55;
		master.connect(comp).connect(ctx.destination);

		noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
		const data = noise.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		return ctx;
	}

	// One call at a time: a new one fades the last out.
	function voice() {
		if (current) {
			const old = current;
			old.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
			setTimeout(() => old.disconnect(), 400);
		}
		current = ctx.createGain();
		current.connect(master);
		return current;
	}

	// An attack, a hold and a release on a gain, from t for len seconds.
	function envelope(param, t, len, peak, attack, release) {
		param.setValueAtTime(0.0001, t);
		param.exponentialRampToValueAtTime(peak, t + attack);
		param.setValueAtTime(peak, t + Math.max(attack, len - release));
		param.exponentialRampToValueAtTime(0.0001, t + len);
	}

	function osc(type, freq, t, len, out, peak = 0.3, attack = 0.02, release = 0.1) {
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = type;
		o.frequency.setValueAtTime(freq, t);
		envelope(g.gain, t, len, peak, attack, release);
		o.connect(g).connect(out);
		o.start(t);
		o.stop(t + len + 0.05);
		return o;
	}

	function hiss(t, len, out, filter, freq, q, peak = 0.4, attack = 0.02, release = 0.2) {
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const f = ctx.createBiquadFilter();
		f.type = filter;
		f.frequency.setValueAtTime(freq, t);
		f.Q.value = q;
		const g = ctx.createGain();
		envelope(g.gain, t, len, peak, attack, release);
		src.connect(f).connect(g).connect(out);
		src.start(t);
		src.stop(t + len + 0.05);
		return f;
	}

	// Grit for the big, rough calls.
	function grit(out, amount) {
		const shaper = ctx.createWaveShaper();
		const curve = new Float32Array(256);
		for (let i = 0; i < 256; i++) {
			const x = (i / 128) - 1;
			curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
		}
		shaper.curve = curve;
		shaper.connect(out);
		return shaper;
	}

	// A fast wobble on a gain, for the rumble in a roar or growl.
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

	const calls = {
		roar(out, t) {
			const body = tremolo(t, 1.8, 28, 0.5, grit(out, 6));
			const o = osc('sawtooth', 110, t, 1.7, body, 0.35, 0.18, 0.7);
			o.frequency.linearRampToValueAtTime(160, t + 0.4);
			o.frequency.linearRampToValueAtTime(75, t + 1.7);
			const f = hiss(t, 1.7, body, 'lowpass', 300, 1, 0.6, 0.15, 0.8);
			f.frequency.linearRampToValueAtTime(1100, t + 0.35);
			f.frequency.linearRampToValueAtTime(250, t + 1.7);
		},
		growl(out, t) {
			const body = tremolo(t, 1.2, 22, 0.6, grit(out, 4));
			const o = osc('sawtooth', 70, t, 1.1, body, 0.3, 0.1, 0.4);
			o.frequency.linearRampToValueAtTime(95, t + 0.5);
			o.frequency.linearRampToValueAtTime(60, t + 1.1);
			hiss(t, 1.1, body, 'lowpass', 500, 1, 0.4, 0.1, 0.4);
		},
		// The spotted hyena's giggle: quick, nasal "hee-hee"s that climb and wobble.
		laugh(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'bandpass';
			f.frequency.value = 1300;
			f.Q.value = 1.5;
			f.connect(grit(out, 3));
			let at = 0;
			for (let i = 0; i < 11; i++) {
				const pitch = 520 + i * 45 + (i % 2 ? 60 : 0);
				const len = 0.075 + Math.random() * 0.03;
				const o = osc('sawtooth', pitch, t + at, len, f, 0.35, 0.008, 0.04);
				o.frequency.exponentialRampToValueAtTime(pitch * 1.35, t + at + len * 0.4);
				o.frequency.exponentialRampToValueAtTime(pitch * 0.85, t + at + len);
				at += len + 0.035 + (i === 4 ? 0.12 : 0);
			}
		},
		trumpet(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'bandpass';
			f.frequency.value = 1400;
			f.Q.value = 1.2;
			f.connect(grit(out, 3));
			[0, 7].forEach((detune) => {
				const o = osc('sawtooth', 380, t, 1.1, f, 0.35, 0.06, 0.35);
				o.detune.value = detune;
				o.frequency.linearRampToValueAtTime(620, t + 0.25);
				o.frequency.linearRampToValueAtTime(540, t + 0.8);
				o.frequency.linearRampToValueAtTime(420, t + 1.1);
				const vib = ctx.createOscillator();
				const vg = ctx.createGain();
				vib.frequency.value = 7;
				vg.gain.value = 18;
				vib.connect(vg).connect(o.frequency);
				vib.start(t);
				vib.stop(t + 1.2);
			});
		},
		bellow(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'lowpass';
			f.frequency.value = 600;
			f.connect(grit(out, 2));
			[0, 0.45].forEach((at) => {
				const o = osc('sawtooth', 95, t + at, 0.38, f, 0.4, 0.05, 0.2);
				o.frequency.linearRampToValueAtTime(70, t + at + 0.38);
			});
		},
		whinny(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'bandpass';
			f.frequency.value = 1100;
			f.connect(out);
			const o = osc('sawtooth', 950, t, 1.0, f, 0.35, 0.03, 0.3);
			o.frequency.exponentialRampToValueAtTime(480, t + 1.0);
			const vib = ctx.createOscillator();
			const vg = ctx.createGain();
			vib.frequency.value = 14;
			vg.gain.value = 70;
			vib.connect(vg).connect(o.frequency);
			vib.start(t);
			vib.stop(t + 1.05);
		},
		whalesong(out, t) {
			const wet = echo(out, 0.42, 0.45);
			const o = osc('sine', 180, t, 2.6, wet, 0.4, 0.5, 0.9);
			o.frequency.exponentialRampToValueAtTime(440, t + 0.9);
			o.frequency.exponentialRampToValueAtTime(260, t + 1.6);
			o.frequency.exponentialRampToValueAtTime(140, t + 2.6);
			const h = osc('sine', 360, t, 2.6, wet, 0.08, 0.6, 0.9);
			h.frequency.exponentialRampToValueAtTime(880, t + 0.9);
			h.frequency.exponentialRampToValueAtTime(280, t + 2.6);
		},
		whistle(out, t) {
			const wet = echo(out, 0.18, 0.3);
			[0, 0.32, 0.6].forEach((at, i) => {
				const o = osc('sine', 3200 + i * 300, t + at, 0.25, wet, 0.15, 0.02, 0.08);
				o.frequency.exponentialRampToValueAtTime(6200 - i * 400, t + at + 0.12);
				o.frequency.exponentialRampToValueAtTime(4000, t + at + 0.25);
			});
			calls.clicks(out, t + 0.9, 10);
		},
		clicks(out, t, n = 16) {
			for (let i = 0; i < n; i++) {
				hiss(t + i * (0.09 - i * 0.003), 0.012, out, 'bandpass', 3500, 3, 0.9, 0.001, 0.008);
			}
		},
		bark(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'bandpass';
			f.frequency.value = 700;
			f.Q.value = 2;
			f.connect(grit(out, 4));
			[0, 0.3, 0.55].forEach((at) => {
				const o = osc('square', 320, t + at, 0.16, f, 0.4, 0.01, 0.08);
				o.frequency.exponentialRampToValueAtTime(220, t + at + 0.16);
			});
		},
		chatter(out, t) {
			[0, 0.22, 0.4, 0.55, 0.68, 0.8].forEach((at, i) => {
				const o = osc('triangle', 300 + i * 40, t + at, 0.14, out, 0.35, 0.02, 0.06);
				o.frequency.exponentialRampToValueAtTime(700 + i * 80, t + at + 0.12);
			});
		},
		hoot(out, t) {
			const wet = echo(out, 0.3, 0.25);
			[[0, 0.35], [0.5, 0.18], [0.75, 0.6]].forEach(([at, len]) => {
				const o = osc('sine', 420, t + at, len, wet, 0.4, 0.06, 0.12);
				o.frequency.linearRampToValueAtTime(380, t + at + len);
			});
		},
		screech(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'bandpass';
			f.frequency.value = 2400;
			f.Q.value = 3;
			f.connect(out);
			const body = tremolo(t, 0.9, 40, 0.5, f);
			const o = osc('sawtooth', 2600, t, 0.9, body, 0.45, 0.02, 0.3);
			o.frequency.exponentialRampToValueAtTime(1700, t + 0.9);
		},
		honk(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'lowpass';
			f.frequency.value = 1500;
			f.connect(out);
			[0, 0.25, 0.5, 0.9].forEach((at, i) => {
				const o = osc('square', i === 3 ? 340 : 420, t + at, i === 3 ? 0.4 : 0.16, f, 0.25, 0.01, 0.06);
				o.frequency.linearRampToValueAtTime(i === 3 ? 260 : 380, t + at + 0.16);
			});
		},
		chirp(out, t) {
			[0, 0.13, 0.26, 0.5, 0.62].forEach((at) => {
				const o = osc('sine', 2600, t + at, 0.09, out, 0.25, 0.005, 0.04);
				o.frequency.exponentialRampToValueAtTime(4600, t + at + 0.04);
				o.frequency.exponentialRampToValueAtTime(3000, t + at + 0.09);
			});
		},
		jaws(out, t) {
			const f = ctx.createBiquadFilter();
			f.type = 'lowpass';
			f.frequency.value = 400;
			f.connect(out);
			let at = 0;
			for (let i = 0; i < 8; i++) {
				const gap = Math.max(0.55 - i * 0.07, 0.14);
				osc('sawtooth', i % 2 ? 87.3 : 82.4, t + at, gap * 0.8, f, 0.45, 0.01, 0.06);
				at += gap;
			}
		},
		hiss(out, t) {
			hiss(t, 1.0, out, 'highpass', 3500, 0.7, 0.35, 0.08, 0.4);
		},
		rustle(out, t) {
			[0, 0.18, 0.4].forEach((at) => hiss(t + at, 0.14, out, 'bandpass', 2000, 0.8, 0.3, 0.02, 0.08));
		},
	};

	function play(name) {
		if (!on || !calls[name]) return;
		audio();
		if (ctx.state === 'suspended') ctx.resume();
		calls[name](voice(), ctx.currentTime + 0.02);
	}

	function set(value) {
		on = value;
		toggle.setAttribute('aria-pressed', String(on));
		toggle.querySelector('.sound-toggle__label').textContent = on ? 'Sound on' : 'Sound off';
		document.documentElement.classList.toggle('has-sound', on);
		try {
			localStorage.setItem(KEY, on ? 'on' : 'off');
		} catch (err) {
			// Private mode: it just won't be remembered.
		}
	}

	toggle.hidden = false;
	toggle.addEventListener('click', function () {
		audio();
		ctx.resume();
		set(!on);
		if (on) play('chirp');
	});

	// Remembered as on, but still silent until the first click, as browsers require.
	try {
		if (localStorage.getItem(KEY) === 'on') {
			document.addEventListener('pointerdown', function first(e) {
				if (toggle.contains(e.target)) return;
				document.removeEventListener('pointerdown', first);
				if (on) return;
				audio();
				ctx.resume();
				set(true);
			});
		}
	} catch (err) {
		// No storage: start silent.
	}

	// Rest on a tile for a moment to hear it, so sweeping the mouse past is quiet.
	let timer = null;
	let last = null;

	function sing(card) {
		play(card.dataset.call);
		card.classList.remove('is-calling');
		void card.offsetWidth;
		card.classList.add('is-calling');
		setTimeout(() => card.classList.remove('is-calling'), 1600);
	}

	function call(card) {
		if (!card || card === last) return;
		last = card;
		clearTimeout(timer);
		// Sound off: point at the button instead.
		toggle.classList.toggle('is-nudging', !on);
		if (!on) return;
		timer = setTimeout(() => sing(card), 250);
	}

	function leave(card) {
		if (card !== last) return;
		clearTimeout(timer);
		last = null;
		toggle.classList.remove('is-nudging');
	}

	document.querySelectorAll('.card[data-call]').forEach(function (card) {
		card.addEventListener('pointerenter', () => call(card));
		card.addEventListener('pointerleave', () => leave(card));
		card.addEventListener('focusin', () => call(card));
		card.addEventListener('focusout', () => leave(card));
		// A click on the tile (not its photo) is a gesture, so it can switch sound on there and then.
		card.addEventListener('click', function (e) {
			if (e.target.closest('a')) return;
			audio();
			ctx.resume();
			if (!on) set(true);
			toggle.classList.remove('is-nudging');
			clearTimeout(timer);
			sing(card);
		});
	});
})();
