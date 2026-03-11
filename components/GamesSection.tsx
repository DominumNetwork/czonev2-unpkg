import React, { useState } from 'react';
import { Game } from '../types';
import GameCard from './GameCard';
import { SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

interface GamesSectionProps {
  games: Game[];
  onOpenDetails: (game: Game) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const GamesSection: React.FC<GamesSectionProps> = ({ games, onOpenDetails }) => {
  const [localSearch, setLocalSearch] = useState('');
  
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic mb-2">
            Games
          </h2>
          <p className="text-[#52525b] text-xs font-bold uppercase tracking-widest">
            {filteredGames.length} Titles Available
          </p>
        </div>
        
        <div className="relative w-full md:max-w-xs group">
          <input 
            type="text"
            placeholder="Search games..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-white transition-all duration-300 text-sm placeholder:text-[#3f3f46]"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
      </div>

      {filteredGames.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {filteredGames.map((game) => (
            <motion.div 
              key={game.id} 
              variants={itemVariants}
            >
              <GameCard 
                game={game} 
                onOpenDetails={onOpenDetails} 
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center opacity-40"
        >
          <SearchX size={64} className="mb-4 text-white" />
          <h3 className="text-xl font-black uppercase tracking-widest italic text-white">No games found</h3>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GamesSection;
