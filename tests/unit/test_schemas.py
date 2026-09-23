"""Unit tests for auth_service and store_service Pydantic schemas."""

from datetime import datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from auth_service.schemas.token import Token
from auth_service.schemas.users import CreateUser, UserBase, UserDB
from store_service.schemas.games import Price, PurchaseGame, RequiresAuth


# --- auth schemas -----------------------------------------------------------

def test_user_base_requires_username():
    assert UserBase(username="alice").username == "alice"
    with pytest.raises(ValidationError):
        UserBase()


def test_user_db_requires_hashed_password():
    with pytest.raises(ValidationError):
        UserDB(username="alice")


def test_create_user_accepts_valid_input():
    user = CreateUser(username="alice", email="alice@example.com", password="pw")
    assert user.email == "alice@example.com"


def test_create_user_rejects_invalid_email():
    with pytest.raises(ValidationError):
        CreateUser(username="alice", email="not-an-email", password="pw")


def test_create_user_requires_password():
    with pytest.raises(ValidationError):
        CreateUser(username="alice", email="alice@example.com")


def test_token_parses_jwt_claims():
    exp = 1_800_000_000  # int timestamp as produced by PyJWT
    token = Token(sub="alice", exp=exp, jti=uuid4())
    assert token.sub == "alice"
    assert isinstance(token.exp, datetime)
    assert token.exp.timestamp() == pytest.approx(exp)


def test_token_rejects_missing_sub():
    with pytest.raises(ValidationError):
        Token(exp=1_800_000_000, jti=uuid4())


def test_token_rejects_invalid_jti():
    with pytest.raises(ValidationError):
        Token(sub="alice", exp=1_800_000_000, jti="not-a-uuid")


# --- store schemas ----------------------------------------------------------

def test_requires_auth_requires_csrf():
    assert RequiresAuth(csrf="abc").csrf == "abc"
    with pytest.raises(ValidationError):
        RequiresAuth()


def test_purchase_game_requires_csrf_and_appid():
    purchase = PurchaseGame(csrf="abc", appid=42)
    assert purchase.appid == 42
    with pytest.raises(ValidationError):
        PurchaseGame(csrf="abc")
    with pytest.raises(ValidationError):
        PurchaseGame(appid=42)


def test_price_accepts_extra_fields_from_db_row():
    # the purchase flow does Price(**row._asdict()) on a full store_games row
    price = Price(price="9.99", appid=42, name="Some Game")
    assert float(price.price) == pytest.approx(9.99)