// A dark globe that turns slowly, each sighting a glowing point of eye-shine.

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

// A soft round dot, drawn once, so points glow instead of being squares.
function glowTexture(THREE) {
	const size = 64;
	const c = document.createElement('canvas');
	c.width = c.height = size;
	const ctx = c.getContext('2d');
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);
	return new THREE.CanvasTexture(c);
}

function onSphere(lat, lng, r) {
	const la = (lat * Math.PI) / 180;
	const ln = (lng * Math.PI) / 180;
	return [r * Math.cos(la) * Math.sin(ln), r * Math.sin(la), r * Math.cos(la) * Math.cos(ln)];
}

mount('globe', function ({ THREE, scene, camera, canvas, pointer, colour, still }) {
	const wide = () => canvas.parentElement.clientWidth > 900;
	const globe = new THREE.Group();
	scene.add(globe);

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

	// A halo of moonlight around the edge.
	const halo = new THREE.Mesh(
		new THREE.SphereGeometry(1.75, 64, 64),
		new THREE.ShaderMaterial({
			uniforms: { glow: { value: colour('--globe-halo', '#7FD1A8') } },
			vertexShader:
				'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
			fragmentShader:
				'uniform vec3 glow; varying vec3 vN; void main(){ float i = pow(0.7 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(glow, 1.0) * i; }',
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true,
		}),
	);
	scene.add(halo);

	// The sightings: one Points for all of them.
	const texture = glowTexture(THREE);
	const coords = positions().flatMap((p) => onSphere(p.lat, p.lng, 1.62));
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
	const eyes = new THREE.Points(
		geometry,
		new THREE.PointsMaterial({
			color: colour('--globe-points', '#FFB547'),
			size: 0.16,
			map: texture,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	globe.add(eyes);

	// Stars behind it all.
	const stars = [];
	for (let i = 0; i < 900; i++) {
		const r = 18 + Math.random() * 20;
		const t = Math.random() * Math.PI * 2;
		const p = Math.acos(2 * Math.random() - 1);
		stars.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), -Math.abs(r * Math.cos(p)));
	}
	const starGeo = new THREE.BufferGeometry();
	starGeo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
	scene.add(
		new THREE.Points(
			starGeo,
			new THREE.PointsMaterial({ color: colour('--globe-stars', '#E9EEE6'), size: 0.08, map: texture, transparent: true, opacity: 0.7, depthWrite: false }),
		),
	);

	camera.position.z = 5.2;
	// Africa faces us first.
	globe.rotation.y = -0.35;
	globe.rotation.x = 0.25;

	return function (time, delta) {
		const x = wide() ? 1.5 : 0;
		globe.position.x = x;
		halo.position.x = x;
		globe.position.y = halo.position.y = wide() ? 0 : 0.6;

		if (still) return;
		globe.rotation.y += delta * 0.08;
		globe.rotation.x += (0.25 + pointer.y * 0.15 - globe.rotation.x) * 0.05;
		camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.05;
		eyes.material.size = 0.15 + Math.sin(time * 2) * 0.025;
	};
});
