@echo off
echo ============================================================
echo    TESTING TRAINED MODEL
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

echo Model found! Starting test interface...
echo.

python test_model.py

pause
