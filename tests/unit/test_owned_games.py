"""Unit tests for GET /store/owned_games (DB and gRPC are mocked).

The endpoint is exercised by calling the router function directly instead of
through the ASGI app: importing ``store_service.main`` alongside
``auth_service.main`` would register duplicate Prometheus timeseries in the
single test process.
"""

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import jwt as pyjwt
import pytest
from fastapi import HTTPException

import store_service.routers.store as store_router
from store_service.utils.jwt import settings as store_settings


def _access_token(username: str = "alice") -> str:
    return pyjwt.encode(
        {
            "sub": username,
            "jti": str(uuid.uuid4()),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        store_settings.secret_key,
        algorithm=store_settings.algorithm,
    )


class _FakeEngine:
    """Stands in for store_service.engine; records executed statements."""

    def __init__(self, rows):
        self.rows = rows
        self.statements = []

    def begin(self):
        return self

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def execute(self, stmt):
        self.statements.append(stmt)
        return SimpleNamespace(
            mappings=lambda: SimpleNamespace(all=lambda: self.rows)
        )


@pytest.fixture
def mocks(monkeypatch):
    get_owned_games = AsyncMock(return_value=[])
    monkeypatch.setattr(store_router, "get_owned_games", get_owned_games)
    return {"get_owned_games": get_owned_games}


async def test_owned_games_requires_access_token_cookie(mocks):
    with pytest.raises(HTTPException) as exc_info:
        await store_router.owned_games(access_token=None)
    assert exc_info.value.status_code == 401
    mocks["get_owned_games"].assert_not_awaited()


async def test_owned_games_rejects_invalid_token(mocks):
    with pytest.raises(HTTPException) as exc_info:
        await store_router.owned_games(access_token="not.a.jwt")
    assert exc_info.value.status_code == 401
    mocks["get_owned_games"].assert_not_awaited()


async def test_owned_games_rejects_expired_token(mocks):
    expired = pyjwt.encode(
        {
            "sub": "alice",
            "jti": str(uuid.uuid4()),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        },
        store_settings.secret_key,
        algorithm=store_settings.algorithm,
    )
    with pytest.raises(HTTPException) as exc_info:
        await store_router.owned_games(access_token=expired)
    assert exc_info.value.status_code == 401
    mocks["get_owned_games"].assert_not_awaited()


async def test_owned_games_empty_library_skips_database(mocks):
    fake_engine = _FakeEngine(rows=[])
    store_router.engine = fake_engine
    try:
        result = await store_router.owned_games(access_token=_access_token())
    finally:
        from store_service.engine import engine

        store_router.engine = engine

    assert result == {"results": []}
    assert fake_engine.statements == []
    mocks["get_owned_games"].assert_awaited_once_with(username="alice")


async def test_owned_games_returns_owned_game_rows(mocks):
    mocks["get_owned_games"].return_value = [42]
    rows = [
        {"appid": 42, "name": "Some Game", "price": "9.99", "tags": ["Action"]},
    ]
    fake_engine = _FakeEngine(rows=rows)
    original = store_router.engine
    store_router.engine = fake_engine
    try:
        result = await store_router.owned_games(access_token=_access_token("bob"))
    finally:
        store_router.engine = original

    assert result == {"results": rows}
    assert len(fake_engine.statements) == 1
    mocks["get_owned_games"].assert_awaited_once_with(username="bob")