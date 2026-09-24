from pydantic import BaseModel

class PurchaseGame(BaseModel):
    appid: int

class Price(BaseModel):
    price: float