# Configuration Guide

## 🔧 Quick Configuration for Raspberry Pi Setup

This guide is for the person setting up the Raspberry Pi camera integration.

## Camera Configuration

### In-App Settings
1. Open the app at `http://localhost:3000`
2. Navigate to **Safety Scout** tab
3. Click **Settings** icon (gear)
4. Scroll to **Raspberry Pi Camera** section
5. Enter your configuration:

```
Camera Stream URL: http://[YOUR-PI-IP]:8080
API Endpoint (optional): http://[YOUR-PI-IP]:5000/api
```

6. Click **Save Camera Settings**

### Example Configurations

#### Local Network (Most Common)
```
Camera Stream URL: http://192.168.1.100:8080
API Endpoint: http://192.168.1.100:5000/api
```

#### Using Hostname
```
Camera Stream URL: http://raspberrypi.local:8080
API Endpoint: http://raspberrypi.local:5000/api
```

#### Direct Connection (Pi Hotspot)
```
Camera Stream URL: http://10.42.0.1:8080
API Endpoint: http://10.42.0.1:5000/api
```

## Default URLs

The app comes pre-configured with these defaults:
- **Camera Stream**: `http://raspberrypi.local:8080/stream`
- **API Endpoint**: `http://raspberrypi.local:5000/api`

These will work if:
1. Your Raspberry Pi hostname is `raspberrypi`
2. Motion server is running on port 8080
3. (Optional) Flask API is running on port 5000

## Raspberry Pi Setup

### Quick Start (Motion Server)

```bash
# Install Motion
sudo apt-get update
sudo apt-get install motion

# Configure Motion
sudo nano /etc/motion/motion.conf
```

**Required Settings in motion.conf:**
```conf
daemon on
stream_port 8080
stream_localhost off
stream_auth_method 0
webcontrol_port 8080
webcontrol_localhost off
framerate 15
width 640
height 480
```

```bash
# Start Motion
sudo systemctl enable motion
sudo systemctl start motion

# Check status
sudo systemctl status motion
```

### Verify Camera Stream

Open in browser: `http://[YOUR-PI-IP]:8080`

You should see the camera stream!

## Network Configuration

### Find Your Raspberry Pi IP

```bash
# On Raspberry Pi
hostname -I

# Or from another computer
ping raspberrypi.local
```

### Firewall (if needed)

```bash
# Allow port 8080 (camera stream)
sudo ufw allow 8080/tcp

# Allow port 5000 (API - optional)
sudo ufw allow 5000/tcp
```

### Static IP (Recommended)

Edit `/etc/dhcpcd.conf`:
```conf
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

## Database Configuration

**No configuration needed!** The app uses browser localStorage automatically.

### Clear Database (if needed)

Open browser console and run:
```javascript
localStorage.clear()
location.reload()
```

This will reset to sample data.

## GPS Configuration

**No configuration needed!** The app uses the browser's Geolocation API.

Make sure:
- Location services are enabled in browser
- App is served over HTTPS (or localhost)
- GPS permission is granted when prompted

## Advanced: Optional AI Detection API

If you want to add AI-based hazard detection:

### Flask API Template

```python
# api.py
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/detect', methods=['POST'])
def detect_hazard():
    # Your AI detection code here
    return jsonify({
        'detected': True,
        'type': 'debris',
        'confidence': 0.92,
        'timestamp': time.time()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

```bash
# Install dependencies
pip install flask flask-cors

# Run API
python api.py
```

## Environment Variables (Optional)

For production deployment, you can use environment variables:

```bash
# .env.local
VITE_PI_CAMERA_URL=http://192.168.1.100:8080
VITE_PI_API_URL=http://192.168.1.100:5000/api
```

Then update the code to use `import.meta.env.VITE_PI_CAMERA_URL`

## Testing Checklist

- [ ] Camera stream accessible at Pi URL
- [ ] App loads at localhost:3000
- [ ] GPS permission granted
- [ ] Sample hazards visible in database
- [ ] Camera settings saved successfully
- [ ] Monitoring screen shows camera feed
- [ ] Speed and GPS coordinates display
- [ ] Proximity alerts work (test by adding hazard near current location)

## Troubleshooting

### Camera Stream Not Loading
1. Check Pi IP address: `hostname -I`
2. Test stream directly: `http://[PI-IP]:8080`
3. Check Motion status: `sudo systemctl status motion`
4. Check firewall: `sudo ufw status`

### GPS Not Working
1. Enable location in browser settings
2. Grant permission when prompted
3. Try different browser (Chrome/Firefox recommended)
4. Check HTTPS (or use localhost)

### No Proximity Alerts
1. Check GPS permission granted
2. Verify hazards in database (check console: `localStorage.getItem('coordinate-hazards-db')`)
3. Make sure monitoring is ON (toggle in Safety Scout)
4. Check proximity radius (default: 500m)

## Support

- Check browser console for errors (F12 → Console)
- Review RASPBERRY_PI_SETUP.md for detailed Pi setup
- Check sample data loaded: App should show 3 demo hazards

---

✅ **Configuration complete!** Your app is plug-and-play and ready to use!
