import cv2
import mediapipe as mp
import numpy as np
import pygame
from threading import Thread
import time
import os
pygame.mixer.init()  # Initialize the mixer
class DrowsinessDetector:
    def __init__(self, ear_thresh=0.21, mar_thresh=0.65, tilt_thresh=16, consec_frames=15):
        
        self.EAR_THRESHOLD = ear_thresh
        self.MAR_THRESHOLD = mar_thresh
        self.HEAD_TILT_THRESHOLD = tilt_thresh
        self.EAR_CONSEC_FRAMES = consec_frames

     
        self.closed_frames = 0
        self.drowsy_score = 0
        self.gps = {"lat": 0.0, "lng": 0.0}

      
        pygame.mixer.init()
        try:
            self.alarm = pygame.mixer.Sound("alarm.wav")
        except:
            print("[Warning] alarm.wav not found. Audio disabled.")
            self.alarm = None


        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

      
        self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
        self.RIGHT_EYE = [362, 385, 387, 263, 373, 380]
        self.MOUTH = [13, 14, 78, 308, 82, 312]

      
        self.capture = None 
        self.running = False
   
        self.latest_data = {
            "ear": 0, "mar": 0, "tilt": 0, 
            "score": 0, "isDrowsy": False, 
            "yawning": False, "gps": self.gps
        }
        self.latest_frame = None

    def update_gps(self, lat, lng):
        self.gps = {"lat": lat, "lng": lng}
    

    def reset(self):
        self.drowsy_score = 0
        self.closed_frames = 0
        self.latest_data["score"] = 0
        print("🔄 Detector Scores Reset")


    def compute_ear(self, pts):
        try:
            p1, p2, p3, p4, p5, p6 = pts
            A = np.linalg.norm(p2 - p6)
            B = np.linalg.norm(p3 - p5)
            C = np.linalg.norm(p1 - p4)
            return (A + B) / (2.0 * C)
        except: return 0

    def compute_mar(self, pts):
        try:
            A = np.linalg.norm(pts[0] - pts[1])
            B = np.linalg.norm(pts[4] - pts[5])
            C = np.linalg.norm(pts[2] - pts[3])
            return (A + B) / (2.0 * C)
        except: return 0

    def compute_head_tilt(self, landmarks):
        try:
            left = landmarks[33]
            right = landmarks[263]
            return np.degrees(np.arctan2(right[1]-left[1], right[0]-left[0]))
        except: return 0


    def start_detection(self):
        if self.running: return
        
      
        if self.capture is None or not self.capture.isOpened():
            self.capture = cv2.VideoCapture(0)

        self.running = True
        Thread(target=self._detection_loop, daemon=True).start()
        print("✅ Detector Started (Sensor Mode)")

    def _detection_loop(self):
        while self.running:
            if self.capture is None: continue
            
            ret, frame = self.capture.read()
            if not ret: continue

            h, w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb)

            ear = mar = tilt = 0
            drowsy = yawning = False

            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image=frame,
                        landmark_list=face_landmarks,
                        connections=self.mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
                    )

                    lm = np.array([(int(p.x*w), int(p.y*h)) for p in face_landmarks.landmark])

                    ear = (self.compute_ear([lm[i] for i in self.LEFT_EYE]) +
                           self.compute_ear([lm[i] for i in self.RIGHT_EYE]))/2
                    mar = self.compute_mar([lm[i] for i in self.MOUTH])
                    tilt = self.compute_head_tilt(lm)

                    eye_closed = ear < self.EAR_THRESHOLD
                    yawning = mar > self.MAR_THRESHOLD
                    tilted = abs(tilt) > self.HEAD_TILT_THRESHOLD

                    if eye_closed: self.closed_frames += 1
                    else: self.closed_frames = 0

                    drowsy = eye_closed and self.closed_frames >= self.EAR_CONSEC_FRAMES

                    if drowsy or yawning or tilted:
                        self.drowsy_score += 1
                        if self.alarm and not pygame.mixer.get_busy():
                            self.alarm.play()
                    else:
                        if self.alarm: self.alarm.stop()

            self.latest_data = {
                "ear": float(ear),
                "mar": float(mar),
                "tilt": float(tilt),
                "score": int(self.drowsy_score),
                "isDrowsy": bool(drowsy),
                "yawning": bool(yawning),
                "gps": self.gps
            }
            self.latest_frame = frame.copy()

    def get_latest_data(self):
        return self.latest_data

    def get_latest_frame(self):
        return self.latest_frame

    def stop(self):
        self.running = False
        if self.capture:
            self.capture.release()
            self.capture = None  
        pygame.mixer.stop()