@echo off
echo ============================================================
echo    STARTING AI MODEL TRAINING
echo ============================================================
echo.

if not exist "dataset\train\images\" (
    echo ERROR: Dataset folder not found!
    echo.
    echo Please run setup.bat first and add your dataset.
    echo See TRAIN_HERE.md for instructions.
    echo.
    pause
    exit /b 1
)

echo Checking for training data...
dir /b dataset\train\images\*.* >nul 2>&1
if errorlevel 1 (
    echo ERROR: No images found in dataset\train\images\
    echo.
    echo Please add your training images to the dataset folder.
    echo See dataset\README.md for structure.
    echo.
    pause
    exit /b 1
)

echo Dataset found! Starting training...
echo.
echo This may take a while depending on:
echo   - Dataset size
echo   - Number of epochs (default: 100)
echo   - Your computer hardware (CPU/GPU)
echo.
echo Training will save results to: hazard-detection\road-hazards-v1\
echo.
echo Press Ctrl+C to stop training at any time.
echo.
echo ============================================================
echo.

python train.py

echo.
echo ============================================================
echo    TRAINING FINISHED
echo ============================================================
echo.
echo Check results in: hazard-detection\road-hazards-v1\
echo Trained model: hazard-detection\road-hazards-v1\weights\best.pt
echo.
echo Next steps:
echo   1. Test model: test.bat
echo   2. Start API: api.bat
echo   3. Deploy to Pi: Copy best.pt to Raspberry Pi
echo.

pause
