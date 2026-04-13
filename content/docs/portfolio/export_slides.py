import win32com.client
import os

pptx_path = os.path.abspath(r"G:\GSD\content\docs\portfolio\경성뎐_시스템기획_포트폴리오.pptx")
out_dir = os.path.abspath(r"G:\GSD\content\docs\portfolio\slides")
os.makedirs(out_dir, exist_ok=True)

ppt = win32com.client.Dispatch("PowerPoint.Application")
ppt.Visible = True
deck = ppt.Presentations.Open(pptx_path)

for i in range(deck.Slides.Count):
    slide = deck.Slides(i + 1)
    out_path = os.path.join(out_dir, f"slide-{i+1:02d}.jpg")
    slide.Export(out_path, "JPG", 1280, 720)
    print(f"  exported slide {i+1}")

deck.Close()
ppt.Quit()
print("Done. Files:", sorted(os.listdir(out_dir)))
