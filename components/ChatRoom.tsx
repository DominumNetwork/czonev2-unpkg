import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Send, Trash2, Edit2, Check, X, ShieldCheck, Smile, DollarSign, MessageSquare } from 'lucide-react';

interface ChatRoomProps {
  collectionName?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ collectionName = 'chat', isAdmin = false, isSuperAdmin = false }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [collectionName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    await addDoc(collection(db, collectionName), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Anonymous',
      role: isSuperAdmin ? 'super-admin' : (isAdmin ? 'admin' : 'user'),
    });
    setNewMessage('');
  };

  const deleteMessage = async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  const startEdit = (id: string, text: string) => {
    setEditingMessageId(id);
    setEditValue(text);
  };

  const saveEdit = async (id: string) => {
    await updateDoc(doc(db, collectionName, id), { text: editValue });
    setEditingMessageId(null);
    setEditValue('');
  };

  return (
    <div className="flex flex-col h-[950px] max-h-[95vh] bg-bg border border-white/5 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: 'var(--accent-glow-dim)', filter: 'blur(100px)' }}></div>
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">{collectionName === 'admin_chat' ? 'Staff Lounge' : 'Public Chat'}</h2>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Live Community Discussion</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
            {msg.role && (msg.role === 'admin' || msg.role === 'super-admin' || msg.role === 'donator') && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg ${
                  msg.role === 'super-admin' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                    : msg.role === 'donator'
                    ? 'bg-green-500 text-white'
                    : 'bg-accent text-white'
                }`}
              >
                {msg.role === 'donator' ? <DollarSign size={10} /> : <ShieldCheck size={10} />}
                {msg.role === 'super-admin' ? 'Owner' : (msg.role === 'donator' ? 'Donator 💵' : 'Admin')}
              </motion.div>
            )}
            <div className={`max-w-[70%] p-3 rounded-2xl ${msg.uid === auth.currentUser?.uid ? 'bg-accent text-white' : 'bg-white/5 text-neutral-300'}`}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold opacity-70">{msg.displayName}</p>
                <p className="text-[10px] opacity-50 ml-2">
                  {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {editingMessageId === msg.id ? (
                <div className="flex gap-2">
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-black/20 rounded px-2 py-1 text-sm w-full"
                  />
                  <button onClick={() => saveEdit(msg.id)}><Check size={14} /></button>
                  <button onClick={() => setEditingMessageId(null)}><X size={14} /></button>
                </div>
              ) : (
                <p className="text-sm">{msg.text}</p>
              )}
              {msg.uid === auth.currentUser?.uid && editingMessageId !== msg.id && (
                <div className="flex gap-2 mt-2 justify-end">
                  <button onClick={() => startEdit(msg.id, msg.text)} className="opacity-50 hover:opacity-100"><Edit2 size={12} /></button>
                  <button onClick={() => deleteMessage(msg.id)} className="opacity-50 hover:opacity-100"><Trash2 size={12} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 relative">
        <div className="relative flex-1 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
          />
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors border border-white/5"
          >
            <Smile size={18} />
          </button>
          
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                ref={emojiPickerRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setNewMessage(prev => prev + emojiData.emoji);
                    // Keep picker open for multiple emojis if desired, or close it
                    // setShowEmojiPicker(false);
                  }}
                  theme={EmojiTheme.DARK}
                  lazyLoadEmojis={true}
                  skinTonesDisabled={true}
                  searchDisabled={false}
                  width={300}
                  height={400}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button type="submit" className="p-2 bg-accent rounded-xl text-white hover:bg-accent/90 transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
    </div>
  );
};

export default ChatRoom;
