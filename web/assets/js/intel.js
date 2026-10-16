// Species Intel Panel - AR HUD Dossier System

(function () {
	let intelData = {};
	let currentAnimal = null;
	
	const panel = document.getElementById('intel-panel');
	const content = document.getElementById('intel-content');
	const title = document.getElementById('intel-title');
	const timestampEl = document.getElementById('timestamp-value');
	
	function loadIntelData() {
		const script = document.getElementById('intel-data');
		if (script) {
			try {
				intelData = JSON.parse(script.textContent);
			} catch (e) {
				console.error('Failed to parse intel data', e);
			}
		}
	}
	
	function formatConservation(code) {
		const codes = {
			'LC': { label: 'LEAST CONCERN', class: 'lc' },
			'NT': { label: 'NEAR THREATENED', class: 'nt' },
			'VU': { label: 'VULNERABLE', class: 'vu' },
			'EN': { label: 'ENDANGERED', class: 'en' },
			'CR': { label: 'CRITICALLY ENDANGERED', class: 'cr' },
			'DD': { label: 'DATA DEFICIENT', class: 'dd' },
			'EW': { label: 'EXTINCT IN WILD', class: 'ew' },
			'EX': { label: 'EXTINCT', class: 'ex' },
		};
		return codes[code] || { label: code, class: '' };
	}
	
	function getClassIcon(cls) {
		const icons = {
			mammal: '🦁',
			bird: '🦅',
			reptile: '🦎',
			fish: '🐟',
			amphibian: '🐸',
		};
		return icons[cls] || '🧬';
	}
	
	function renderDossier(animal) {
		const d = intelData[animal];
		if (!d) return;
		
		currentAnimal = animal;
		const cons = formatConservation(d.conservation);
		
		const now = new Date();
		document.getElementById('timestamp-value').textContent = 
			now.toISOString().replace('T', ' ').substring(0, 19) + 'Z';
		
		title.textContent = `${d.name.toUpperCase()} // ${d.scientific.toUpperCase()}`;
		
		content.innerHTML = `
			<div class="dossier" data-animal="${animal}">
				<div class="dossier-header">
					<div class="dossier-id">
						<span class="dossier-code">ID: ${animal.toUpperCase().replace('_', '-')}</span>
						<span class="dossier-class">${getClassIcon(d.class)} ${d.class.toUpperCase()}</span>
					</div>
					<div class="dossier-status">
						<span class="cons-badge ${cons.class}">${cons.label}</span>
						<span class="iucn-tag">IUCN ${d.conservation}</span>
					</div>
				</div>
				
				<div class="dossier-grid">
					<div class="dossier-panel primary">
						<h3>BIOMETRICS</h3>
						<table class="spec-table">
							<tr><td>Mass</td><td>${d.weightKg.toLocaleString()} kg</td></tr>
							<tr><td>Height</td><td>${d.heightCm} cm</td></tr>
							<tr><td>Length</td><td>${d.lengthCm} cm</td></tr>
							<tr><td>Lifespan</td><td>${d.lifespan}</td></tr>
						</table>
						
						<h3>COMBAT PROFILE</h3>
						<div class="stat-bars">
							${renderStatBar('ATTACK', d.attack)}
							${renderStatBar('DEFENSE', d.defense)}
							${renderStatBar('SPEED', d.speed)}
							${renderStatBar('STAMINA', d.stamina)}
						</div>
						
						<h3>SPECIAL CAPABILITY</h3>
						<div class="special-move">
							<span class="move-name">${d.specialMove}</span>
							<span class="move-desc">${d.specialDesc}</span>
						</div>
					</div>
					
					<div class="dossier-panel secondary">
						<h3>CLASSIFICATION</h3>
						<table class="spec-table">
							<tr><td>Common</td><td>${d.name}</td></tr>
							<tr><td>Scientific</td><td><em>${d.scientific}</em></td></tr>
							<tr><td>Class</td><td>${d.class}</td></tr>
							<tr><td>Conservation</td><td>${cons.label}</td></tr>
						</table>
						
						<h3>ECOLOGY</h3>
						<table class="spec-table">
							<tr><td>Habitat</td><td>${d.habitat}</td></tr>
							<tr><td>Diet</td><td>${d.diet}</td></tr>
							<tr><td>Lifespan</td><td>${d.lifespan}</td></tr>
						</table>
						
						<h3>INTEL NOTES</h3>
						<div class="intel-note">
							"${d.funFact}"
						</div>
					</div>
				</div>
				
				<div class="dossier-actions">
					<button class="intel-btn intel-btn--compare" onclick="compareSpecies('${animal}')">COMPARE</button>
					<button class="intel-btn intel-btn--map" onclick="locateOnMap('${animal}')">LOCATE</button>
					<button class="intel-btn intel-btn--sound" onclick="playCall('${animal}')">AUDIO SIG</button>
				</div>
			</div>
		`;
		
		// Animate stat bars
		setTimeout(() => {
			document.querySelectorAll('.stat-fill').forEach(bar => {
				bar.style.width = bar.dataset.value + '%';
			});
		}, 50);
	}
	
	function renderStatBar(label, value) {
		return `
			<div class="stat-bar-row">
				<span class="stat-label">${label}</span>
				<div class="stat-bar-bg">
					<div class="stat-fill" data-value="${value}" style="width: 0%"></div>
				</div>
				<span class="stat-value">${value}</span>
			</div>
		`;
	}
	
	function openIntel(animal) {
		if (!intelData[animal]) return;
		
		const panel = document.getElementById('intel-panel');
		panel.hidden = false;
		document.body.style.overflow = 'hidden';
		
		renderDossier(animal);
		
		// Focus trap
		setTimeout(() => {
			const closeBtn = document.querySelector('.intel-close');
			if (closeBtn) closeBtn.focus();
		}, 100);
	}
	
	function closeIntel() {
		const panel = document.getElementById('intel-panel');
		panel.hidden = true;
		document.body.style.overflow = '';
	}
	
	// Wire up card clicks
	function attachCardListeners() {
		document.querySelectorAll('.card[data-call]').forEach(card => {
			card.style.cursor = 'pointer';
			card.addEventListener('click', (e) => {
				// Don't open intel if clicking links/buttons
				if (e.target.closest('a, button, .sound-toggle')) return;
				
				const animal = card.dataset.call;
				if (animal) openIntel(animal);
			});
			
			// Keyboard support
			card.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					const animal = card.dataset.call;
					if (animal) openIntel(animal);
				}
			});
			
			// Make focusable
			card.setAttribute('tabindex', '0');
			card.setAttribute('role', 'button');
			card.setAttribute('aria-label', `View intel for ${card.querySelector('.card__name')?.textContent || 'animal'}`);
		});
	}
	
	// Keyboard close
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const panel = document.getElementById('intel-panel');
			if (panel && !panel.hidden) closeIntel();
		}
	});
	
	// Backdrop click
	document.addEventListener('click', (e) => {
		if (e.target.classList.contains('intel-backdrop')) closeIntel();
	});
	
	// Initialize
	document.addEventListener('DOMContentLoaded', () => {
		loadIntelData();
		attachCardListeners();
	});
	
	// Re-attach after dynamic content
	const observer = new MutationObserver(() => {
		attachCardListeners();
	});
	observer.observe(document.body, { childList: true, subtree: true });
	
	// Expose globally
	window.openIntel = openIntel;
	window.closeIntel = closeIntel;
})();

// CSS for dossier (injected)
const style = document.createElement('style');
style.textContent = `
.dossier { animation: dossier-enter 0.3s ease-out; }
@keyframes dossier-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.dossier-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
.dossier-code { font-family: var(--font-hud); font-size: 0.65rem; color: var(--phosphor-dim); letter-spacing: 0.1em; }
.dossier-class { display: inline-block; margin-top: 0.25rem; padding: 0.15rem 0.5rem; background: rgba(0,255,65,0.1); border: 1px solid var(--phosphor); border-radius: 2px; font-family: var(--font-hud); font-size: 0.6rem; color: var(--phosphor); }
.dossier-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.cons-badge { padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-hud); font-size: 0.55rem; letter-spacing: 0.05em; font-weight: 700; }
.cons-badge.lc { background: var(--phosphor); color: var(--void); }
.cons-badge.nt { background: var(--amber); color: var(--void); }
.cons-badge.vu { background: var(--thermal-warm); color: var(--void); }
.cons-badge.en { background: var(--thermal-hot); color: var(--void); }
.cons-badge.cr { background: var(--red-alert); color: var(--void); animation: pulse-badge 1s ease-in-out infinite; }
.cons-badge.dd { background: var(--thermal-cool); color: var(--void); }
@keyframes pulse-badge { 50% { box-shadow: 0 0 10px var(--red-alert); } }
.iucn-tag { font-family: var(--font-hud); font-size: 0.55rem; color: var(--phosphor-dim); }

.dossier-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
@media (max-width: 800px) { .dossier-grid { grid-template-columns: 1fr; } }

.dossier-panel { background: var(--bg-panel-raised); border: 1px solid var(--line); padding: 1.25rem; }
.dossier-panel h3 { font-family: var(--font-hud); font-size: 0.6rem; letter-spacing: 0.15em; color: var(--phosphor-dim); margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--line); text-transform: uppercase; }
.dossier-panel.secondary h3 { margin-top: 1.5rem; }

.spec-table { width: 100%; font-family: var(--font-body); font-size: 0.8rem; border-collapse: collapse; }
.spec-table td { padding: 0.5rem 0; border-bottom: 1px dotted var(--line); vertical-align: top; }
.spec-table td:first-child { color: var(--phosphor-dim); width: 40%; font-family: var(--font-hud); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; }
.spec-table td:last-child { color: var(--phosphor); font-weight: 500; }
.spec-table em { font-style: italic; color: var(--thermal-cool); }

.stat-bars { display: flex; flex-direction: column; gap: 0.75rem; }
.stat-bar-row { display: flex; align-items: center; gap: 0.75rem; }
.stat-label { width: 70px; font-family: var(--font-hud); font-size: 0.6rem; letter-spacing: 0.05em; color: var(--phosphor-dim); text-transform: uppercase; }
.stat-bar-bg { flex: 1; height: 8px; background: var(--bg-deep); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
.stat-fill { height: 100%; background: linear-gradient(90deg, var(--phosphor), var(--thermal-warm)); border-radius: 3px; transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 0 8px var(--phosphor); }
.stat-value { width: 3ch; font-family: var(--font-hud); font-size: 0.7rem; color: var(--phosphor-bright); text-align: right; }

.special-move { padding: 1rem; background: rgba(0,255,65,0.05); border: 1px solid var(--phosphor); border-radius: 4px; }
.move-name { display: block; font-family: var(--font-display); font-size: 0.85rem; color: var(--thermal-warm); margin-bottom: 0.5rem; letter-spacing: 0.02em; }
.move-desc { font-family: var(--font-body); font-size: 0.8rem; color: var(--phosphor); line-height: 1.5; }

.intel-note { padding: 1rem; background: rgba(255,170,0,0.05); border-left: 3px solid var(--amber); font-family: var(--font-body); font-size: 0.85rem; line-height: 1.6; color: var(--phosphor); font-style: italic; }

.dossier-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; padding-top: 1rem; border-top: 1px solid var(--line); }
.intel-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border: 1px solid var(--line); background: var(--bg-panel-raised); color: var(--phosphor); font-family: var(--font-hud); font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
.intel-btn:hover { background: var(--phosphor); color: var(--void); border-color: var(--phosphor); }
.intel-btn--compare:hover { background: var(--thermal-warm); border-color: var(--thermal-warm); }
.intel-btn--map:hover { background: var(--thermal-cool); border-color: var(--thermal-cool); }
.intel-btn--sound:hover { background: var(--amber); border-color: var(--amber); }
`;
document.head.appendChild(style);