# 🎯 LOCAL TRAINING SETUP - Windows

Train your hazard detection model right here on this computer!

---

## 📁 Step 1: Prepare Your Dataset

Create this folder structure in the project:

```
Hazard Scout Prototype Design (Copy)/
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
│   └── test/ (optional)
│       ├── images/
│       └── labels/
├── data.yaml ✅ (already created)
├── train.py ✅ (already created)
├── test_model.py ✅ (already created)
└── detection_api.py ✅ (already created)
```

### Copy Your Dataset

1. Create the `dataset` folder in this directory
2. Copy your images to:
   - `dataset/train/images/` (80% of data)
   - `dataset/val/images/` (20% of data)
3. Copy corresponding labels to:
   - `dataset/train/labels/`
   - `dataset/val/labels/`

### Label Format (YOLO)

Each `.txt` file should match an image filename:
- Image: `img001.jpg`
- Label: `img001.txt`

Label content (one line per object):
```
class_id center_x center_y width height
```

Example:
```
0 0.5 0.5 0.3 0.4
1 0.2 0.3 0.1 0.15
```

**Class IDs:**
- 0 = debris
- 1 = pothole
- 2 = roadblock
- 3 = accident
- 4 = flood
- 5 = construction

---

## 🔧 Step 2: Install Dependencies

Open PowerShell in this directory and run:

```powershell
# CPU training (slower but works on any PC)
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Additional dependencies
pip install opencv-python flask flask-cors numpy pillow
```

**If you have NVIDIA GPU (much faster):**
```powershell
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

---

## 🚀 Step 3: Train the Model

```powershell
python train.py
```

**What happens:**
1. Downloads YOLOv8n model (if not already downloaded)
2. Trains on your dataset
3. Creates `hazard-detection/road-hazards-v1/` folder
4. Saves best model to `weights/best.pt`
5. Generates training plots and metrics

**Training time:**
- Small dataset (500 images): 30-60 minutes (CPU) / 10-15 minutes (GPU)
- Medium dataset (2000 images): 2-4 hours (CPU) / 30-60 minutes (GPU)

---

## 🧪 Step 4: Test the Model

After training completes:

```powershell
python test_model.py
```

**Options:**
1. Test on single image
2. Test on folder of images
3. Test on webcam (live detection)

---

## 📡 Step 5: Run Detection API (Optional)

```powershell
python detection_api.py
```

Starts API server at `http://localhost:5000`

**Test the API:**
```powershell
# In another terminal
curl -X POST -F "image=@test_image.jpg" http://localhost:5000/api/detect
```

---

## 📤 Step 6: Deploy to Raspberry Pi

After training, copy the model to your Pi:

```powershell
# Copy best model
scp hazard-detection/road-hazards-v1/weights/best.pt pi@raspberrypi.local:~/

# Or copy entire project via Git
git add .
git commit -m "Added trained model"
git push
```

---

## 📊 Training Results

Check results in:
```
hazard-detection/road-hazards-v1/
├── weights/
│   ├── best.pt       ⭐ Your trained model
│   └── last.pt       (Latest checkpoint)
├── results.png       📈 Training graphs
├── confusion_matrix.png
├── F1_curve.png
└── ...
```

---

## 🎯 Quick Commands Reference

```powershell
# Install dependencies
pip install ultralytics torch torchvision opencv-python flask flask-cors

# Train model
python train.py

# Test model
python test_model.py

# Run API server
python detection_api.py

# Start web app
npm run dev
```

---

## 🐛 Troubleshooting

### "Dataset not found"
Create the `dataset/` folder and add your images:
```
dataset/
├── train/images/ and labels/
└── val/images/ and labels/
```

### "Out of memory"
Edit `train.py` line 26:
```python
'batch': 4,  # Reduce from 16 to 4 or 8
```

### "No images found in train"
Verify images are in:
- `dataset/train/images/`
- `dataset/val/images/`

### Model accuracy is low
- Add more training data (1000+ images recommended)
- Train for more epochs (100-200)
- Use better quality labels
- Enable data augmentation (already enabled)

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Dataset in `dataset/` folder
- [ ] Images in train/images and val/images
- [ ] Labels in train/labels and val/labels
- [ ] Run `python train.py` successfully
- [ ] Model saved to `hazard-detection/.../weights/best.pt`
- [ ] Test with `python test_model.py`
- [ ] API runs with `python detection_api.py`

---

## 🎓 What You Get

After training:
- ✅ **best.pt** - Trained model file (~6 MB)
- ✅ **Training metrics** - Accuracy, loss, mAP graphs
- ✅ **Detection API** - Ready to deploy
- ✅ **Test scripts** - Validate model performance

---

## 📦 File Organization

```
Current Directory/
├── dataset/              ⬅️ Your training data goes here
├── hazard-detection/     ⬅️ Training results saved here
├── train.py             ⬅️ Run this to train
├── test_model.py        ⬅️ Run this to test
├── detection_api.py     ⬅️ Run this for API server
├── data.yaml            ⬅️ Dataset configuration
└── src/                 (Your web app)
```

---

**Ready to train! Just add your dataset and run `python train.py`** 🚀
