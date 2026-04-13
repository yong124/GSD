"""Capture EditorNode with data panel open."""
import asyncio
from playwright.async_api import async_playwright
import os
import sys

# Fix encoding
sys.stdout.reconfigure(encoding='utf-8')

SSDIR = r"G:\GSD\content\docs\portfolio\screenshots"
os.makedirs(SSDIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1600, "height": 900})
        page = await ctx.new_page()

        await page.goto("http://localhost:3901/EditorNode/index.html", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(3000)

        # Get button list safely
        nav_items = await page.evaluate("""
            const items = document.querySelectorAll('button, [role="tab"]');
            return Array.from(items).map((i,idx) => ({
                idx,
                text: (i.textContent || '').trim().substring(0, 20),
                cls: (i.className || '').substring(0, 40),
                id: i.id || ''
            })).slice(0, 30);
        """)
        for item in nav_items:
            print(f"  [{item['idx']}] '{item['text']}' id={item['id']} cls={item['cls']}")

        # Find "데이터" tab or similar
        data_tab_idx = await page.evaluate("""
            const btns = Array.from(document.querySelectorAll('button, [role="tab"]'));
            const idx = btns.findIndex(b => {
                const t = b.textContent || '';
                return t.includes('데이터') || t.includes('Data') || t.includes('Edit');
            });
            if (idx >= 0) btns[idx].click();
            return idx;
        """)
        print(f"  Data tab index: {data_tab_idx}")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SSDIR, "editor_data_mode.png"))
        print("  Saved: editor_data_mode.png")

        # Also try clicking on a node card to show inspector
        clicked = await page.evaluate("""
            // Try double-clicking a node
            const nodeCards = document.querySelectorAll('.node-card, [data-scene-id], .scene-node-wrap');
            if (nodeCards.length > 0) {
                const rect = nodeCards[0].getBoundingClientRect();
                return {found: true, x: rect.x + rect.width/2, y: rect.y + rect.height/2, cls: nodeCards[0].className.substring(0,40)};
            }
            return {found: false};
        """)
        print(f"  Node card: {clicked}")
        if clicked.get('found'):
            await page.mouse.double_click(clicked['x'], clicked['y'])
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SSDIR, "editor_node_open.png"))
            print("  Saved: editor_node_open.png")

        # Try to find the scene list / right panel
        panel = await page.evaluate("""
            const panels = document.querySelectorAll('[class*="panel"], [class*="sidebar"], [class*="inspector"], [class*="right"]');
            return Array.from(panels).slice(0,5).map(p => ({cls: p.className.substring(0,50), visible: p.offsetWidth > 0}));
        """)
        print(f"  Panels found: {panel}")

        await browser.close()

asyncio.run(main())
