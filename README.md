# Hazard Scout - Camera-Based Road Hazard Detection

**Real-time road hazard detection using Raspberry Pi camera with GPS coordinate tracking and proximity alerts.**

## 🚀 Quick Start

### Option A: Run the Web App Only

```bash
npm install
npm run dev
```
App runs at **http://localhost:3000** with sample hazard data.

### Option B: Train AI Model HERE (Windows)

**Complete local training setup ready!**

```bash
# 1. Install AI dependencies
setup.bat

# 2. Add your dataset to dataset/train/images and dataset/val/images

# 3. Train the model
train.bat

# 4. Test the model
test.bat

# 5. Run detection API
api.bat
```

See **[TRAIN_HERE.md](TRAIN_HERE.md)** for complete training guide.

### Option C: Full Setup (App + AI)

```bash
# Terminal 1: Web app
npm run dev

# Terminal 2: AI detection API (after training)
api.bat
```

### Configure Raspberry Pi Camera (For Deployment)
- Navigate to **Safety Scout** → **Settings**
- Enter your Raspberry Pi camera stream URL (default: `http://raspberrypi.local:8080`)
- Save settings

## 📱 Features

✅ **Camera Detection** - Real-time hazard detection via Raspberry Pi camera  
✅ **GPS Tracking** - Continuous location monitoring with browser Geolocation API  
✅ **Proximity Alerts** - Automatic alerts when within 500m of hazards  
✅ **Coordinate Database** - Persistent localStorage-based hazard storage  
✅ **Live Monitoring Screen** - Full HUD with speed, GPS, and hazard info  
✅ **Sample Data** - Pre-loaded demo hazards for testing  

## 🗄️ Database & Storage

The app uses **localStorage** for persistent data storage - **no external database required!**

- **Hazard Database**: `coordinate-hazards-db` (auto-initialized with sample data)
- **Camera Settings**: `pi-camera-url`, `pi-api-url`
- **GPS Position**: `last-gps-position`

### Sample Data
On first launch, the database automatically loads with 3 sample hazards:
- Pothole (Chennai: 13.0827, 80.2707)
- Debris (Chennai: 13.0878, 80.2785)
- Construction (Chennai: 13.0456, 80.2548)

## 🔧 Raspberry Pi Integration

### Camera Setup
For the Raspberry Pi camera setup, see **[RASPBERRY_PI_SETUP.md](RASPBERRY_PI_SETUP.md)**

### AI Model Training
To train your dataset for hazard detection, see **[AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md)**

### Default Configuration
- **Camera Stream**: `http://raspberrypi.local:8080/stream`
- **API Endpoint**: `http://raspberrypi.local:5000/api` (optional)

### Quick Pi Setup
```bash
# On Raspberry Pi
sudo apt-get install motion
sudo nano /etc/motion/motion.conf
# Set: stream_port 8080, stream_localhost off
sudo systemctl start motion
```

### Train AI Model
```bash
pip install ultralytics torch torchvision torchaudio opencv-python
python train.py  # See AI_TRAINING_GUIDE.md for details
```

## 🧭 How to Use

1. **Grant GPS Permission** - Allow location access when prompted
2. **Navigate to Safety Scout** - Click the Safety Scout tab
3. **Toggle Camera Detection ON** - Activates full monitoring screen
4. **View Live Feed** - See camera stream with HUD overlay showing:
   - Current speed (km/h)
   - GPS coordinates
   - Nearby hazards with distance/direction
   - Estimated time to hazard

## 📦 Tech Stack

- **React 18.3** + TypeScript
- **Vite 6.3** - Fast build tool
- **Radix UI** - Component library
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Geolocation API** - GPS tracking
- **localStorage** - Data persistence

## 🔄 Deployment

### For Web Developer
```bash
git push origin main
```

### For Raspberry Pi Person
```bash
git pull origin main
npm install
npm run dev
```

Then configure the Pi camera stream URL in app settings.

## 📝 Project Structure

```
src/
├── components/
│   ├── CameraDetectionService.ts    # Pi camera integration & GPS
│   ├── CoordinateDatabase.ts        # Hazard storage & proximity alerts
│   ├── HazardService.ts             # Main hazard management
│   ├── MonitoringScreen.tsx         # Live camera feed + HUD
│   ├── SafetyScoutScreen.tsx        # Main hazard scout interface
│   └── HazardScoutSettingsScreen.tsx # Pi configuration
```

## 🎯 Key Features Explained

### Proximity Detection
- Uses **Haversine formula** for accurate Earth-surface distance
- Alerts when hazards are within **500 meters**
- Shows bearing (N/NE/E/SE/S/SW/W/NW) and ETA

### Hazard Lifecycle
- **Confirmed** - 3+ users confirm hazard exists
- **Resolved** - 3+ users report hazard gone
- **Auto-cleanup** - Old hazards auto-marked resolved

## 🆘 Troubleshooting

**Black screen?**
- Check GPS permission is granted
- Verify camera stream URL is correct
- Check browser console for errors

**No camera feed?**
- Ensure Raspberry Pi Motion server is running
- Test stream URL directly: `http://[PI-IP]:8080`
- Check firewall settings

**No GPS data?**
- Enable location services in browser
- Use HTTPS (or localhost) for Geolocation API
- Check browser compatibility

## 📄 License

Original design: https://www.figma.com/design/CeLnoUJGiBCJeWyAi1CTlW/

---

**Ready to deploy!** 🎉 Just push to Git and your Pi person can pull and run.