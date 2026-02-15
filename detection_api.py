from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import time
import os

print("=" * 60)
print("🚀 HAZARD DETECTION API SERVER")
print("=" * 60)

# Check if model exists
MODEL_PATH = 'hazard-detection/road-hazards-v1/weights/best.pt'
if not os.path.exists(MODEL_PATH):
    print(f"\n❌ Trained model not found at: {MODEL_PATH}")
    print("\nPlease train the model first:")
    print("   python train.py")
    exit(1)

print(f"\n✅ Loading model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print("✅ Model loaded successfully!")

app = Flask(__name__)
CORS(app)

@app.route('/api/detect', methods=['POST'])
def detect_hazard():
    """Detect hazards in uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        # Read image
        file = request.files['image']
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
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
            print(f"⚠️  Detected: {best_detection['type']} ({best_detection['confidence']}%)")
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
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect/stream', methods=['POST'])
def detect_from_stream():
    """Detect from camera stream"""
    try:
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
            print(f"⚠️  Detected: {best_detection['type']} ({best_detection['confidence']}%)")
            return jsonify({
                'detected': True,
                'type': best_detection['type'],
                'confidence': best_detection['confidence'],
                'timestamp': best_detection['timestamp']
            })
        else:
            return jsonify({'detected': False})
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'running',
        'model': 'loaded',
        'classes': model.names
    })

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("✅ API SERVER READY")
    print("=" * 60)
    print(f"\n🌐 Server running at: http://localhost:5000")
    print(f"📡 Endpoints:")
    print(f"   POST /api/detect        - Detect in uploaded image")
    print(f"   POST /api/detect/stream - Detect from camera")
    print(f"   GET  /api/health        - Health check")
    print(f"\n🎯 Model Classes: {list(model.names.values())}")
    print(f"\nPress Ctrl+C to stop\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
