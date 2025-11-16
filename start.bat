@echo off
echo ========================================
echo    RescueLena - Starting Application
echo ========================================
echo.

echo Starting Backend...
start "RescueLena Backend" cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "RescueLena Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to exit...
pause >nul
