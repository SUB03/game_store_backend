from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from store_service.routers import store

import time
from typing import Awaitable, Callable
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency",
    ["endpoint"]
)

api = FastAPI()
api.include_router(store.router)

origins = [
    "http://localhost",
    "http://localhost:3001",
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.middleware("http")
async def metrics_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    REQUEST_COUNT.labels(
        request.method,
        request.url.path,
        response.status_code
    ).inc()

    REQUEST_LATENCY.labels(request.url.path).observe(duration)
    return response

@api.get('/')
async def index():
    return {"message": "game store index"}

@api.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST) 