from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AddGameToUserRequest(_message.Message):
    __slots__ = ("username", "appid")
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    APPID_FIELD_NUMBER: _ClassVar[int]
    username: str
    appid: int
    def __init__(self, username: _Optional[str] = ..., appid: _Optional[int] = ...) -> None: ...

class AddGameToUserResponse(_message.Message):
    __slots__ = ("appid",)
    APPID_FIELD_NUMBER: _ClassVar[int]
    appid: int
    def __init__(self, appid: _Optional[int] = ...) -> None: ...

class HasGameRequest(_message.Message):
    __slots__ = ("username", "appid")
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    APPID_FIELD_NUMBER: _ClassVar[int]
    username: str
    appid: int
    def __init__(self, username: _Optional[str] = ..., appid: _Optional[int] = ...) -> None: ...

class HasGameResponse(_message.Message):
    __slots__ = ("result",)
    RESULT_FIELD_NUMBER: _ClassVar[int]
    result: bool
    def __init__(self, result: _Optional[bool] = ...) -> None: ...

class GetOwnedGamesRequest(_message.Message):
    __slots__ = ("username",)
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    username: str
    def __init__(self, username: _Optional[str] = ...) -> None: ...

class GetOwnedGamesResponse(_message.Message):
    __slots__ = ("appids",)
    APPIDS_FIELD_NUMBER: _ClassVar[int]
    appids: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, appids: _Optional[_Iterable[int]] = ...) -> None: ...
