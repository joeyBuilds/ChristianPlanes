#!/usr/bin/env python3
"""Convert white/near-white pixels to transparent in blueprint PNGs.

Usage: python3 scripts/white-to-transparent.py [file.png ...]
       python3 scripts/white-to-transparent.py --all
"""
import sys
from pathlib import Path
from PIL import Image
import numpy as np

BLUEPRINT_DIR = Path(__file__).resolve().parent.parent / "public/aircraft-images/blueprint"

def fix_png(path):
    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    # White or near-white pixels (R>240, G>240, B>240) → transparent
    mask = (arr[:,:,0] > 240) & (arr[:,:,1] > 240) & (arr[:,:,2] > 240)
    arr[mask, 3] = 0
    Image.fromarray(arr).save(path)
    count = mask.sum()
    print(f"  {Path(path).name}: {count:,} white pixels → transparent")

if '--all' in sys.argv:
    for f in sorted(BLUEPRINT_DIR.glob('*.png')):
        if 'e175' in f.name: continue
        fix_png(str(f))
else:
    for f in sys.argv[1:]:
        fix_png(f)
