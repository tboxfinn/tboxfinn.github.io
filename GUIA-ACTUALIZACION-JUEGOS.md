# 🎮 Guía para Actualizar Juegos de Itch.io - SISTEMA AUTOMÁTICO

## 🚀 Método Súper Automático (Recomendado)

### ✨ Todo es automático ahora:
1. **Doble clic** en `update-games.bat`
2. **¡Listo!** Se actualizan automáticamente con:
   - ✅ Solo juegos reales (classification: 'game')
   - ✅ En el orden exacto de tu perfil de itch.io
   - ✅ Los primeros 6 juegos automáticamente
   - ✅ Sin assets ni otros tipos de contenido

### 🎯 Para publicar un nuevo juego:
1. **Publica** tu juego en itch.io
2. **Reordena** tus juegos en tu dashboard de itch.io como quieras
3. **Doble clic** en `update-games.bat`
4. **¡Automático!** Tu nuevo juego aparece en la posición correcta

---

## 📁 Archivos importantes

- **`games.json`** - Contiene automáticamente tus 6 primeros juegos
- **`fetch-itch-games.js`** - Script inteligente que filtra y ordena
- **`update-games.bat`** - Un clic y todo se actualiza solo
- **`scripts.js`** - Muestra los juegos automáticamente en la página

---


## ⚙️ Configuración automática actual

- **Filtrado:** Solo juegos reales (classification: 'game')
- **Orden:** De último subido (más reciente primero)
- **Cantidad:** 6 juegos más recientes automáticamente
- **Actualización:** Un clic y listo
- **Información:** Título, descripción, estadísticas, imágenes, enlaces

---

## 🎯 Lo que hace automáticamente

### ✅ Filtra inteligentemente:
- Solo muestra `classification: 'game'`
- Elimina assets, otros contenidos
- Solo juegos publicados

### ✅ Orden automático por fecha:
- Muestra los juegos más recientes primero
- Ordena por fecha de publicación
- El portfolio siempre muestra lo último que publicaste

### ✅ Siempre actualizado:
- Detecta automáticamente nuevos juegos
- Se adapta a reordenamientos en itch.io
- Sin configuración manual necesaria

---

## 🆘 Solución de problemas

### Si no aparece un juego nuevo:
- Verifica que esté marcado como 'game' en itch.io
- Asegúrate de que esté publicado (no draft)
- Ejecuta `update-games.bat`

### Si el orden no es correcto:
- Ve a tu dashboard de itch.io
- Reordena tus juegos como quieras
- Ejecuta `update-games.bat`
- El portfolio reflejará el nuevo orden

### Si aparecen assets o contenido no deseado:
- El sistema ahora los filtra automáticamente
- Solo aparecerán juegos reales

---

## 📊 Información que se muestra automáticamente

Cada juego incluye:
- ✅ **Título y descripción**
- 📈 **Estadísticas reales** (descargas, vistas)
- 💰 **Precio** (Free/Paid)
- 🖼️ **Imagen de portada** desde itch.io
- 🔗 **Enlace directo** al juego
- 🎯 **Datos actualizados** cada vez que ejecutes

---

## � Flujo de trabajo súper simple

### Cuando publiques un nuevo juego:
1. 🎲 **Publica** en itch.io
2. 🔄 **Reordena** en tu dashboard
3. 🖱️ **Doble clic** en `update-games.bat`
4. 🎉 **¡Listo!** Ya está en tu portfolio

### Para cambiar qué juegos aparecen:
1. 📝 **Reordena** en itch.io (los primeros 6 aparecerán)
2. 🖱️ **Doble clic** en `update-games.bat`
3. ✨ **Automático** - sin código, sin configuración

---

## 💡 Consejos pro

1. **Mantén tus mejores juegos** en las primeras 6 posiciones en itch.io
2. **Actualiza después de publicar** para mantener el portfolio fresco
3. **El orden en itch.io** es el orden en tu portfolio
4. **Solo classification: 'game'** aparece - perfecto y limpio

---

## 🚀 Comandos rápidos

```bash
# Actualizar automáticamente (recomendado)
# Doble clic en: update-games.bat

# Manual desde terminal
& "C:\Program Files\nodejs\node.exe" fetch-itch-games.js

# Verificar que Node.js funciona
node --version
```

---

¡Sistema completamente automático! 🎯 Publica, reordena, un clic y listo. Tu portfolio siempre estará actualizado con tus mejores juegos en el orden perfecto.
