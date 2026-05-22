// Tabs for Other Projects (Itch.io / Playstore)
document.addEventListener('DOMContentLoaded', function () {
  var tabItchio = document.getElementById('tab-itchio');
  var tabPlaystore = document.getElementById('tab-playstore');
  var sectionItchio = document.getElementById('section-itchio');
  var sectionPlaystore = document.getElementById('section-playstore');
  if (tabItchio && tabPlaystore && sectionItchio && sectionPlaystore) {
    // Set initial state
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
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const hamburger = document.querySelector('.hamburger');

  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

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

  // Event listeners
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking on a link
  if (mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Navigation scroll effect
  window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 100) {
        nav.classList.add('shadow-sm');
      } else {
        nav.classList.remove('shadow-sm');
      }
    }
  });

  // Scroll animations
  function handleScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-up');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }

  // Run scroll animations on scroll and load
  window.addEventListener('scroll', handleScrollAnimations);
  window.addEventListener('load', handleScrollAnimations);
  
  // Run initially
  handleScrollAnimations();

  // Dark mode functionality
  function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const body = document.body;
    
    // Icons
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const mobileSunIcon = document.getElementById('mobile-sun-icon');
    const mobileMoonIcon = document.getElementById('mobile-moon-icon');
    const themeText = document.getElementById('theme-text');
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
    
    function enableDarkMode() {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      
      // Update icons
      if (sunIcon && moonIcon) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
      
      if (mobileSunIcon && mobileMoonIcon) {
        mobileSunIcon.classList.add('hidden');
        mobileMoonIcon.classList.remove('hidden');
      }
      
      if (themeText) {
        themeText.textContent = 'Dark Mode';
      }
    }
    
    function enableLightMode() {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      
      // Update icons
      if (sunIcon && moonIcon) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
      
      if (mobileSunIcon && mobileMoonIcon) {
        mobileSunIcon.classList.remove('hidden');
        mobileMoonIcon.classList.add('hidden');
      }
      
      if (themeText) {
        themeText.textContent = 'Light Mode';
      }
    }
    
    function toggleTheme() {
      if (body.classList.contains('dark-mode')) {
        enableLightMode();
      } else {
        enableDarkMode();
      }
    }
    
    // Event listeners
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          enableDarkMode();
        } else {
          enableLightMode();
        }
      }
    });
  }
  
  // Initialize theme toggle
  initThemeToggle();

  // Initialize itch.io games if on projects page
  if (document.getElementById('itch-games-container')) {
    loadItchioGames();
  }

  // Render Assets dynamically if on assets page
  if (document.getElementById('assets-container') && typeof assetsData !== 'undefined') {
    renderAssets();
  }
});

// Render Dynamic Assets
function renderAssets() {
  const container = document.getElementById('assets-container');
  if (!container) return;
  
  let html = '';
  assetsData.forEach((asset, index) => {
    const delay = index > 0 ? `scroll-delay-${index > 4 ? 4 : index}` : '';
    
    let tagsHtml = asset.tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">${tag}</span>`).join('');

    html += `
      <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 scroll-scale-up ${delay}">
        <div class="bg-gray-100 aspect-video">
          <img src="${asset.image}" alt="${asset.title} Preview" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">${asset.title}</h3>
          <p class="text-gray-600 mb-4 text-sm">${asset.description}</p>
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-bold text-green-600">${asset.price}</span>
            <div class="flex items-center">
              <span class="text-yellow-400">${asset.rating}</span>
              <span class="text-sm text-gray-500 ml-1">(${asset.reviews})</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-1 mb-4">
            ${tagsHtml}
          </div>
          <a href="${asset.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-medium text-sm hover:underline">View on Asset Store →</a>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  setTimeout(() => {
    const event = new Event('scroll');
    window.dispatchEvent(event);
  }, 100);
}

// Itch.io Games Integration using games.json
async function loadItchioGames() {
  const container = document.getElementById('itch-games-container');
  
  try {
    console.log('🎮 Loading games from games.json...');
    
    // Fetch from the generated games.json file
    const response = await fetch('games.json?' + Date.now()); // Add timestamp to prevent caching
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load games.json`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Games data indicates an error');
    }
    
    console.log(`✅ Loaded ${data.total_games} games from itch.io`);
    displayItchioGames(data.games, container);
    
  } catch (error) {
    console.error('❌ Error loading games:', error.message);
    
    // Fallback to manual data if games.json fails
    console.log('🔄 Falling back to manual games data...');
    try {
      const fallbackGames = await getItchioGamesData();
      displayItchioGames(fallbackGames, container);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      displayItchioError(container, error.message);
    }
  }
}

// Manual games data - Add your real games here
async function getItchioGamesData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 🎮 TUS JUEGOS AQUÍ - Reemplaza con la información real de tus juegos
  return [
    {
      title: "Tu Juego 1",
      short_text: "Descripción corta de tu primer juego. Explica brevemente de qué trata.",
      url: "https://tboxfinn.itch.io/tu-juego-1",
      cover_url: "URL_DE_LA_IMAGEN_DEL_JUEGO", // O null si no tienes imagen
      min_price: 0, // Precio en centavos (0 = gratis, 500 = $5.00)
      classification: "Game",
      type: "Género del juego", // Ej: "Platformer", "Puzzle", "RPG"
      downloads_count: 100, // Número de descargas
      views_count: 500, // Número de vistas
      published: true
    },
    {
      title: "Tu Juego 2",
      short_text: "Descripción de tu segundo juego.",
      url: "https://tboxfinn.itch.io/tu-juego-2",
      cover_url: null,
      min_price: 300, // $3.00
      classification: "Game",
      type: "Género del juego",
      downloads_count: 50,
      views_count: 200,
      published: true
    }
    // Agrega más juegos copiando el formato anterior
  ];
}

function displayItchioGames(games, container) {
  if (!games || games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-600">No published games found on itch.io</p>
        <a href="https://tboxfinn.itch.io" target="_blank" class="inline-block mt-2 text-purple-600 hover:underline">
          Visit my itch.io profile →
        </a>
      </div>
    `;
    return;
  }

  const gamesHTML = games.slice(0, 6).map((game, index) => `
    <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 scroll-scale-up itch-game-card" style="animation-delay: ${index * 0.1}s;">
      <div class="bg-gray-100 aspect-video overflow-hidden">
        ${game.cover_url ? 
          `<img src="${game.cover_url}" alt="${game.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">` :
          `<div class="w-full h-full bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl mb-2">🎮</div>
              <span class="text-gray-700 font-medium">${game.title}</span>
            </div>
          </div>`
        }
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold mb-2 line-clamp-1">${game.title}</h3>
        <p class="text-gray-600 mb-4 text-sm line-clamp-3">
          ${game.short_text || 'An exciting game created with passion and dedication.'}
        </p>
        
        <!-- Stats row -->
        ${(game.downloads_count || game.views_count) ? `
        <div class="flex items-center gap-4 mb-3 text-xs text-gray-500">
          ${game.downloads_count ? `
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>${game.downloads_count.toLocaleString()}</span>
          </div>
          ` : ''}
          ${game.views_count ? `
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span>${game.views_count.toLocaleString()}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-4">
          <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">itch.io</span>
          ${game.classification ? `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${game.classification}</span>` : ''}
          ${game.type ? `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">${game.type}</span>` : ''}
        </div>
        
        <!-- Bottom row -->
        <div class="flex items-center justify-between">
          <a href="${game.url}" target="_blank" rel="noopener noreferrer" class="text-purple-600 font-medium text-sm hover:underline flex items-center group">
            Play on itch.io
            <svg class="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
          ${game.min_price > 0 ? 
            `<span class="text-sm text-gray-500 font-medium">$${(game.min_price / 100).toFixed(2)}</span>` : 
            `<span class="text-sm text-green-600 font-medium">Free</span>`
          }
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = gamesHTML;
}

function displayItchioError(container, errorMessage = 'Unknown error') {
  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="text-red-500 mb-4">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Unable to load games</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Could not fetch games from itch.io
      </p>
      <details class="text-sm text-gray-500 mb-4">
        <summary class="cursor-pointer hover:text-gray-700">Technical details</summary>
        <p class="mt-2 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">${errorMessage}</p>
      </details>
      <div class="space-y-2">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          To fix this, run: <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">node fetch-itch-games.js</code>
        </p>
        <p class="text-sm text-gray-500">
          Or visit my profile directly at 
          <a href="https://tboxfinn.itch.io" target="_blank" class="text-purple-600 hover:underline font-medium">
            tboxfinn.itch.io →
          </a>
        </p>
      </div>
    </div>
  `;
}
