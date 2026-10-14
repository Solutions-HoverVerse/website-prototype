@echo off
title Hoververse Executive Studio
echo ========================================================
echo   Launching Hoververse Executive Studio (NL CMS)
echo ========================================================
echo.
echo Starting local agent server on http://localhost:3000 ...
start http://localhost:3000
node studio\server.js
pause
