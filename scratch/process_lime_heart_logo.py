from PIL import Image
import numpy as np

src_path = r"C:\Users\Lokesh Sharma\.gemini\antigravity-ide\brain\91429fe4-0ac4-4e27-b92c-c751d2a2b5d2\.user_uploaded\media_1791746541132.jpg"
img = Image.open(src_path).convert("RGBA")
print("Image size:", img.size)

data = np.array(img, dtype=float)
r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

# Measure saturation & green dominance
max_c = np.maximum(np.maximum(r, g), b)
min_c = np.minimum(np.minimum(r, g), b)
saturation = max_c - min_c
green_excess = g - np.maximum(r, b)

# For lime green, g is high and r is medium (yellowish tint: r ~ 150-190, g ~ 210-240, b ~ 40-70).
# Thus, b is very low compared to g!
# In the checkerboard: r ~= g ~= b (saturation < 6).
print("Corner (0,0) saturation:", saturation[0, 0], "RGB:", r[0, 0], g[0, 0], b[0, 0])
# Heart center
cy, cx = img.height // 3, img.width // 2
print(f"Heart ({cx},{cy}) saturation:", saturation[cy, cx], "RGB:", r[cy, cx], g[cy, cx], b[cy, cx])

# Metric: color saturation and green dominance over blue (g - b)
# In the checkerboard: saturation is near 0, g - b is near 0.
# In the lime green heart: saturation is > 40, g - b is > 70!
metric = np.maximum(saturation, g - b)

low_thresh = 12.0
high_thresh = 35.0

alpha = np.zeros_like(r, dtype=float)
alpha[metric <= low_thresh] = 0.0
alpha[metric >= high_thresh] = 255.0

transition = (metric > low_thresh) & (metric < high_thresh)
alpha[transition] = ((metric[transition] - low_thresh) / (high_thresh - low_thresh)) * 255.0

# Also check for any faint sparkles in bottom 10% corners and clear them if they aren't part of the main emblem
out_data = np.array(img)
out_data[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

temp_img = Image.fromarray(out_data, "RGBA")
bbox = temp_img.getbbox()
print("Initial bbox:", bbox)

# The main emblem is located roughly within:
# x: 200 to 800, y: 150 to 850
# Let's zero out anything outside the central emblem region just in case of faint corner watermark/sparkle
mask = np.zeros((img.height, img.width), dtype=bool)
# Keep only central region
mask[140:870, 220:800] = True
out_data[~mask, 3] = 0

final_img = Image.fromarray(out_data, "RGBA")
final_bbox = final_img.getbbox()
print("Final clean bbox:", final_bbox)

cropped = final_img.crop(final_bbox)
print("Cropped dimensions:", cropped.size)

# Add 4% padding
pad = int(max(cropped.size) * 0.04)
padded = Image.new("RGBA", (cropped.width + 2*pad, cropped.height + 2*pad), (0, 0, 0, 0))
padded.paste(cropped, (pad, pad))

# Save outputs to all asset and public locations
padded.save(r"frontend/src/assets/logo_emblem.png", "PNG")
padded.save(r"frontend/public/images/logo_emblem.png", "PNG")
padded.save(r"frontend/src/assets/logo.png", "PNG")
padded.save(r"frontend/public/images/logo.png", "PNG")
padded.save(r"frontend/public/logo.png", "PNG")

print("Successfully saved new lime green heart logo to all directories!")
