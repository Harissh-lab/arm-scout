@echo off
echo ============================================================
echo    STARTING DETECTION API SERVER
echo ============================================================
echo.

if not exist "hazard-detection\road-hazards-v1\weights\best.pt" (
    echo ERROR: Trained model not found!
    echo.
    echo Please train the model first:
    echo   Run: train.bat
    echo.
    pause
    exit /b 1
)

echo Starting API server at http://localhost:5000
echo.
echo API Endpoints:
echo   POST /api/detect        - Detect in uploaded image
echo   POST /api/detect/stream - Detect from camera
echo   GET  /api/health        - Health check
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

python detection_api.py

pause
