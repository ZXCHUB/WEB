import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-950/30 border border-green-900/50 text-green-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
          Status: Undetected & Working
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          DOMINATE WITH <br />
          <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">ZXCHUB</span>
        </h1>
        
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Premium Roblox scripts developed by the elite ZXCHUB team. 
          Unleash the full potential of your gameplay with our undetected, high-performance scripts.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/scripts" 
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            Browse Scripts
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/executors" 
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-lg hover:bg-zinc-800 transition-all border border-zinc-800 hover:border-zinc-700"
          >
            Supported Executors
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl">
        <FeatureCard 
          icon={<Terminal className="w-8 h-8 text-red-500" />}
          title="Premium Scripts"
          description="High-quality, optimized scripts designed for maximum performance and minimal lag."
        />
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-red-500" />}
          title="Undetected"
          description="Regularly updated to bypass the latest anti-cheats and keep your account safe."
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-red-500" />}
          title="Fast Updates"
          description="Our team works around the clock to patch and update scripts immediately after game updates."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-left"
    >
      <div className="w-14 h-14 rounded-xl bg-red-950/30 flex items-center justify-center mb-4 border border-red-900/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
