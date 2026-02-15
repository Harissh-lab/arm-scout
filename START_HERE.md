# 🎯 START HERE - LOCAL AI TRAINING

## ✅ Everything is Ready!

Your training environment is fully set up. Here's what to do:

---

## 📁 Step 1: Add Your Dataset

Copy your hazard images to these folders:

```
dataset/
├── train/
│   ├── images/  ⬅️ PUT 80% OF YOUR IMAGES HERE
│   └── labels/  ⬅️ PUT CORRESPONDING .TXT FILES HERE
└── val/
    ├── images/  ⬅️ PUT 20% OF YOUR IMAGES HERE
    └── labels/  ⬅️ PUT CORRESPONDING .TXT FILES HERE
```

### Label Format

Each image needs a matching `.txt` file:
- Image: `road_hazard_001.jpg`
- Label: `road_hazard_001.txt`

Label content (YOLO format):
```
class_id center_x center_y width height
```

**Example:** `road_hazard_001.txt`
```
1 0.5 0.5 0.3 0.4
0 0.2 0.3 0.1 0.15
```

**Class IDs:**
- 0 = debris
- 1 = pothole
- 2 = roadblock
- 3 = accident
- 4 = flood
- 5 = construction

All values are normalized between 0 and 1.

---

## 🚀 Step 2: Install Dependencies

**Double-click:** `setup.bat`

This will install:
- PyTorch (AI framework)
- Ultralytics YOLO (object detection)
- OpenCV (image processing)
- Flask (API server)

**Or run manually:**
```powershell
pip install ultralytics torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install opencv-python flask flask-cors numpy pillow
```

---

## 🎓 Step 3: Train Your Model

**Double-click:** `train.bat`

**Or run manually:**
```powershell
python train.py
```

**What happens:**
1. Loads YOLOv8n pretrained model
2. Trains on your dataset
3. Saves model to `hazard-detection/road-hazards-v1/weights/best.pt`
4. Generates performance graphs

**Time estimate:**
- 500 images: 30-60 minutes (CPU)
- 2000 images: 2-4 hours (CPU)

*Much faster with NVIDIA GPU!*

---

## 🧪 Step 4: Test Your Model

**Double-click:** `test.bat`

**Or run manually:**
```powershell
python test_model.py
```

**Options:**
1. Test on single image
2. Test on folder of images
3. Test on webcam (live detection)

---

## 📡 Step 5: Run Detection API

**Double-click:** `api.bat`

**Or run manually:**
```powershell
python detection_api.py
```

API will run at: `http://localhost:5000`

**Endpoints:**
- `POST /api/detect` - Detect in uploaded image
- `POST /api/detect/stream` - Detect from camera
- `GET /api/health` - Check if API is running

---

## 📊 Check Results

After training, check:

```
hazard-detection/road-hazards-v1/
├── weights/
│   ├── best.pt       ⭐ YOUR TRAINED MODEL
│   └── last.pt       (latest checkpoint)
├── results.png       📈 Training graphs
├── confusion_matrix.png
├── F1_curve.png
└── ...
```

**Good signs:**
- Loss decreasing over epochs
- mAP (mean Average Precision) > 0.7
- Good predictions on test images

---

## 🍓 Deploy to Raspberry Pi

Once you're happy with the model:

```powershell
git add .
git commit -m "Trained hazard detection model"
git push origin main
```

Then on Raspberry Pi:
```bash
git pull origin main
python3 detection_api.py
```

---

## 📚 Need More Help?

**Quick reference:** [TRAIN_HERE.md](TRAIN_HERE.md)
**Complete guide:** [COMPLETE_WORKFLOW.md](COMPLETE_WORKFLOW.md)
**AI details:** [AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md)

---

## ✅ Quick Checklist

- [ ] Dataset in `dataset/train/` and `dataset/val/`
- [ ] Images in `images/` folders
- [ ] Labels in `labels/` folders
- [ ] Run `setup.bat` to install dependencies
- [ ] Run `train.bat` to train model
- [ ] Check `hazard-detection/` for results
- [ ] Run `test.bat` to validate
- [ ] Run `api.bat` to start API server
- [ ] Push to Git for Raspberry Pi deployment

---

## 🎯 Simple Workflow

```
1. setup.bat     →  Install everything
2. Add dataset   →  Copy images & labels
3. train.bat     →  Train AI model
4. test.bat      →  Test the model
5. api.bat       →  Run API server
6. git push      →  Deploy to Pi
```

---

**Ready to train! Just add your dataset and run `setup.bat`** 🚀
