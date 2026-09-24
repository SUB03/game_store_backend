import logging
from typing import Annotated

from fastapi import HTTPException, routing, Depends, status, Request, Cookie, Header, Query, Path
from sqlalchemy import select, func

from store_service.schemas.games import Price
from store_service.engine import engine
from store_service.models.models import games_table, tags_table
from store_service.routers.store_utils import get_price, has_game, make_payment, add_game, get_owned_games
from store_service.schemas.games import PurchaseGame
from store_service.utils.jwt import decode_jwt
from store_service.schemas.token import Token
from store_service.utils.tag_groups import _TAG_TO_GROUP, TAG_GROUPS

logger = logging.getLogger("store_service")

router = routing.APIRouter(
    prefix="/store",
    tags=["store"]
)

@router.get("/tags")
async def get_tags(
    tags: str | None = Query(
        None, description="Comma-separated tags; only count games that have ALL of them"
    ),
):
    tags = [t for t in (tags or "").split(",") if t] or None
    
    async with engine.begin() as conn:
        if not tags:
            # No filter: count every tag across all games
            stmt = (
                select(
                    tags_table.c.tags.label("tag"),
                    func.count(func.distinct(tags_table.c.appid)).label("game_count"),
                )
                .group_by(tags_table.c.tags)
                .order_by(func.count(func.distinct(tags_table.c.appid)).desc())
            )
        else:
            # Find games that have ALL selected tags, then count tags within that subset
            matching_games = (
                select(tags_table.c.appid)
                .where(tags_table.c.tags.in_(tags))
                .group_by(tags_table.c.appid)
                .having(
                    func.count(func.distinct(tags_table.c.tags)) >= len(tags)
                )
                .subquery()
            )
            stmt = (
                select(
                    tags_table.c.tags.label("tag"),
                    func.count(func.distinct(tags_table.c.appid)).label("game_count"),
                )
                .where(tags_table.c.appid.in_(select(matching_games.c.appid)))
                .group_by(tags_table.c.tags)
                .order_by(func.count(func.distinct(tags_table.c.appid)).desc())
            )

        result = await conn.execute(stmt)
        rows = result.mappings().all()

    grouped: dict[str, list[dict]] = {}
    other: list[dict] = []

    for row in rows:
        group = _TAG_TO_GROUP.get(row["tag"])
        if group:
            grouped.setdefault(group, []).append(row)
        else:
            other.append(row)

    if other:
        grouped["Other"] = other

    # Preserve the order of TAG_GROUPS, drop empty groups
    ordered = {
        name: grouped[name]
        for name in [*TAG_GROUPS, "Other"]
        if name in grouped
    }
    return ordered

@router.get("/games/{appid}")
async def get_game(appid: Annotated[int, Path(title="appid of the game in db")]):
    async with engine.begin() as conn:
        result = await conn.execute(
            games_table.select().where(games_table.c.appid == appid)
        )
    return result.mappings().first()

@router.get("/games")
async def get_games(
    offset: int = Query(0, ge=0),
    search: str | None = Query(None, description="Search by name"),
    tags: str | None = Query(
        None, description="Comma-separated tags; filter by tags (AND)"
    ),
):
    tags = [t for t in (tags or "").split(",") if t] or None
    limit = 12

    stmt = (
        select(games_table, func.array_agg(tags_table.c.tags).label("tags"))
        .join(tags_table, tags_table.c.appid == games_table.c.appid, isouter=True)
        .group_by(games_table.c.appid)
        .order_by(games_table.c.recommendations.desc(),  games_table.c.appid)
        .limit(limit + 1)  # fetch one extra to detect next page
        .offset(offset)
    )

    if search:
        stmt = stmt.where(games_table.c.name.ilike(f"%{search}%"))

    if tags:
        # Only include games that have ALL the requested tags
        stmt = stmt.having(
            func.count(func.distinct(tags_table.c.tags)).filter(
                tags_table.c.tags.in_(tags)
            ) >= len(tags)
        )
    
    async with engine.begin() as conn:
        result = await conn.execute(stmt)
        result = result.mappings().all()

    is_next_page = len(result) > limit

    return {
        "results": result[:limit],
        "is_next_page": is_next_page,
    }

@router.get("/owned_games")
async def owned_games(access_token: Annotated[str | None, Cookie()] = None):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="could not validate credentials"
        )
    claims = Token(**decode_jwt(access_token))

    appids = await get_owned_games(username=claims.sub)
    if not appids:
        return {"results": []}

    stmt = (
        select(games_table, func.array_agg(tags_table.c.tags).label("tags"))
        .join(tags_table, tags_table.c.appid == games_table.c.appid, isouter=True)
        .where(games_table.c.appid.in_(appids))
        .group_by(games_table.c.appid)
        .order_by(games_table.c.name)
    )

    async with engine.begin() as conn:
        result = await conn.execute(stmt)
        rows = result.mappings().all()

    return {"results": rows}


@router.post("/purchase_game")
async def purchase_game(
    purchase: PurchaseGame,
    csrf: Annotated[str | None, Header(alias="CSRF")] = None,
    access_token: Annotated[str | None, Cookie()] = None,
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="could not validate credentials"
        )
    claims = Token(**decode_jwt(access_token))
    if not csrf or csrf != str(claims.jti):
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
    """YooKassa webhook: grant the game when a payment succeeds.

    Always answers 200 fast (YooKassa retries on non-2xx / timeouts).
    Ownership is idempotent - re-delivered webhooks must not fail.
    """
    logger.info("YooKassa notification received")
    try:
        payload = await request.json()
    except Exception:
        logger.warning(
            "YooKassa notification ignored: request body is not valid JSON",
            exc_info=True,
        )
        return {"status": "OK"}

    if not isinstance(payload, dict):
        logger.warning(
            "YooKassa notification ignored: JSON payload is not an object",
            extra={"payload_type": type(payload).__name__},
        )
        return {"status": "OK"}

    event = payload.get("event")
    obj = payload.get("object")
    payment_id = obj.get("id") if isinstance(obj, dict) else None
    log_context = {
        "event": event,
        "payment_id": payment_id,
    }

    if event != "payment.succeeded":
        logger.info(
            "YooKassa notification ignored: event is not payment.succeeded",
            extra=log_context,
        )
        return {"status": "OK"}

    metadata = obj.get("metadata") if isinstance(obj, dict) else None
    metadata = metadata if isinstance(metadata, dict) else {}
    username = metadata.get("username")
    appid = metadata.get("appid")

    if not username or appid is None:
        logger.warning(
            "Succeeded payment ignored: username or appid metadata is missing",
            extra={**log_context, "username": username, "appid": appid},
        )
        return {"status": "OK"}

    try:
        appid = int(appid)
    except (TypeError, ValueError):
        logger.warning(
            "Succeeded payment ignored: appid metadata is not an integer",
            extra={**log_context, "username": username, "raw_appid": repr(appid)[:200]},
        )
        return {"status": "OK"}

    ownership_context = {**log_context, "username": username, "appid": appid}
    logger.info(
        "Checking ownership for succeeded payment",
        extra=ownership_context,
    )
    try:
        already_owned = await has_game(username=username, appid=appid)
    except Exception as exc:
        logger.exception(
            "Failed to check ownership for succeeded payment",
            extra={**ownership_context, "error_type": type(exc).__name__},
        )
        raise

    if already_owned:
        logger.info(
            "Game is already owned; skipping grant for succeeded payment",
            extra={**ownership_context, "already_owned": True},
        )
        return {"status": "OK"}

    try:
        result = await add_game(username=username, appid=appid)
    except Exception as exc:
        logger.exception(
            "Failed to add game for succeeded payment",
            extra={**ownership_context, "error_type": type(exc).__name__},
        )
        raise

    logger.info(
        "Successfully added game for succeeded payment",
        extra={
            **ownership_context,
            "result_appid": result.get("appid") if isinstance(result, dict) else None,
        },
    )
    return {"status": "OK"}