import yaml
import os

def create_data_yaml():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    classes_path = os.path.join(base_dir, "data", "classes.txt")
    output_path = os.path.join(base_dir, "data_split", "data.yaml")
    data_split_abs = os.path.join(base_dir, "data_split").replace("\\", "/")

    with open(classes_path, "r") as f:
        classes = [line.strip() for line in f if line.strip()]

    data = {
        "path": data_split_abs,
        "train": "train/images",
        "val": "valid/images",
        "nc": len(classes),
        "names": classes
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        yaml.dump(data, f, sort_keys=False)

    print(f"✅ data.yaml created at {output_path}!")

if __name__ == "__main__":
    create_data_yaml()