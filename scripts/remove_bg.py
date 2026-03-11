from rembg import remove, new_session
from PIL import Image
import sys

# arguments
input_path = sys.argv[1]
output_path = sys.argv[2]

# use lightweight model (important for low RAM servers)
session = new_session("u2netp")

# open image
img = Image.open(input_path).convert("RGBA")

# remove background
out = remove(img, session=session)

# save result
out.save(output_path)

print("DONE")