// Lists every call with a play button, then renders each one offline and
// measures it: how long it sounds, its loudest pitch and its peak level,
// checked against the real call's range. ?report writes the results as JSON.

(function () {
	// name: [animals, the real call, [low Hz, high Hz] of its loudest band, [min s, max s]]
	const CALLS = {
		lion: ['Lion', 'A deep roar, then a run of grunts that fade.', [100, 1500], [3, 5]],
		tiger: ['Tiger', 'One long "aaungh" roar.', [100, 1500], [1, 2.5]],
		saw: ['Leopard, jaguar', 'A hoarse rasp in and out, like sawing wood.', [100, 1500], [2, 4]],
		cheetah: ['Cheetah', 'A bird-like chirp. Cheetahs can\'t roar.', [1000, 2500], [0.8, 2]],
		scream: ['Puma', 'A raw, wavering scream.', [500, 2500], [1, 2.5]],
		laugh: ['Spotted hyena', 'The "giggle": quick, nasal, climbing.', [400, 1600], [0.8, 2]],
		growl: ['Brown bear, polar bear', 'A low, rough growl.', [50, 800], [1, 2]],
		platypus: ['Platypus', 'A soft, low grumble, like a broody hen.', [100, 600], [0.5, 1.5]],
		wombat: ['Common wombat', 'Huffing hisses and grunts.', [60, 1500], [0.5, 1.5]],
		hippo: ['Hippo', 'A wheeze, then a run of deep honks.', [100, 1600], [1.5, 3.5]],
		snort: ['White rhinoceros', 'Snorts through the nose.', [50, 1500], [0.5, 1.2]],
		impala: ['Impala', 'A sharp alarm snort-bark.', [150, 1600], [0.4, 1]],
		bellow: ['African buffalo, American bison', 'A deep, cattle-like bellow.', [70, 700], [1.5, 2.5]],
		gnu: ['Blue and black wildebeest', 'Nasal "gnu" grunts, like a big frog.', [200, 1000], [1, 2]],
		moan: ['Moose', 'A long, nasal moan.', [200, 900], [1.2, 2.5]],
		kwaha: ['Plains zebra', 'A barking "kwa-ha", not a horse\'s neigh.', [300, 1500], [1.5, 2.5]],
		donkey: ['Grevy\'s zebra, African penguin', 'A donkey-like "hee-haw" bray.', [200, 1200], [2, 3]],
		trumpet: ['Elephant', 'A brassy trumpet.', [350, 1500], [0.8, 1.5]],
		purr: ['Capybara', 'A low purr with clicks.', [20, 700], [1, 2]],
		sloth: ['Three-toed sloth', 'A long, high "ahh-eee" whistle.', [2000, 3200], [0.7, 1.3]],
		longcall: ['Bornean orangutan', 'The male\'s long call: rising bellows, then sighs.', [120, 900], [2.5, 4]],
		koala: ['Koala', 'A snoring inhale and belching exhale, very deep.', [30, 700], [2, 3.5]],
		whistle: ['Bottlenose, common, spinner, Risso\'s dolphin', 'Whistles, then a buzz of clicks.', [3000, 12000], [1, 2.5]],
		orca: ['Orca', 'Pulsed calls with a metallic, screaming edge.', [800, 2600], [1.5, 2.6]],
		beluga: ['Beluga', 'The "sea canary": chirps, squeaks, squeals.', [1500, 5500], [1.2, 2.5]],
		clicks: ['Sperm whale', 'A coda of loud clicks.', [200, 6000], [2, 3]],
		song: ['Humpback whale', 'Moans and whoops of its song.', [150, 900], [2.5, 4.5]],
		lowmoan: ['Blue whale', 'A moan below hearing (10–40 Hz), pitched up here.', [55, 250], [2.5, 4.5]],
		pulse: ['Fin whale', 'Steady 20 Hz downsweep pulses, pitched up here.', [55, 250], [3, 4.5]],
		boing: ['Minke whale', 'The "boing": a buzzing pulse train near 1.4 kHz.', [1000, 1800], [1.8, 3]],
		knock: ['Gray whale', 'Low grunts and knocks.', [60, 1000], [1.2, 2.5]],
		sealgrowl: ['Harbour seal', 'A male\'s low, gurgling roar under water.', [30, 400], [1, 2.5]],
		trill: ['Leopard seal', 'An eerie, descending trill.', [300, 1400], [1.8, 3]],
		walrus: ['Walrus', 'Knocks, then a ringing, bell-like note.', [400, 2500], [2, 3]],
		bubbles: ['Great white shark, whale shark', 'Sharks are silent: bubbles in the water.', [300, 3200], [1.4, 2.5]],
		breath: ['Green turtle', 'Near silent: a breath at the surface.', [100, 2000], [1.2, 2]],
		hiss: ['Nile and American crocodile, gharial, two-toed sloth', 'A long, threatening hiss.', [700, 10000], [0.8, 1.5]],
		gator: ['American alligator', 'A bellow so deep the water shakes.', [30, 400], [1.4, 2.2]],
		piping: ['Bald eagle', 'Weak, high piping. The film "screech" is a red-tailed hawk.', [2200, 3300], [0.7, 1.2]],
		puffin: ['Atlantic puffin', 'A low, purring "arr-arr".', [150, 1000], [1, 1.8]],
		clatter: ['Shoebill', 'A machine-gun clatter of its bill.', [500, 2500], [1.2, 2.2]],
		honk: ['Greater flamingo', 'Goose-like honks.', [250, 1600], [1, 1.5]],
		squawk: ['Scarlet macaw', 'A harsh, loud squawk.', [900, 2600], [0.8, 1.4]],
		warble: ['King penguin', 'A two-voiced trumpeting warble.', [550, 1000], [1.6, 2.2]],
		hoot: ['Snowy owl', 'Deep, booming hoots.', [300, 420], [2, 2.8]],
		chirp: ['Small birds', 'Quick, bright chirps.', [2500, 5000], [0.5, 1]],
		rustle: ['Anything else', 'A rustle in the leaves.', [1000, 4000], [0.4, 0.8]],
	};

	const RATE = 44100;
	const LENGTH = 6;

	function fft(re, im) {
		const n = re.length;
		for (let i = 1, j = 0; i < n; i++) {
			let bit = n >> 1;
			for (; j & bit; bit >>= 1) j ^= bit;
			j ^= bit;
			if (i < j) {
				[re[i], re[j]] = [re[j], re[i]];
				[im[i], im[j]] = [im[j], im[i]];
			}
		}
		for (let len = 2; len <= n; len <<= 1) {
			const ang = (-2 * Math.PI) / len;
			for (let i = 0; i < n; i += len) {
				for (let k = 0; k < len / 2; k++) {
					const wr = Math.cos(ang * k);
					const wi = Math.sin(ang * k);
					const ar = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
					const ai = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
					re[i + k + len / 2] = re[i + k] - ar;
					im[i + k + len / 2] = im[i + k] - ai;
					re[i + k] += ar;
					im[i + k] += ai;
				}
			}
		}
	}

	// How long it sounds, its loudest band, its peak and whether it clips.
	function measure(samples) {
		let peak = 0;
		for (const s of samples) peak = Math.max(peak, Math.abs(s));
		const frame = 2048;
		const loud = [];
		for (let i = 0; i + frame <= samples.length; i += frame) {
			let sum = 0;
			for (let j = i; j < i + frame; j++) sum += samples[j] * samples[j];
			loud.push(Math.sqrt(sum / frame));
		}
		const top = Math.max(...loud);
		const on = loud.map((r) => r > top * 0.03);
		const first = on.indexOf(true);
		const last = on.lastIndexOf(true);
		const duration = first < 0 ? 0 : ((last - first + 1) * frame) / RATE;

		// The spectrum summed over the sounding frames, then its strongest bin.
		const size = 4096;
		const spectrum = new Float64Array(size / 2);
		for (let i = Math.max(first, 0) * frame; i + size <= (last + 1) * frame && i + size <= samples.length; i += size / 2) {
			const re = new Float64Array(size);
			const im = new Float64Array(size);
			for (let j = 0; j < size; j++) re[j] = samples[i + j] * (0.5 - 0.5 * Math.cos((2 * Math.PI * j) / size));
			fft(re, im);
			for (let k = 1; k < size / 2; k++) spectrum[k] += Math.hypot(re[k], im[k]);
		}
		let best = 1;
		for (let k = 1; k < size / 2; k++) if (spectrum[k] > spectrum[best]) best = k;

		return { duration, pitch: Math.round((best * RATE) / size), peak, clips: peak >= 0.999 };
	}

	async function render(name) {
		const ctx = new OfflineAudioContext(1, RATE * LENGTH, RATE);
		const master = ctx.createGain();
		master.gain.value = 0.55;
		const comp = ctx.createDynamicsCompressor();
		master.connect(comp).connect(ctx.destination);
		window.NightSynth(ctx)[name](master, 0.02);
		const buffer = await ctx.startRendering();
		return measure(buffer.getChannelData(0));
	}

	function verdict(name, m) {
		const [, , [lo, hi], [min, max]] = CALLS[name];
		const problems = [];
		if (m.peak < 0.02) problems.push('silent');
		if (m.clips) problems.push('clips');
		if (m.pitch < lo || m.pitch > hi) problems.push('pitch ' + m.pitch + ' Hz outside ' + lo + '–' + hi);
		if (m.duration < min || m.duration > max) problems.push('length ' + m.duration.toFixed(2) + ' s outside ' + min + '–' + max);
		return problems;
	}

	const list = document.getElementById('calls');
	const synthNames = Object.keys(window.NightSynth(new OfflineAudioContext(1, 128, RATE)));
	let live = null;
	let calls = null;

	synthNames.forEach(function (name) {
		const info = CALLS[name] || ['?', 'Not described yet.', [0, 0], [0, 0]];
		const li = list.appendChild(document.createElement('li'));
		li.className = 'call';
		li.appendChild(document.createElement('h2')).textContent = info[0];
		li.appendChild(document.createElement('p')).textContent = 'Call: ' + name;
		const real = li.appendChild(document.createElement('p'));
		real.className = 'call__real';
		real.textContent = info[1];
		const check = li.appendChild(document.createElement('p'));
		check.className = 'call__check';
		check.textContent = 'Measuring…';
		check.id = 'check-' + name;
		const button = li.appendChild(document.createElement('button'));
		button.type = 'button';
		button.textContent = 'Play';
		button.addEventListener('click', function () {
			if (!live) {
				live = new AudioContext();
				const g = live.createGain();
				g.gain.value = 0.55;
				g.connect(live.destination);
				calls = { synth: window.NightSynth(live), out: g };
			}
			live.resume();
			calls.synth[name](calls.out, live.currentTime + 0.02);
		});
	});

	(async function () {
		const results = {};
		for (const name of synthNames) {
			const m = await render(name);
			const problems = CALLS[name] ? verdict(name, m) : ['no description'];
			results[name] = { duration: +m.duration.toFixed(2), pitch: m.pitch, peak: +m.peak.toFixed(3), problems };
			const el = document.getElementById('check-' + name);
			el.textContent = m.duration.toFixed(2) + ' s · loudest at ' + m.pitch + ' Hz · ' + (problems.length ? problems.join(', ') : 'matches the real call\'s range');
			el.classList.add(problems.length ? 'is-off' : 'is-ok');
		}
		if (location.search.includes('report')) {
			const report = document.getElementById('report');
			report.textContent = JSON.stringify(results);
			report.dataset.done = 'true';
			console.log('CALLS-REPORT ' + report.textContent);
		}
	})();
})();
