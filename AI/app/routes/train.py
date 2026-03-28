from fastapi import APIRouter, BackgroundTasks
from app.services.train_service import train_model

router = APIRouter()

@router.post("/train")
def train(background_tasks: BackgroundTasks):
    background_tasks.add_task(train_model)
    return {"message": "Training started in the background 🚀"}