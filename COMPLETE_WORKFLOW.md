# 🎯 COMPLETE WORKFLOW - Train AI Here, Deploy to Pi

Complete step-by-step guide for training on Windows and deploying to Raspberry Pi.

---

## 📋 Overview

```
Your Windows PC          →         Raspberry Pi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Train AI model        →    4. Pull trained model
2. Test model locally    →    5. Run detection API
3. Push to Git           →    6. Stream camera feed
                         →    7. Detect hazards live!
```

---

## 🖥️ PART 1: Train on Your Windows PC

### Step 1: Install Dependencies

**Double-click:** `setup.bat`

Or manually:
```powershell
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install opencv-python flask flask-cors numpy pillow
```

### Step 2: Prepare Dataset

Your dataset should be in YOLO format. Create this structure:

```
dataset/
├── train/
│   ├── images/
│   │   ├── road_001.jpg
│   │   ├── road_002.jpg
│   │   └── ... (80% of your images)
│   └── labels/
│       ├── road_001.txt
│       ├── road_002.txt
│       └── ... (matching .txt files)
├── val/
│   ├── images/
│   │   └── ... (20% of your images)
│   └── labels/
│       └── ... (matching .txt files)
```

**Label format** (YOLO .txt):
```
class_id center_x center_y width height
```

**Classes:**
- 0 = debris
- 1 = pothole
- 2 = roadblock
- 3 = accident
- 4 = flood
- 5 = construction

All values normalized 0-1.

### Step 3: Train Model

**Double-click:** `train.bat`

Or manually:
```powershell
python train.py
```

**What happens:**
- Downloads YOLOv8n pretrained model (~6 MB)
- Trains on your dataset
- Saves to `hazard-detection/road-hazards-v1/weights/best.pt`
- Generates training metrics and graphs

**Estimated time:**
- 500 images: 30-60 min (CPU) / 10-15 min (GPU)
- 2000 images: 2-4 hours (CPU) / 30-60 min (GPU)

### Step 4: Test Model

**Double-click:** `test.bat`

Or manually:
```powershell
python test_model.py
```

**Testing options:**
1. Single image - Test on one photo
2. Folder - Test on multiple photos
3. Webcam - Live detection from your camera

### Step 5: Verify Results

Check training results:
```
hazard-detection/road-hazards-v1/
├── weights/
│   ├── best.pt       ⭐ YOUR TRAINED MODEL
│   └── last.pt
├── results.png       📈 Training graphs
├── confusion_matrix.png
└── ...
```

**Good model indicators:**
- Loss decreasing over epochs
- mAP (mean Average Precision) > 0.7
- Confusion matrix shows good classification

---

## 🚀 PART 2: Deploy to Raspberry Pi

### Option A: Via Git (Recommended)

**On your PC:**
```powershell
git add .
git commit -m "Added trained hazard detection model"
git push origin main
```

**On Raspberry Pi:**
```bash
git pull origin main
```

### Option B: Direct Copy

**From your PC:**
```powershell
# Copy model file to Pi
scp hazard-detection/road-hazards-v1/weights/best.pt pi@raspberrypi.local:~/hazard-scout/

# Or copy entire project
scp -r "Hazard Scout Prototype Design (Copy)" pi@raspberrypi.local:~/
```

---

## 🍓 PART 3: Setup Raspberry Pi

### Step 1: Install Dependencies on Pi

```bash
# On Raspberry Pi
ssh pi@raspberrypi.local

# Navigate to project
cd ~/hazard-scout/

# Install Python dependencies
pip3 install ultralytics torch torchvision opencv-python flask flask-cors

# Install Motion (for camera streaming)
sudo apt-get update
sudo apt-get install motion

# Install Node.js dependencies (for web app)
npm install
```

### Step 2: Configure Motion (Camera Stream)

```bash
sudo nano /etc/motion/motion.conf
```

**Key settings:**
```conf
daemon on
stream_port 8080
stream_localhost off
stream_auth_method 0
webcontrol_localhost off
framerate 15
width 640
height 480
```

**Start Motion:**
```bash
sudo systemctl enable motion
sudo systemctl start motion

# Verify camera stream
curl http://localhost:8080
```

### Step 3: Run Detection API

```bash
python3 detection_api.py
```

Should see:
```
✅ Model loaded successfully!
🌐 Server running at: http://localhost:5000
```

### Step 4: Run Web App

```bash
# In another terminal
npm run dev
```

App runs at: `http://localhost:3000`

---

## 📱 PART 4: Configure App

### On Web App:

1. Open `http://[PI-IP]:3000` in browser
2. Navigate to **Safety Scout** tab
3. Click **Settings** (gear icon)
4. Configure Pi Camera:
   - **Camera Stream URL**: `http://[PI-IP]:8080`
   - **API Endpoint**: `http://[PI-IP]:5000/api`
5. Click **Save Camera Settings**

### Test Detection:

1. Grant GPS permission when prompted
2. Toggle **Camera Detection** ON
3. You should see:
   - ✅ Live camera feed
   - ✅ Speed display
   - ✅ GPS coordinates
   - ✅ Real-time hazard detection!

---

## 🔄 Complete Workflow Commands

### On Your Windows PC:

```powershell
# 1. Setup and install
setup.bat

# 2. Add your dataset to dataset/ folder

# 3. Train model
train.bat

# 4. Test model
test.bat

# 5. Push to Git
git add .
git commit -m "Trained hazard detection model"
git push
```

### On Raspberry Pi:

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
pip3 install ultralytics torch torchvision opencv-python flask flask-cors
npm install

# 3. Start camera stream
sudo systemctl start motion

# 4. Terminal 1: Run detection API
python3 detection_api.py

# 5. Terminal 2: Run web app
npm run dev
```

### Configure in Browser:

1. Open `http://[PI-IP]:3000`
2. Settings → Configure camera URLs
3. Toggle Camera Detection ON
4. ✅ Done!

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  WINDOWS PC (Training)                          │
│  ├── Dataset (your images)                      │
│  ├── train.py → Trained model (best.pt)         │
│  └── Push to Git                                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  RASPBERRY PI (Deployment)                      │
│  ├── Motion Server (port 8080) → Camera Stream  │
│  ├── Detection API (port 5000) → AI Detection   │
│  └── Web App (port 3000) → User Interface       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  USER BROWSER                                   │
│  ├── Live camera feed                           │
│  ├── Real-time hazard detection                 │
│  ├── GPS tracking                               │
│  └── Proximity alerts                           │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Expected Performance

### Model Accuracy (after good training):
- Debris: 85-95%
- Pothole: 80-90%
- Roadblock: 90-95%

### Inference Speed:
- Raspberry Pi 4: 100-200ms per frame
- With optimization: 50-100ms

### Web App:
- Real-time GPS tracking
- 500m proximity alerts
- Instant notifications

---

## 🐛 Troubleshooting

### Windows Training Issues:

**"Out of memory"**
```python
# Edit train.py, reduce batch size
'batch': 4,  # Instead of 16
```

**"No images found"**
- Check dataset/train/images/ has your images
- Check dataset/val/images/ has validation images

**"CUDA not available" (GPU not detected)**
- This is normal if you don't have NVIDIA GPU
- Training will use CPU (slower but works)

### Raspberry Pi Issues:

**Camera stream not working**
```bash
# Check Motion status
sudo systemctl status motion

# Check camera connection
vcgencmd get_camera

# Expected: supported=1 detected=1
```

**API not starting**
```bash
# Check if model exists
ls -la hazard-detection/road-hazards-v1/weights/best.pt

# Check Python packages
pip3 list | grep ultralytics
```

**App not loading**
```bash
# Check if Node.js installed
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## ✅ Success Checklist

### Windows PC:
- [ ] Dependencies installed (`setup.bat`)
- [ ] Dataset prepared (images + labels)
- [ ] Model trained successfully (`train.bat`)
- [ ] Model tested (`test.bat`)
- [ ] Results look good (check confusion matrix)
- [ ] Pushed to Git

### Raspberry Pi:
- [ ] Code pulled from Git
- [ ] Python dependencies installed
- [ ] Motion server running (camera stream at :8080)
- [ ] Detection API running (:5000)
- [ ] Web app running (:3000)
- [ ] Camera URLs configured in app

### Final Test:
- [ ] Camera feed visible in monitoring screen
- [ ] GPS tracking working
- [ ] Hazards detected in real-time
- [ ] Proximity alerts appear
- [ ] All systems green! 🎉

---

## 📚 Quick Reference

### Files Created:
- `data.yaml` - Dataset configuration
- `train.py` - Training script
- `test_model.py` - Testing script
- `detection_api.py` - Flask API server
- `setup.bat` - Install dependencies
- `train.bat` - Start training
- `test.bat` - Test model
- `api.bat` - Start API server

### Folders:
- `dataset/` - Your training data
- `hazard-detection/` - Training results
- `src/` - Web application

### Guides:
- `TRAIN_HERE.md` - Local training guide
- `AI_TRAINING_GUIDE.md` - Detailed AI guide
- `RASPBERRY_PI_SETUP.md` - Pi hardware setup
- `CONFIGURATION.md` - Config reference
- This file - Complete workflow

---

## 🎓 Tips for Best Results

1. **Dataset Quality**
   - 1000+ images per class recommended
   - Varied lighting conditions
   - Different angles and distances
   - Balanced classes

2. **Training**
   - Start with 100 epochs
   - Monitor loss - should decrease
   - Check mAP - should increase
   - Use validation set (20% of data)

3. **Pi Optimization**
   - Use YOLOv8n (nano) for speed
   - Reduce image size if needed
   - Monitor CPU temperature
   - Consider overclocking for better performance

4. **Production**
   - Use systemd to auto-start services
   - Set up error logging
   - Monitor detection accuracy
   - Regular model retraining with new data

---

**You're all set! Train here, deploy to Pi, detect hazards! 🚀**
