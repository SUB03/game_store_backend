from fastapi import Response

def _set_cookies(
        response: Response,
        access_token: str,
        refresh_token: str,
        secure: bool,
        access_token_expire_time_minutes: int,
        refresh_token_expire_time_minutes: int,
    ):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        max_age=access_token_expire_time_minutes * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        max_age=refresh_token_expire_time_minutes * 60,
    )