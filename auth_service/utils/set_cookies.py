from fastapi import Response

def _set_cookies(
        response: Response,
        access_token: str,
        refresh_token: str,
        csrf: str,
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

    # Mirrors the access token's jti; sent back in the CSRF header by the
    # frontend, so it must stay readable by JS (not httponly) and expire
    # together with the access token it belongs to.
    response.set_cookie(
        key="CSRF",
        value=csrf,
        httponly=False,
        secure=secure,
        max_age=access_token_expire_time_minutes * 60,
    )