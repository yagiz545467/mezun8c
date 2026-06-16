import { Student, MemoryMedia } from '../types';
import { Lock, Clock, Search, Trash2, Camera, User, Sparkles, Image, Film, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { getAvatarColor, formatDate } from '../lib/utils';

interface GalleryTabProps {
  memories: MemoryMedia[];
  currentUserStudent: Student | null;
  user: any;
  timeMachineDate: string;
  onDeleteMemory: (memoryId: string) => Promise<void>;
  setActiveTab: (tab: 'home' | 'notes' | 'camera' | 'gallery') => void;
}

export default function GalleryTab({
  memories, currentUserStudent, user, timeMachineDate, onDeleteMemory, setActiveTab,
}: GalleryTabProps) {
  const isUnlockedDay = timeMachineDate === '2026-06-20';
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryMedia | null>(null);

  const filteredMemories = memories.filter(m => {
    const matches = m.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'mine') return matches && user && m.userUid === user.uid;
    return matches;
  });

  if (!isUnlockedDay) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/5 text-violet-400">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white">Albüm Kilitli</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Galeri <strong className="text-white">20 Haziran 2026</strong>'da açılacaktır.
          </p>
        </div>
        <div className="bg-[#0f0f1a] border border-[#1e1e32] p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold justify-center">
            <Clock className="h-4 w-4" />
            <span>Zaman Makinesi ile Aç</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Galeriyi görmek için üstteki <strong className="text-white">Zaman Makinesi</strong>'ni 20.06.2026 yapın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 py-2 md:py-4">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-white">
          8C Mezuniyet Albümü
        </h2>
        <p className="text-xs text-slate-400">Anı kamerası ile çekilen tüm kareler burada.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#0f0f1a] p-4 rounded-xl border border-[#1e1e32]">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Kişi ara..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#1e1e32] bg-[#0a0a14] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#1e1e32] bg-[#0a0a14] p-0.5 text-slate-400 text-[10px] font-medium">
            <button onClick={() => setActiveFilter('all')}
              className={`cursor-pointer rounded px-2.5 py-1 transition-all ${activeFilter === 'all' ? 'bg-indigo-500 text-white' : 'hover:text-white'}`}>
              Tümü
            </button>
            <button onClick={() => setActiveFilter('mine')} disabled={!user}
              className={`cursor-pointer rounded px-2.5 py-1 transition-all disabled:opacity-40 ${activeFilter === 'mine' ? 'bg-indigo-500 text-white' : 'hover:text-white'}`}>
              Benim Çektiklerim
            </button>
          </div>
          <button onClick={() => setActiveTab('camera')}
            className="cursor-pointer flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            <Camera className="h-3 w-3" />
            Çek
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filteredMemories.length > 0 ? (
          filteredMemories.map(memory => {
            const isAuthor = user && memory.userUid === user.uid;
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className="group relative aspect-square rounded-lg overflow-hidden bg-[#0f0f1a] border border-[#1e1e32] cursor-pointer"
                onClick={() => setSelectedPhoto(memory)}
              >
                {memory.mediaType === 'image' ? (
                  <img src={memory.mediaUrl} alt={memory.studentName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="relative w-full h-full">
                    <video src={memory.mediaUrl} muted playsinline
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <User className="h-3 w-3 text-indigo-400" />
                    {memory.studentName}
                  </p>
                  <p className="text-[8px] text-slate-400">{formatDate(memory.createdAt)}</p>
                </div>
                {isAuthor && (
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Silmek istediğinize emin misiniz?')) onDeleteMemory(memory.id); }}
                    className="cursor-pointer absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white hover:bg-rose-500 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {memory.mediaType === 'video' && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white font-medium">
                    <Film className="h-3 w-3 inline mr-0.5" />VIDEO
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 border border-dashed border-[#1e1e32] rounded-xl bg-[#0f0f1a]">
            <Image className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 mb-1">Albüm boş</p>
            <button onClick={() => setActiveTab('camera')}
              className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 cursor-pointer">
              İlk anıyı sen çek
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-zoom-out"
            onClick={() => setSelectedPhoto(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              <button onClick={() => setSelectedPhoto(null)}
                className="cursor-pointer absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-indigo-500 transition-colors flex items-center justify-center shadow-lg">
                <X className="h-4 w-4" />
              </button>

              {selectedPhoto.mediaType === 'image' ? (
                <img src={selectedPhoto.mediaUrl} alt={selectedPhoto.studentName}
                  className="w-full max-h-[80vh] object-contain rounded-lg" />
              ) : (
                <video src={selectedPhoto.mediaUrl} controls
                  className="w-full max-h-[80vh] rounded-lg" />
              )}

              <div className="flex items-center justify-between mt-3 px-2">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  {selectedPhoto.studentName}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(selectedPhoto.createdAt)}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
