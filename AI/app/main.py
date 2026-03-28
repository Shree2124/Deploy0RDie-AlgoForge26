from fastapi import FastAPI
from app.routes import predict, train

app = FastAPI(title="Road Damage Detection API")

app.include_router(predict.router)
app.include_router(train.router)

@app.get("/")
def home():
    return {"message": "API Running"}