# Raspberry Pi Camera Integration Guide

## Overview
This Hazard Scout application uses your Raspberry Pi camera to detect road hazards in real-time and alerts drivers based on GPS coordinates.

## Features
✅ Real-time camera feed display
✅ GPS coordinate tracking
✅ Speed monitoring (km/h)
✅ Proximity alerts (warns when within 500m of hazards)
✅ Automatic hazard logging with coordinates
✅ Community verification system

## Raspberry Pi Setup

### 1. Hardware Requirements
- Raspberry Pi 3/4/5 (4GB RAM recommended)
- Pi Camera Module (V2 or HQ Camera)
- GPS module (USB or GPIO) OR use phone's GPS via network
- Power supply
- MicroSD card (32GB+ recommended)

### 2. Software Setup

#### Install Dependencies
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install camera tools
sudo apt-get install -y python3-pip python3-opencv
sudo apt-get install -y libcamera-apps

# Install streaming server
sudo apt-get install -y motion
```

#### Configure Motion (Camera Streaming)
```bash
# Edit motion config
sudo nano /etc/motion/motion.conf
```

Set these values:
```conf
daemon on
stream_port 8080
stream_localhost off
stream_quality 80
framerate 15
width 640
height 480
```

Start motion:
```bash
sudo systemctl enable motion
sudo systemctl start motion
```

Your camera stream will be available at: `http://raspberrypi.local:8080`

### 3. Hazard Detection API (Optional)

#### Install Python Detection Service
```bash
# Create project directory
mkdir ~/hazard-detection
cd ~/hazard-detection

# Install dependencies
pip3 install flask opencv-python numpy
```

#### Create Detection API (`detection_api.py`)
```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/detect', methods=['POST'])
def detect_hazard():
    # Your detection logic here
    # This is a placeholder - integrate your ML model
    
    detection = {
        'type': 'debris',
        'confidence': 95,
        'timestamp': int(time.time() * 1000)
    }
    
    return jsonify(detection)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'camera': 'connected'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

#### Run the API
```bash
python3 detection_api.py
```

### 4. Network Configuration

#### Find Your Pi's IP Address
```bash
hostname -I
```

#### Configure in Hazard Scout App
1. Open the app at http://localhost:3000
2. Navigate to Safety Scout → Settings
3. Enter your Pi's camera stream URL:
   - Camera Stream: `http://[YOUR-PI-IP]:8080`
   - API Endpoint: `http://[YOUR-PI-IP]:5000/api`
4. Click "Save Camera Settings"

## Usage

### Starting Monitoring
1. Open Hazard Scout app
2. Go to "Safety Scout" tab
3. Toggle "Camera Detection" ON
4. Grant GPS location permission when prompted
5. Full-screen monitoring view will appear showing:
   - Live camera feed from Pi
   - Current speed in km/h
   - GPS coordinates
   - Proximity alerts for hazards ahead

### Detection Flow
```
Pi Camera → Motion Stream → Your Device Display
                ↓
        Detection API (optional)
                ↓
        GPS Coordinates Logged
                ↓
        Database Storage
                ↓
        Proximity Alerts to Drivers
```

### When Hazard Detected
The system automatically:
1. Captures GPS coordinates
2. Logs hazard type and confidence
3. Stores in coordinate database
4. Alerts nearby drivers when they approach (within 500m)
5. Shows:
   - Distance to hazard (e.g., "250m ahead")
   - Direction (N, NE, E, etc.)
   - ETA based on current speed

## Troubleshooting

### Camera Feed Not Showing
- Check Pi is powered on and on same network
- Verify motion service is running: `sudo systemctl status motion`
- Test stream directly: Open `http://[PI-IP]:8080` in browser
- Check firewall allows port 8080

### GPS Not Working
- Grant location permissions in browser
- Check browser supports Geolocation API (Chrome/Firefox recommended)
- For Pi GPS module, install gpsd:
  ```bash
  sudo apt-get install gpsd gpsd-clients
  ```

### Slow Performance
- Reduce camera resolution in motion.conf
- Use Pi 4 or newer (8GB RAM ideal)
- Lower framerate to 10-12 fps
- Optimize detection model

## Advanced: ML Model Integration

For automatic hazard detection, integrate models like:
- YOLOv5/v8 for object detection
- Custom trained models for potholes, debris
- TensorFlow Lite for Pi optimization

Example:
```python
import torch
from yolov5 import YOLOv5

model = YOLOv5('path/to/weights.pt')
results = model(frame)

# Process detections
for det in results.xyxy[0]:
    if det[5] in [debris_class, pothole_class]:
        # Send detection to database
        send_to_api(det)
```

## Network Requirements
- Pi and device must be on same network OR
- Use port forwarding for remote access
- Recommended: Use VPN (WireGuard) for secure remote streaming

## Security Notes
- Change default Pi password
- Use HTTPS for production
- Enable authentication on motion stream
- Firewall: Only open required ports

## Support
For issues or questions, check the documentation or configure URLs in Settings.
