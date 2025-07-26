@echo off
echo Updating games automatically from itch.io...
echo Automated system: Only real games, sorted by latest upload
echo.

REM Change to portfolio directory
cd /d "X:\Documentos\GitHub\tboxfinn.github.io"

REM Run Node.js script
echo Fetching the 6 most recently uploaded games...
node fetch-itch-games.js

REM Check if the file was created
if exist games.json (
    echo.
    echo Games updated automatically!
    echo games.json file updated
    echo Showing your 6 most recent games (only classification: 'game')
    echo Sorted by publish date (newest first)
    echo Your portfolio is ready with the latest games
    echo.
    echo Every time you publish a new game on itch.io,
    echo    just run this file to update automatically
) else (
    echo.
    echo Error: games.json could not be created
    echo Check your internet connection and API key
)

echo.
echo Fully automated system configured: you will always see your latest releases
pause
