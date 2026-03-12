import React from 'react';
import { Game } from '../types';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: Game;
  onOpenDetails: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onOpenDetails }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onOpenDetails(game)}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-bg transition-all duration-300 hover:shadow-2xl cursor-pointer border border-white/5 hover:border-accent/50"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-80`}></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <i className={`fas ${game.icon} text-4xl ${game.iconColor} mb-2`}></i>
        <h3 className="text-sm font-black text-white uppercase italic tracking-tight leading-tight line-clamp-2">
          {game.title}
        </h3>
        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">
          {game.system}
        </p>
      </div>
      
      <div className="absolute inset-0 bg-bg/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default GameCard;
