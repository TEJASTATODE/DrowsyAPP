import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Car, 
  ArrowLeft, 
  Terminal, 
  ShieldCheck, 
  Fingerprint 
} from "lucide-react";

const SafeSteerLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
      <Car size={24} strokeWidth={2} />
    </div>
    <div className="flex flex-col">
      <span className="font-bold text-xl leading-none tracking-tight text-slate-900">SafeSteer</span>
      <span className="text-[10px] font-mono font-medium text-slate-500 tracking-wider">SYSTEMS V2.0</span>
    </div>
  </div>
);

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      const token = response.credential;
      const res = await fetch("https://drowsyapp-1.onrender.com/api/users/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/profile";
      } else {
        alert(data.message || "Login Failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        { theme: "outline", size: "large", width: "100%", shape: "rectangular", text: "continue_with" } 
      );
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 flex flex-col relative overflow-hidden">
      
      
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <header className="relative z-50 w-full px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <a href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Home
        </a>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg" 
        >
      
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative">
            
      
            <div className="flex justify-center mb-10">
                <SafeSteerLogo />
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                <p className="text-slate-500">Access your driver dashboard.</p>
            </div>

            <div className="relative mb-8">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <div id="googleLoginBtn" className="w-full min-h-[50px]"></div>
            </div>

            <div className="relative flex items-center gap-4 py-6">
                <div className="flex-grow border-t border-slate-100"></div>
                <div className="flex gap-4 text-slate-400">
                    <Fingerprint size={18} />
                    <Terminal size={18} />
                    <ShieldCheck size={18} />
                </div>
                <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <p className="text-center text-xs text-slate-400 font-mono">
                SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()} • ENCRYPTED
            </p>

          </div>

         
          <div className="mt-8 text-center">
            <p className="text-slate-600">
                Don't have an account?{' '}
                <a href="/" className="font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4 transition-colors">
                    Initialize Registration
                </a>
            </p>
          </div>

        </motion.div>
      </main>

  
      <footer className="relative z-10 w-full py-6 text-center">
         <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            SafeSteer Ops • Build 2.0.4
         </p>
      </footer>

    </div>
  );
};

export default Login;