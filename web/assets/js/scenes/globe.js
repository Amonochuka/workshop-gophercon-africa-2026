// A dark globe that turns slowly, each sighting a blinking point of eye-shine,
// with fireflies drifting in front and the odd shooting star behind.

import { mount } from '/assets/js/threejs.js';

// The sightings' positions, from the JSON the map also reads.
function positions() {
	const el = document.getElementById('map-points');
	try {
		return (el && JSON.parse(el.textContent)) || [];
	} catch (err) {
		return [];
	}
}

function onSphere(lat, lng, r) {
	const la = (lat * Math.PI) / 180;
	const ln = (lng * Math.PI) / 180;
	return [r * Math.cos(la) * Math.sin(ln), r * Math.sin(la), r * Math.cos(la) * Math.cos(ln)];
}

// Points that glow and twinkle, each on its own beat.
function glowMaterial(THREE, color, size, speed) {
	return new THREE.ShaderMaterial({
		uniforms: {
			color: { value: color },
			time: { value: 0 },
			size: { value: size },
			speed: { value: speed },
			scale: { value: window.devicePixelRatio > 1 ? 1.5 : 1 },
		},
		vertexShader: `
			attribute float phase;
			uniform float time, size, speed, scale;
			varying float vTwinkle;
			void main() {
				vTwinkle = 0.55 + 0.45 * sin(time * speed + phase * 6.2831);
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size * scale * (0.6 + vTwinkle * 0.6) * (8.0 / -mv.z);
				gl_Position = projectionMatrix * mv;
			}`,
		fragmentShader: `
			uniform vec3 color;
			varying float vTwinkle;
			void main() {
				float d = length(gl_PointCoord - 0.5);
				float a = smoothstep(0.5, 0.0, d);
				a = a * a + smoothstep(0.12, 0.0, d);
				gl_FragColor = vec4(color * (0.8 + vTwinkle), a * vTwinkle);
			}`,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
}

function pointCloud(THREE, coords, material) {
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
	geometry.setAttribute('phase', new THREE.Float32BufferAttribute(coords.filter((_, i) => i % 3 === 0).map(() => Math.random()), 1));
	return new THREE.Points(geometry, material);
}

mount('globe', function ({ THREE, scene, camera, canvas, pointer, colour, still }) {
	const wide = () => canvas.parentElement.clientWidth > 900;
	const world = new THREE.Group();
	const globe = new THREE.Group();
	world.add(globe);
	scene.add(world);

	// The planet: a dark body, with faint lines of latitude and longitude.
	globe.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(1.6, 64, 64),
			new THREE.MeshBasicMaterial({ color: colour('--globe-body', '#0F1C17') }),
		),
	);
	globe.add(
		new THREE.LineSegments(
			new THREE.WireframeGeometry(new THREE.SphereGeometry(1.605, 24, 16)),
			new THREE.LineBasicMaterial({ color: colour('--globe-grid', '#2A4A3C'), transparent: true, opacity: 0.35 }),
		),
	);

	// A neon halo around the edge.
	const haloMaterial = new THREE.ShaderMaterial({
		uniforms: { glow: { value: colour('--globe-halo', '#B8F36B') }, time: { value: 0 } },
		vertexShader:
			'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
		fragmentShader:
			'uniform vec3 glow; uniform float time; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0) * (0.85 + 0.15 * sin(time)); gl_FragColor = vec4(glow, 1.0) * i; }',
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
	});
	world.add(new THREE.Mesh(new THREE.SphereGeometry(1.78, 64, 64), haloMaterial));

	// The sightings: eyes that blink, one Points for all of them.
	const eyesMaterial = glowMaterial(THREE, colour('--globe-points', '#FFB547'), 26, 1.8);
	globe.add(pointCloud(THREE, positions().flatMap((p) => onSphere(p.lat, p.lng, 1.62)), eyesMaterial));

	// Stars far behind.
	const stars = [];
	for (let i = 0; i < 1200; i++) {
		const r = 18 + Math.random() * 20;
		const t = Math.random() * Math.PI * 2;
		const p = Math.acos(2 * Math.random() - 1);
		stars.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), -Math.abs(r * Math.cos(p)));
	}
	const starsMaterial = glowMaterial(THREE, colour('--globe-stars', '#E9EEE6'), 9, 0.9);
	scene.add(pointCloud(THREE, stars, starsMaterial));

	// Fireflies: drift on their own slow paths in front of the globe.
	const flyCount = 70;
	const fly = [];
	const flyCoords = new Float32Array(flyCount * 3);
	for (let i = 0; i < flyCount; i++) {
		fly.push({
			x: (Math.random() - 0.5) * 9,
			y: (Math.random() - 0.5) * 5,
			z: Math.random() * 2.2 - 0.4,
			a: Math.random() * Math.PI * 2,
			s: 0.15 + Math.random() * 0.35,
		});
	}
	const flyGeo = new THREE.BufferGeometry();
	flyGeo.setAttribute('position', new THREE.BufferAttribute(flyCoords, 3));
	flyGeo.setAttribute('phase', new THREE.Float32BufferAttribute(fly.map(() => Math.random()), 1));
	const flyMaterial = glowMaterial(THREE, colour('--globe-fireflies', '#B8F36B'), 20, 2.6);
	scene.add(new THREE.Points(flyGeo, flyMaterial));

	// Shooting stars: a streak that fades, one every few seconds.
	const meteorMaterial = new THREE.LineBasicMaterial({ color: colour('--globe-stars', '#E9EEE6'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
	const meteorGeo = new THREE.BufferGeometry();
	meteorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
	const meteor = new THREE.Line(meteorGeo, meteorMaterial);
	scene.add(meteor);
	let meteorStart = -10;
	let meteorGap = 2;
	let meteorFrom = [0, 0];

	camera.position.z = 5.2;
	// Africa faces us first.
	globe.rotation.y = -0.35;
	globe.rotation.x = 0.25;

	function place() {
		world.position.x = wide() ? 1.5 : 0;
		world.position.y = wide() ? 0 : 0.6;
	}

	function moveFireflies(time) {
		for (let i = 0; i < flyCount; i++) {
			const f = fly[i];
			flyCoords[i * 3] = f.x + Math.sin(time * f.s + f.a) * 0.6;
			flyCoords[i * 3 + 1] = f.y + Math.cos(time * f.s * 0.8 + f.a * 2) * 0.4;
			flyCoords[i * 3 + 2] = f.z;
		}
		flyGeo.attributes.position.needsUpdate = true;
	}

	function moveMeteor(time) {
		if (time - meteorStart > meteorGap) {
			meteorStart = time;
			meteorGap = 3 + Math.random() * 4;
			meteorFrom = [Math.random() * 10 - 3, 2 + Math.random() * 2];
		}
		const t = (time - meteorStart) / 0.9;
		if (t > 1) {
			meteorMaterial.opacity = 0;
			return;
		}
		const pos = meteorGeo.attributes.position.array;
		const hx = meteorFrom[0] - t * 4;
		const hy = meteorFrom[1] - t * 1.6;
		pos.set([hx, hy, -4, hx + 0.9, hy + 0.36, -4]);
		meteorGeo.attributes.position.needsUpdate = true;
		meteorMaterial.opacity = Math.sin(t * Math.PI) * 0.9;
	}

	return function (time, delta) {
		place();
		for (const m of [eyesMaterial, starsMaterial, flyMaterial, haloMaterial]) m.uniforms.time.value = time;
		moveFireflies(time);

		if (still) return;
		moveMeteor(time);
		globe.rotation.y += delta * 0.1;
		globe.rotation.x += (0.25 + pointer.y * 0.15 - globe.rotation.x) * 0.05;
		camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05;
		camera.position.y += (pointer.y * 0.2 - camera.position.y) * 0.05;
	};
});
