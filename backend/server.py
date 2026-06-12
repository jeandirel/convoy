from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Admin password (simple shared secret for admin page)
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'gastyconvoy2026')

app = FastAPI(title="GastyConvoy API")
api_router = APIRouter(prefix="/api")


# ==================== Models ====================
class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    subject: Optional[str] = Field(default=None, max_length=200)
    message: str = Field(min_length=5, max_length=4000)


class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QuoteCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=40)
    client_type: str  # particulier / professionnel
    service_type: str  # conduite, livraison, recuperation, transport
    pickup_address: str = Field(min_length=2, max_length=300)
    delivery_address: str = Field(min_length=2, max_length=300)
    pickup_date: Optional[str] = Field(default=None, max_length=40)
    vehicle_brand: Optional[str] = Field(default=None, max_length=120)
    vehicle_model: Optional[str] = Field(default=None, max_length=120)
    vehicle_year: Optional[str] = Field(default=None, max_length=10)
    vehicle_fuel: Optional[str] = Field(default=None, max_length=40)
    notes: Optional[str] = Field(default=None, max_length=2000)


class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    client_type: str
    service_type: str
    pickup_address: str
    delivery_address: str
    pickup_date: Optional[str] = None
    vehicle_brand: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[str] = None
    vehicle_fuel: Optional[str] = None
    notes: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminLogin(BaseModel):
    password: str


class StatusUpdate(BaseModel):
    status: str


# ==================== Auth helper ====================
def require_admin(x_admin_password: Optional[str] = Header(default=None)):
    if not x_admin_password or x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Mot de passe administrateur invalide")
    return True


def _serialize(doc: dict) -> dict:
    doc.pop('_id', None)
    if isinstance(doc.get('created_at'), str):
        try:
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        except ValueError:
            pass
    return doc


# ==================== Public endpoints ====================
@api_router.get("/")
async def root():
    return {"message": "GastyConvoy API", "status": "ok"}


@api_router.post("/contact", response_model=Contact)
async def create_contact(payload: ContactCreate):
    obj = Contact(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    return obj


@api_router.post("/quote", response_model=Quote)
async def create_quote(payload: QuoteCreate):
    obj = Quote(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.quotes.insert_one(doc)
    return obj


# ==================== Admin endpoints ====================
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    return {"ok": True}


@api_router.get("/admin/contacts", response_model=List[Contact])
async def list_contacts(_: bool = Depends(require_admin)):
    items = await db.contacts.find({}).sort("created_at", -1).to_list(1000)
    return [Contact(**_serialize(i)) for i in items]


@api_router.get("/admin/quotes", response_model=List[Quote])
async def list_quotes(_: bool = Depends(require_admin)):
    items = await db.quotes.find({}).sort("created_at", -1).to_list(1000)
    return [Quote(**_serialize(i)) for i in items]


@api_router.patch("/admin/contacts/{contact_id}")
async def update_contact_status(contact_id: str, payload: StatusUpdate, _: bool = Depends(require_admin)):
    res = await db.contacts.update_one({"id": contact_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    return {"ok": True}


@api_router.patch("/admin/quotes/{quote_id}")
async def update_quote_status(quote_id: str, payload: StatusUpdate, _: bool = Depends(require_admin)):
    res = await db.quotes.update_one({"id": quote_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    return {"ok": True}


@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, _: bool = Depends(require_admin)):
    res = await db.contacts.delete_one({"id": contact_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    return {"ok": True}


@api_router.delete("/admin/quotes/{quote_id}")
async def delete_quote(quote_id: str, _: bool = Depends(require_admin)):
    res = await db.quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(_: bool = Depends(require_admin)):
    contacts_total = await db.contacts.count_documents({})
    contacts_new = await db.contacts.count_documents({"status": "new"})
    quotes_total = await db.quotes.count_documents({})
    quotes_new = await db.quotes.count_documents({"status": "new"})
    return {
        "contacts_total": contacts_total,
        "contacts_new": contacts_new,
        "quotes_total": quotes_total,
        "quotes_new": quotes_new,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
