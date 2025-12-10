import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, Play, StopCircle, LogOut, Clock, Activity, 
  MapPin, Calendar, ChevronRight, Shield, History, 
  X, Camera, Eye, AlertTriangle, RefreshCw, Timer,
  Phone, Save, Edit2, AlertCircle, CheckCircle2,
  Smile, User, Monitor
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const NODE_URL = "http://localhost:5000";
const PYTHON_URL = "http://localhost:8000";

const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${seconds % 60}s`;
};


const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
  >
    <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
            <Icon size={20} strokeWidth={2} />
        </div>
    </div>
    <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
        {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);


const SessionDetailModal = ({ session, onClose }) => {
    if (!session) return null;
    const fileId = session.sessionId || session._id;
    const imageUrl = `${PYTHON_URL}/snapshots/${fileId}.jpg`; 

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
               
                <div className="md:w-3/5 bg-slate-900 relative min-h-[300px] flex items-center justify-center group flex-col">
                    <img 
                        src={imageUrl} 
                        alt="Evidence" 
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                    />
                    <div className="hidden w-full h-full absolute inset-0 flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                        <Camera size={48} className="opacity-20"/>
                        <span className="text-xs font-mono text-red-400">NO SNAPSHOT FOUND</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <p className="text-xs font-mono font-bold uppercase tracking-widest text-red-400 mb-1">Session Data</p>
                        <p className="text-sm text-slate-300">ID: {fileId}</p>
                    </div>
                </div>

                <div className="md:w-2/5 p-8 flex flex-col relative bg-white">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Detailed Analysis</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Eye size={16} className="text-blue-500"/> Avg EAR</span>
                            <span className="font-mono font-bold text-slate-900">{session.avgEar?.toFixed(3) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Activity size={16} className="text-orange-500"/> Peak Fatigue</span>
                            <span className="font-mono font-bold text-slate-900">{session.maxScore || 0}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  
 
  const [contact, setContact] = useState("");
  const [isEditingContact, setIsEditingContact] = useState(false);

  const fetchHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${NODE_URL}/api/sessions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) { console.warn("Failed to fetch history:", err); }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    
    const initData = async () => {
        try {
            const profileRes = await axios.get(`${NODE_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
            setUser(profileRes.data.user);
            
            if (profileRes.data.user.emergencyContact) {
                setContact(profileRes.data.user.emergencyContact);
            } else {
                setIsEditingContact(true);
            }

            if (profileRes.data.user?._id) await fetchHistory(profileRes.data.user._id);
            setLoading(false);
        } catch (err) { setLoading(false); }
    };
    initData();
  }, [fetchHistory]);


  const saveContact = async () => {
    if (contact.length < 10) { toast.error("Invalid Number"); return; }
    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${NODE_URL}/api/users/update-contact`, 
            { emergencyContact: contact }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
        setIsEditingContact(false);
        toast.success("Contact Saved");
    } catch (err) { toast.error("Save Failed"); }
  };

  const handleStartDetection = async () => {
    if (!user.emergencyContact) {
        toast.warning("Set Emergency Contact", { description: "Please add a contact number first." });
        return;
    }
    setIsStarting(true);
    try {
      const sessionRes = await axios.post(`${NODE_URL}/api/sessions/start`, { userId: user._id });
      if (sessionRes.data.success) {
          const newSessionId = sessionRes.data.sessionId || sessionRes.data.mongoId;
          localStorage.setItem("sessionId", sessionRes.data.mongoId); 
          await axios.post(`${PYTHON_URL}/start_detection`, { token: "dummy-token", session_id: newSessionId });
          window.location.href = "/detection";
      }
    } catch (err) { alert("System Error"); } finally { setIsStarting(false); }
  };

  const handleStopDetection = async () => {
      try { 
          const pythonRes = await axios.post(`${PYTHON_URL}/stop`);
          const reportSummary = pythonRes.data.summary; 
          
          const storedMongoId = localStorage.getItem("sessionId"); 
          if (storedMongoId && reportSummary) {
              await axios.post(`${NODE_URL}/api/sessions/stop`, { sessionId: storedMongoId, summary: reportSummary });
              if (user?._id) fetchHistory(user._id);
          }
      } catch (err) { console.error("Error stopping session:", err); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

 
 
  const avgEAR = logs.length > 0 ? (logs.reduce((acc, curr) => acc + (Number(curr.avgEar) || 0), 0) / logs.length).toFixed(2) : "0.00";

  const avgYawn = logs.length > 0 ? (logs.reduce((acc, curr) => acc + (Number(curr.mar || 0.45) || 0), 0) / logs.length).toFixed(2) : "0.00"; 
  const avgTilt = logs.length > 0 ? (logs.reduce((acc, curr) => acc + (Number(curr.tilt || 12) || 0), 0) / logs.length).toFixed(0) : "0";

  const totalSessions = logs.length;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-500 font-mono text-sm">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 pb-12">
 
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <div className="bg-slate-900 text-white p-2 rounded-lg"><Car size={20} strokeWidth={2.5} /></div>
             <span className="font-bold text-lg text-slate-900 tracking-tight">SafeSteer</span>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 relative">
        <AnimatePresence>
            {selectedSession && <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
        </AnimatePresence>

    
<motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10"
>

    <div>
        <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-slate-900">
                {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return "Good Morning";
                    if (hour < 18) return "Good Afternoon";
                    return "Good Evening";
                })()}, {user.name.split(' ')[0]}
            </h1>
            <motion.span 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                className="text-3xl inline-block origin-bottom-right"
            >
                👋
            </motion.span>
        </div>
        <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
              Access your driving dashboard.
        </p>
    </div>
    
   
    <div className="flex gap-3 w-full md:w-auto">
         <motion.button 
            onClick={handleStartDetection} 
            disabled={isStarting}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg overflow-hidden transition-colors"
         >
          
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

            <div className="relative z-10 flex items-center gap-2">
                {isStarting ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <div className="p-1 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                    </div>
                )}
                <span>Start Driving Session</span>
            </div>
         </motion.button>
    </div>
</motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            
            <div className="lg:col-span-1 flex flex-col gap-6">
                
                
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden text-center pb-6">
                    <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="-mt-10 mb-3">
                        <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                    </div>
                    <h2 className="font-bold text-slate-900">{user.name}</h2>
                    <p className="text-xs text-slate-500 mb-4">{user.email}</p>
                    <div className="px-6">
                        <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span>Status</span>
                            <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-200">Active Driver</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-3xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={16} className="text-red-500"/> SOS Contact</span>
                        {user.emergencyContact ? <CheckCircle2 size={16} className="text-emerald-500"/> : <AlertCircle size={16} className="text-red-500 animate-pulse"/>}
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="+1 (555) 000-0000" 
                            value={contact} 
                            onChange={(e) => setContact(e.target.value)} 
                            disabled={!isEditingContact && !!user.emergencyContact}
                            className="bg-slate-50 h-9 text-xs"
                        />
                        {isEditingContact || !user.emergencyContact ? (
                            <Button size="sm" onClick={saveContact}><Save size={14}/></Button>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingContact(true)}><Edit2 size={14}/></Button>
                        )}
                    </div>
                </Card>
            </div>

           
            <div className="lg:col-span-3 flex flex-col gap-6">
                
              
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        label="Avg Eye Ratio" 
                        value={avgEAR} 
                        subtext="Target: > 0.25"
                        icon={Eye} 
                        color="blue" 
                    />
                    <StatCard 
                        label="Avg Yawn Ratio" 
                        value={avgYawn} 
                        subtext="Target: < 0.50"
                        icon={Smile} 
                        color="emerald" 
                    />
                    <StatCard 
                        label="Avg Head Tilt" 
                        value={`${avgTilt}°`} 
                        subtext="Normal Range"
                        icon={Monitor} 
                        color="orange" 
                    />
                    <StatCard 
                        label="Total Sessions" 
                        value={totalSessions} 
                        subtext="Lifetime Trips"
                        icon={MapPin} 
                        color="indigo" 
                    />
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-1 min-h-[400px]">
                    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} className="text-slate-400"/> Drive History</h3>
                        <button onClick={() => fetchHistory(user._id)} className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Peak Fatigue</th>
                                    <th className="px-6 py-4">Risk Level</th>
                                    <th className="px-6 py-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium text-slate-600 divide-y divide-slate-50">
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No activity recorded yet.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{new Date(log.startTime).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{formatDuration(log.duration || 0)}</span></td>
                                            <td className="px-6 py-4 font-mono font-bold">{log.maxScore}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`border-0 ${log.status === "Danger" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                                                    {log.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setSelectedSession(log)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}