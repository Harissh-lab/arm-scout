# 🤖 AI Model Training Guide - Road Hazard Detection

Complete guide for training a YOLO model to detect road hazards (debris, potholes, etc.)

---

## 📦 Step 1: Install Dependencies

### On Raspberry Pi or Training Computer

```bash
# Install PyTorch and Ultralytics YOLO
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# For GPU training (NVIDIA CUDA - much faster)
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Additional dependencies
pip install opencv-python numpy pillow
```

### Verify Installation

```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}')"
python -c "from ultralytics import YOLO; print('YOLO installed successfully')"
```

---

## 📁 Step 2: Prepare Dataset

### Dataset Structure

Create this folder structure:

```
hazard-detection/
├── dataset/
│   ├── train/
│   │   ├── images/
│   │   │   ├── img001.jpg
│   │   │   ├── img002.jpg
│   │   │   └── ...
│   │   └── labels/
│   │       ├── img001.txt
│   │       ├── img002.txt
│   │       └── ...
│   ├── val/
│   │   ├── images/
│   │   └── labels/
│   └── test/
│       ├── images/
│       └── labels/
├── data.yaml
└── train.py
```

### Create `data.yaml`

```yaml
# data.yaml
path: ./dataset  # Dataset root directory
train: train/images  # Train images
val: val/images      # Validation images
test: test/images    # Test images (optional)

# Classes
nc: 6  # Number of classes
names: ['debris', 'pothole', 'roadblock', 'accident', 'flood', 'construction']
```

### Label Format (YOLO)

Each `.txt` file should contain:
```
class_id center_x center_y width height
```

Example `img001.txt`:
```
0 0.5 0.5 0.3 0.4
1 0.2 0.3 0.1 0.15
```

Values are normalized (0-1):
- `class_id`: 0=debris, 1=pothole, 2=roadblock, etc.
- `center_x, center_y`: Center of bounding box
- `width, height`: Box dimensions

---

## 🎯 Step 3: Training Script

### Create `train.py`

```python
from ultralytics import YOLO
import torch

# Check device
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Training on: {device}")

# Load a pretrained model (recommended for transfer learning)
model = YOLO('yolov8n.pt')  # nano (fastest), also try: yolov8s, yolov8m, yolov8l

# Train the model
results = model.train(
    data='data.yaml',           # Dataset config
    epochs=100,                 # Training epochs
    imgsz=640,                  # Image size
    batch=16,                   # Batch size (reduce if out of memory)
    device=device,              # cuda or cpu
    project='hazard-detection', # Project name
    name='road-hazards-v1',     # Experiment name
    patience=20,                # Early stopping patience
    save=True,                  # Save checkpoints
    plots=True,                 # Generate plots
    
    # Augmentation (helps with varied conditions)
    hsv_h=0.015,               # Hue augmentation
    hsv_s=0.7,                 # Saturation augmentation
    hsv_v=0.4,                 # Value augmentation
    degrees=10,                # Rotation
    translate=0.1,             # Translation
    scale=0.5,                 # Scale
    fliplr=0.5,                # Horizontal flip
    mosaic=1.0,                # Mosaic augmentation
)

print("Training complete!")
print(f"Best model saved at: {results.save_dir}/weights/best.pt")
```

### Run Training

```bash
python train.py
```

---

## 📊 Step 4: Monitor Training

Training will create:
```
hazard-detection/
└── road-hazards-v1/
    ├── weights/
    │   ├── best.pt       # Best model
    │   └── last.pt       # Latest checkpoint
    ├── results.png       # Training metrics
    ├── confusion_matrix.png
    ├── F1_curve.png
    └── ...
```

**Monitor progress:**
- Loss should decrease
- mAP (mean Average Precision) should increase
- Check `results.png` for graphs

---

## 🧪 Step 5: Test Trained Model

### Create `test.py`

```python
from ultralytics import YOLO
import cv2

# Load trained model
model = YOLO('hazard-detection/road-hazards-v1/weights/best.pt')

# Test on single image
results = model.predict('test_image.jpg', save=True, conf=0.5)

# Print detections
for result in results:
    boxes = result.boxes
    for box in boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = model.names[class_id]
        print(f"Detected: {class_name} (confidence: {confidence:.2f})")

# Test on video/camera
results = model.predict(source=0, show=True, conf=0.5)  # source=0 for webcam
```

---

## 🔗 Step 6: Integrate with Hazard Scout App

### Create Detection API (`detection_api.py`)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import time
import base64

app = Flask(__name__)
CORS(app)

# Load trained model
model = YOLO('hazard-detection/road-hazards-v1/weights/best.pt')

@app.route('/api/detect', methods=['POST'])
def detect_hazard():
    """Detect hazards in uploaded image or from camera"""
    
    try:
        # Get image from request
        if 'image' in request.files:
            file = request.files['image']
            image_bytes = file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        # Run detection
        results = model.predict(image, conf=0.5, verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[class_id]
                
                detections.append({
                    'type': class_name,
                    'confidence': round(confidence * 100, 2),
                    'timestamp': time.time()
                })
        
        if detections:
            # Return highest confidence detection
            best_detection = max(detections, key=lambda x: x['confidence'])
            return jsonify({
                'detected': True,
                'type': best_detection['type'],
                'confidence': best_detection['confidence'],
                'timestamp': best_detection['timestamp'],
                'all_detections': detections
            })
        else:
            return jsonify({
                'detected': False,
                'message': 'No hazards detected'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect/stream', methods=['POST'])
def detect_from_stream():
    """Detect from camera stream (Pi Camera)"""
    try:
        # Capture from Pi Camera
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return jsonify({'error': 'Failed to capture from camera'}), 500
        
        # Run detection
        results = model.predict(frame, conf=0.5, verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[class_id]
                
                detections.append({
                    'type': class_name,
                    'confidence': round(confidence * 100, 2),
                    'timestamp': time.time()
                })
        
        if detections:
            best_detection = max(detections, key=lambda x: x['confidence'])
            return jsonify({
                'detected': True,
                'type': best_detection['type'],
                'confidence': best_detection['confidence'],
                'timestamp': best_detection['timestamp']
            })
        else:
            return jsonify({'detected': False})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'running', 'model': 'loaded'})

if __name__ == '__main__':
    print("🚀 Detection API starting...")
    print("Model loaded successfully!")
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### Run Detection API

```bash
python detection_api.py
```

API will run on: `http://[PI-IP]:5000`

---

## 🔄 Step 7: Continuous Detection (Background Service)

### Create `continuous_detection.py`

```python
from ultralytics import YOLO
import cv2
import requests
import time
import json

# Configuration
HAZARD_SCOUT_API = "http://localhost:3000/api/hazards"  # Your app API
CONFIDENCE_THRESHOLD = 0.6
CHECK_INTERVAL = 2  # seconds

# Load model
model = YOLO('hazard-detection/road-hazards-v1/weights/best.pt')

# Open camera
cap = cv2.VideoCapture(0)

print("🎥 Continuous detection started...")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame")
        time.sleep(1)
        continue
    
    # Run detection
    results = model.predict(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
    
    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = model.names[class_id]
            
            print(f"⚠️  Detected: {class_name} ({confidence*100:.1f}%)")
            
            # TODO: Send detection to Hazard Scout app
            # This would integrate with your CameraDetectionService
    
    time.sleep(CHECK_INTERVAL)

cap.release()
```

---

## 📱 Step 8: Update Hazard Scout App Configuration

In your app's settings:

```
Pi Camera Stream URL: http://[PI-IP]:8080
Pi API Endpoint: http://[PI-IP]:5000/api
```

The app will:
1. Display camera stream from Motion (port 8080)
2. Poll detection API (port 5000) for hazards
3. Show real-time detections with GPS coordinates
4. Alert when near detected hazards

---

## 🎓 Training Tips

### For Better Accuracy:

1. **More Data**: 1000+ images per class recommended
2. **Varied Conditions**: Different lighting, weather, angles
3. **Balanced Dataset**: Equal samples per class
4. **Quality Labels**: Accurate bounding boxes
5. **Augmentation**: Enabled by default in training script

### Model Selection:

- **YOLOv8n** (nano): Fastest, ~6ms inference (Raspberry Pi)
- **YOLOv8s** (small): Balanced, ~12ms inference
- **YOLOv8m** (medium): More accurate, slower
- **YOLOv8l** (large): Best accuracy, GPU only

### Raspberry Pi Optimization:

```bash
# Use smaller model
model = YOLO('yolov8n.pt')

# Reduce image size
model.predict(source=0, imgsz=320, conf=0.6)

# Use INT8 quantization for speed
model.export(format='tflite', int8=True)
```

---

## 📈 Expected Results

After training with good dataset:

- **Debris Detection**: 85-95% accuracy
- **Pothole Detection**: 80-90% accuracy
- **Roadblock Detection**: 90-95% accuracy
- **Inference Speed**: 100-200ms on Raspberry Pi 4

---

## 🐛 Troubleshooting

### Out of Memory
```bash
# Reduce batch size
batch=8  # or even batch=4
```

### Slow Training
```bash
# Use GPU if available
# Or train on powerful computer, then transfer model to Pi
```

### Low Accuracy
- Add more training data
- Train for more epochs
- Use larger model (yolov8s instead of yolov8n)
- Improve label quality

### Pi Can't Run Model
```bash
# Use nano model and smaller image size
model = YOLO('yolov8n.pt')
results = model.predict(source=0, imgsz=320)
```

---

## ✅ Complete Workflow

```bash
# 1. Install dependencies
pip install ultralytics torch torchvision torchaudio opencv-python flask flask-cors

# 2. Prepare dataset (your existing dataset)
# Organize into train/val/test folders

# 3. Create data.yaml configuration
# Define classes: debris, pothole, etc.

# 4. Train model
python train.py

# 5. Test model
python test.py

# 6. Run detection API
python detection_api.py

# 7. Start camera stream (Motion)
sudo systemctl start motion

# 8. Open Hazard Scout app
# Configure Pi URLs in settings

# 9. Toggle Camera Detection ON
# See real-time detections!
```

---

## 🚀 Next Steps

1. **Train your model** with the dataset you have
2. **Test locally** to verify accuracy
3. **Deploy to Raspberry Pi**
4. **Configure app** with Pi IP addresses
5. **Start detecting hazards in real-time!**

---

**Your dataset + This training guide = Working AI hazard detection!** 🎯
