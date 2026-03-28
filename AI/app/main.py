from fastapi import FastAPI
app = FastAPI(title="Detection API")

@app.get("/")
def home():
    return {"message": "API Running"}