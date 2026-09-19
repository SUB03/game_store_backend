TAG_GROUPS: dict[str, set[str]] = {
    "Genres": {
        "Action", "Adventure", "RPG", "Strategy", "Simulation",
        "Indie", "Casual", "Racing", "Sports", "Puzzle",
        "Platformer", "Shooter", "Fighting", "Stealth", "Survival",
    },
    "Perspective": {
        "2D", "3D", "First-Person", "Third-Person", "Top-Down",
        "Isometric", "Side Scroller", "VR", "Pixel Graphics", "Cartoony",
    },
    "Mood": {
        "Atmospheric", "Relaxing", "Funny", "Horror", "Dark",
        "Emotional", "Cute", "Sci-Fi", "Fantasy", "Post-Apocalyptic",
    },
    "Features": {
        "Multiplayer", "Co-op", "Singleplayer", "PvP", "Local Co-Op",
        "Online Co-Op", "Split Screen", "Controller", "Moddable",
        "Early Access", "Free to Play",
    },
    "Difficulty": {
        "Difficult", "Souls-like", "Roguelike", "Roguelite",
        "Permadeath", "Bullet Hell",
    },
}

# Build a reverse lookup once at import time
_TAG_TO_GROUP = {
    tag: group for group, tags in TAG_GROUPS.items() for tag in tags
}

print(_TAG_TO_GROUP)