"""Unit tests for the YooKassa webhook endpoint (gRPC / DB are mocked)."""

import json
from unittest.mock import AsyncMock

import pytest
from starlette.requests import Request

import store_service.routers.store as store_router


def _request(payload: bytes) -> Request:
    async def receive():
        return {"type": "http.request", "body": payload, "more_body": False}

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/store/notifications",
        "headers": [],
        "query_string": b"",
        "client": ("127.0.0.1", 1),
    }
    return Request(scope, receive)


@pytest.fixture
def mocks(monkeypatch):
    has_game = AsyncMock(return_value=False)
    add_game = AsyncMock(return_value={"message": "added the game", "appid": 42})
    monkeypatch.setattr(store_router, "has_game", has_game)
    monkeypatch.setattr(store_router, "add_game", add_game)
    return {"has_game": has_game, "add_game": add_game}


def _succeeded(username="alice", appid="42") -> bytes:
    return json.dumps(
        {
            "event": "payment.succeeded",
            "object": {"metadata": {"username": username, "appid": appid}},
        }
    ).encode()


async def test_succeeded_payment_grants_the_game(mocks):
    response = await store_router.notifications(_request(_succeeded()))
    assert response == {"status": "OK"}
    mocks["has_game"].assert_awaited_once_with(username="alice", appid=42)
    mocks["add_game"].assert_awaited_once_with(username="alice", appid=42)


async def test_succeeded_payment_is_idempotent(mocks):
    mocks["has_game"].return_value = True
    response = await store_router.notifications(_request(_succeeded()))
    assert response == {"status": "OK"}
    mocks["add_game"].assert_not_awaited()


async def test_other_events_are_ignored(mocks):
    payload = json.dumps(
        {
            "event": "payment.canceled",
            "object": {"metadata": {"username": "alice", "appid": "42"}},
        }
    ).encode()
    response = await store_router.notifications(_request(payload))
    assert response == {"status": "OK"}
    mocks["has_game"].assert_not_awaited()
    mocks["add_game"].assert_not_awaited()


async def test_missing_metadata_is_ignored(mocks):
    payload = json.dumps({"event": "payment.succeeded", "object": {}}).encode()
    response = await store_router.notifications(_request(payload))
    assert response == {"status": "OK"}
    mocks["has_game"].assert_not_awaited()
    mocks["add_game"].assert_not_awaited()


async def test_non_integer_appid_is_ignored(mocks):
    response = await store_router.notifications(
        _request(_succeeded(appid="not-a-number"))
    )
    assert response == {"status": "OK"}
    mocks["has_game"].assert_not_awaited()
    mocks["add_game"].assert_not_awaited()


async def test_malformed_body_is_accepted(mocks):
    response = await store_router.notifications(_request(b"not json"))
    assert response == {"status": "OK"}
    mocks["has_game"].assert_not_awaited()
    mocks["add_game"].assert_not_awaited()