import sys
from PIL import Image
import os

try:
    from rembg import remove
except ImportError:
    print("rembg not found, make sure it's installed")
    sys.exit(1)

def main():
    img_path = '/Users/harold/Downloads/Badges final.png'
    out_dir = '/Users/harold/Documents/Programming/themes-and-motifs-microsite/public/badges'
    
    os.makedirs(out_dir, exist_ok=True)
    
    img = Image.open(img_path)
    width, height = img.size
    
    # It's a 2x2 grid based on the visual
    w2 = width // 2
    h2 = height // 2
    
    boxes = [
        (0, 0, w2, h2), # top left
        (w2, 0, width, h2), # top right
        (0, h2, w2, height), # bottom left
        (w2, h2, width, height) # bottom right
    ]
    
    names = ['badge_1.png', 'badge_2.png', 'badge_3.png', 'badge_4.png']
    
    for box, name in zip(boxes, names):
        cropped = img.crop(box)
        # remove background
        out = remove(cropped)
        # remove transparent padding
        out_bbox = out.getbbox()
        if out_bbox:
            out = out.crop(out_bbox)
        
        out_path = os.path.join(out_dir, name)
        out.save(out_path)
        print(f"Saved {out_path}")

if __name__ == '__main__':
    main()
