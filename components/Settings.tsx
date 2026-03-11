import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const [siteTitle, setSiteTitle] = useState(localStorage.getItem('siteTitle') || 'Google');
  const [faviconUrl, setFaviconUrl] = useState(localStorage.getItem('faviconUrl') || 'https://www.google.com/favicon.ico');

  const openAboutBlank = () => {
    const url = window.location.href;
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }
    
    const doc = win.document;
    const iframe = doc.createElement('iframe');
    const style = iframe.style;

    doc.title = siteTitle;
    
    // Favicon for the new tab
    if (faviconUrl) {
      const link = doc.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      doc.head.appendChild(link);
    }

    iframe.src = url;
    style.position = 'fixed';
    style.top = '0';
    style.left = '0';
    style.bottom = '0';
    style.right = '0';
    style.width = '100%';
    style.height = '100%';
    style.border = 'none';
    style.margin = '0';
    style.padding = '0';
    style.overflow = 'hidden';
    style.zIndex = '999999';

    doc.body.appendChild(iframe);
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.overflow = 'hidden';

    // Save settings for next time
    localStorage.setItem('siteTitle', siteTitle);
    localStorage.setItem('faviconUrl', faviconUrl);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="p-6 space-y-6 w-80 bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Stealth Mode</h1>
        <Shield size={18} className="text-[#ff2644]" />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Tab Title</label>
            <input 
              type="text" 
              placeholder="e.g. Google, Drive, Classroom"
              value={siteTitle} 
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white text-white transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Tab Icon (URL)</label>
            <input 
              type="text" 
              placeholder="Favicon URL"
              value={faviconUrl} 
              onChange={(e) => setFaviconUrl(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white text-white transition-colors"
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAboutBlank}
          className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <ExternalLink size={18} />
          Launch About:Blank
        </motion.button>
        
        <p className="text-[10px] text-center text-[#52525b] leading-relaxed">
          Opens the site in a new <span className="text-[#ff2644]">about:blank</span> tab to hide it from your browser history and filters.
        </p>
      </div>
    </motion.div>
  );
};

export default Settings;
