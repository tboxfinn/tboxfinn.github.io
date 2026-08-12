#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Tu API key de itch.io — NUNCA embebida en el código (repo público).
// Orden de lectura:
//   1. Variable de entorno ITCH_API_KEY (usada por GitHub Actions con el secret)
//   2. Archivo .env local (gitignored — para correr el .bat en tu máquina)
function loadEnvKey() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const m = content.match(/^\s*ITCH_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch (e) { /* no hay .env — se usará el secret de CI o fallará */ }
  return null;
}
const API_KEY = process.env.ITCH_API_KEY || loadEnvKey();
if (process.env.ITCH_API_KEY) {
  console.log('🔑 API key leída del secret ITCH_API_KEY (CI)');
} else if (API_KEY) {
  console.log('🔑 API key leída del archivo .env local');
} else {
  console.error('❌ No se encontró ITCH_API_KEY.');
  console.error('   Local:  crea un archivo .env con: ITCH_API_KEY=tu_key');
  console.error('   GitHub: Settings → Secrets and variables → Actions → ITCH_API_KEY');
  process.exit(1);
}

// Function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Fetch games from itch.io API
async function fetchItchioGames() {
  try {
    console.log('🎮 Fetching games from itch.io...');
    
    const url = `https://itch.io/api/1/${API_KEY}/my-games`;
    const options = {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Portfolio-Game-Fetcher/1.0'
      }
    };
    
    const response = await makeRequest(url, options);
    
    if (!response.games) {
      throw new Error('No games found in API response');
    }
    
    console.log(`✅ Found ${response.games.length} games`);
    
    // Process and clean the games data
    const processedGames = response.games.map(game => ({
      id: game.id,
      title: game.title || 'Untitled Game',
      short_text: game.short_text || 'An exciting game experience.',
      url: game.url || '#',
      cover_url: game.cover_url || null,
      min_price: game.min_price || 0,
      classification: game.classification || 'Game',
      type: game.type || 'Unknown',
      published_at: game.published_at || null,
      downloads_count: game.downloads_count || 0,
      views_count: game.views_count || 0,
      published: game.published || false,
      can_be_bought: game.can_be_bought || false,
      traits: game.traits || [],
      created_at: game.created_at || null,
      updated_at: game.updated_at || null
    }));
    
    // FILTRAR SOLO JUEGOS (classification: 'game') y PUBLICADOS
    const gamesOnly = processedGames.filter(game => 
      game.classification === 'game' && game.published === true
    );
    // ORDENAR POR FECHA DE PUBLICACIÓN (más reciente primero)
    const sortedGames = gamesOnly.sort((a, b) => {
      // published_at puede ser null, usar created_at como fallback
      const dateA = new Date(a.published_at || a.created_at || 0);
      const dateB = new Date(b.published_at || b.created_at || 0);
      return dateB - dateA;
    });
    // Tomar los 6 más recientes
    const finalGames = sortedGames.slice(0, 6);
    
    console.log('� Primeros 6 juegos automáticos (solo games, orden itch.io):');
    finalGames.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title} (${game.downloads_count} downloads)`);
    });
    
    console.log(`\n📊 Total games encontrados: ${gamesOnly.length}`);
    console.log(`🎯 Mostrando los primeros: 6`);
    
    // Create output object with all games (for backup) and filtered games for display
    const output = {
      success: true,
      fetched_at: new Date().toISOString(),
      total_games: finalGames.length,
      display_games: finalGames, // Only the 6 games to show
      all_games: gamesOnly, // All games for reference
      games: finalGames // For compatibility with existing code
    };
    
    // Write to games.json
    const outputPath = path.join(__dirname, 'games.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`📁 Games data saved to: ${outputPath}`);
    console.log(`🎯 Total games processed: ${finalGames.length}`);
    
    // Display summary
    const publishedGames = finalGames.filter(g => g.published);
    const freeGames = finalGames.filter(g => g.min_price === 0);
    const paidGames = finalGames.filter(g => g.min_price > 0);
    
    console.log('\n📊 Summary:');
    console.log(`   Published games: ${publishedGames.length}`);
    console.log(`   Free games: ${freeGames.length}`);
    console.log(`   Paid games: ${paidGames.length}`);
    
    if (finalGames.length > 0) {
      console.log('\n🎮 Games found:');
      finalGames.slice(0, 5).forEach((game, index) => {
        const price = game.min_price > 0 ? `$${(game.min_price / 100).toFixed(2)}` : 'Free';
        const status = game.published ? '✅' : '⏳';
        console.log(`   ${status} ${game.title} (${price})`);
      });
      
      if (finalGames.length > 5) {
        console.log(`   ... and ${finalGames.length - 5} more`);
      }
    }
    
    console.log('\n✨ Done! You can now use games.json in your portfolio.');
    
  } catch (error) {
    console.error('❌ Error fetching games:', error.message);
    
    // Create error fallback file
    const errorOutput = {
      success: false,
      error: error.message,
      fetched_at: new Date().toISOString(),
      games: []
    };
    
    const outputPath = path.join(__dirname, 'games.json');
    fs.writeFileSync(outputPath, JSON.stringify(errorOutput, null, 2));
    
    console.log('📁 Error info saved to games.json');
    process.exit(1);
  }
}

// Create package.json if it doesn't exist
function ensurePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    const packageData = {
      "name": "portfolio-itch-fetcher",
      "version": "1.0.0",
      "description": "Fetches games from itch.io API for portfolio",
      "main": "fetch-itch-games.js",
      "scripts": {
        "fetch-games": "node fetch-itch-games.js",
        "update-games": "node fetch-itch-games.js"
      },
      "keywords": ["itch.io", "games", "portfolio"],
      "author": "Hugo Valladolid",
      "license": "MIT"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    console.log('📦 Created package.json');
  }
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting itch.io games fetcher...\n');
  ensurePackageJson();
  fetchItchioGames();
}

module.exports = { fetchItchioGames };
