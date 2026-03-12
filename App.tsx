import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import LibrarySection from './components/LibrarySection';
import Settings from './components/Settings';
import UpdateLog from './components/UpdateLog';
import DateTimeWidget from './components/DateTimeWidget';
import { MOVIES_DATA, TV_DATA, ANIME_DATA, MANGA_DATA, PROXIES_DATA, PARTNERS_DATA, STAFF_DATA } from './constants';
import { ExternalLink, Users, GitCommit, Settings as SettingsIcon, ExternalLink as ExternalLinkIcon } from 'lucide-react';

const DEFAULT_LOGO = "https://lh7-rt.googleusercontent.com/sitesz/AClOY7psM7n5cC2oRAQVLVss3LsgYFKWwE-KzTjGQvDYtnnp1f1j-Szl1OH6r1pZTXpsw0t_1es0N4P9E2cBl4Oqs-lOwNJdAt3H5CiGxGZKfBTzaYq_ybiI1qd2dWXWu_GRWMqLDD_3BL9tkNhJBNJhjBuuQWyvP1B19h6v0fblyHBwfxs-94c7?key=IannGxLsV9P5UfJ0NHPqqQ";

const DiscordIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const App: React.FC = () => {
  useEffect(() => {
    const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
      window.location.href = "https://chillz0ne.dev";
    }
  }, []);

  const [customLogo, setCustomLogo] = useState<string>(DEFAULT_LOGO);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpdateLogOpen, setIsUpdateLogOpen] = useState(false);

  useEffect(() => {
    const savedLogo = localStorage.getItem('chillzone_custom_logo');
    if (savedLogo) setCustomLogo(savedLogo);
  }, []);

  const handleUpdateLogo = (newLogoUrl: string) => {
    setCustomLogo(newLogoUrl);
    localStorage.setItem('chillzone_custom_logo', newLogoUrl);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-[#fafafa]">
        <div id="app" className="fixed inset-0 flex flex-row overflow-hidden bg-black text-[#fafafa]">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-60" style={{ background: 'rgba(255,38,68,0.08)', filter: 'blur(160px)', transform: 'translateZ(0)' }}></div>
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full opacity-30" style={{ background: 'rgba(37,99,235,0.05)', filter: 'blur(130px)', transform: 'translateZ(0)' }}></div>
          </div>
          
          <Sidebar logoUrl={customLogo} onLogoChange={handleUpdateLogo} />
          
          <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-auto custom-scrollbar">
            <header className="sticky top-0 z-40 border-b border-[#1c1c1f] p-4 md:p-6 flex justify-between items-center shrink-0 bg-black/60 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <DateTimeWidget />
              </div>
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUpdateLogOpen(!isUpdateLogOpen)} 
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                      isUpdateLogOpen 
                        ? 'bg-[#ff2644] border-[#ff2644] text-white' 
                        : 'bg-[#1c1c1f] border-white/5 text-[#52525b] hover:text-white hover:border-white/20'
                    }`}
                    title="Update Log"
                  >
                    <GitCommit size={18} />
                  </motion.button>
                  <AnimatePresence>
                    {isUpdateLogOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsUpdateLogOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                          className="absolute top-14 right-0 z-50 bg-[#0a0a0a] border border-[#1c1c1f] rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <UpdateLog onClose={() => setIsUpdateLogOpen(false)} />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://discord.gg/7jxU9cgsHV" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1c1c1f] border border-white/5 text-[#52525b] hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-all duration-300"
                  title="Discord"
                >
                  <DiscordIcon size={18} />
                </motion.a>
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                      isSettingsOpen 
                        ? 'bg-[#ff2644] border-[#ff2644] text-white' 
                        : 'bg-[#1c1c1f] border-white/5 text-[#52525b] hover:text-white hover:border-white/20'
                    }`}
                    title="Settings"
                  >
                    <motion.div
                      animate={{ rotate: isSettingsOpen ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "backOut" }}
                    >
                      <SettingsIcon size={18} />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isSettingsOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsSettingsOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                          className="absolute top-14 right-0 z-50 bg-[#0a0a0a] border border-[#1c1c1f] rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <Settings />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div id="content-area" className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar overscroll-contain">
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <Routes>
                </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
    </BrowserRouter>
  );
};

export default App;
