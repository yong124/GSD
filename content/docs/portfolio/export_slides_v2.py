import win32com.client, os
pptx_path = os.path.abspath(r"G:\GSD\content\docs\portfolio\경성뎐_시스템기획_포트폴리오_v2.pptx")
out_dir = os.path.abspath(r"G:\GSD\content\docs\portfolio\slides_v2")
os.makedirs(out_dir, exist_ok=True)
ppt = win32com.client.Dispatch("PowerPoint.Application")
ppt.Visible = True
deck = ppt.Presentations.Open(pptx_path)
for i in range(deck.Slides.Count):
    deck.Slides(i+1).Export(os.path.join(out_dir, f"slide-{i+1:02d}.jpg"), "JPG", 1280, 720)
    print(f"  slide {i+1}")
deck.Close()
ppt.Quit()
print("Done:", sorted(os.listdir(out_dir)))
