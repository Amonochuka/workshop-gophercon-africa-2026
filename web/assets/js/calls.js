// Plays each tile's animal call, built by callsynth.js. Sound is off until
// the header button or a click on a tile turns it on, since browsers only
// allow audio after a click. Once on, resting on a tile plays its call.

(function () {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	const toggle = document.querySelector('.sound-toggle');
	if (!Ctx || !toggle || !window.NightSynth) return;

	const KEY = 'night-safari-sound';
	let ctx = null;
	let master = null;
	let calls = null;
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
		calls = window.NightSynth(ctx);
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

	function play(name) {
		if (!on) return;
		audio();
		if (!calls[name]) return;
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

	// Restart a one-shot animation class, then take it off when it's done.
	function flash(card, name, ms) {
		card.classList.remove(name);
		void card.offsetWidth;
		card.classList.add(name);
		clearTimeout(card['_' + name]);
		card['_' + name] = setTimeout(() => card.classList.remove(name), ms);
	}

	// The animal comes at you, calling if sound is on.
	function sing(card) {
		flash(card, 'is-lunging', 1800);
		if (!on) return;
		play(card.dataset.call);
		flash(card, 'is-calling', 1600);
	}

	function call(card) {
		if (!card || card === last) return;
		last = card;
		clearTimeout(timer);
		// Sound off: point at the button too.
		toggle.classList.toggle('is-nudging', !on);
		timer = setTimeout(() => sing(card), 250);
	}

	// The photo tilts towards the pointer, and the animal shifts the other way.
	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function tilt(card, e) {
		const photo = card.querySelector('.card__photo');
		if (!photo || still) return;
		const box = photo.getBoundingClientRect();
		const x = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
		const y = Math.min(Math.max((e.clientY - box.top) / box.height, 0), 1);
		photo.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
		photo.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
		photo.style.setProperty('--px', ((0.5 - x) * 5).toFixed(2) + '%');
		photo.style.setProperty('--py', ((0.5 - y) * 4).toFixed(2) + '%');
		photo.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
		photo.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
	}

	function untilt(card) {
		const photo = card.querySelector('.card__photo');
		if (!photo) return;
		['--rx', '--ry', '--px', '--py', '--gx', '--gy'].forEach((p) => photo.style.removeProperty(p));
	}

	function leave(card) {
		if (card !== last) return;
		clearTimeout(timer);
		last = null;
		toggle.classList.remove('is-nudging');
	}

	document.querySelectorAll('.card[data-call]').forEach(function (card) {
		let frame = 0;
		card.addEventListener('pointerenter', () => call(card));
		card.addEventListener('pointermove', function (e) {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => tilt(card, e));
		});
		card.addEventListener('pointerleave', function () {
			cancelAnimationFrame(frame);
			untilt(card);
			leave(card);
		});
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
