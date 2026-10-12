from PIL import Image
import numpy as np

src_path = r"C:\Users\Lokesh Sharma\.gemini\antigravity-ide\brain\91429fe4-0ac4-4e27-b92c-c751d2a2b5d2\.user_uploaded\media_1791746028556.jpg"
img = Image.open(src_path).convert("RGBA")
print("Size:", img.size)

data = np.array(img, dtype=float)
r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

# Let's inspect some sample pixels
# Top-left corner (0,0) is checkerboard
print("Corner 0,0 RGB:", r[0, 0], g[0, 0], b[0, 0])
print("Sample (50,50) RGB:", r[50, 50], g[50, 50], b[50, 50])

# Center (where green heart is)
center_y, center_x = img.height // 3, img.width // 2
print(f"Center ({center_x}, {center_y}) RGB:", r[center_y, center_x], g[center_y, center_x], b[center_y, center_x])

# The logo is vibrant green: g is significantly higher than r and b!
# In the checkerboard: r ~= g ~= b (grayscale neutrality)
# Let's measure green excess: g - max(r, b)
green_excess = g - np.maximum(r, b)
# Also measure saturation: max(r,g,b) - min(r,g,b)
max_c = np.maximum(np.maximum(r, g), b)
min_c = np.minimum(np.minimum(r, g), b)
saturation = max_c - min_c

print("Checkerboard corner green_excess:", green_excess[0, 0], "saturation:", saturation[0, 0])
print("Heart green_excess:", green_excess[center_y, center_x], "saturation:", saturation[center_y, center_x])
