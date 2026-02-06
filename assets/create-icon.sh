#!/bin/bash

# Create a simple bright yellow square with sun-like design (Solimo branding)
# Using ImageMagick if available
if command -v convert &> /dev/null; then
  convert -size 1024x1024 xc:'#FFF9E6' \
    -fill '#FFD633' -draw "circle 512,512 612,512" \
    icon-app-1024.png
  echo "Created PNG icon"
else
  echo "ImageMagick not found, trying with Python"
  python3 << 'PYTHON'
from PIL import Image, ImageDraw
# Create bright yellow background
img = Image.new('RGB', (1024, 1024), '#FFF9E6')
draw = ImageDraw.Draw(img)
# Draw golden sun circle
draw.ellipse([212, 212, 812, 812], fill='#FFD633', outline='#FFB800', width=20)
img.save('icon-app-1024.png')
print("Created PNG icon with PIL")
PYTHON
fi
