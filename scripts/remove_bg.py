from rembg import remove
from PIL import Image
import sys
import io

# arguments
input_path = sys.argv[1]
output_path = sys.argv[2]

# read input image
with open(input_path, "rb") as f:
    input_data = f.read()

# remove background
output_data = remove(input_data)

# save result
with open(output_path, "wb") as f:
    f.write(output_data)

print("DONE")