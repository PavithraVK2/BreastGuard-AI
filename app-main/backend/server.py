from fastapi import FastAPI, APIRouter, HTTPException, Header, Cookie, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from bson import ObjectId



from datetime import datetime, timezone
import anyio

import bcrypt
import joblib
import numpy as np

# =============================
# ENVIRONMENT
# =============================

ROOT_DIR = Path(__file__).parent

load_dotenv(ROOT_DIR / ".env")



logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger(__name__)


class InMemoryCollection:
    def __init__(self):
        self._items = []

    async def find_one(self, query):
        if not query:
            return None

        for item in self._items:
            if all(item.get(key) == value for key, value in query.items()):
                return item

        return None

    async def insert_one(self, document):
        self._items.append(document)
        return type("InsertResult", (), {"inserted_id": len(self._items) - 1})()

    async def delete_one(self, query):
        before_count = len(self._items)
        self._items = [
            item for item in self._items
            if not all(item.get(key) == value for key, value in query.items())
        ]
        return type("DeleteResult", (), {"deleted_count": before_count - len(self._items)})()
    async def delete_many(self, query):
        before_count = len(self._items)

        self._items = [
           item for item in self._items
           if not all(item.get(key) == value for key, value in query.items())
        ]

        return type(
           "DeleteResult",
            (),
        {
            "deleted_count": before_count - len(self._items)
        }
    )()
    def find(self, query):
        return InMemoryCursor(
            [
                item for item in self._items
                if all(item.get(key) == value for key, value in query.items())
            ]
        )


class InMemoryCursor:
    def __init__(self, items):
        self._items = items

    async def to_list(self, limit):
        return self._items[:limit]


class InMemoryDatabase:
    def __init__(self):
        self.users = InMemoryCollection()
        self.user_sessions = InMemoryCollection()
        self.predictions = InMemoryCollection()


MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if MONGO_URL and DB_NAME:
    try:
        mongo_client = AsyncIOMotorClient(MONGO_URL)
        db = mongo_client[DB_NAME]
        logger.info("MongoDB connected")
    except Exception as exc:
        logger.warning(f"MongoDB unavailable, using in-memory fallback store: {exc}")
        db = InMemoryDatabase()
else:
    logger.warning("MongoDB settings missing, using in-memory fallback store")
    db = InMemoryDatabase()


# =============================
# FASTAPI
# =============================

app = FastAPI(
    title="BreastGuard AI API"
)


api_router = APIRouter(
    prefix="/api"
)


# =============================
# ML MODEL
# =============================

model: Optional[Any] = None
scaler: Optional[Any] = None
model_metadata: dict = {}


def load_ml_model():

    global model
    global scaler
    global model_metadata


    try:

        model_path = ROOT_DIR / "model" / "svm_model.pkl"

        scaler_path = ROOT_DIR / "model" / "scaler.pkl"


        if model_path.exists() and scaler_path.exists():

            model = joblib.load(model_path)

            scaler = joblib.load(scaler_path)


            model_metadata = {

                "accuracy": 0.97,

                "features": 30

            }


            logger.info(
                "SVM Model Loaded"
            )


        else:

            logger.warning(
                "Model files not found"
            )


    except Exception as e:

        logger.error(
            f"Model error: {e}"
        )

# =============================
# DATABASE MODELS
# =============================


class UserRegister(BaseModel):

    email: EmailStr

    password: str

    name: str



class UserLogin(BaseModel):

    email: EmailStr

    password: str



class PredictionInput(BaseModel):

    features: List[float]

    patient_name: Optional[str] = "Anonymous"



class PredictionResult(BaseModel):

    model_config = ConfigDict(
        extra="ignore"
    )


    prediction_id: str

    user_id: str

    patient_name: str

    result: str

    confidence: float

    features: List[float]

    created_at: datetime



class DashboardStats(BaseModel):

    total_predictions: int

    benign_count: int

    malignant_count: int

    accuracy: float


def to_json_safe(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (list, tuple)):
        return [to_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {str(key): to_json_safe(item) for key, item in value.items()}
    if hasattr(value, "dict") and callable(value.dict):
        return to_json_safe(value.dict())
    return str(value)


# =============================
# AUTHENTICATION
# =============================


async def get_current_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    logger.info(f"Cookie token: {session_token}")
    logger.info(f"Authorization: {authorization}")

    token = session_token

    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")

    logger.info(f"Using token: {token}")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")


    session = await db.user_sessions.find_one(

        {
            "session_token": token
        }

    

    )

    session = to_json_safe(session)
    if not session:

        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )


    user = await db.users.find_one(

        {
            "user_id": session["user_id"]
        }
    
    
       

    )
    user = to_json_safe(user)

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )


    return user



# =============================
# REGISTER
# =============================


@api_router.post("/auth/register")
async def register(
    user_data: UserRegister
):


    exists = await db.users.find_one(

        {
            "email": user_data.email
        }

    )


    if exists:

        raise HTTPException(

            status_code=400,

            detail="Email already registered"

        )


    password_hash = bcrypt.hashpw(

        user_data.password.encode(),

        bcrypt.gensalt()

    )


    user_id = (
        f"user_{uuid.uuid4().hex[:10]}"
    )


    await db.users.insert_one(

        {

            "user_id": user_id,

            "email": user_data.email,

            "name": user_data.name,

            "password_hash": password_hash.decode(),

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    session_token = (
        f"session_{uuid.uuid4().hex}"
    )


    await db.user_sessions.insert_one(

        {

            "user_id": user_id,

            "session_token": session_token,

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    response = JSONResponse(
        {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "session_token": session_token
        }
    )
    response.set_cookie(
    key="session_token",
    value=session_token,
    httponly=True,
    samesite="lax",
    secure=False,
    path="/"
)


    return response

# =============================
# LOGIN
# =============================


@api_router.post("/auth/login")
async def login(
    data: UserLogin
):


    user = await db.users.find_one(

        {
            "email": data.email
        }

    )


    if not user:

        raise HTTPException(

            status_code=401,

            detail="Invalid email/password"

        )


    valid = bcrypt.checkpw(

        data.password.encode(),

        user["password_hash"].encode()

    )


    if not valid:

        raise HTTPException(

            status_code=401,

            detail="Invalid email/password"

        )


    token = (
        f"session_{uuid.uuid4().hex}"
    )


    await db.user_sessions.insert_one(

        {

            "user_id": user["user_id"],

            "session_token": token,

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    response = JSONResponse(

        {

            "message": "Login success",

            "session_token": token,

            "name": user["name"]

        }

    )

    response.set_cookie(
    key="session_token",
    value=token,
    httponly=True,
    samesite="lax",
    secure=False,
    path="/"
)

    return response




# =============================
# USER ROUTES
# =============================

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"]
    }


@api_router.post("/auth/logout")
async def logout(

    response: Response,

    session_token: Optional[str] = Cookie(None)

):


    if session_token:

        await db.user_sessions.delete_one(

            {
                "session_token": session_token
            }

        )


    response.delete_cookie(
        "session_token"
    )


    return {

        "message": "Logout success"

    }




# =============================
# PREDICTION
# =============================


@api_router.post(
    "/predictions",
    response_model=PredictionResult
)
async def prediction(

    data: PredictionInput,

    user: dict = Depends(get_current_user)

):


    if model is None or scaler is None:

        raise HTTPException(

            status_code=503,

            detail="Model not loaded"

        )


    if len(data.features) != 30:

        raise HTTPException(

            status_code=400,

            detail="Need exactly 30 features"

        )


    values = np.array(

        data.features

    ).reshape(1,-1)



    scaled = scaler.transform(

        values

    )


    output = model.predict(scaled)[0]

    if hasattr(model, "predict_proba"):
       probabilities = model.predict_proba(scaled)[0]
       confidence = float(max(probabilities))
    else:
       decision = model.decision_function(scaled)[0]
       confidence = float(1 / (1 + np.exp(-abs(decision))))


    if output == 1:
       result = "Benign"
    else:
     result = "Malignant"


    if confidence >= 0.90:
       confidence_level = "High Confidence"
    elif confidence >= 0.70:
       confidence_level = "Medium Confidence"
    else:
       confidence_level = "Low Confidence"


    if result == "Benign":
       risk_level = "Low Risk"
       severity = "Non-Cancerous Pattern Detected"
    else:
       risk_level = "High Risk"
       severity = "Malignant Pattern Detected - Medical Review Required"

   

    prediction_id = (

        f"pred_{uuid.uuid4().hex[:10]}"

    )


    record = {

        "prediction_id": prediction_id,

        "user_id": user["user_id"],

        "patient_name": data.patient_name,

        "result": result,

        "risk_level": risk_level,

        "severity": severity,

        "confidence":confidence,

        "features": data.features,

        "created_at":
        datetime.now(timezone.utc).isoformat()

    }


    await db.predictions.insert_one(

        record

    )


    return PredictionResult(

        prediction_id=prediction_id,

        user_id=user["user_id"],

        patient_name=data.patient_name,

        result=result,

        confidence=confidence,

        features=data.features,

        created_at=datetime.now(timezone.utc)

    ) 
# =============================
# CLEAR REPORTS
# =============================

@api_router.delete("/reports/clear")
async def clear_reports(
    user: dict = Depends(get_current_user)
):
    print("CLEAR REPORT USER:", user)
    records = await db.predictions.find(
        {
            "user_id": user["user_id"]
        }
    ).to_list(1000)
    print("REPORT COUNT:", len(records))
    deleted_count = 0

    for record in records:
        result = await db.predictions.delete_one(
            {
                "prediction_id": record["prediction_id"]
            }
        )
        deleted_count += result.deleted_count

    return {
        "message": "Reports cleared successfully",
        "deleted": deleted_count
    } 
 # =============================
# DASHBOARD
# =============================


@api_router.get(
    "/dashboard/stats",
    response_model=DashboardStats
)
async def dashboard(

    user: dict = Depends(get_current_user)

):


    records = await db.predictions.find(

        {
            "user_id": user["user_id"]
        }

    ).to_list(1000)



    total = len(records)


    benign = sum(

        1 for x in records

        if x["result"] == "Benign"

    )


    malignant = total - benign



    return DashboardStats(

        total_predictions=total,

        benign_count=benign,

        malignant_count=malignant,

        accuracy=model_metadata.get(
            "accuracy",
            0.97
        )

    )

# =============================
# GET ALL PREDICTIONS
# =============================

@api_router.get(
    "/predictions",
    response_model=List[PredictionResult]
)
async def get_predictions(
    user: dict = Depends(get_current_user)
):
    records = await db.predictions.find(
        {
            "user_id": user["user_id"]
        }
    ).to_list(1000)

    return [
        PredictionResult(
            prediction_id=item["prediction_id"],
            user_id=item["user_id"],
            patient_name=item.get("patient_name", "Anonymous"),
            result=item["result"],
            confidence=item.get("confidence", 0.97),
            features=item.get("features", []),
            created_at=datetime.fromisoformat(item["created_at"])
        )
        for item in records
    ]
# =============================
# DELETE SINGLE PREDICTION
# =============================
# =============================
# DELETE SINGLE PREDICTION
# =============================
@api_router.delete("/predictions/{prediction_id}")
async def delete_prediction(
    prediction_id: str,
    user: dict = Depends(get_current_user)
):

    print("DELETE ID RECEIVED:", prediction_id)

    records = await db.predictions.find(
        {}
    ).to_list(1000)

    print("ALL RECORDS:")
    for r in records:
        print(r.get("prediction_id"), r.get("user_id"))


    record = await db.predictions.find_one(
        {
            "prediction_id": prediction_id
        }
    )


    print("MATCHED RECORD:", record)


    if not record:
        raise HTTPException(
            status_code=404,
            detail="Prediction record not found"
        )


    result = await db.predictions.delete_one(
        {
            "prediction_id": prediction_id
        }
    )


    return {
        "message":"Prediction deleted successfully",
        "deleted":result.deleted_count
    }


 
@api_router.delete("/predictions/clear")
async def clear_predictions(
    user: dict = Depends(get_current_user)
):

    result = await db.predictions.delete_many(
        {
            "user_id": user["user_id"]
        }
    )

    return {
        "message": "All prediction records deleted",
        "deleted": result.deleted_count
    }
# =============================
# MODEL INFO
# =============================


@api_router.get("/model/info")
async def model_info():


    return {

        "loaded": model is not None,

        "accuracy":
        model_metadata.get(
            "accuracy",
            0.97
        ),

        "features": 30

    }


from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

from  fastapi import APIRouter, HTTPException, Header, Cookie, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from bson import ObjectId



from datetime import datetime, timezone
import anyio

import bcrypt
import joblib
import numpy as np

# =============================
# ENVIRONMENT
# =============================

ROOT_DIR = Path(__file__).parent

load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger(__name__)


class InMemoryCollection:
    def __init__(self):
        self._items = []

    async def find_one(self, query):
        if not query:
            return None

        for item in self._items:
            if all(item.get(key) == value for key, value in query.items()):
                return item

        return None

    async def insert_one(self, document):
        self._items.append(document)
        return type("InsertResult", (), {"inserted_id": len(self._items) - 1})()

    async def delete_one(self, query):
        before_count = len(self._items)
        self._items = [
            item for item in self._items
            if not all(item.get(key) == value for key, value in query.items())
        ]
        return type("DeleteResult", (), {"deleted_count": before_count - len(self._items)})()
    async def delete_many(self, query):
        before_count = len(self._items)

        self._items = [
           item for item in self._items
           if not all(item.get(key) == value for key, value in query.items())
        ]

        return type(
           "DeleteResult",
            (),
        {
            "deleted_count": before_count - len(self._items)
        }
    )()
    def find(self, query):
        return InMemoryCursor(
            [
                item for item in self._items
                if all(item.get(key) == value for key, value in query.items())
            ]
        )


class InMemoryCursor:
    def __init__(self, items):
        self._items = items

    async def to_list(self, limit):
        return self._items[:limit]


class InMemoryDatabase:
    def __init__(self):
        self.users = InMemoryCollection()
        self.user_sessions = InMemoryCollection()
        self.predictions = InMemoryCollection()


MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if MONGO_URL and DB_NAME:
    try:
        mongo_client = AsyncIOMotorClient(MONGO_URL)
        db = mongo_client[DB_NAME]
        logger.info("MongoDB connected")
    except Exception as exc:
        logger.warning(f"MongoDB unavailable, using in-memory fallback store: {exc}")
        db = InMemoryDatabase()
else:
    logger.warning("MongoDB settings missing, using in-memory fallback store")
    db = InMemoryDatabase()


# =============================
# FASTAPI
# =============================

app = FastAPI(
    title="BreastGuard AI API"
)


api_router = APIRouter(
    prefix="/api"
)


# =============================
# ML MODEL
# =============================

model: Optional[Any] = None
scaler: Optional[Any] = None
model_metadata: dict = {}


def load_ml_model():

    global model
    global scaler
    global model_metadata


    try:

        model_path = ROOT_DIR / "model" / "svm_model.pkl"

        scaler_path = ROOT_DIR / "model" / "scaler.pkl"


        if model_path.exists() and scaler_path.exists():

            model = joblib.load(model_path)

            scaler = joblib.load(scaler_path)


            model_metadata = {

                "accuracy": 0.97,

                "features": 30

            }


            logger.info(
                "SVM Model Loaded"
            )


        else:

            logger.warning(
                "Model files not found"
            )


    except Exception as e:

        logger.error(
            f"Model error: {e}"
        )

# =============================
# DATABASE MODELS
# =============================


class UserRegister(BaseModel):

    email: EmailStr

    password: str

    name: str



class UserLogin(BaseModel):

    email: EmailStr

    password: str



class PredictionInput(BaseModel):

    features: List[float]

    patient_name: Optional[str] = "Anonymous"



class PredictionResult(BaseModel):

    model_config = ConfigDict(
        extra="ignore"
    )


    prediction_id: str

    user_id: str

    patient_name: str

    result: str

    confidence: float

    features: List[float]

    created_at: datetime



class DashboardStats(BaseModel):

    total_predictions: int

    benign_count: int

    malignant_count: int

    accuracy: float


def to_json_safe(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (list, tuple)):
        return [to_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {str(key): to_json_safe(item) for key, item in value.items()}
    if hasattr(value, "dict") and callable(value.dict):
        return to_json_safe(value.dict())
    return str(value)


# =============================
# AUTHENTICATION
# =============================


async def get_current_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    logger.info(f"Cookie token: {session_token}")
    logger.info(f"Authorization: {authorization}")

    token = session_token

    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")

    logger.info(f"Using token: {token}")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")


    session = await db.user_sessions.find_one(

        {
            "session_token": token
        }

    

    )

    session = to_json_safe(session)
    if not session:

        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )


    user = await db.users.find_one(

        {
            "user_id": session["user_id"]
        }
    
    
       

    )
    user = to_json_safe(user)

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )


    return user



# =============================
# REGISTER
# =============================


@api_router.post("/auth/register")
async def register(
    user_data: UserRegister
):


    exists = await db.users.find_one(

        {
            "email": user_data.email
        }

    )


    if exists:

        raise HTTPException(

            status_code=400,

            detail="Email already registered"

        )


    password_hash = bcrypt.hashpw(

        user_data.password.encode(),

        bcrypt.gensalt()

    )


    user_id = (
        f"user_{uuid.uuid4().hex[:10]}"
    )


    await db.users.insert_one(

        {

            "user_id": user_id,

            "email": user_data.email,

            "name": user_data.name,

            "password_hash": password_hash.decode(),

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    session_token = (
        f"session_{uuid.uuid4().hex}"
    )


    await db.user_sessions.insert_one(

        {

            "user_id": user_id,

            "session_token": session_token,

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    response = JSONResponse(
        {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "session_token": session_token
        }
    )
    response.set_cookie(
    key="session_token",
    value=session_token,
    httponly=True,
    samesite="lax",
    secure=False,
    path="/"
)


    return response

# =============================
# LOGIN
# =============================


@api_router.post("/auth/login")
async def login(
    data: UserLogin
):


    user = await db.users.find_one(

        {
            "email": data.email
        }

    )


    if not user:

        raise HTTPException(

            status_code=401,

            detail="Invalid email/password"

        )


    valid = bcrypt.checkpw(

        data.password.encode(),

        user["password_hash"].encode()

    )


    if not valid:

        raise HTTPException(

            status_code=401,

            detail="Invalid email/password"

        )


    token = (
        f"session_{uuid.uuid4().hex}"
    )


    await db.user_sessions.insert_one(

        {

            "user_id": user["user_id"],

            "session_token": token,

            "created_at":
            datetime.now(timezone.utc).isoformat()

        }

    )


    response = JSONResponse(

        {

            "message": "Login success",

            "session_token": token,

            "name": user["name"]

        }

    )

    response.set_cookie(
    key="session_token",
    value=token,
    httponly=True,
    samesite="lax",
    secure=False,
    path="/"
)

    return response




# =============================
# USER ROUTES
# =============================

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"]
    }


@api_router.post("/auth/logout")
async def logout(

    response: Response,

    session_token: Optional[str] = Cookie(None)

):


    if session_token:

        await db.user_sessions.delete_one(

            {
                "session_token": session_token
            }

        )


    response.delete_cookie(
        "session_token"
    )


    return {

        "message": "Logout success"

    }




# =============================
# PREDICTION
# =============================


@api_router.post(
    "/predictions",
    response_model=PredictionResult
)
async def prediction(

    data: PredictionInput,

    user: dict = Depends(get_current_user)

):


    if model is None or scaler is None:

        raise HTTPException(

            status_code=503,

            detail="Model not loaded"

        )


    if len(data.features) != 30:

        raise HTTPException(

            status_code=400,

            detail="Need exactly 30 features"

        )


    values = np.array(

        data.features

    ).reshape(1,-1)



    scaled = scaler.transform(

        values

    )


    output = model.predict(scaled)[0]

    if hasattr(model, "predict_proba"):
       probabilities = model.predict_proba(scaled)[0]
       confidence = float(max(probabilities))
    else:
       decision = model.decision_function(scaled)[0]
       confidence = float(1 / (1 + np.exp(-abs(decision))))


    if output == 1:
       result = "Benign"
    else:
     result = "Malignant"


    if confidence >= 0.90:
       confidence_level = "High Confidence"
    elif confidence >= 0.70:
       confidence_level = "Medium Confidence"
    else:
       confidence_level = "Low Confidence"


    if result == "Benign":
       risk_level = "Low Risk"
       severity = "Non-Cancerous Pattern Detected"
    else:
       risk_level = "High Risk"
       severity = "Malignant Pattern Detected - Medical Review Required"

   

    prediction_id = (

        f"pred_{uuid.uuid4().hex[:10]}"

    )


    record = {

        "prediction_id": prediction_id,

        "user_id": user["user_id"],

        "patient_name": data.patient_name,

        "result": result,

        "risk_level": risk_level,

        "severity": severity,

        "confidence":confidence,

        "features": data.features,

        "created_at":
        datetime.now(timezone.utc).isoformat()

    }


    await db.predictions.insert_one(

        record

    )


    return PredictionResult(

        prediction_id=prediction_id,

        user_id=user["user_id"],

        patient_name=data.patient_name,

        result=result,

        confidence=confidence,

        features=data.features,

        created_at=datetime.now(timezone.utc)

    ) 
# =============================
# CLEAR REPORTS
# =============================

@api_router.delete("/reports/clear")
async def clear_reports(
    user: dict = Depends(get_current_user)
):
    print("CLEAR REPORT USER:", user)
    records = await db.predictions.find(
        {
            "user_id": user["user_id"]
        }
    ).to_list(1000)
    print("REPORT COUNT:", len(records))
    deleted_count = 0

    for record in records:
        result = await db.predictions.delete_one(
            {
                "prediction_id": record["prediction_id"]
            }
        )
        deleted_count += result.deleted_count

    return {
        "message": "Reports cleared successfully",
        "deleted": deleted_count
    } 
 # =============================
# DASHBOARD
# =============================


@api_router.get(
    "/dashboard/stats",
    response_model=DashboardStats
)
async def dashboard(

    user: dict = Depends(get_current_user)

):


    records = await db.predictions.find(

        {
            "user_id": user["user_id"]
        }

    ).to_list(1000)



    total = len(records)


    benign = sum(

        1 for x in records

        if x["result"] == "Benign"

    )


    malignant = total - benign



    return DashboardStats(

        total_predictions=total,

        benign_count=benign,

        malignant_count=malignant,

        accuracy=model_metadata.get(
            "accuracy",
            0.97
        )

    )

# =============================
# GET ALL PREDICTIONS
# =============================

@api_router.get(
    "/predictions",
    response_model=List[PredictionResult]
)
async def get_predictions(
    user: dict = Depends(get_current_user)
):
    records = await db.predictions.find(
        {
            "user_id": user["user_id"]
        }
    ).to_list(1000)

    return [
        PredictionResult(
            prediction_id=item["prediction_id"],
            user_id=item["user_id"],
            patient_name=item.get("patient_name", "Anonymous"),
            result=item["result"],
            confidence=item.get("confidence", 0.97),
            features=item.get("features", []),
            created_at=datetime.fromisoformat(item["created_at"])
        )
        for item in records
    ]
# =============================
# DELETE SINGLE PREDICTION
# =============================
# =============================
# DELETE SINGLE PREDICTION
# =============================
@api_router.delete("/predictions/{prediction_id}")
async def delete_prediction(
    prediction_id: str,
    user: dict = Depends(get_current_user)
):

    print("DELETE ID RECEIVED:", prediction_id)

    records = await db.predictions.find(
        {}
    ).to_list(1000)

    print("ALL RECORDS:")
    for r in records:
        print(r.get("prediction_id"), r.get("user_id"))


    record = await db.predictions.find_one(
        {
            "prediction_id": prediction_id
        }
    )


    print("MATCHED RECORD:", record)


    if not record:
        raise HTTPException(
            status_code=404,
            detail="Prediction record not found"
        )


    result = await db.predictions.delete_one(
        {
            "prediction_id": prediction_id
        }
    )


    return {
        "message":"Prediction deleted successfully",
        "deleted":result.deleted_count
    }


 
@api_router.delete("/predictions/clear")
async def clear_predictions(
    user: dict = Depends(get_current_user)
):

    result = await db.predictions.delete_many(
        {
            "user_id": user["user_id"]
        }
    )

    return {
        "message": "All prediction records deleted",
        "deleted": result.deleted_count
    }
# =============================
# MODEL INFO
# =============================


@api_router.get("/model/info")
async def model_info():


    return {

        "loaded": model is not None,

        "accuracy":
        model_metadata.get(
            "accuracy",
            0.97
        ),

        "features": 30

    }


from pydantic import BaseModel









# =============================
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
    allow_origin_regex=r"http://localhost(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

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

    logger.info(
        "Backend stopped"
    )



# =============================
# RUN SERVER
# =============================


if __name__ == "__main__":

    import uvicorn


    uvicorn.run(

        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )     

# =============================
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
    allow_origin_regex=r"http://localhost(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

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

    logger.info(
        "Backend stopped"
    )



# =============================
# RUN SERVER
# =============================


if __name__ == "__main__":

    import uvicorn


    uvicorn.run(

        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )