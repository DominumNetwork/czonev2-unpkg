import React, { useState, useRef, KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Home, Search, Lock, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProxyBrowserProps {
  onBackToMovies: () => void;
  onMinimize: () => void;
}

const ProxyBrowser: React.FC<ProxyBrowserProps> = ({ onBackToMovies, onMinimize }) => {
  const [urlInput, setUrlInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);

  const formatUrl = (input: string) => {
    if (!input.trim()) return '';
    if (/^https?:\/\//i.test(input)) return input;
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/.test(input)) return `https://${input}`;
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  };

  const handleNavigate = () => {
    const formatted = formatUrl(urlInput);
    if (formatted) {
      setCurrentUrl(formatted);
      setUrlInput(formatted);
      setIsLoading(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      // Force reload by resetting src
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 10);
    }
  };

  const handleHome = () => {
    setCurrentUrl('');
    setUrlInput('');
  };

  const proxySrc = currentUrl ? `/api/proxy?url=${encodeURIComponent(currentUrl)}` : '';

  return (
    <div ref={browserRef} className="flex flex-col h-full w-full bg-[#0a0a0a] rounded-3xl border border-[#1c1c1f] overflow-hidden shadow-2xl">
      {/* Browser Chrome */}
      <div className="relative flex items-center gap-2 p-3 bg-[#18181b] border-b border-[#27272a]">
        {isLoading && (
          <motion.div 
            className="absolute bottom-0 left-0 h-0.5 bg-[#ff2644]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}
        <div className="flex gap-1.5 px-2">
          <button onClick={onBackToMovies} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80"></button>
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80"></button>
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                browserRef.current?.requestFullscreen();
              }
            }}
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80"
          ></button>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <button className="p-1.5 rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1.5 rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors disabled:opacity-50">
            <ChevronRight size={18} />
          </button>
          <button onClick={handleReload} className="p-1.5 rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors">
            <RotateCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleHome} className="p-1.5 rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors">
            <Home size={16} />
          </button>
        </div>

        <div className="flex-1 max-w-3xl mx-auto relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none">
            {currentUrl ? <Lock size={14} className="text-[#27c93f]" /> : <Search size={14} className="text-[#52525b]" />}
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search the web or enter a URL"
            className="w-full bg-[#27272a] text-white text-sm px-9 py-1.5 rounded-full border border-transparent focus:border-[#ff2644]/50 focus:bg-[#1c1c1f] focus:outline-none transition-all"
          />
        </div>
        
        {/* Empty div to balance the chrome */}
        <div className="w-24"></div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {!currentUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#18181b] to-[#0a0a0a] overflow-hidden">
            {/* Rain effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px bg-white animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    height: `${Math.random() * 20 + 10}%`
                  }}
                />
              ))}
            </div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center max-w-xl px-6 z-10"
            >
              <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white mb-6 drop-shadow-2xl">
                CHILLZONE
              </h1>
              
              <button
                onClick={() => {
                  setUrlInput('google.com');
                  setCurrentUrl('https://google.com');
                  setIsLoading(true);
                }}
                className="inline-block px-8 py-3 mb-8 rounded-full border border-[#ff2644]/50 bg-[#ff2644]/10 text-white font-bold uppercase tracking-widest hover:bg-[#ff2644] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,38,68,0.2)]"
              >
                Start Browsing
              </button>
            </motion.div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={proxySrc}
            className="w-full h-full border-none bg-white"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default ProxyBrowser;
