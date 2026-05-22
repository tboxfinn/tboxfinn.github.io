const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Lanzando Puppeteer en modo escucha de red...');
    let rawJsonData = null;

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1400, height: 900 });

        // Interceptar ráfaga de red de Coveo
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('coveo.com/rest/search/v2') || url.includes('assetstore.unity.com/api/en-US/search')) {
                try {
                    if (response.status() === 200) {
                        const text = await response.text();
                        rawJsonData = JSON.parse(text);
                        console.log('¡[OK] Peticion de datos de Coveo interceptada con exito!');
                    }
                } catch (e) {
                    // Evita caídas por llamadas secundarias
                }
            }
        });

        console.log('Navegando al perfil de Publisher 78465 (capturando red)...');
        await page.goto('https://assetstore.unity.com/publishers/78465', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Esperando transmisiones de la base de datos de Unity...');
        await new Promise(r => setTimeout(r, 8000));
        await browser.close();

        if (!rawJsonData || (!rawJsonData.results && !rawJsonData.hits)) {
            console.log('\n\x1b[31m[ERROR] No se pudo capturar la rafaga de red de Coveo.\x1b[0m');
            process.exit(1);
        }

        const packages = rawJsonData.results || rawJsonData.hits || [];
        console.log(`Procesando ${packages.length} productos encontrados en la red...`);

        const formattedAssets = packages.map((asset, index) => {
            const r = asset.raw || {};
            
            // 1. Título
            const title = asset.title || r.title || "Unity Asset";
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // 2. Descripción
            const rawDesc = r.description || asset.excerpt || r.excerpt || "Herramienta avanzada para Unity.";
            const cleanDescription = rawDesc.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';

            // =========================================================================
            // EL CAZADOR DE IMÁGENES: Extracción a la fuerza
            // =========================================================================
            let image = 'images/LogoPNG.png'; // Fallback
            
            // Intento 1: Variables clásicas que usa Unity
            const possibleKeys = ['tp_thumbnail_url', 'sysimageurl', 'key_image_url', 'thumbnail_url', 'tp_image_url', 'ec_thumbnails'];
            for (const key of possibleKeys) {
                if (r[key]) {
                    // Si es un arreglo (Unity a veces manda arreglos de imagenes), tomamos la primera
                    image = Array.isArray(r[key]) ? r[key][0] : r[key];
                    break;
                }
            }

            // Intento 2: Si el intento 1 fallo y seguimos con el logo, buscamos CUALQUIER URL en los datos
            if (image === 'images/LogoPNG.png') {
                const flatString = JSON.stringify(asset);
                // Expresión regular que busca cualquier enlace de la CDN de Asset Store o archivos de imagen
                const match = flatString.match(/(https?:)?\/\/[^"']*(assetstorev1-prd-cdn|cdn\.assetstore)[^"']*/i) || 
                              flatString.match(/(https?:)?\/\/[^"']*\.(jpg|jpeg|png|webp)/i);
                
                if (match && match[0]) {
                    image = match[0];
                }
            }

            // Corrección final de seguridad: Si la CDN omitió el "https:", se lo ponemos
            if (image.startsWith('//')) {
                image = 'https:' + image;
            }
            // =========================================================================

            // 4. Precio (Ya validado que funciona)
            let price = "$0.00";
            if (r.ec_price_formatted) price = r.ec_price_formatted;
            else if (r.ec_price) price = typeof r.ec_price === 'number' ? `$${r.ec_price.toFixed(2)}` : r.ec_price;
            else if (r.price_display) price = r.price_display;
            else if (r.price_amount) price = `$${r.price_amount}`;

            // 5. Estrellas y Reseñas
            const ratingAvg = parseFloat(r.tp_rating_average || r.rating_average || r.rating || 5);
            const ratingValue = Math.round(ratingAvg);
            const stars = "★".repeat(ratingValue) + "☆".repeat(5 - ratingValue);
            
            const reviewsCount = parseInt(r.tp_rating_count || r.rating_count || r.reviews_count || 0, 10);
            const reviews = reviewsCount > 0 ? reviewsCount : "New";

            // 6. Tags
            const tags = [];
            if (r.tp_category_name) tags.push(r.tp_category_name);
            else if (r.category_name) tags.push(r.category_name);
            tags.push("Tools");

            // 7. Enlace
            let link = asset.clickUri || r.clickuri || asset.uri || `https://assetstore.unity.com/packages/package/${asset.id || r.id}`;
            if (link.includes('?')) link = link.split('?')[0];

            return {
                id: id,
                title: title,
                description: cleanDescription,
                image: image,
                price: price,
                rating: stars,
                reviews: reviews,
                tags: [...new Set(tags)].slice(0, 2),
                link: link
            };
        });

        // Guardado de archivo
        const fileContent = "const assetsData = " + JSON.stringify(formattedAssets, null, 2) + ";\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = assetsData;\n}";
        fs.writeFileSync('assets-data.js', fileContent, 'utf-8');
        
        console.log(`\n\x1b[32m[OK] ¡Sincronizacion Completa! Mapeados ${formattedAssets.length} assets con imagenes reales.\x1b[0m`);
        process.exit(0);

    } catch (err) {
        console.log('\n\x1b[31m[ERROR FATAL]:\x1b[0m', err.message);
        process.exit(1);
    }
})();