
import React, { useRef } from 'react';
import { Home, Film, Tv, Sparkles, BookOpen, Heart, Camera, Globe, Users, DollarSign, Gamepad2, LayoutGrid, Settings as SettingsIcon, Shield, Code, Music } from 'lucide-react';
import { Category } from '../types';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogoChange: (newLogo: string) => void;
  logoUrl: string;
}

const Sidebar: React.FC<SidebarProps> = ({ logoUrl, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onLogoChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
  ];

  return (
    <aside className="w-20 md:w-64 bg-black border-r border-white/10 flex flex-col p-6 shrink-0 transition-all duration-500 z-50 h-full">
      <div className="mb-10 flex flex-col items-center justify-center">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative group/logo cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="w-16 h-16 shrink-0 overflow-hidden relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-2xl">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-4 text-center hidden md:block">
            <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">ChillZone</h2>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </motion.div>
      </div>
      
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl transition-colors duration-300 font-bold uppercase tracking-widest text-xs ${
                isActive 
                  ? 'bg-[#ff2644] text-white' 
                  : 'text-[#52525b] hover:bg-[#1c1c1f] hover:text-white'
              }`}
            >
              <Link to={item.path} className="absolute inset-0 z-10" />
              <Icon size={20} className="relative z-10" />
              <span className="hidden md:block relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-[#ff2644] rounded-xl z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
