import grpc, asyncio
from grpc.aio import ServicerContext
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.ext.asyncio import create_async_engine

from models import games_ownership

import users_proto.users_service_pb2_grpc as users_service_pb2_grpc
from users_proto.users_service_pb2 import (
    AddGameToUserRequest,
    AddGameToUserResponse,
    GetOwnedGamesRequest,
    GetOwnedGamesResponse,
    HasGameRequest,
    HasGameResponse,
)

class Settings(BaseSettings):
    db_url: str = Field(alias="SQLALCHEMY_URL")
    model_config = SettingsConfigDict(extra="ignore", env_file=".env")

class UsersServiceServicer(users_service_pb2_grpc.UserServiceServicer):
    def __init__(self, settings: Settings):
        self.settings = settings
        self.engine = create_async_engine(settings.db_url)

    async def AddGameToUser(
        self,
        request: AddGameToUserRequest,
        context: ServicerContext
    ) -> AddGameToUserResponse:
        async with self.engine.begin() as conn:
            await conn.execute(games_ownership.insert().values(username=request.username, appid=request.appid))
        return AddGameToUserResponse(appid=request.appid)

    async def HasGame(
        self,
        request: HasGameRequest,
        context: ServicerContext
    ) -> HasGameResponse:
        async with self.engine.begin() as conn:
            result = await conn.execute(games_ownership.select().where(
                games_ownership.c.username == request.username,
                games_ownership.c.appid == request.appid
            ))

            result = result.fetchone()
            print(result)

            return HasGameResponse(
                result = True if result else False
            )

    async def GetOwnedGames(
        self,
        request: GetOwnedGamesRequest,
        context: ServicerContext
    ) -> GetOwnedGamesResponse:
        async with self.engine.begin() as conn:
            result = await conn.execute(
                games_ownership.select().where(
                    games_ownership.c.username == request.username
                )
            )
            rows = result.fetchall()

        return GetOwnedGamesResponse(appids=[row.appid for row in rows])


async def serve():
    settings = Settings()
    server = grpc.aio.server()
    users_service_pb2_grpc.add_UserServiceServicer_to_server(UsersServiceServicer(settings), server)
    server.add_insecure_port('[::]:8003')

    await server.start()
    await server.wait_for_termination()

if __name__ == "__main__":
    asyncio.run(serve())