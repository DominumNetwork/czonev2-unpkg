
import React, { useRef, useState } from 'react';
import { Home, Film, Tv, Sparkles, BookOpen, Heart, Camera, Globe, Users, DollarSign, Gamepad2, LayoutGrid, Settings as SettingsIcon, Shield, Code, Music, Database } from 'lucide-react';
import { Category } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activeCategory: Category;
  onSelect: (category: Category) => void;
  logoUrl: string;
  onLogoChange: (newLogo: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelect, logoUrl, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

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
    { id: 'support' as Category, label: 'Devs', icon: Heart },
    { id: 'donate' as Category, label: 'Donate', icon: DollarSign },
    { id: 'movies' as Category, label: 'Movies', icon: Film },
    { id: 'tv shows' as Category, label: 'TV Shows', icon: Tv },
    { id: 'anime' as Category, label: 'Animes', icon: Sparkles },
    { id: 'manga' as Category, label: 'Mangas', icon: BookOpen },
    { id: 'music' as Category, label: 'Music', icon: Music },
    { id: 'proxies' as Category, label: 'Proxies', icon: Shield },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isHovered ? 160 : 80 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-bg border-r border-white/5 flex flex-col items-center py-8 shrink-0 transition-all duration-300 z-[100] h-full relative"
    >
      <div className="mb-12">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group/logo cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="w-12 h-12 shrink-0 overflow-hidden relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-xl">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
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
      
      <div className="flex-1 w-full flex flex-col items-center gap-8 overflow-y-auto custom-scrollbar no-scrollbar">
        {/* Data/Navigation Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${
                  isActive ? 'text-accent' : 'text-text-secondary hover:text-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-accent/10 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'group-hover:bg-white/5'
                }`}>
                  <Icon size={22} />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] italic"
                    >
                      {t(item.label)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
