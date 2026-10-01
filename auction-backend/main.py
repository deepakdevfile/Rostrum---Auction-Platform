from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

@app.get("/")
def main():
    return {"message": "Hello World"}

@app.post("/api/v1/auth/register")
def register():
    return "okay"
