import os
import subprocess

def train_model():
    # The absolute path to your project root `d:\AlgoForge\ai`
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Absolute paths for configuration and base model
    data_yaml_path = os.path.join(base_dir, "data_split", "data.yaml")
    base_model_path = os.path.join(base_dir, "yolov8n.pt")
    
    # The exact folder where we will store the trained weights "here only"
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
        print("🚀 Starting YOLO training...")
        print(f"📁 Weights will be saved exactly to: {project_dir}\\train\\weights\\best.pt")
        # subprocess.run correctly handles the command arguments over os.system
        # and we set cwd safely to base_dir
        subprocess.run(command, cwd=base_dir, check=True)
        print("✅ Training completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Training failed: {e}")