"""Capture screenshots of EditorNode for portfolio."""
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

        # 1. Editor - main node graph view (zoom out to show full graph)
        await page.goto("http://localhost:3901/EditorNode/index.html", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2000)
        # Try to zoom out to show more nodes
        await page.keyboard.press("Control+Shift+H")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SSDIR, "editor_full.png"), full_page=False)
        print("  [1] editor_full.png")

        # 2. Editor - click on a node to show data panel
        # Find and click the first node
        await page.evaluate("window.scrollTo(0,0)")
        await page.wait_for_timeout(500)
        # Try clicking on a node in the graph
        nodes = await page.query_selector_all(".node-card, .scene-node, [class*='node']")
        if nodes:
            await nodes[0].click()
            await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(SSDIR, "editor_panel.png"), full_page=False)
        print("  [2] editor_panel.png")

        # 3. Editor - try to switch to Data tab if it exists
        data_tabs = await page.query_selector_all("[data-tab='data'], button:has-text('데이터'), button:has-text('Data')")
        if data_tabs:
            await data_tabs[0].click()
            await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SSDIR, "editor_datatab.png"), full_page=False)
        print("  [3] editor_datatab.png")

        # 4. Game - title screen
        await page.goto("http://localhost:3901/game/index.html", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(SSDIR, "game_title.png"), full_page=False)
        print("  [4] game_title.png")

        # 5. Game - start game to see dialogue
        start_btns = await page.query_selector_all("button:has-text('새 게임'), button:has-text('Start'), .start-btn, #new-game")
        if start_btns:
            await start_btns[0].click()
            await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(SSDIR, "game_dialogue.png"), full_page=False)
        print("  [5] game_dialogue.png")

        await browser.close()
    print("\nAll screenshots saved to:", SSDIR)

asyncio.run(main())
