import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Search, 
  Music, 
  ListMusic, 
  Loader2,
  Heart,
  MoreVertical,
  Download,
  Share2,
  Repeat,
  Shuffle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  duration?: number;
  url?: string;
}

const MusicPlayer: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/music/monochrome/search?s=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Assuming data is an array of tracks or has a results property
        // Based on monochrome API, it usually returns an array of objects
        const tracks = (Array.isArray(data) ? data : data.results || []).map((item: any) => ({
          id: item.id || item.trackId,
          title: item.title || item.name,
          artist: item.artist || item.artists?.[0]?.name || 'Unknown Artist',
          album: item.album || item.albumName,
          image: item.image || item.thumbnail || item.artworkUrl || 'https://picsum.photos/seed/music/300/300',
          duration: item.duration
        }));
        setSearchResults(tracks);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/music/monochrome/track/${track.id}`);
      if (response.ok) {
        const data = await response.json();
        const streamUrl = data.url || data.streamUrl || data.link;
        
        if (streamUrl) {
          const trackWithUrl = { ...track, url: streamUrl };
          setCurrentTrack(trackWithUrl);
          setIsPlaying(true);
          
          // Add to playlist if not already there
          if (!playlist.find(t => t.id === track.id)) {
            setPlaylist(prev => [trackWithUrl, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error('Track load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipNext = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    playTrack(playlist[nextIndex]);
  };

  const skipPrev = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    playTrack(playlist[prevIndex]);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [currentTrack]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex-1 min-h-[calc(100vh-80px)] flex flex-col p-4 lg:p-8"
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">
              {t('Chill Music')}
            </h1>
            <p className="text-text-secondary font-medium">Stream your favorite tracks without interruptions.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={t('Search for songs, artists...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10 transition-all"
            />
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Main Content Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isLoading && !currentTrack && (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="text-accent animate-spin mb-4" size={48} />
                <p className="text-text-secondary font-bold uppercase tracking-widest text-sm">Searching the vibes...</p>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && !currentTrack && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <Music className="text-text-muted" size={40} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">No Music Playing</h3>
                <p className="text-text-secondary max-w-xs mx-auto">Search for a track to start your session.</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                  <Search className="text-accent" size={20} />
                  Search Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((track) => (
                    <motion.div
                      key={track.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => playTrack(track)}
                      className="bg-surface border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-accent/40 transition-all group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="text-white fill-white" size={24} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">{track.title}</h4>
                        <p className="text-text-secondary text-sm truncate">{track.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentTrack && (
              <div className="bg-surface border border-white/5 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
                
                <motion.div 
                  key={currentTrack.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10"
                >
                  <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl mb-8 mx-auto border-4 border-white/10">
                    <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">{currentTrack.title}</h2>
                  <p className="text-accent font-bold text-xl mb-8">{currentTrack.artist}</p>
                  
                  <div className="flex items-center justify-center gap-8">
                    <button className="text-text-secondary hover:text-white transition-colors">
                      <Heart size={24} />
                    </button>
                    <button className="text-text-secondary hover:text-white transition-colors">
                      <Download size={24} />
                    </button>
                    <button className="text-text-secondary hover:text-white transition-colors">
                      <Share2 size={24} />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Sidebar: Playlist & Controls */}
          <div className="flex flex-col gap-6">
            {/* Player Controls Card */}
            <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Now Playing</h3>
                  <button 
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'bg-accent text-white' : 'text-text-secondary hover:bg-white/5'}`}
                  >
                    <ListMusic size={20} />
                  </button>
                </div>

                {currentTrack ? (
                  <>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-6 mb-8">
                      <button 
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`transition-colors ${isShuffle ? 'text-accent' : 'text-text-muted hover:text-white'}`}
                      >
                        <Shuffle size={20} />
                      </button>
                      <button onClick={skipPrev} className="text-white hover:text-accent transition-colors">
                        <SkipBack size={32} fill="currentColor" />
                      </button>
                      <button 
                        onClick={togglePlay}
                        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                      >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                      </button>
                      <button onClick={skipNext} className="text-white hover:text-accent transition-colors">
                        <SkipForward size={32} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                        className={`transition-colors ${repeatMode !== 'none' ? 'text-accent' : 'text-text-muted hover:text-white'}`}
                      >
                        <Repeat size={20} />
                        {repeatMode === 'one' && <span className="absolute text-[8px] font-bold mt-[-10px] ml-[8px]">1</span>}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                      <button onClick={toggleMute} className="text-text-secondary hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input 
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-text-muted font-medium italic">Select a track to play</p>
                  </div>
                )}
              </div>
            </div>

            {/* Playlist Card */}
            <div className="bg-surface border border-white/5 rounded-3xl p-6 flex-1 flex flex-col min-h-[400px]">
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-4">Up Next</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {playlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ListMusic className="mb-2" size={32} />
                    <p className="text-sm font-medium italic">Playlist is empty</p>
                  </div>
                ) : (
                  playlist.map((track, idx) => (
                    <div 
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${currentTrack?.id === track.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <img src={track.image} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-accent' : 'text-white'}`}>{track.title}</h4>
                        <p className="text-text-muted text-xs truncate">{track.artist}</p>
                      </div>
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="flex gap-0.5 items-end h-3">
                          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-accent" />
                          <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-accent" />
                          <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-0.5 bg-accent" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {currentTrack?.url && (
        <audio 
          ref={audioRef}
          src={currentTrack.url}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={skipNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </motion.div>
  );
};

export default MusicPlayer;
