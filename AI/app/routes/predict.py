from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from app.services.yolo_service import predict_image

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    print("\n" + "="*50)
    print(f"🚀 PREDICT ROUTE HIT! Received file: {file.filename}")
    print("="*50 + "\n")

    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"📂 Passed file to YOLO service: {file_path}")
        detections = predict_image(file_path)
        print("Result ",detections)
    except FileNotFoundError as e:
        print(f"❌ ERROR: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"❌ ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    print("\n" + "="*50)
    print(f"✅ PREDICTION COMPLETE! Detections found: {len(detections)}")
    print(f"➡️ DETECTIONS: {detections}")
    print("="*50 + "\n")

    return {
        "filename": file.filename,
        "detections": detections
    }