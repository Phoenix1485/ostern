// ——— PETALS ———
const petalColors = ['#f9a8c9', '#ffc8e0', '#f4c4f0', '#c8f0d8', '#ffeab0', '#b0e0f8'];
const petalContainer = document.getElementById('petals');
for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.cssText = `
left: ${Math.random() * 100}vw;
top: ${Math.random() * -20}px;
background: ${petalColors[Math.floor(Math.random() * petalColors.length)]};
animation-duration: ${6 + Math.random() * 8}s;
animation-delay: ${Math.random() * 10}s;
width: ${8 + Math.random() * 8}px;
height: ${8 + Math.random() * 8}px;
transform: rotate(${Math.random() * 360}deg);
opacity: 0;
`;
    petalContainer.appendChild(p);
}

// ——— GAME ———
const GRID_SIZE = 25;
const EGG_EMOJIS = ['🥚', '🥚', '🐣', '🥚', '🐣'];
const EGG_COUNT = 5;
let eggs = new Set();
let found = 0;
let clicks = 0;
let revealed = new Set();
let gameOver = false;

const CELL_CONTENTS = ['🌸', '🌼', '🌺', '🌻', '🌷', '🪷', '💐', '🌹'];

function randomSet(n, max) {
    const s = new Set();
    while (s.size < n) s.add(Math.floor(Math.random() * max));
    return s;
}

function resetGame() {
    eggs = randomSet(EGG_COUNT, GRID_SIZE);
    found = 0;
    clicks = 0;
    revealed = new Set();
    gameOver = false;
    document.getElementById('found-count').textContent = 0;
    document.getElementById('click-count').textContent = 0;
    document.getElementById('game-message').textContent = 'Klicke auf die Felder um Eier zu finden! 🔍';
    buildGrid();
}

function buildGrid() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.idx = i;
        const isEgg = eggs.has(i);
        const hiddenContent = isEgg
            ? EGG_EMOJIS[Math.floor(Math.random() * EGG_EMOJIS.length)]
            : CELL_CONTENTS[Math.floor(Math.random() * CELL_CONTENTS.length)];
        cell.innerHTML = `<span class="grass-cover">🌿</span><span class="hidden-icon">${hiddenContent}</span>`;
        if (isEgg) {
            cell.style.setProperty('--hidden-bg', '#fff7cc');
        }
        cell.addEventListener('click', () => revealCell(cell, i, isEgg));
        grid.appendChild(cell);
    }
}

function revealCell(cell, idx, isEgg) {
    if (revealed.has(idx) || gameOver) return;
    revealed.add(idx);
    clicks++;
    document.getElementById('click-count').textContent = clicks;
    cell.classList.add('revealed');

    if (isEgg) {
        found++;
        document.getElementById('found-count').textContent = found;
        cell.style.background = '#fff7cc';
        cell.style.borderColor = '#e8c84a';
        spawnConfetti(cell);
        if (found === EGG_COUNT) {
            gameOver = true;
            document.getElementById('game-message').textContent = `🎉 Alle ${EGG_COUNT} Eier gefunden! Super! 🎉`;
        } else {
            document.getElementById('game-message').textContent = `Ei gefunden! Noch ${EGG_COUNT - found} zu finden… 🐣`;
        }
    } else {
        cell.style.background = '#d0ead0';
        if (revealed.size % 5 === 0) {
            document.getElementById('game-message').textContent = 'Schau weiter! Die Eier warten… 🔍';
        }
    }
}

function spawnConfetti(anchor) {
    const rect = anchor.getBoundingClientRect();
    const colors = ['#e8c84a', '#f4845f', '#6ab4d8', '#7bbf8a', '#a87bc8', '#f8c8d0'];
    for (let i = 0; i < 12; i++) {
        const c = document.createElement('div');
        c.className = 'confetti-piece';
        c.style.cssText = `
left:${rect.left + rect.width / 2 + (Math.random() - 0.5) * 20}px;
top:${rect.top + rect.height / 2}px;
background:${colors[Math.floor(Math.random() * colors.length)]};
--dx:${(Math.random() - 0.5) * 120}px;
border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
width:${6 + Math.random() * 8}px;
height:${6 + Math.random() * 8}px;
animation-delay:${Math.random() * 0.2}s;
`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1800);
    }
}

// ——— ROTATING QUOTES ———
const quotes = [
    'Möge dieses Ostern dir genauso viel Freude bringen, wie du in das Leben anderer trägst. Frohe Ostern! 🐰',
    'Frühling liegt in der Luft — und mit ihm all die Wärme, die du verdienst. 🌸',
    'Manchmal braucht es nur ein buntes Ei und ein Lächeln, um den Tag zu verschönern. 🥚',
    'Möge dein Ostern so süß sein wie die Schokolade im Nest. 🍫',
    'Neuer Anfang, frische Blüten — alles ist möglich. Frohe Ostern! 🌼',
    'Wer sucht, der findet — nicht nur Ostereier, sondern auch Glück und Freude. 🍀',
];

// Prüfe ob ein Spruch per URL übergeben wurde (?quote=INDEX)
const urlParams = new URLSearchParams(window.location.search);
const urlQuoteIndex = urlParams.get('quote');
const hasUrlQuote = urlQuoteIndex !== null && quotes[Number(urlQuoteIndex)] !== undefined;

// Wenn URL-Quote vorhanden: zeige nur diesen, keine Rotation
// Wenn nicht: shuffle und rotiere normal
let shuffled, quoteIndex, quoteInterval, isStaticQuote;

if (hasUrlQuote) {
    shuffled = quotes;
    quoteIndex = Number(urlQuoteIndex);
    isStaticQuote = true;
} else {
    shuffled = [...quotes].sort(() => Math.random() - 0.5);
    quoteIndex = 0;
    isStaticQuote = false;
}

const quoteEl = document.getElementById('quote-text');
const messageCard = document.querySelector('.message-card');

quoteEl.textContent = shuffled[quoteIndex];

function nextQuote() {
    quoteIndex = (quoteIndex + 1) % shuffled.length;
    quoteEl.classList.remove('animating-in');
    quoteEl.classList.add('animating-out');
    setTimeout(() => {
        quoteEl.textContent = shuffled[quoteIndex];
        quoteEl.classList.remove('animating-out');
        quoteEl.classList.add('animating-in');
    }, 400);
}

function startQuoteRotation() {
    if (quoteInterval || isStaticQuote) return;
    quoteInterval = setInterval(nextQuote, 4500);
}

function stopQuoteRotation() {
    clearInterval(quoteInterval);
    quoteInterval = null;
}

const quoteVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startQuoteRotation();
        } else {
            stopQuoteRotation();
        }
    });
}, { threshold: 0.3 });

quoteVisibilityObserver.observe(messageCard);

// ——— SHARE ———
function getShareUrl() {
    const currentText = quoteEl.textContent;
    const originalIndex = quotes.indexOf(currentText);
    const base = window.location.origin + window.location.pathname;
    return originalIndex >= 0 ? `${base}?quote=${originalIndex}` : base;
}

function copyLink() {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
        const fb = document.getElementById('copy-feedback');
        fb.textContent = '✅ Link wurde kopiert!';
        setTimeout(() => fb.textContent = '', 3000);
    }).catch(() => {
        document.getElementById('copy-feedback').textContent = '🔗 ' + url;
    });
}

function shareWhatsApp() {
    const url = getShareUrl();
    const msg = encodeURIComponent('🐰 Frohe Ostern! Schau dir diese kleine Osterkarte an: ' + url);
    window.open('https://wa.me/?text=' + msg, '_blank');
}

// ——— SCROLL REVEAL ———
const eggObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.egg-card');
            cards.forEach((card, i) => {
                card.style.transitionDelay = `${i * 0.1}s`;
                card.classList.add('visible');
            });
            eggObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const eggsGrid = document.querySelector('.eggs-grid');
if (eggsGrid) eggObserver.observe(eggsGrid);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ——— INIT ———
resetGame();