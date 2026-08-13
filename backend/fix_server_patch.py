from pathlib import Path

path = Path(__file__).parent / 'server.py'
text = path.read_text(encoding='utf-8')
marker = 'from pydantic import BaseModel\n\nclass ChatRequest(BaseModel):\n    message: str\n\n\nfrom dotenv import load_dotenv\n'
idx = text.find(marker)
if idx == -1:
    raise SystemExit('Duplicate server block start marker not found')
new_tail = '''# =============================
# INCLUDE ROUTER
# =============================

app.include_router(
    api_router
)


# Simple health endpoint
@app.get("/health")
async def health():
    return {"status": "ok"}


# Model readiness
@app.get("/model/ready")
async def model_ready():
    return {"loaded": model is not None}


# =============================
# CORS
# =============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================
# STARTUP
# =============================

@app.on_event("startup")
async def startup():
    try:
        await anyio.to_thread.run_sync(load_ml_model)
        logger.info("Backend started")
    except Exception as e:
        logger.error(f"Startup error: {e}")


# =============================
# SHUTDOWN
# =============================

@app.on_event("shutdown")
async def shutdown():
    try:
        if "mongo_client" in globals():
            mongo_client.close()
    except Exception:
        pass
    logger.info("Backend stopped")


# =============================
# RUN SERVER
# =============================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
'''
path.write_text(text[:idx] + new_tail, encoding='utf-8')
print('server.py patched successfully')
