# not used now

from playwright.sync_api import sync_playwright
import time

def scrape_steam_category_tags(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        # Wait for the tag container to appear.
        # Steam often uses a div with id "tags" or a data attribute.
        page.wait_for_selector("#tags, [data-featuretarget='tags']", timeout=15000)

        # Keep clicking "Show more" buttons until none are left.
        # The button text might be "Show more" or "显示更多" depending on locale.
        while True:
            show_more = page.locator(
                "button:has-text('Show more'), button:has-text('显示更多'), "
                "a:has-text('Show more'), a:has-text('显示更多')"
            )
            count = show_more.count()
            if count == 0:
                break
            for i in range(count):
                try:
                    show_more.nth(i).click(timeout=2000)
                    # Give the page a moment to load the new tags.
                    page.wait_for_timeout(500)
                except Exception:
                    # Button might have disappeared after another click.
                    pass
            # Wait a bit before checking for new buttons.
            page.wait_for_timeout(1000)

        # Now extract the tags grouped by category.
        # The structure typically looks like:
        # <div class="block_header">Genres</div>
        # <div class="tags_container">
        #   <a href="/search/?tags=...">Action</a>
        #   ...
        # </div>
        groups = {}
        # Find all section headers.
        headers = page.locator(
            "div.block_header, h2, .filter_section_title, [data-featuretarget='filter-header']"
        )
        for i in range(headers.count()):
            header = headers.nth(i)
            header_text = header.inner_text().strip()
            # Find the next sibling container that holds the tags.
            # This selector is a guess; inspect the DOM to refine.
            container = header.locator("xpath=following-sibling::*[1]")
            if container.count() == 0:
                continue
            # Extract all tag links inside the container.
            tag_links = container.locator("a[href*='tags='], a.tag, a.app_tag")
            tags = []
            for j in range(tag_links.count()):
                tag_text = tag_links.nth(j).inner_text().strip()
                if tag_text:
                    tags.append(tag_text)
            if tags:
                groups[header_text] = tags

        browser.close()
        return groups

# Example usage:
if __name__ == "__main__":
    result = scrape_steam_category_tags(
        "https://store.steampowered.com/category/action"
    )
    for group, tags in result.items():
        print(f"{group}: {tags}")