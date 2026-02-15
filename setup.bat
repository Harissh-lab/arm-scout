@echo off
echo ============================================================
echo    HAZARD SCOUT - AI MODEL TRAINING SETUP
echo ============================================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)
python --version
echo.

echo ============================================================
echo    INSTALLING DEPENDENCIES
echo ============================================================
echo.
echo This will install:
echo   - PyTorch (CPU version)
echo   - Ultralytics YOLO
echo   - OpenCV
echo   - Flask API server
echo.

set /p install="Install dependencies? (y/n): "
if /i "%install%"=="y" (
    echo.
    echo Installing PyTorch and dependencies...
    pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip install opencv-python flask flask-cors numpy pillow
    echo.
    echo ============================================================
    echo Installation complete!
    echo ============================================================
) else (
    echo Skipping installation...
)

echo.
echo ============================================================
echo    DATASET CHECK
echo ============================================================
echo.

if not exist "dataset\" (
    echo Creating dataset folder...
    mkdir dataset\train\images
    mkdir dataset\train\labels
    mkdir dataset\val\images
    mkdir dataset\val\labels
    echo.
    echo Created dataset folders!
    echo.
    echo NEXT STEPS:
    echo 1. Copy your training images to: dataset\train\images\
    echo 2. Copy your validation images to: dataset\val\images\
    echo 3. Copy corresponding labels to dataset\train\labels\ and dataset\val\labels\
    echo 4. Run: train.bat
    echo.
) else (
    echo Dataset folder found!
    
    if exist "dataset\train\images\*.*" (
        for /f %%i in ('dir /b dataset\train\images\* 2^>nul ^| find /c /v ""') do set train_count=%%i
        echo   Training images: %train_count%
    ) else (
        echo   Training images: 0 (folder empty)
    )
    
    if exist "dataset\val\images\*.*" (
        for /f %%i in ('dir /b dataset\val\images\* 2^>nul ^| find /c /v ""') do set val_count=%%i
        echo   Validation images: %val_count%
    ) else (
        echo   Validation images: 0 (folder empty)
    )
)

echo.
echo ============================================================
echo    SETUP COMPLETE!
echo ============================================================
echo.
echo To start training:
echo   1. Make sure dataset is ready (see TRAIN_HERE.md)
echo   2. Run: train.bat
echo.
echo To test trained model:
echo   - Run: test.bat
echo.
echo To start detection API:
echo   - Run: api.bat
echo.

pause
