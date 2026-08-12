// Tabs para Other Projects (Itch.io / Playstore)
document.addEventListener('DOMContentLoaded', function () {
  var tabItchio = document.getElementById('tab-itchio');
  var tabPlaystore = document.getElementById('tab-playstore');
  var sectionItchio = document.getElementById('section-itchio');
  var sectionPlaystore = document.getElementById('section-playstore');
  if (tabItchio && tabPlaystore && sectionItchio && sectionPlaystore) {
    tabItchio.classList.add('active');
    tabPlaystore.classList.remove('active');
    tabItchio.addEventListener('click', function () {
      sectionItchio.style.display = '';
      sectionPlaystore.style.display = 'none';
      tabItchio.classList.add('active');
      tabPlaystore.classList.remove('active');
    });
    tabPlaystore.addEventListener('click', function () {
      sectionItchio.style.display = 'none';
      sectionPlaystore.style.display = '';
      tabPlaystore.classList.add('active');
      tabItchio.classList.remove('active');
    });
  }
});

// Menú móvil
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const hamburger = document.querySelector('.hamburger');
  if (!mobileMenuButton || !mobileMenu || !mobileMenuOverlay) return;

  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.remove('hidden');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.add('hidden');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
  mobileMenuButton.addEventListener('click', function () {
    mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });
});

// Render de Assets dinámicos (assets.html)
// Muestra 9 por defecto + botón "ver más" con el resto
function renderAssets() {
  const container = document.getElementById('assets-container');
  if (!container || typeof assetsData === 'undefined') return;
  const VISIBLE = 9;

  const cards = assetsData.map((asset) => {
    const tags = asset.tags.map(tag =>
      `<span class="tag">${tag}</span>`
    ).join('');
    return `
      <a class="game-card reveal" href="${asset.link}" target="_blank" rel="noopener noreferrer">
        <div class="thumb">
          <img src="${asset.image}" alt="${asset.title} Preview" loading="lazy" onerror="this.remove(); this.parentElement.classList.add('no-img')" />
        </div>
        <div class="card-body">
          <h3>${asset.title}</h3>
          <p class="line-clamp-3">${asset.description}</p>
          <div class="tags">${tags}</div>
          <div class="stats-row">
            <span>${asset.price}</span>
            <span>${asset.rating}</span>
            <span>${asset.reviews}</span>
          </div>
          <span class="go">View on Asset Store →</span>
        </div>
      </a>`;
  });

  container.innerHTML = cards.join('');

  /* Marcar las extras: ocultas pero DENTRO del grid (3 columnas).
     asset-extra = identificador permanente (para el toggle);
     is-extra = estado visible/oculto. */
  const all = container.querySelectorAll('.game-card');
  all.forEach((el, i) => { if (i >= VISIBLE) el.classList.add('asset-extra', 'is-extra'); });

  revealCards(container);
  updateAssetStats();

  const wrap = document.getElementById('assets-more-wrap');
  if (wrap) wrap.style.display = cards.length > VISIBLE ? '' : 'none';
}

// Estadísticas de assets calculadas desde los datos (nunca hardcodeadas)
function updateAssetStats() {
  if (typeof assetsData === 'undefined') return;
  const el = (id) => document.getElementById(id);

  if (el('stat-assets')) el('stat-assets').textContent = assetsData.length;

  let reviews = 0, ratingSum = 0, ratingCount = 0;
  assetsData.forEach((a) => {
    const r = parseInt(a.reviews, 10);
    if (!isNaN(r)) reviews += r;
    const stars = (a.rating || '').match(/★/g);
    if (stars) { ratingSum += stars.length; ratingCount++; }
  });
  if (el('stat-reviews')) el('stat-reviews').textContent = reviews > 0 ? reviews + '+' : '50+';
  if (el('stat-rating')) el('stat-rating').textContent = ratingCount ? (ratingSum / ratingCount).toFixed(1) : '5.0';
}

// Botón "ver más / ver menos" de assets (toggle)
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('assets-more-btn');
  if (!btn) return;
  let expanded = false;
  btn.addEventListener('click', function () {
    const extras = document.querySelectorAll('#assets-container .game-card.asset-extra');
    if (!extras.length) return;
    expanded = !expanded;
    extras.forEach((el) => {
      if (expanded) {
        el.classList.add('visible');    // revelar con transición
        el.classList.remove('is-extra'); // vuelve al grid de 3 columnas
      } else {
        el.classList.add('is-extra');   // ocultar de nuevo
      }
    });
    btn.textContent = expanded ? 'Show less ↑' : 'View all assets →';
  });
});

// Revela las tarjetas recién insertadas (evita que queden invisibles)
function revealCards(container) {
  if (!container) return;
  container.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  setTimeout(() => {
    const event = new Event('scroll');
    window.dispatchEvent(event);
  }, 100);
}

// Juegos de itch.io usando games.json (projects.html)
async function loadItchioGames() {
  const container = document.getElementById('itch-games-container');
  if (!container) return;

  try {
    const response = await fetch('games.json?' + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Games data indicates an error');
    displayItchioGames(data.games, container);
  } catch (error) {
    console.error('❌ Error loading games:', error.message);
    try {
      const fallbackGames = await getItchioGamesData();
      displayItchioGames(fallbackGames, container);
    } catch (fallbackError) {
      displayItchioError(container, error.message);
    }
  }
}

// Datos manuales de respaldo
async function getItchioGamesData() {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      title: "Tu Juego 1",
      short_text: "Descripción corta de tu primer juego.",
      url: "https://tboxfinn.itch.io/tu-juego-1",
      cover_url: null,
      min_price: 0,
      classification: "Game",
      type: "Género",
      downloads_count: 100,
      views_count: 500,
      published: true
    }
  ];
}

function displayItchioGames(games, container) {
  if (!games || games.length === 0) {
    container.innerHTML = `
      <div class="loading">No published games found on itch.io — <a class="link-underline" href="https://tboxfinn.itch.io" target="_blank">visit my profile →</a></div>
    `;
    return;
  }

  container.innerHTML = games.slice(0, 6).map((game, index) => `
    <a class="game-card reveal reveal-delay-${index % 3}" href="${game.url}" target="_blank" rel="noopener noreferrer">
      <div class="thumb">
        ${game.cover_url
          ? `<img src="${game.cover_url}" alt="${game.title}" loading="lazy" onerror="this.remove(); this.parentElement.classList.add('no-img')" />`
          : `<div class="no-img"><span>🎮</span></div>`}
      </div>
      <div class="card-body">
        <h3 class="line-clamp-1">${game.title}</h3>
        <p class="line-clamp-3">${game.short_text || 'An exciting game created with passion and dedication.'}</p>
        <div class="tags">
          <span class="tag">itch.io</span>
          ${game.classification ? `<span class="tag">${game.classification}</span>` : ''}
          ${game.type ? `<span class="tag">${game.type}</span>` : ''}
        </div>
        <div class="stats-row">
          ${game.downloads_count ? `<span>⬇ ${game.downloads_count.toLocaleString()}</span>` : ''}
          ${game.views_count ? `<span>👁 ${game.views_count.toLocaleString()}</span>` : ''}
          ${game.min_price > 0 ? `<span>$${(game.min_price / 100).toFixed(2)}</span>` : `<span>Free</span>`}
        </div>
        <span class="go">Play on itch.io →</span>
      </div>
    </a>
  `).join('');

  revealCards(container);
}

function displayItchioError(container, errorMessage = 'Unknown error') {
  container.innerHTML = `
    <div class="loading">
      <p>Could not fetch games from itch.io.</p>
      <p class="mt-2">Run <code>node fetch-itch-games.js</code> to refresh, or visit
      <a class="link-underline" href="https://tboxfinn.itch.io" target="_blank">tboxfinn.itch.io →</a></p>
      <details style="font-size:0.75rem"><summary>Technical details</summary><p>${errorMessage}</p></details>
    </div>
  `;
}

// Assets destacados de la home (3 más recientes)
function renderFeaturedAssets() {
  const container = document.getElementById('featured-assets-container');
  if (!container || typeof assetsData === 'undefined') return;

  container.innerHTML = assetsData.slice(0, 3).map((asset, index) => {
    return `
      <a class="game-card reveal reveal-delay-${index}" href="${asset.link}" target="_blank" rel="noopener noreferrer">
        <div class="thumb">
          <img src="${asset.image}" alt="${asset.title} Preview" loading="lazy" onerror="this.remove(); this.parentElement.classList.add('no-img')" />
        </div>
        <div class="card-body">
          <h3>${asset.title}</h3>
          <p class="line-clamp-3">${asset.description}</p>
          <div class="stats-row">
            <span>${asset.price}</span>
            <span>${asset.rating}</span>
          </div>
          <span class="go">View on Asset Store →</span>
        </div>
      </a>`;
  }).join('');

  revealCards(container);
}

// Cargar juegos si la página los tiene
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('itch-games-container')) loadItchioGames();
  if (document.getElementById('assets-container')) renderAssets();
  if (document.getElementById('featured-assets-container')) renderFeaturedAssets();
});
