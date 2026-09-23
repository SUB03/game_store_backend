"""Unit tests for JWT creation and decoding (auth_service + store_service)."""

import uuid
from datetime import datetime, timedelta, timezone

import jwt as pyjwt
import pytest
from fastapi import HTTPException

from auth_service.routers.users.users_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_MINUTES,
    create_jwt_token,
    create_tokens,
)
from auth_service.utils.hash_password import ALGORITHM, SECRET_KEY
from auth_service.utils.jwt import decode_jwt
from store_service.utils.jwt import decode_jwt as store_decode_jwt
from store_service.utils.jwt import settings as store_settings


def _future(delta: timedelta) -> datetime:
    return datetime.now(timezone.utc) + delta


def _past(delta: timedelta) -> datetime:
    return datetime.now(timezone.utc) - delta


def test_create_jwt_token_roundtrip():
    token = create_jwt_token({"sub": "alice", "exp": _future(timedelta(minutes=5))})
    payload = decode_jwt(token, SECRET_KEY, ALGORITHM)
    assert payload["sub"] == "alice"


def test_decode_rejects_expired_token():
    token = create_jwt_token({"sub": "alice", "exp": _past(timedelta(minutes=1))})
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt(token, SECRET_KEY, ALGORITHM)
    assert exc_info.value.status_code == 401


def test_decode_rejects_wrong_secret():
    token = pyjwt.encode(
        {"sub": "alice", "exp": _future(timedelta(minutes=5))},
        "not-the-secret",
        algorithm=ALGORITHM,
    )
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt(token, SECRET_KEY, ALGORITHM)
    assert exc_info.value.status_code == 401


def test_decode_rejects_garbage_token():
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt("not.a.jwt", SECRET_KEY, ALGORITHM)
    assert exc_info.value.status_code == 401


def test_create_tokens_claims_and_expiration():
    jti = str(uuid.uuid4())
    access_token, refresh_token, refresh_expire = create_tokens("bob", jti)

    assert access_token != refresh_token

    access = pyjwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
    refresh = pyjwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

    assert access["sub"] == refresh["sub"] == "bob"
    assert access["jti"] == refresh["jti"] == jti

    now = datetime.now(timezone.utc).timestamp()
    access_ttl = access["exp"] - now
    refresh_ttl = refresh["exp"] - now

    assert ACCESS_TOKEN_EXPIRE_MINUTES * 60 - 60 <= access_ttl <= ACCESS_TOKEN_EXPIRE_MINUTES * 60 + 60
    assert REFRESH_TOKEN_EXPIRE_MINUTES * 60 - 120 <= refresh_ttl <= REFRESH_TOKEN_EXPIRE_MINUTES * 60 + 60
    assert refresh_ttl > access_ttl

    # returned refresh expiration matches the token's exp claim
    assert abs(refresh_expire.timestamp() - refresh["exp"]) < 5


def test_store_decode_accepts_valid_token():
    token = pyjwt.encode(
        {"sub": "carol", "jti": str(uuid.uuid4()), "exp": _future(timedelta(minutes=5))},
        store_settings.secret_key,
        algorithm=store_settings.algorithm,
    )
    assert store_decode_jwt(token)["sub"] == "carol"


def test_store_decode_rejects_expired_token():
    token = pyjwt.encode(
        {"sub": "carol", "jti": str(uuid.uuid4()), "exp": _past(timedelta(minutes=1))},
        store_settings.secret_key,
        algorithm=store_settings.algorithm,
    )
    with pytest.raises(HTTPException) as exc_info:
        store_decode_jwt(token)
    assert exc_info.value.status_code == 401


def test_store_decode_rejects_wrong_secret():
    token = pyjwt.encode(
        {"sub": "carol", "jti": str(uuid.uuid4()), "exp": _future(timedelta(minutes=5))},
        "not-the-secret",
        algorithm=store_settings.algorithm,
    )
    with pytest.raises(HTTPException) as exc_info:
        store_decode_jwt(token)
    assert exc_info.value.status_code == 401


def test_store_and_auth_share_secret_and_algorithm():
    # store_service must be able to validate tokens issued by auth_service
    assert store_settings.secret_key == SECRET_KEY
    assert store_settings.algorithm == ALGORITHM