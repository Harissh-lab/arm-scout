from ultralytics import YOLO
import cv2
import os

print("=" * 60)
print("🧪 TESTING TRAINED MODEL")
print("=" * 60)

# Path to trained model
MODEL_PATH = 'hazard-detection/road-hazards-v1/weights/best.pt'

if not os.path.exists(MODEL_PATH):
    print(f"\n❌ Model not found at: {MODEL_PATH}")
    print("\nPlease train the model first:")
    print("   python train.py")
    exit(1)

print(f"\n✅ Loading model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print("✅ Model loaded successfully!")

print("\n" + "=" * 60)
print("🎯 DETECTION OPTIONS")
print("=" * 60)
print("\n1. Test on single image")
print("2. Test on folder of images")
print("3. Test on webcam (live)")
print("4. Exit")

choice = input("\nEnter choice (1-4): ").strip()

if choice == '1':
    # Single image test
    image_path = input("\nEnter image path: ").strip()
    if os.path.exists(image_path):
        print(f"\n🔍 Running detection on: {image_path}")
        results = model.predict(image_path, save=True, conf=0.5)
        
        print("\n📊 DETECTIONS:")
        for result in results:
            boxes = result.boxes
            if len(boxes) == 0:
                print("   No hazards detected")
            else:
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = model.names[class_id]
                    print(f"   ⚠️  {class_name.upper()}: {confidence*100:.1f}% confidence")
        
        print(f"\n✅ Result saved to: runs/detect/predict/")
    else:
        print(f"❌ Image not found: {image_path}")

elif choice == '2':
    # Folder test
    folder_path = input("\nEnter folder path: ").strip()
    if os.path.exists(folder_path):
        print(f"\n🔍 Running detection on all images in: {folder_path}")
        results = model.predict(folder_path, save=True, conf=0.5)
        print(f"\n✅ Results saved to: runs/detect/predict/")
    else:
        print(f"❌ Folder not found: {folder_path}")

elif choice == '3':
    # Webcam test
    print("\n📹 Starting webcam detection...")
    print("Press 'q' to quit\n")
    
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Run detection
        results = model.predict(frame, conf=0.5, verbose=False)
        
        # Draw results
        annotated_frame = results[0].plot()
        
        # Display
        cv2.imshow('Hazard Detection', annotated_frame)
        
        # Print detections
        boxes = results[0].boxes
        if len(boxes) > 0:
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[class_id]
                print(f"⚠️  {class_name}: {confidence*100:.1f}%")
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Webcam test complete")

else:
    print("\n👋 Exiting...")

print("\n" + "=" * 60)
print("✅ TESTING COMPLETE")
print("=" * 60)
