# 🏯 Modelo 3D del portfolio (prototype.html)

El prototipo busca automáticamente tu modelo aquí. Coloca el archivo con uno de estos nombres:

| Archivo | Formato | Recomendado |
|---|---|---|
| `tenshu.glb` | GLB (binario, texturas embebidas) | ✅ Mejor opción |
| `tower.glb` | GLB | ✅ |
| `tenshu.gltf` | glTF (texturas aparte) | ✅ |
| `tenshu.obj` | OBJ (sin texturas) | ⚠️ Básico |

## Reglas

- **Un solo archivo** — si tu modelo usa texturas aparte, usa GLB (las incluye) o sube también las imágenes junto al `.gltf`.
- **Orientación**: la torre debe estar **de pie** (eje Y hacia arriba). El prototipo la escala automáticamente a ~18 unidades de alto y la centra, así que el tamaño original no importa.
- **Base en el suelo**: idealmente el punto más bajo del modelo debe ser su base (el prototipo la reacomoda a y=0 de todos modos).

## Cómo probar

El modelo solo carga con servidor estático (Chrome bloquea fetch local con `file://`):

```bash
python -m http.server 4173
# abre http://localhost:4173/prototype.html
```

## Cómo exportar desde tu herramienta

- **Blender**: File → Export → `glTF 2.0 (.glb)` — marcar "Z up" si preguntara.
- **Unity**: `Assets > Export > glTF` (con el paquete glTF exporter de Khronos).
- **Roblox Studio**: no exporta glTF nativamente; usa un exportador externo o Blender como intermediario.
