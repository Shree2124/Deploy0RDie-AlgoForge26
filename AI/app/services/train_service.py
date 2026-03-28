import os
import subprocess

def train_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    data_yaml_path = os.path.join(base_dir, "data_split", "data.yaml")
    base_model_path = os.path.join(base_dir, "yolov8n.pt")
    
    project_dir = os.path.join(base_dir, "runs", "detect")
    
    command = [
        "yolo", "detect", "train", 
        f"data={data_yaml_path}", 
        f"model={base_model_path}", 
        "epochs=70", 
        "imgsz=640",
        f"project={project_dir}",
        "name=train",
        "exist_ok=True"
    ]
    
    try:
        print("Starting YOLO training...")
        print(f"Weights will be saved exactly to: {project_dir}\\train\\weights\\best.pt")
        subprocess.run(command, cwd=base_dir, check=True)
        print("Training completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Training failed: {e}")