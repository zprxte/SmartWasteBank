from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import os
import uvicorn

app = FastAPI(title="Waste Classification API")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific frontend URL in production, e.g., ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLOv8 model
MODEL_PATH = "best.pt"

try:
    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) == 0:
        print(f"Warning: Model file '{MODEL_PATH}' is missing or empty. Please download the real best.pt from GitHub and place it in the ai-backend folder.")
        model = None
    else:
        model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def read_root():
    return {"message": "Waste Classification API is running. Send a POST request to /predict with an image."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded. Ensure best.pt is downloaded correctly.")

    try:
        # Read the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Run inference with aggressive NMS (iou=0.2) to prevent drawing multiple boxes on one item
        results = model.predict(image, conf=0.25, iou=0.2, agnostic_nms=True)

        if not results:
            return {"is_waste": False, "message": "No object detected."}

        # Handle classification model (results[0].probs) or object detection model (results[0].boxes)
        result = results[0]
        detected_class = None
        confidence = 0.0
        counts = {}

        if hasattr(result, 'probs') and result.probs is not None:
            # Image classification model
            top1_index = result.probs.top1
            detected_class = result.names[top1_index]
            confidence = float(result.probs.top1conf) * 100
            
            normalized_name = str(detected_class).lower().strip()
            counts[normalized_name] = 1

        elif hasattr(result, 'boxes') and result.boxes is not None and len(result.boxes) > 0:
            # Object detection model
            # Count all detected objects
            for box in result.boxes:
                # You can filter by confidence if needed, e.g., if float(box.conf[0]) > 0.25
                class_id = int(box.cls[0])
                name = str(result.names[class_id]).lower().strip()
                counts[name] = counts.get(name, 0) + 1

            # Get the detection with the highest confidence as the "primary" detected class
            best_box = max(result.boxes, key=lambda b: float(b.conf[0]))
            class_id = int(best_box.cls[0])
            detected_class = result.names[class_id]
            confidence = float(best_box.conf[0]) * 100
        else:
            return {"is_waste": False, "message": "Could not identify any waste in this image."}

        # Normalize the primary detected class name
        detected_class_normalized = str(detected_class).lower().strip()

        return {
            "is_waste": True,
            "detected_class": detected_class_normalized,
            "original_class_name": str(detected_class),
            "confidence": round(confidence, 2),
            "counts": counts,
            "message": f"Detected {detected_class} with {round(confidence, 2)}% confidence."
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
