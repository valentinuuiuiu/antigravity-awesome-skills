import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
}

export default function Swipe() {
  const { supabase, session } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!session) return;
    const fetchMatches = async () => {
      const token = session.access_token;
      try {
        const response = await fetch('/api/potential-matches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const matches = await response.json();
          setProfiles(Array.isArray(matches) ? matches : []);
        }
      } catch (error) {
        console.error("Error fetching matches", error);
      }
    };
    fetchMatches();
  }, [session]);

  const handleLike = async () => {
    if (!session || !profiles[currentIndex]) return;
    const matchUserId = profiles[currentIndex].user_id;
    await supabase.from('matches').insert({
      user1_id: session.user.id,
      user2_id: matchUserId,
      status: 'accepted',
      initiated_by: session.user.id
    });
    setCurrentIndex(currentIndex + 1);
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono text-[#00f0ff]">
        <div className="text-center">
          <div className="animate-pulse mb-4 text-4xl">NO TARGETS FOUND</div>
          <div className="text-gray-500">SCANNING SECTOR...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Grid & Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative w-full max-w-md h-[650px]">
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, x: 100, rotate: 10 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)] border border-[#00f0ff]/20 bg-[#111]"
          >
            {/* Image */}
            <div className="absolute inset-0">
              <img
                src={currentProfile.photos[0] || 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="mb-2 flex items-baseline gap-3">
                <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {currentProfile.name}
                </h2>
                <span className="text-2xl font-bold text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                  {currentProfile.age}
                </span>
              </div>

              {/* Bio Glassmorphism */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-24">
                <p className="text-gray-300 text-sm leading-relaxed font-sans">
                  {currentProfile.bio || "No bio data available. Ask me about neural networks."}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 rounded bg-[#ff00f0]/20 border border-[#ff00f0]/30 text-[#ff00f0] text-xs font-bold uppercase tracking-wider">
                    NetRunner
                  </span>
                  <span className="px-2 py-1 rounded bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-wider">
                    Level 82
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 z-20">
          <button
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-lg border border-[#ff003c]/50 text-[#ff003c] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(255,0,60,0.3)] hover:scale-110 hover:bg-[#ff003c] hover:text-black transition-all duration-300"
          >
            ✕
          </button>

          <button className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-lg border border-yellow-400/50 text-yellow-400 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-110 hover:bg-yellow-400 hover:text-black transition-all duration-300 mt-2">
            ★
          </button>

          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-lg border border-[#00f0ff]/50 text-[#00f0ff] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:scale-110 hover:bg-[#00f0ff] hover:text-black transition-all duration-300"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}
