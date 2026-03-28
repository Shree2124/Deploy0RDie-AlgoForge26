import os
import shutil
import random

# Paths
DATA_ROOT = "data"
IMAGES_PATH = os.path.join(DATA_ROOT, "images")
LABELS_PATH = os.path.join(DATA_ROOT, "labels")

OUTPUT_ROOT = "data_split"
TRAIN_RATIO = 0.8

# Create folders
for split in ["train", "valid"]:
    os.makedirs(f"{OUTPUT_ROOT}/{split}/images", exist_ok=True)
    os.makedirs(f"{OUTPUT_ROOT}/{split}/labels", exist_ok=True)

# Get all images
images = [f for f in os.listdir(IMAGES_PATH) if f.endswith((".jpg", ".png", ".jpeg"))]

print(f"Total images: {len(images)}")

# Shuffle images
random.shuffle(images)

# Split
split_index = int(len(images) * TRAIN_RATIO)
train_images = images[:split_index]
valid_images = images[split_index:]


def copy_files(image_list, split):
    for img_name in image_list:
        img_path = os.path.join(IMAGES_PATH, img_name)
        label_name = os.path.splitext(img_name)[0] + ".txt"
        label_path = os.path.join(LABELS_PATH, label_name)

        # Skip if label not found
        if not os.path.exists(label_path):
            print(f"⚠️ Missing label for {img_name}")
            continue

        # Copy image
        shutil.copy(img_path, f"{OUTPUT_ROOT}/{split}/images/{img_name}")

        # Copy label
        shutil.copy(label_path, f"{OUTPUT_ROOT}/{split}/labels/{label_name}")


# Copy files
copy_files(train_images, "train")
copy_files(valid_images, "valid")

print("✅ Dataset split completed!")