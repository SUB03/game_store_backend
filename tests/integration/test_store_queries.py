"""Integration tests for store_service catalog queries against real PostgreSQL.

Router functions are called directly (instead of through the ASGI app) so that
``store_service.main`` is never imported alongside ``auth_service.main`` in the
test process (duplicate Prometheus metric registration).
"""

import store_service.routers.store as store_router


async def test_get_game_returns_seeded_game(seed_game):
    appid = await seed_game(name="Hollow Depth", price="14.99")
    game = await store_router.get_game(appid)
    assert game is not None
    assert game["name"] == "Hollow Depth"
    assert float(game["price"]) == 14.99


async def test_get_unknown_game_returns_none(seed_game):
    await seed_game()
    assert await store_router.get_game(999_999) is None


async def test_get_games_paginates_and_signals_next_page(seed_game):
    for i in range(13):
        await seed_game(name=f"Game {i:02d}", recommendations=i)

    # all params passed explicitly: defaults are fastapi Query() markers,
    # which are not resolved when calling the function directly
    first = await store_router.get_games(offset=0, search=None, tags=None)
    assert len(first["results"]) == 12
    assert first["is_next_page"] is True

    second = await store_router.get_games(offset=12, search=None, tags=None)
    assert len(second["results"]) == 1
    assert second["is_next_page"] is False


async def test_get_games_orders_by_recommendations(seed_game):
    await seed_game(name="Niche", recommendations=5)
    await seed_game(name="Hit", recommendations=5000)
    await seed_game(name="Mid", recommendations=50)

    page = await store_router.get_games(offset=0, search=None, tags=None)
    names = [row["name"] for row in page["results"]]
    assert names == ["Hit", "Mid", "Niche"]


async def test_get_games_search_is_case_insensitive(seed_game):
    await seed_game(name="Zelda-like Adventure")
    await seed_game(name="Space Shooter")

    page = await store_router.get_games(offset=0, search="ZELDA", tags=None)
    assert [row["name"] for row in page["results"]] == ["Zelda-like Adventure"]


async def test_get_games_search_with_no_matches(seed_game):
    await seed_game(name="Space Shooter")
    page = await store_router.get_games(offset=0, search="nothing-matches", tags=None)
    assert page["results"] == []
    assert page["is_next_page"] is False


async def test_get_games_includes_aggregated_tags(seed_game):
    appid = await seed_game(name="Tagged", tags=("Action", "Roguelike"))
    page = await store_router.get_games(offset=0, search=None, tags="Action")
    row = next(r for r in page["results"] if r["appid"] == appid)
    assert sorted(row["tags"]) == ["Action", "Roguelike"]
