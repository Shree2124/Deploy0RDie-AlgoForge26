from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "runs", "detect", "train", "weights", "best.pt")


model = None

def get_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model weights not found at {MODEL_PATH}. Please train the model first.")
        model = YOLO(MODEL_PATH)
    return model

def predict_image(image_path):
    print("get_model() - Loading trained YOLO model...")
    active_model = get_model()
    
    print(f"ultralytics active_model() - Running inference on {image_path}...")
    results = active_model(image_path, conf=0.1)
    print("Inference successfully finished!")

    detections = []

    for box in results[0].boxes:
        detections.append({
            "class_id": int(box.cls[0]),
            "class_name": active_model.names[int(box.cls[0])] if hasattr(active_model, 'names') else "unknown",
            "confidence": float(box.conf[0]),
            "bbox": box.xyxy[0].tolist()
        })

    return detections