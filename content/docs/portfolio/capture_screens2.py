"""Capture more specific EditorNode screenshots."""
import asyncio
from playwright.async_api import async_playwright
import os

SSDIR = r"G:\GSD\content\docs\portfolio\screenshots"
os.makedirs(SSDIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1600, "height": 900})
        page = await ctx.new_page()

        await page.goto("http://localhost:3901/EditorNode/index.html", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(3000)

        # Try clicking a node to open its side panel
        # Click near the first node in the center area
        await page.mouse.click(300, 250)
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SSDIR, "editor_node_click.png"))
        print("  [1] editor_node_click.png")

        # Try to find and click the data edit button / scene edit
        btns = await page.query_selector_all("button")
        print(f"  Found {len(btns)} buttons")
        for i, btn in enumerate(btns[:10]):
            txt = await btn.inner_text()
            print(f"    btn[{i}]: '{txt}'")

        # Try clicking any scene node
        nodes = await page.query_selector_all(".node-header, .scene-title, [class*='scene']")
        print(f"  Found {len(nodes)} scene elements")

        # Try to click tab buttons at the top
        tabs = await page.query_selector_all("[class*='tab'], nav button, .toolbar button")
        for t in tabs[:5]:
            txt = await t.inner_text()
            print(f"    tab: '{txt}'")

        # Take a screenshot of current state
        await page.screenshot(path=os.path.join(SSDIR, "editor_state.png"))

        # Try to navigate to data mode using keyboard shortcut or clicking toolbar
        # First try clicking on a visible node in the graph
        await page.evaluate("""
            // Try to find any clickable node elements
            const cards = document.querySelectorAll('[class*="card"], [class*="node"], [class*="scene"]');
            if (cards.length > 0) {
                cards[0].click();
                console.log('Clicked:', cards[0].className);
            }
        """)
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SSDIR, "editor_after_click.png"))
        print("  [2] editor_after_click.png")

        # Try to get HTML structure to understand what's clickable
        html_snippet = await page.evaluate("""
            const nodes = document.querySelectorAll('[class*="node"]');
            return Array.from(nodes).slice(0,5).map(n => n.className + '|' + n.tagName).join('\\n');
        """)
        print("  Node elements:", html_snippet[:500])

        # Try switching to Data tab if available in top nav
        nav_items = await page.evaluate("""
            const items = document.querySelectorAll('button, .tab, [role="tab"]');
            return Array.from(items).map(i => ({text: i.textContent.trim(), cls: i.className})).slice(0, 20);
        """)
        print("  Nav items:")
        for item in nav_items:
            print(f"    '{item.get('text','')[:30]}' cls: {item.get('cls','')[:40]}")

        await browser.close()

asyncio.run(main())
