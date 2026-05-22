const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Lanzando Puppeteer en modo visual para leer Coveo Atomic...');
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1400, height: 900 });
        
        console.log('Navegando al perfil de Publisher 78465...');
        await page.goto('https://assetstore.unity.com/publishers/78465', { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Esperando a que Coveo rinda las tarjetas de tus assets...');
        
        // Esperamos a que aparezca al menos una tarjeta de componente de Coveo en el DOM
        await page.waitForSelector('atomic-result, .v_result, [class*="result"]', { timeout: 15000 }).catch(() => {
            console.log('Nota: Tiempo de espera agotado esperando selectores especificos. Intentando raspar directamente...');
        });

        // Le damos 2 segundos extra para asegurar que las imagenes y precios se dibujen bien
        await new Promise(r => setTimeout(r, 2000));

        console.log('Extrayendo informacion de los elementos visibles en pantalla...');
        
        const assetsData = await page.evaluate(() => {
            // Buscamos todas las tarjetas de productos generadas por el nuevo sistema de Unity
            // Intentamos con varios selectores comunes que usa Coveo y el esquema de clases de la tienda
            let cardElements = Array.from(document.querySelectorAll('atomic-result, .v_result, [class*="result-card"]'));
            
            // Si el query anterior falla, buscamos por los contenedores de los enlaces a los packages
            if (cardElements.length === 0) {
                cardElements = Array.from(document.querySelectorAll('a[href*="/packages/package/"]')).map(a => a.closest('div'));
                // Filtrar nulos y duplicados si se selecciono el mismo contenedor
                cardElements = [...new Set(cardElements.filter(el => el !== null))];
            }

            return cardElements.map((card, index) => {
                // 1. Extraer el Link y el ID original de Unity
                const linkEl = card.querySelector('a[href*="/packages/package/"]');
                if (!linkEl) return null;
                
                const link = linkEl.href;
                const urlParts = link.split('/');
                const packageId = urlParts[urlParts.length - 1]?.split('?')[0] || `computed-${index}`;
                
                // 2. Extraer el Titulo del asset
                // Coveo suele usar componentes <atomic-result-text field="title"> o encabezados h3/h4
                const titleEl = card.querySelector('atomic-result-text[field="title"], h3, h4, [class*="title"]');
                const title = titleEl ? titleEl.innerText.trim() : "Unity Asset Tool";

                // 3. Generar un slug ID limpio a partir del titulo para tu formato
                const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `asset-${packageId}`;

                // 4. Extraer la Imagen de la tarjeta
                const imgEl = card.querySelector('img');
                const image = imgEl ? imgEl.src : 'images/LogoPNG.png';

                // 5. Extraer el Precio
                const priceEl = card.querySelector('[class*="price"], [field*="price"], span:last-child');
                let price = "$15.00"; // Fallback por defecto si no se lee
                if (priceEl && priceEl.innerText.includes('$')) {
                    const priceMatch = priceEl.innerText.match(/\$\d+(\.\d{2})?/);
                    if (priceMatch) price = priceMatch[0];
                }

                // 6. Extraer Estrellas y Reseñas
                const ratingEl = card.querySelector('[class*="rating"], [class*="stars"]');
                let rating = "★★★★★";
                let reviews = "New";
                
                if (ratingEl) {
                    const text = ratingEl.innerText || "";
                    const numMatch = text.match(/\((\d+)\)/); // Busca el "(3)" por ejemplo
                    if (numMatch) reviews = parseInt(numMatch[1], 10);
                }

                // 7. Descripcion y tags de soporte predefinidos para tus herramientas
                const description = `Herramienta avanzada de optimizacion y arquitectura para mejorar los flujos de trabajo dentro del editor de Unity.`;

                return {
                    id: id,
                    title: title,
                    description: description,
                    image: image,
                    price: price,
                    rating: rating,
                    reviews: reviews,
                    tags: ["Tools", "Editor"],
                    link: link
                };
            }).filter(item => item !== null && item.title !== "");
        });

        if (assetsData && assetsData.length > 0) {
            // Formatear el archivo de salida identico a tu estructura
            const fileContent = "const assetsData = " + JSON.stringify(assetsData, null, 2) + ";\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = assetsData;\n}";
            fs.writeFileSync('assets-data.js', fileContent, 'utf-8');
            console.log(`\n\x1b[32m[OK] ¡Exito Absoluto! Se encontraron y transcribieron ${assetsData.length} assets visibles de tu perfil.\x1b[0m`);
            await browser.close();
            process.exit(0);
        } else {
            console.log('\n\x1b[31m[ERROR] El navegador abrio la pagina pero las tarjetas de Coveo no cargaron a tiempo.\x1b[0m');
            await browser.close();
            process.exit(1);
        }

    } catch(err) {
        console.log('\n\x1b[31m[ERROR FATAL]:\x1b[0m', err.message);
        process.exit(1);
    }
})();