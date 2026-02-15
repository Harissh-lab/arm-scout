from ultralytics import YOLO
import torch

print("=" * 60)
print("🚀 HAZARD DETECTION MODEL TRAINING")
print("=" * 60)

# Check device
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"\n✅ Training Device: {device.upper()}")
if device == 'cuda':
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    print(f"   CUDA Version: {torch.version.cuda}")
else:
    print("   Note: CPU training is slower. Consider using GPU if available.")

print("\n" + "=" * 60)

# Load pretrained YOLO model
print("\n📦 Loading YOLOv8 nano model (fastest for Raspberry Pi)...")
model = YOLO('yolov8n.pt')  # Will auto-download on first run
print("✅ Model loaded successfully!")

# Training configuration
print("\n⚙️  Training Configuration:")
config = {
    'data': 'data.yaml',
    'epochs': 100,
    'imgsz': 640,
    'batch': 16 if device == 'cuda' else 8,  # Smaller batch for CPU
    'device': device,
    'project': 'hazard-detection',
    'name': 'road-hazards-v1',
    'patience': 20,
    'save': True,
    'plots': True,
    'cache': False,
    'pretrained': True,
    'verbose': True,
    
    # Data augmentation
    'hsv_h': 0.015,
    'hsv_s': 0.7,
    'hsv_v': 0.4,
    'degrees': 10,
    'translate': 0.1,
    'scale': 0.5,
    'fliplr': 0.5,
    'mosaic': 1.0,
}

for key, value in config.items():
    print(f"   {key}: {value}")

print("\n" + "=" * 60)
print("🎯 Starting Training...")
print("=" * 60)
print("\nThis may take a while depending on your dataset size and hardware.")
print("Training progress will be displayed below.\n")

# Train the model
try:
    results = model.train(**config)
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    
    # Print results location
    save_dir = results.save_dir
    print(f"\n📁 Results saved to: {save_dir}")
    print(f"\n🏆 Best model: {save_dir}/weights/best.pt")
    print(f"📊 Last checkpoint: {save_dir}/weights/last.pt")
    print(f"📈 Training metrics: {save_dir}/results.png")
    
    print("\n" + "=" * 60)
    print("📋 NEXT STEPS:")
    print("=" * 60)
    print("1. Check training results: hazard-detection/road-hazards-v1/")
    print("2. Test model: python test_model.py")
    print("3. Deploy to Pi: Copy best.pt to Raspberry Pi")
    print("4. Run detection API: python detection_api.py")
    print("\n✨ Ready to detect road hazards!\n")
    
except Exception as e:
    print("\n" + "=" * 60)
    print("❌ TRAINING ERROR")
    print("=" * 60)
    print(f"\nError: {str(e)}\n")
    print("Common issues:")
    print("1. Dataset not found - Check 'dataset/' folder exists")
    print("2. Out of memory - Reduce batch size in train.py")
    print("3. Missing images - Verify train/val folders have images")
    print("\nSee AI_TRAINING_GUIDE.md for troubleshooting.\n")
