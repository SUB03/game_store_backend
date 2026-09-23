"""Integration tests for auth_service DB helpers against real PostgreSQL."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.exc import IntegrityError

from auth_service.routers.users import users_utils
from auth_service.schemas.users import CreateUser
from auth_service.utils.hash_password import verify_password


async def test_insert_and_get_user(auth_db):
    await users_utils.insert_user(
        CreateUser(username="alice", email="alice@example.com", password="s3cret-pw")
    )

    user = await users_utils.get_user("alice")
    assert user is not None
    assert user.username == "alice"
    assert verify_password("s3cret-pw", user.hashed_password)


async def test_get_unknown_user_returns_none(auth_db):
    assert await users_utils.get_user("nobody") is None


async def test_duplicate_username_is_rejected(auth_db):
    await users_utils.insert_user(
        CreateUser(username="alice", email="alice@example.com", password="pw")
    )
    with pytest.raises(IntegrityError):
        await users_utils.insert_user(
            CreateUser(username="alice", email="other@example.com", password="pw")
        )


async def test_duplicate_email_is_rejected(auth_db):
    await users_utils.insert_user(
        CreateUser(username="alice", email="alice@example.com", password="pw")
    )
    with pytest.raises(IntegrityError):
        await users_utils.insert_user(
            CreateUser(username="bob", email="alice@example.com", password="pw")
        )


async def test_token_whitelist_roundtrip(auth_db):
    jti = uuid.uuid4()
    expiration = datetime.now(timezone.utc) + timedelta(days=31)

    await users_utils.store_token_in_db(jti, expiration)

    row = await users_utils.get_token_from_db(jti)
    assert row is not None
    assert row.uid == jti

    await users_utils.delete_token_from_db(jti)
    assert await users_utils.get_token_from_db(jti) is None


async def test_deleting_unknown_token_is_a_noop(auth_db):
    await users_utils.delete_token_from_db(uuid.uuid4())