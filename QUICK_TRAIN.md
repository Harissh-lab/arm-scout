# 🚀 Quick Start - AI Training

Fast reference for training your hazard detection model.

## 1️⃣ Install (One Time)

```bash
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install opencv-python flask flask-cors numpy pillow
```

**For GPU (faster):**
```bash
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## 2️⃣ Organize Your Dataset

```
dataset/
├── train/
│   ├── images/    # Your training images
│   └── labels/    # YOLO format .txt files
├── val/
│   ├── images/
│   └── labels/
└── data.yaml      # Config file
```

**Create `data.yaml`:**
```yaml
path: ./dataset
train: train/images
val: val/images

nc: 6
names: ['debris', 'pothole', 'roadblock', 'accident', 'flood', 'construction']
```

## 3️⃣ Train Model

**Create `train.py`:**
```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device='cpu',  # or 'cuda'
    project='hazard-detection',
    name='road-hazards-v1'
)
```

**Run:**
```bash
python train.py
```

## 4️⃣ Test Model

```python
from ultralytics import YOLO

model = YOLO('hazard-detection/road-hazards-v1/weights/best.pt')
results = model.predict('test_image.jpg', show=True, conf=0.5)
```

## 5️⃣ Deploy API

**Create `detection_api.py`:**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
import cv2
import time

app = Flask(__name__)
CORS(app)
model = YOLO('hazard-detection/road-hazards-v1/weights/best.pt')

@app.route('/api/detect', methods=['POST'])
def detect():
    file = request.files['image']
    image_bytes = file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model.predict(image, conf=0.5, verbose=False)
    
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append({
                'type': model.names[int(box.cls[0])],
                'confidence': round(float(box.conf[0]) * 100, 2),
                'timestamp': time.time()
            })
    
    if detections:
        best = max(detections, key=lambda x: x['confidence'])
        return jsonify({'detected': True, **best})
    return jsonify({'detected': False})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Run:**
```bash
python detection_api.py
```

## 6️⃣ Configure Hazard Scout App

In app settings:
- **Camera Stream**: `http://[PI-IP]:8080`
- **API Endpoint**: `http://[PI-IP]:5000/api`

## ✅ Done!

Your AI model is now detecting hazards in real-time!

---

**Full guide:** [AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md)
