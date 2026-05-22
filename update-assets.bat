@echo off
echo Comprobando dependencias...
if not exist "node_modules\puppeteer" (
    echo Instalando Puppeteer para entorno de navegador oculto...
    npm install puppeteer
)

echo Actualizando assets automaticamente desde la Unity Asset Store...
echo Sistema automatizado: Filtrando tus herramientas y paquetes de Unity
echo.

cd /d "%~dp0"

echo Buscando tus assets publicados...
node fetch-unity-assets.js

REM Si el script de Node devuelve un código de error (exit 1), saltamos al error
if errorlevel 1 goto error

echo.
echo ¡Assets actualizados automaticamente!
echo El archivo assets-data.js ha sido actualizado con exito.
echo Tu portafolio ya cuenta con los ultimos lanzamientos de la Asset Store.
goto end

:error
echo.
echo [ERROR] No se pudo actualizar el archivo assets-data.js
echo Por favor, verifica que tu ID de Publisher sea el correcto y tengas conexion a internet.
echo.

:end
echo Sistema configurado. Presiona cualquier tecla para salir.
pause