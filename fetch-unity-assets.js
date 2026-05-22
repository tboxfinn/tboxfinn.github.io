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
                    // Evita caídas por llamadas de red secundarias
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

        const formattedAssets = packages.map(asset => {
            // Capa de seguridad para acceder a los metadatos indexados por Coveo
            const r = asset.raw || {};
            
            // 1. Obtener el Título
            const title = asset.title || r.title || "Unity Asset";
            
            // Generar un slug ID limpio a partir del titulo para tus estilos locales
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // 2. Extraer y limpiar descripción
            const rawDesc = r.description || asset.excerpt || r.excerpt || "Herramienta avanzada para Unity.";
            const cleanDescription = rawDesc.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';

            // 3. SOLUCIÓN IMAGEN: Propiedades exactas de la CDN de imágenes de la Asset Store en Coveo
            let image = 'images/LogoPNG.png';
            if (r.tp_image_url) image = r.tp_image_url;
            else if (r.sysimageurl) image = r.sysimageurl;
            else if (r.thumbnail_url) image = r.thumbnail_url;
            else if (r.key_image_url) image = r.key_image_url;

            // 4. SOLUCIÓN PRECIO: Mapear los campos comerciales reales del índice
            let price = "$0.00";
            if (r.ec_price_formatted) {
                price = r.ec_price_formatted;
            } else if (r.ec_price) {
                price = typeof r.ec_price === 'number' ? `$${r.ec_price.toFixed(2)}` : r.ec_price;
            } else if (r.price_display) {
                price = r.price_display;
            } else if (r.price_label) {
                price = r.price_label;
            } else if (r.price_amount) {
                price = `$${r.price_amount}`;
            }

            // 5. SOLUCIÓN ESTRELLAS Y RESEÑAS: Campos numéricos de calificación de la tienda
            const ratingAvg = parseFloat(r.tp_rating_average || r.rating_average || r.rating || 5);
            const ratingValue = Math.round(ratingAvg);
            const stars = "★".repeat(ratingValue) + "☆".repeat(5 - ratingValue);
            
            const reviewsCount = parseInt(r.tp_rating_count || r.rating_count || r.reviews_count || 0, 10);
            const reviews = reviewsCount > 0 ? reviewsCount : "New";

            // 6. Tags de Categoría dinámicos
            const tags = [];
            if (r.tp_category_name) tags.push(r.tp_category_name);
            if (r.category_name) tags.push(r.category_name);
            tags.push("Tools"); // Tag de respaldo

            // 7. Enlace directo estético y limpio
            let link = asset.clickUri || r.clickuri || asset.uri || `https://assetstore.unity.com/packages/package/${asset.id || r.id}`;
            if (link.includes('?')) {
                link = link.split('?')[0]; // Cortamos los parámetros de tracking analítico de Coveo
            }

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

        // Escribir y sobreescribir el archivo assets-data.js de forma automatizada
        const fileContent = "const assetsData = " + JSON.stringify(formattedAssets, null, 2) + ";\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = assetsData;\n}";
        fs.writeFileSync('assets-data.js', fileContent, 'utf-8');
        
        console.log(`\n\x1b[32m[OK] ¡Sincronización Completa! Mapeados ${formattedAssets.length} assets en tu assets-data.js con datos reales de la CDN.\x1b[0m`);
        process.exit(0);

    } catch (err) {
        console.log('\n\x1b[31m[ERROR FATAL]:\x1b[0m', err.message);
        process.exit(1);
    }
})();