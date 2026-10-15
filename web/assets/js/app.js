// Thermal Haze Shader + Particle System for animal cards
// Makes photos distort like rising heat, emit particles per species

(function () {
	const VERT_SRC = `
		attribute vec2 a_pos;
		varying vec2 v_uv;
		void main() {
			v_uv = a_pos * 0.5 + 0.5;
			gl_Position = vec4(a_pos, 0.0, 1.0);
		}
	`;

	const FRAG_SRC = `
		precision highp float;
		varying vec2 v_uv;
		uniform sampler2D u_tex;
		uniform float u_time;
		uniform float u_intensity;
		uniform vec2 u_mouse;
		uniform vec2 u_res;
		uniform float u_hover;

		float noise(vec2 p) {
			return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
		}

		float fbm(vec2 p) {
			float v = 0.0, a = 0.5;
			for (int i = 0; i < 5; i++) {
				v += a * noise(p);
				p *= 2.02;
				a *= 0.5;
			}
			return v;
		}

		void main() {
			vec2 uv = v_uv;

			if (u_hover > 0.5) {
				// Heat haze distortion
				vec2 distortion = vec2(0.0);
				float t = u_time * 0.8;
				distortion.x = fbm(uv * 8.0 + vec2(t, -t * 0.7)) * 0.015 * u_intensity;
				distortion.y = fbm(uv * 6.0 + vec2(-t * 0.5, t)) * 0.025 * u_intensity;

				// Radial pull toward mouse
				vec2 toMouse = (u_mouse / u_res) - uv;
				float dist = length(toMouse);
				float pull = smoothstep(0.8, 0.0, dist) * 0.008 * u_intensity;
				distortion += normalize(toMouse) * pull;

				uv += distortion;

				// Chromatic aberration at edges
				float r = texture2D(u_tex, uv + distortion * 0.5).r;
				float g = texture2D(u_tex, uv).g;
				float b = texture2D(u_tex, uv - distortion * 0.5).b;

				gl_FragColor = vec4(r, g, b, 1.0);

				// Vignette heat glow
				float vign = 1.0 - smoothstep(0.4, 0.9, length(uv - 0.5));
				gl_FragColor.rgb += vign * vec3(1.0, 0.4, 0.0) * 0.15 * u_intensity;
			} else {
				gl_FragColor = texture2D(u_tex, uv);
			}
		}
	`;

	// Particle types per motion
	const PARTICLE_TYPES = {
		pounce: { color: '#FF3D00', size: [2, 5], gravity: 0.3, life: [0.8, 1.5], count: 12, shape: 'ember' },
		stomp: { color: '#FF8C00', size: [3, 7], gravity: 0.5, life: [0.6, 1.2], count: 16, shape: 'dust' },
		sway: { color: '#FFB84D', size: [2, 4], gravity: -0.1, life: [1.5, 2.5], count: 10, shape: 'bubble' },
		flutter: { color: '#FFF8E7', size: [1, 3], gravity: -0.05, life: [1.0, 2.0], count: 14, shape: 'feather' },
		swing: { color: '#FFB84D', size: [2, 5], gravity: 0.1, life: [1.2, 2.0], count: 8, shape: 'leaf' },
		wiggle: { color: '#FF8C00', size: [1, 3], gravity: 0.2, life: [0.5, 1.0], count: 10, shape: 'spark' }
	};

	let canvas, gl, program, quadBuffer, texCache = {};
	let particles = [];
	let rafId = null;
	let mouse = { x: 0, y: 0 };
	let hoverCard = null;

	function initGL() {
		canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
		document.body.appendChild(canvas);
		gl = canvas.getContext('webgl', { alpha: true, antialias: true });
		if (!gl) return false;

		const vs = compileShader(gl.VERTEX_SHADER, VERT_SRC);
		const fs = compileShader(gl.FRAGMENT_SHADER, FRAG_SRC);
		if (!vs || !fs) return false;

		program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			return false;
		}

		quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

		resize();
		window.addEventListener('resize', resize);
		document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
		return true;
	}

	function compileShader(type, src) {
		const s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(s));
			return null;
		}
		return s;
	}

	function resize() {
		const dpr = Math.min(window.devicePixelRatio, 2);
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		gl.viewport(0, 0, canvas.width, canvas.height);
	}

	function createTexture(img) {
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return tex;
	}

	function getTexture(img) {
		const src = img.src;
		if (!texCache[src]) texCache[src] = createTexture(img);
		return texCache[src];
	}

	function renderHaze(card, img, intensity) {
		if (!gl || !program) return;

		const rect = card.getBoundingClientRect();
		const dpr = canvas.width / window.innerWidth;

		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		const aPos = gl.getAttribLocation(program, 'a_pos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1f(gl.getUniformLocation(program, 'u_time'), performance.now() / 1000);
		gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
		gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x * dpr, (window.innerHeight - mouse.y) * dpr);
		gl.uniform2f(gl.getUniformLocation(program, 'u_res'), canvas.width, canvas.height);
		gl.uniform1f(gl.getUniformLocation(program, 'u_hover'), hoverCard === card ? 1.0 : 0.0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, getTexture(img));
		gl.uniform1i(gl.getUniformLocation(program, 'u_tex'), 0);

		// Scissor to card bounds
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(rect.left * dpr, (window.innerHeight - rect.bottom) * dpr, rect.width * dpr, rect.height * dpr);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.SCISSOR_TEST);
	}

	// Particle system
	function spawnParticles(card, motion) {
		const cfg = PARTICLE_TYPES[motion] || PARTICLE_TYPES.wiggle;
		const rect = card.querySelector('.card__photo').getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		for (let i = 0; i < cfg.count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 30 + Math.random() * 60;
			particles.push({
				x: cx + (Math.random() - 0.5) * rect.width * 0.5,
				y: cy + (Math.random() - 0.5) * rect.height * 0.5,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 0,
				maxLife: cfg.life[0] + Math.random() * (cfg.life[1] - cfg.life[0]),
				size: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
				color: cfg.color,
				gravity: cfg.gravity,
				shape: cfg.shape,
				rotation: Math.random() * Math.PI * 2,
				rotSpeed: (Math.random() - 0.5) * 4
			});
		}
	}

	function drawParticles(ctx, dt) {
		if (!particles.length) return;
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.life += dt;
			if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }

			p.vy += p.gravity * 100 * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.rotation += p.rotSpeed * dt;

			const t = p.life / p.maxLife;
			const alpha = (1 - t) * 0.9;
			const size = p.size * (1 - t * 0.3);

			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rotation);
			ctx.globalAlpha = alpha;

			if (p.shape === 'ember') {
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(0, 0, size, 0, Math.PI * 2);
				ctx.fill();
			} else if (p.shape === 'dust') {
				ctx.fillStyle = p.color;
				ctx.globalAlpha = alpha * 0.6;
				ctx.fillRect(-size/2, -size/2, size, size);
			} else if (p.shape === 'bubble') {
				ctx.strokeStyle = p.color;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(0, 0, size, 0, Math.PI * 2);
				ctx.stroke();
			} else if (p.shape === 'feather') {
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
				ctx.fill();
			} else if (p.shape === 'leaf') {
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.ellipse(0, 0, size, size * 0.6, p.rotation, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(0, 0, size, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
	}

	// Sound wave rings
	const soundRings = [];
	function spawnSoundRing(card) {
		const rect = card.querySelector('.card__photo').getBoundingClientRect();
		soundRings.push({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			r: 0,
			maxR: Math.max(rect.width, rect.height) * 2.5,
			life: 0,
			maxLife: 1.2
		});
	}

	function drawSoundRings(ctx, dt) {
		for (let i = soundRings.length - 1; i >= 0; i--) {
			const r = soundRings[i];
			r.life += dt;
			if (r.life >= r.maxLife) { soundRings.splice(i, 1); continue; }

			const t = r.life / r.maxLife;
			r.r = r.maxR * t;
			const alpha = (1 - t) * 0.6;

			ctx.save();
			ctx.strokeStyle = `rgba(255, 61, 0, ${alpha})`;
			ctx.lineWidth = 2 * (1 - t * 0.5);
			ctx.beginPath();
			ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();

			// Inner ring
			ctx.save();
			ctx.strokeStyle = `rgba(255, 184, 77, ${alpha * 0.7})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(r.x, r.y, r.r * 0.7, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
	}

	// Main loop
	let lastTime = 0;
	function loop(time) {
		const dt = (time - lastTime) / 1000;
		lastTime = time;

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Render heat haze for hovered card
		if (hoverCard) {
			const img = hoverCard.querySelector('.card__photo img');
			if (img && img.complete) renderHaze(hoverCard, img, 1.0);
		}

		// Particles + sound rings
		drawParticles(ctx, dt);
		drawSoundRings(ctx, dt);

		rafId = requestAnimationFrame(loop);
	}

	// Wire up cards
	function attach() {
		if (!initGL()) return;

		document.querySelectorAll('.card[data-call]').forEach(card => {
			const motion = card.className.match(/card--(\w+)/)?.[1] || 'wiggle';
			const photo = card.querySelector('.card__photo');
			const img = photo?.querySelector('img');
			if (!img) return;

			// Ensure image is loaded
			if (!img.complete) img.onload = () => {};

			card.addEventListener('pointerenter', () => {
				hoverCard = card;
				card.classList.add('has-haze');
				spawnParticles(card, motion);
			});

			card.addEventListener('pointerleave', () => {
				hoverCard = null;
				card.classList.remove('has-haze');
			});

			// Also trigger on lunge (sound)
			const observer = new MutationObserver(muts => {
				muts.forEach(m => {
					if (m.target.classList.contains('is-lunging')) {
						spawnSoundRing(card);
						spawnParticles(card, motion);
					}
				});
			});
			observer.observe(card, { attributes: true, attributeFilter: ['class'] });
		});

		rafId = requestAnimationFrame(loop);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attach);
	} else {
		attach();
	}

	// Cleanup
	window.addEventListener('beforeunload', () => {
		if (rafId) cancelAnimationFrame(rafId);
		if (canvas) canvas.remove();
	});
})();

// Species search filter
(function () {
	const input = document.getElementById('species-search');
	const clearBtn = document.querySelector('.search-clear');
	const cards = document.querySelectorAll('.card[data-call]');
	const sightingsList = document.querySelector('.sightings');
	const emptyMsg = document.querySelector('.empty');

	if (!input || !cards.length) return;

	// Normalize text for matching
	function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

	// Get searchable text from card
	function cardText(card) {
		const name = card.querySelector('.card__name')?.textContent || '';
		const sci = card.querySelector('.card__scientific')?.textContent || '';
		const loc = card.querySelector('.card__meta dd')?.textContent || '';
		const call = card.dataset.call || '';
		const motion = card.className.match(/card--(\w+)/)?.[1] || '';
		return norm(name + ' ' + sci + ' ' + loc + ' ' + call + ' ' + motion);
	}

	const cardData = Array.from(cards).map(card => ({ card, text: cardText(card) }));

	function filter(query) {
		const q = norm(query.trim());
		let visible = 0;

		cardData.forEach(({ card, text }) => {
			const match = q === '' || text.includes(q);
			card.style.display = match ? '' : 'none';
			card.hidden = !match;
			if (match) visible++;
		});

		// Show/hide empty message
		if (emptyMsg) emptyMsg.hidden = visible > 0 || q === '';

		// Update URL without reload
		const url = new URL(window.location);
		if (q) url.searchParams.set('q', q);
		else url.searchParams.delete('q');
		window.history.replaceState({}, '', url);
	}

	// Debounced input
	let debounce = null;
	input.addEventListener('input', () => {
		clearTimeout(debounce);
		debounce = setTimeout(() => filter(input.value), 80);
	});

	// Clear button
	clearBtn?.addEventListener('click', () => {
		input.value = '';
		filter('');
		input.focus();
	});

	// Restore from URL on load
	const urlParams = new URLSearchParams(window.location.search);
	const initial = urlParams.get('q') || '';
	if (initial) {
		input.value = initial;
		filter(initial);
	}

	// Escape to clear
	input.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			input.value = '';
			filter('');
			input.blur();
		}
	});
})();