from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

app.include_router(api_router)

@app.get("/")
def main():
    return {"message": "Hello World"}
