"""Unit tests for auth_service password hashing helpers."""

from auth_service.utils.hash_password import (
    ALGORITHM,
    DUMMY_HASH,
    SECRET_KEY,
    get_password_hash,
    verify_dummy,
    verify_password,
)


def test_secret_key_is_loaded_from_environment():
    assert SECRET_KEY
    assert ALGORITHM == "HS256"


def test_hash_roundtrip():
    hashed = get_password_hash("s3cret-pw")
    assert hashed != "s3cret-pw"
    assert verify_password("s3cret-pw", hashed) is True


def test_wrong_password_is_rejected():
    hashed = get_password_hash("s3cret-pw")
    assert verify_password("wrong-pw", hashed) is False


def test_hashes_are_salted():
    assert get_password_hash("same-pw") != get_password_hash("same-pw")


def test_verify_dummy_never_raises():
    # Used to keep login timing consistent for unknown users.
    assert verify_dummy("whatever") is None
    assert verify_dummy("") is None


def test_dummy_hash_is_not_the_plain_password():
    assert DUMMY_HASH != "daoGiMoiajhsdaih"
    assert verify_password("daoGiMoiajhsdaih", DUMMY_HASH) is True