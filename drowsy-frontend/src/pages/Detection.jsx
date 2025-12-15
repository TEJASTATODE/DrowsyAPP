import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  RiStopCircleLine, 
  RiMapPinUserLine, 
  RiEyeLine, 
  RiFocus3Line,
  RiSteeringLine, 
  RiLogoutBoxRLine, 
  RiAlarmWarningLine 
} from "react-icons/ri";
import { TbActivityHeartbeat, TbFaceId } from "react-icons/tb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DrowsyMap from "../components/DrowsyMap";

const CleanMetric = ({ label, value, max, threshold, inverse, unit = "", icon: Icon }) => {
  const safeValue = Number(value) || 0;
  const isDanger = inverse ? safeValue > threshold : safeValue < threshold;
  const percentage = Math.min((safeValue / max) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Icon className="text-slate-400" size={16} />
          {label}
        </div>
        <span className={`font-mono text-sm font-bold ${isDanger ? "text-red-600" : "text-slate-900"}`}>
          {safeValue.toFixed(2)}{unit}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${isDanger ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const Detection = () => {
  const [status, setStatus] = useState({ ear: 0, mar: 0, tilt: 0, score: 0, isDrowsy: false, isDistracted: false });
  const [detectionStopped, setDetectionStopped] = useState(false);
  const [coords, setCoords] = useState(null); 
  const [sosActive, setSosActive] = useState(false);

  const intervalRef = useRef(null);
  const NODE_URL = "https://drowsyapp-1.onrender.com";
  const PYTHON_URL = "https://photophilous-maliyah-subinvolute.ngrok-free.dev"; 
  const VIDEO_FEED_URL = `${PYTHON_URL}/video_feed`;

  // Start detection session
  useEffect(() => {
    const startSystem = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?._id) {
          const nodeRes = await axios.post(`${NODE_URL}/api/sessions/start`, { userId: user._id });
          if (nodeRes.data.success) localStorage.setItem("sessionId", nodeRes.data.sessionId);
        }
        const storedId = localStorage.getItem("sessionId");
        if(storedId) await axios.post(`${PYTHON_URL}/start_detection`, { token: "demo", session_id: storedId });
        toast.success("System Ready");
      } catch (err) { toast.error("Connection Error"); }
    };
    startSystem();
    return () => clearInterval(intervalRef.current);
  }, []);

  // Fetch metrics from Python server
  useEffect(() => {
    if (!detectionStopped) {
      intervalRef.current = setInterval(async () => {
        try {
          const res = await axios.get(`${PYTHON_URL}/status`);
          if (res.data) {
            setStatus(res.data);
            if (res.data.isDrowsy) toast.error("CRITICAL FATIGUE", { className: "bg-red-600 text-white border-0" });
            else if (res.data.isDistracted) toast.warning("EYES ON ROAD", { className: "bg-orange-500 text-white border-0" });
          }
        } catch (err) {
          console.error("Status fetch failed:", err);
        }
      }, 500);
    }
    return () => clearInterval(intervalRef.current);
  }, [detectionStopped]);

  // Track GPS
  useEffect(() => {
    if (navigator.geolocation && !detectionStopped) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          try { await axios.post(`${PYTHON_URL}/update_gps`, { lat: latitude, lng: longitude }); } catch {}
        }, 
        (err) => console.warn("GPS Warning:", err.message), 
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [detectionStopped]);

  // SOS button
  const handleTriggerSOS = async () => {
    if (sosActive) return;
    setSosActive(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const contactNumber = user?.emergencyContact || "911";
    window.location.href = `tel:${contactNumber}`;
    try {
      await axios.post(`${NODE_URL}/api/sos/send`, {
        userId: user._id,
        location: coords || { lat: 0, lng: 0 },
        reason: "Manual Help Request"
      });
      toast.error("SOS SENT", { className: "bg-red-700 text-white font-bold border-0" });
    } catch (err) {
      toast.error("SOS Network Error");
      setSosActive(false); 
    }
  };

  // Stop detection
  const handleStop = async () => {
    setDetectionStopped(true);
    clearInterval(intervalRef.current);
    try {
      const pyRes = await axios.post(`${PYTHON_URL}/stop`);
      const sessionId = localStorage.getItem("sessionId"); 
      if (sessionId && pyRes.data.summary) {
        await axios.post(`${NODE_URL}/api/sessions/stop`, { sessionId, summary: pyRes.data.summary });
      }
      toast.success("Session Saved");
    } catch { toast.error("Error Saving Data"); } 
    finally { setTimeout(() => window.location.href = "/profile", 1000); }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 z-20 shadow-sm hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-md">
              <RiSteeringLine size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">SafeSteer</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-blue-700">SYSTEM ACTIVE</span>
            </div>
            <p className="text-[10px] text-blue-600">Monitoring driver alertness levels in real-time.</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={handleStop}>
          <RiLogoutBoxRLine className="mr-3" size={18} /> End Session
        </Button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Monitoring</h1>
            <p className="text-slate-500 text-sm">Real-time driver fatigue & distraction analysis</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="destructive" 
              onClick={handleTriggerSOS} 
              disabled={sosActive}
              className={`h-11 px-6 rounded-full font-bold shadow-lg transition-all flex-1 md:flex-none ${sosActive ? 'opacity-50' : 'hover:scale-105 hover:bg-red-600 shadow-red-200'}`}
            >
              <RiAlarmWarningLine className={`mr-2 ${!sosActive && 'animate-pulse'}`} size={20} />
              {sosActive ? "SIGNAL SENT" : "EMERGENCY SOS"}
            </Button>
            <Button variant="outline" onClick={handleStop} className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full px-6">
              <RiStopCircleLine className="mr-2" /> Stop
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 h-auto md:h-[calc(100vh-140px)]">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <Card className="flex-1 overflow-hidden border-slate-200 shadow-sm relative bg-white rounded-3xl min-h-[400px]">
              {!detectionStopped ? (
                <img 
                  src={VIDEO_FEED_URL} 
                  alt="Live Feed" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                  <TbFaceId size={48} /><span>Feed Inactive</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> CAM 01 • LIVE
              </div>
              {status.isDrowsy && <div className="absolute inset-0 border-[8px] border-red-500/50 z-20 pointer-events-none rounded-3xl animate-pulse"></div>}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 border-slate-200 shadow-sm bg-white rounded-2xl">
                <CleanMetric label="Eye Closure" value={status.ear} max={0.4} threshold={0.25} inverse={false} icon={RiEyeLine} />
              </Card>
              <Card className="p-5 border-slate-200 shadow-sm bg-white rounded-2xl">
                <CleanMetric label="Yawning" value={status.mar} max={0.8} threshold={0.65} inverse={true} icon={TbFaceId} />
              </Card>
              <Card className="p-5 border-slate-200 shadow-sm bg-white rounded-2xl">
                <CleanMetric label="Head Tilt" value={Math.abs(status.tilt)} max={45} threshold={20} inverse={true} unit="°" icon={RiFocus3Line} />
              </Card>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <Card className="flex-1 overflow-hidden border-slate-200 shadow-sm relative bg-slate-100 rounded-3xl min-h-[250px]">
              <div className="absolute inset-0">
                {coords ? (
                  <DrowsyMap lat={coords.lat} lng={coords.lng} isDrowsy={status.isDrowsy} zoom={15} />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <span className="loading loading-spinner loading-md"></span>
                    <span className="text-sm font-medium animate-pulse">Acquiring GPS...</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-full text-blue-600"><RiMapPinUserLine size={18} /></div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Coordinates</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "--, --"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><TbActivityHeartbeat className="text-blue-500" /> Fatigue Index</h3>
                <span className={`text-3xl font-black ${status.score > 15 ? "text-red-600" : "text-emerald-500"}`}>{status.score}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-4">
                <div className={`h-full transition-all duration-500 ${status.score > 15 ? "bg-red-500" : status.score > 8 ? "bg-orange-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((status.score/20)*100, 100)}%` }}></div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed text-center font-medium">
                  {status.score > 15 ? "⚠️ FATIGUE CRITICAL" : "Status: Optimal Alertness"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Detection;
