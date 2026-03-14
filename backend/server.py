from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
JWT_SECRET = os.environ.get('JWT_SECRET', 'aptapcodes-secret-2024')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ── Models ──────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    available: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None

class OrderItemSchema(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int
    image_url: str = ""

class OrderCreate(BaseModel):
    table_number: int
    items: List[OrderItemSchema]
    total: float

class StatusUpdate(BaseModel):
    status: str

class AdminLogin(BaseModel):
    password: str


# ── Auth ────────────────────────────────────────────────

async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ")[1]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


# ── Admin Auth ──────────────────────────────────────────

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")
    token = jwt.encode(
        {"role": "admin", "exp": datetime.now(timezone.utc).timestamp() + 86400},
        JWT_SECRET, algorithm="HS256"
    )
    return {"token": token}


# ── Menu ────────────────────────────────────────────────

@api_router.get("/menu")
async def get_menu(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    items = await db.menu_items.find(query, {"_id": 0}).to_list(100)
    return items

@api_router.get("/menu/{item_id}")
async def get_menu_item(item_id: str):
    item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Item not found")
    return item

@api_router.post("/menu")
async def create_menu_item(data: MenuItemCreate, _=Depends(verify_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.menu_items.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, data: MenuItemUpdate, _=Depends(verify_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "No fields to update")
    result = await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Item not found")
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, _=Depends(verify_admin)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Item not found")
    return {"message": "Deleted"}


# ── Orders ──────────────────────────────────────────────

@api_router.post("/orders")
async def create_order(data: OrderCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "table_number": data.table_number,
        "items": [item.model_dump() for item in data.items],
        "total": data.total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/orders")
async def get_orders(status: Optional[str] = None, _=Depends(verify_admin)):
    query = {}
    if status and status != "all":
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return orders

@api_router.get("/orders/table/{table_number}")
async def get_table_orders(table_number: int):
    orders = await db.orders.find(
        {"table_number": table_number}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, data: StatusUpdate, _=Depends(verify_admin)):
    valid = ["pending", "preparing", "ready", "served"]
    if data.status not in valid:
        raise HTTPException(400, f"Status must be one of {valid}")
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"message": "Updated"}

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, _=Depends(verify_admin)):
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Order not found")
    return {"message": "Deleted"}


# ── Tables ──────────────────────────────────────────────

@api_router.get("/tables")
async def get_tables():
    return [{"table_number": i, "label": f"Table {i}"} for i in range(1, 11)]


# ── Seed Data ───────────────────────────────────────────

SEED_ITEMS = [
    {"name": "Truffle Bruschetta", "description": "Crispy sourdough topped with truffle-infused mushrooms and aged parmesan", "price": 14.99, "category": "starters", "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop"},
    {"name": "Crispy Spring Rolls", "description": "Hand-rolled with seasonal vegetables and sweet chili dipping sauce", "price": 11.99, "category": "starters", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"},
    {"name": "French Onion Soup", "description": "Classic caramelized onion soup with gruyere crouton", "price": 12.99, "category": "starters", "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop"},
    {"name": "Garlic Bread Supreme", "description": "Toasted with roasted garlic butter, mozzarella, and fresh herbs", "price": 9.99, "category": "starters", "image_url": "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop"},
    {"name": "Wagyu Ribeye Steak", "description": "Prime cut wagyu with truffle mash and red wine jus", "price": 45.99, "category": "main_course", "image_url": "https://images.unsplash.com/photo-1625604086988-6e41981275fa?w=400&h=300&fit=crop"},
    {"name": "Gourmet Smash Burger", "description": "Double patty with aged cheddar, caramelized onions, and secret sauce", "price": 24.99, "category": "main_course", "image_url": "https://images.unsplash.com/photo-1663530761401-15eefb544889?w=400&h=300&fit=crop"},
    {"name": "Black Truffle Pasta", "description": "Fresh tagliatelle with black truffle cream and parmesan shavings", "price": 28.99, "category": "main_course", "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop"},
    {"name": "Pan-Seared Salmon", "description": "Atlantic salmon with lemon butter, asparagus, and quinoa", "price": 32.99, "category": "main_course", "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop"},
    {"name": "Smoked Old Fashioned", "description": "Bourbon, bitters, and orange zest with a maple smoke finish", "price": 16.99, "category": "drinks", "image_url": "https://images.unsplash.com/photo-1671053804479-a9049588251a?w=400&h=300&fit=crop"},
    {"name": "Reserve Red Wine", "description": "Full-bodied Cabernet Sauvignon, aged 5 years", "price": 18.99, "category": "drinks", "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop"},
    {"name": "Tropical Paradise", "description": "Fresh mango, passion fruit, and coconut water blend", "price": 8.99, "category": "drinks", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop"},
    {"name": "Artisan Espresso", "description": "Single-origin Ethiopian beans, expertly extracted", "price": 6.99, "category": "drinks", "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop"},
    {"name": "Molten Chocolate Cake", "description": "Rich dark chocolate with a flowing center and vanilla gelato", "price": 15.99, "category": "desserts", "image_url": "https://images.unsplash.com/photo-1638180625058-e70c77bd90c6?w=400&h=300&fit=crop"},
    {"name": "Classic Tiramisu", "description": "Layers of mascarpone, espresso-soaked ladyfingers, and cocoa", "price": 13.99, "category": "desserts", "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"},
    {"name": "Artisan Gelato Trio", "description": "Three scoops of house-made gelato with fresh berries", "price": 11.99, "category": "desserts", "image_url": "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop"},
    {"name": "Creme Brulee", "description": "Madagascar vanilla bean custard with caramelized sugar crust", "price": 12.99, "category": "desserts", "image_url": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop"},
]

@api_router.post("/seed")
async def seed_data():
    count = await db.menu_items.count_documents({})
    if count > 0:
        return {"message": "Already seeded", "count": count}
    docs = []
    for item in SEED_ITEMS:
        docs.append({
            "id": str(uuid.uuid4()),
            **item,
            "available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    await db.menu_items.insert_many(docs)
    return {"message": "Seeded", "count": len(docs)}

@app.on_event("startup")
async def auto_seed():
    try:
        count = await db.menu_items.count_documents({})
        if count == 0:
            docs = []
            for item in SEED_ITEMS:
                docs.append({
                    "id": str(uuid.uuid4()),
                    **item,
                    "available": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            await db.menu_items.insert_many(docs)
            logger.info(f"Auto-seeded {len(docs)} menu items")
    except Exception as e:
        logger.error(f"Auto-seed failed: {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
