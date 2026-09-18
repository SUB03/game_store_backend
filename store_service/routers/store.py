from typing import Annotated

from fastapi import HTTPException, routing, Depends, status, Request, Cookie, Query, Path
from sqlalchemy import select, func

from store_service.schemas.games import Price
from store_service.engine import engine
from store_service.models.models import games, tags
from store_service.routers.store_utils import get_price, has_game, make_payment, add_game
from store_service.schemas.games import PurchaseGame
from store_service.utils.jwt import decode_jwt
from store_service.schemas.token import Token

router = routing.APIRouter(
    prefix="/store",
    tags=["store"]
)

@router.get("/games/{appid}")
async def get_game(appid: Annotated[int, Path(title="appid of the game in db")]):
    async with engine.begin() as conn:
        result = await conn.execute(
            games.select().where(games.c.appid == appid)
        )
    return result.mappings().first()

@router.get("/games")
async def get_games(offset: int = Query(0, ge=0)):
    limit = 12
    #TODO: add search filters and limit + 1 trick with returning is_next_page
    
    async with engine.begin() as conn:
        result = await conn.execute(
            select(games, func.array_agg(tags.c.tags).label("tags"))
            .join(tags, tags.c.appid == games.c.appid, isouter=True)
            .group_by(games.c.appid)
            .order_by(games.c.recommendations.desc())
            .limit(limit).offset((offset) * limit))
        result = result.mappings().all()
    return result

@router.post("/purchase_game")
async def purchase_game(purchase: PurchaseGame, access_token: Annotated[str | None, Cookie()] = None):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="could not validate credentials"
        )
    claims = Token(**decode_jwt(access_token))
    if not purchase.csrf == str(claims.jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="could not validate credentials"
        )

    result = await has_game(username=claims.sub, appid=purchase.appid)
    if result:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="already owned by the user"
        )

    game_price = await get_price(purchase.appid)
    if not game_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="appid is not found"
        )
    game_price = Price(**game_price._asdict())
    if game_price.price > 0:
        response = await make_payment(username=claims.sub, appid=purchase.appid, price=str(game_price.price))
        return {
            "payment_id": response.payment_id,
            "confirmation_url": response.confirmation_url,
        }
    else:
        result = await add_game(username=claims.sub, appid=purchase.appid)
        return result
    

@router.post("/notifications")
async def notifications(request: Request):
    result = await request.body()
    print(result)
    return {"status": "OK"}