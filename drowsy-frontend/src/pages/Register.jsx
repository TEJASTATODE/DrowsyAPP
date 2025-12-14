import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2
} from "lucide-react";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-xl shadow-black/20">
      <ShieldCheck size={28} strokeWidth={2.5} />
    </div>
    <span className="font-bold text-2xl tracking-tight text-zinc-900">SafeSteer</span>
  </div>
);


const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-5 items-start">
    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 border border-zinc-200 text-black shadow-sm backdrop-blur-sm">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      <p className="text-base text-zinc-600 leading-relaxed mt-1 font-medium">{desc}</p>
    </div>
  </div>
);

const Register = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      const res = await fetch("https://drowsyapp-1.onrender.com/api/users/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/profile";
      } else {
        alert(data.message || "Registration Failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
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
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", shape: "pill", text: "continue_with" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] font-sans text-zinc-900 flex flex-col relative overflow-hidden">
    
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 45, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ x: [0, -100, 0], y: [0, 100, 0], rotate: [0, -45, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-pink-300/20 rounded-full blur-[100px] mix-blend-multiply" 
          />
      </div>


      <header className="relative z-50 w-full px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <Logo />
        <Button 
            className="bg-black hover:bg-zinc-800 text-white font-semibold rounded-full px-8 shadow-lg shadow-black/20 transition-all hover:scale-105" 
            onClick={() => window.location.href='/login'}
        >
            Log In
        </Button>
      </header>


      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 pb-20 gap-16 lg:gap-32">
      
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="flex-1 max-w-lg space-y-12 lg:pr-10"
        >
            <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-900 leading-[1.05]">
                    Safety, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Reimagined.</span>
                </h1>
                <p className="text-xl text-zinc-600 font-medium leading-relaxed max-w-md">
                    Advanced computer vision that monitors driver alertness. 
                    Privacy-first, always active, and designed for your safety.
                </p>
            </div>

            <div className="space-y-8">
                <FeatureItem 
                    icon={Zap} 
                    title="Real-time Detection" 
                    desc="Instant analysis with zero latency monitoring." 
                />
                <FeatureItem 
                    icon={CheckCircle2} 
                    title="Private by Design" 
                    desc="All facial data is processed locally on your device." 
                />
            </div>
        </motion.div>

    
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full max-w-[520px]"
        >
            <Card className="group relative bg-white/70 backdrop-blur-2xl shadow-[0_40px_120px_-15px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden border-white/50 border-2">
                
            
                <div className="absolute inset-0 p-[2px] rounded-[40px] bg-gradient-to-br from-white/80 via-transparent to-white/20 pointer-events-none opacity-50" />

                <CardContent className="relative p-14 flex flex-col gap-10 z-10">
                    
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                            Welcome
                        </h2>
                        <p className="text-zinc-500 text-lg font-medium">Create your account to get started.</p>
                    </div>

                  
                    <div className="space-y-6">
                        <motion.div 
                            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" }}
                            whileTap={{ scale: 0.98 }}
                            className="relative min-h-[56px] w-full rounded-full bg-white transition-all duration-300"
                        >
                            {loading && (
                                <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center rounded-full backdrop-blur-sm">
                                    <div className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        
                            <div id="googleBtn" className="w-full overflow-hidden rounded-full h-full flex items-center justify-center"></div>
                        </motion.div>
                    </div>

                    <p className="text-sm text-zinc-400 text-center leading-relaxed px-6 font-medium">
                        By continuing, you acknowledge that SafeSteer is a driver assist tool.
                    </p>

                </CardContent>
            </Card>
        </motion.div>

      </main>
    </div>
  );
};

export default Register;