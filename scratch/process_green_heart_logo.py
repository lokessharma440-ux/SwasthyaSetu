from PIL import Image
import numpy as np

src_path = r"C:\Users\Lokesh Sharma\.gemini\antigravity-ide\brain\91429fe4-0ac4-4e27-b92c-c751d2a2b5d2\.user_uploaded\media_1791746028556.jpg"
img = Image.open(src_path).convert("RGBA")
data = np.array(img, dtype=float)

r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

# Calculate color metrics
max_c = np.maximum(np.maximum(r, g), b)
min_c = np.minimum(np.minimum(r, g), b)
saturation = max_c - min_c
green_excess = g - np.maximum(r, b)

# Foreground mask: pixels that are distinctly green / saturated
# The green logo has green_excess > 20 and saturation > 25
# The gray checkerboard has green_excess <= 3 and saturation <= 5
# Let's create a smooth alpha ramp between threshold low (10) and high (35)
alpha = np.zeros_like(r, dtype=float)

# Metric combining saturation and green excess
metric = np.maximum(saturation * 0.8, green_excess)

low_thresh = 10.0
high_thresh = 35.0

# Fully transparent
alpha[metric <= low_thresh] = 0.0

# Fully opaque
alpha[metric >= high_thresh] = 255.0

# Linear interpolation for anti-aliased edge transition
transition = (metric > low_thresh) & (metric < high_thresh)
alpha[transition] = ((metric[transition] - low_thresh) / (high_thresh - low_thresh)) * 255.0

# Put alpha channel into uint8 image data
out_data = np.array(img)
out_data[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

result = Image.fromarray(out_data, "RGBA")

# Find bounding box of visible content
bbox = result.getbbox()
print("Non-transparent bounding box:", bbox)

cropped = result.crop(bbox)
print("Cropped dimensions:", cropped.size)

# Add subtle 5% padding around emblem
pad = int(max(cropped.size) * 0.05)
padded = Image.new("RGBA", (cropped.width + 2*pad, cropped.height + 2*pad), (0, 0, 0, 0))
padded.paste(cropped, (pad, pad))

# Save outputs
padded.save(r"frontend/src/assets/logo_emblem.png", "PNG")
padded.save(r"frontend/public/images/logo_emblem.png", "PNG")
padded.save(r"frontend/src/assets/logo.png", "PNG")
padded.save(r"frontend/public/images/logo.png", "PNG")
padded.save(r"frontend/public/logo.png", "PNG")

print("Successfully exported new transparent green heart logo to all asset directories!")
