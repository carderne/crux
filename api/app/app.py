from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .crux import calculate
from .models import Statements, People, Pairings, Message


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware)


@app.get("/healthz", response_model=Message, status_code=status.HTTP_200_OK)
async def health():
    return {"message": "Health OK!"}


@app.post("/pair", response_model=Pairings)
async def pair(statements: Statements, people: People):
    pairings = calculate(statements, people)
    return pairings
