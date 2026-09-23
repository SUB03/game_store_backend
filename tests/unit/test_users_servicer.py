"""Unit tests for the users_service gRPC servicer (engine is mocked)."""

from unittest.mock import MagicMock

import pytest
from users_proto.users_service_pb2 import (
    AddGameToUserRequest,
    AddGameToUserResponse,
    HasGameRequest,
    HasGameResponse,
)

from users_service.main import Settings, UsersServiceServicer


class FakeResult:
    def __init__(self, row=None):
        self._row = row

    def fetchone(self):
        return self._row


class FakeConnection:
    def __init__(self, result=None):
        self.result = result if result is not None else FakeResult()
        self.statements = []

    async def execute(self, statement, *args, **kwargs):
        self.statements.append(str(statement))
        return self.result


class FakeEngine:
    def __init__(self, connection):
        self.connection = connection

    def begin(self):
        connection = self.connection

        class _Ctx:
            async def __aenter__(self):
                return connection

            async def __aexit__(self, *exc):
                return False

        return _Ctx()


def _servicer(connection) -> UsersServiceServicer:
    servicer = UsersServiceServicer(Settings(SQLALCHEMY_URL="postgresql+psycopg://user:pw@localhost/db"))
    servicer.engine = FakeEngine(connection)
    return servicer


@pytest.fixture
def context():
    return MagicMock()


async def test_add_game_to_user_inserts_ownership(context):
    connection = FakeConnection()
    servicer = _servicer(connection)

    response = await servicer.AddGameToUser(
        AddGameToUserRequest(username="alice", appid=42), context
    )

    assert isinstance(response, AddGameToUserResponse)
    assert response.appid == 42
    assert len(connection.statements) == 1
    assert "INSERT INTO users_game_ownership" in connection.statements[0]


async def test_has_game_returns_true_when_row_exists(context):
    connection = FakeConnection(FakeResult(row=("alice", 42)))
    servicer = _servicer(connection)

    response = await servicer.HasGame(
        HasGameRequest(username="alice", appid=42), context
    )

    assert isinstance(response, HasGameResponse)
    assert response.result is True
    assert "SELECT" in connection.statements[0]
    assert "users_game_ownership" in connection.statements[0]


async def test_has_game_returns_false_when_row_missing(context):
    connection = FakeConnection(FakeResult(row=None))
    servicer = _servicer(connection)

    response = await servicer.HasGame(
        HasGameRequest(username="alice", appid=42), context
    )

    assert response.result is False