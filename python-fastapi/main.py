from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import cv2, time, os
from threading import Thread
import pygame

pygame.mixer.init()  # Initialize audio alerts
from drowsy_detector import DrowsinessDetector

app = FastAPI(title="Drowsiness Detection API")

# -------------------- Directories --------------------
SNAPSHOT_DIR = "snapshots"
if not os.path.exists(SNAPSHOT_DIR):
    os.makedirs(SNAPSHOT_DIR)

app.mount("/snapshots", StaticFiles(directory=SNAPSHOT_DIR), name="snapshots")

# -------------------- Global Variables --------------------
HISTORY_LOG = []
SESSION_START_TIME = 0
CURRENT_SESSION_ID = ""
detector = DrowsinessDetector()
latest_gps = {"lat": 28.6139, "lng": 77.2090}

# -------------------- Models --------------------
class GPSInput(BaseModel):
    lat: float
    lng: float
    timestamp: float | None = None

class StartInput(BaseModel):
    token: str
    session_id: str

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://drowsy-app-ratx.vercel.app"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- COOP/COEP Middleware --------------------
@app.middleware("http")
async def add_coop_coep_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "unsafe-none"  # Dev-friendly
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
    return response

# -------------------- Startup --------------------
@app.on_event("startup")
async def startup_event():
    print("🚀 Server Starting... Initializing Camera...")
    detector.start_detection()

# -------------------- History Logging --------------------
def record_history_loop():
    while True:
        time.sleep(1)
        data = detector.get_latest_data()
        if not data: continue
        HISTORY_LOG.append({
            "id": len(HISTORY_LOG) + 1,
            "timestamp": time.strftime("%H:%M:%S"),
            "status": "Danger" if data["isDrowsy"] else "Safe",
            "score": data["score"],
            "ear": round(data["ear"], 2),
            "mar": round(data["mar"], 2),
            "isDrowsy": data["isDrowsy"]
        })
        if len(HISTORY_LOG) > 3600:
            HISTORY_LOG.pop(0)
Thread(target=record_history_loop, daemon=True).start()

# -------------------- Endpoints --------------------
@app.post("/start_detection")
async def start_detection(payload: StartInput):
    global HISTORY_LOG, SESSION_START_TIME, CURRENT_SESSION_ID
    HISTORY_LOG = []
    SESSION_START_TIME = time.time()
    CURRENT_SESSION_ID = payload.session_id
    detector.reset()
    detector.start_detection()
    print(f"✅ Session Started. ID: {CURRENT_SESSION_ID}")
    return {"status": "detection started"}

@app.post("/stop")
def stop():
    last_frame = detector.get_latest_frame()
    print("🛑 STOP REQUEST RECEIVED")
    if last_frame is not None and CURRENT_SESSION_ID:
        filename = f"{CURRENT_SESSION_ID}.jpg"
        cv2.imwrite(os.path.join(SNAPSHOT_DIR, filename), last_frame)
    detector.stop()
    if not HISTORY_LOG:
        return {"status": "stopped", "summary": None}
    total_frames = len(HISTORY_LOG)
    avg_ear = sum(log["ear"] for log in HISTORY_LOG) / total_frames
    avg_mar = sum(log["mar"] for log in HISTORY_LOG) / total_frames
    drowsy_frames = sum(1 for log in HISTORY_LOG if log["isDrowsy"])
    max_score = max((log["score"] for log in HISTORY_LOG), default=0)
    duration_seconds = int(time.time() - SESSION_START_TIME)
    summary = {
        "duration": duration_seconds,
        "avgEar": round(avg_ear, 2),
        "avgMar": round(avg_mar, 2),
        "drowsyCount": drowsy_frames,
        "maxScore": max_score,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    return {"status": "stopped", "summary": summary}

@app.post("/update_gps")
async def update_gps(data: GPSInput):
    global latest_gps
    latest_gps = {"lat": data.lat, "lng": data.lng}
    detector.update_gps(data.lat, data.lng)
    return {"status": "success"}

@app.get("/status")
def get_status():
    data = detector.get_latest_data() or {"ear": 0.0, "mar": 0.0, "score": 0, "isDrowsy": False}
    data['gps'] = latest_gps
    return JSONResponse(content=data)

@app.get("/video_feed")
def video_feed():
    def generate():
        while True:
            time.sleep(0.04)
            frame = detector.get_latest_frame()
            if frame is None: continue
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (frame.shape[1], 80), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
            data = detector.get_latest_data()
            color = (0, 0, 255) if data.get('isDrowsy') else (0, 255, 0)
            cv2.putText(frame, f"EAR: {data.get('ear',0):.2f}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)
            cv2.putText(frame, "DROWSY!" if data.get('isDrowsy') else "ACTIVE", (frame.shape[1]-180, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            ret, jpeg = cv2.imencode(".jpg", frame)
            if not ret: continue
            yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")

    headers = {
        "Access-Control-Allow-Origin": "https://drowsy-app-ratx.vercel.app"
    }
    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame", headers=headers)

@app.get("/api/history")
def get_history():
    return {"history": HISTORY_LOG}
