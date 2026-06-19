import { Student, GraduationNote } from '../types';
import {
  Search, PenTool, Trash2, MessageCircle, Sparkles, UserCheck,
  Heart, Lock, AlertTriangle, BookOpen, X, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, FormEvent } from 'react';
import { getInitials, getAvatarColor, formatDate } from '../lib/utils';

interface NotesTabProps {
  students: Student[];
  notes: GraduationNote[];
  currentUserStudent: Student | null;
  user: any;
  onAddNote: (toStudentId: string, content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onLogin: () => void;
  isNotebookPublic: boolean;
}

export default function NotesTab({
  students, notes, currentUserStudent, user, onAddNote, onDeleteNote,
  onLogin, isNotebookPublic,
}: NotesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'students' | 'teachers'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user && user.email === 'unluleyla52@gmail.com';
  const visibleNotes = isNotebookPublic || isAdmin
    ? notes
    : (user ? notes.filter(n => n.fromUserUid === user.uid) : []);

  const filteredStudents = students.filter(s => {
    const matches = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches) return false;
    if (filterMode === 'teachers') return !!s.isTeacher;
    if (filterMode === 'students') return !s.isTeacher;
    return true;
  });

  const receivedNotes = selectedStudent
    ? visibleNotes.filter(n => n.toStudentId === selectedStudent.id)
    : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !noteContent.trim() || !user) return;
    if (currentUserStudent?.isTeacher && !currentUserStudent.isApproved) {
      alert('Hoca profiliniz henüz onaylanmadı.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddNote(selectedStudent.id, noteContent.trim());
      setNoteContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 py-2 md:py-4">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-white">8C Mezuniyet Defteri</h2>
        <p className="text-xs text-slate-400">Bir isme tıklayarak ona dijital mektup yazabilirsin.</p>
      </div>

      {!isNotebookPublic && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 max-w-2xl mx-auto flex items-center gap-3">
          <Lock className="h-5 w-5 text-indigo-400 shrink-0 animate-pulse" />
          <div className="text-xs text-slate-400">
            <strong className="text-indigo-300">Gizli Mod:</strong> Mektupları sadece yazarı görebilir. Yönetici yayına açtığında herkes görecek.
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#0f0f1a] p-4 rounded-xl border border-[#1e1e32]">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="İsim ara..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#1e1e32] bg-[#0a0a14] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1e1e32] bg-[#0a0a14] p-0.5 text-[10px] font-medium text-slate-400">
          {[
            { key: 'all' as const, label: `Tümü (${students.length})` },
            { key: 'students' as const, label: `Öğrenciler (${students.filter(s => !s.isTeacher).length})` },
            { key: 'teachers' as const, label: `Öğretmenler (${students.filter(s => s.isTeacher).length})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilterMode(key)}
              className={`cursor-pointer rounded px-2.5 py-1 transition-all ${filterMode === key ? 'bg-indigo-500 text-white' : 'hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => {
            const colors = getAvatarColor(student.name);
            const noteCount = visibleNotes.filter(n => n.toStudentId === student.id).length;
            return (
              <motion.div key={student.id} whileHover={{ y: -2 }}
                className="cursor-pointer flex items-center justify-between rounded-xl border border-[#1e1e32] bg-[#0f0f1a] p-3 transition-all hover:border-indigo-500/20 hover:bg-[#12121e]"
                onClick={() => setSelectedStudent(student)}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colors.bg} ${colors.text} font-bold text-xs`}>
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      {student.name}
                      {student.isTeacher && (
                        <span className="text-[8px] bg-violet-500/15 text-violet-300 px-1.5 py-0.5 rounded-full font-medium">Hoca</span>
                      )}
                    </h4>
                    <span className="text-[9px] text-slate-500">
                      {student.isTeacher ? 'Öğretmen' : (student.gender === 'F' ? 'Kız' : 'Erkek')}
                      {student.claimedByUid && (
                        <span className="text-emerald-400 ml-1">• eşleşti</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-[#0a0a14] border border-[#1e1e32] px-2 py-1 text-[10px] text-slate-400">
                    <MessageCircle className="h-3 w-3 text-indigo-400" />
                    <span>{noteCount}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 border border-dashed border-[#1e1e32] rounded-xl bg-[#0f0f1a]">
            <BookOpen className="h-6 w-6 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Sonuç bulunamadı.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-[#1e1e32] bg-[#0f0f1a] overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1e1e32] p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border font-bold text-xs ${getAvatarColor(selectedStudent.name).bg} ${getAvatarColor(selectedStudent.name).text}`}>
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-[10px] text-slate-400">Mektup Defteri</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-[#1a1a2e] text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
                {/* Notes List */}
                <div className="flex-1 p-4 overflow-y-auto border-r border-[#1e1e32]">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Heart className="h-3 w-3 text-indigo-400" />
                    Mektuplar ({receivedNotes.length})
                  </h4>
                  <div className="space-y-3">
                    {receivedNotes.length > 0 ? (
                      receivedNotes.map(note => {
                        const isWriter = user && note.fromUserUid === user.uid;
                        return (
                          <div key={note.id}
                            className={`rounded-xl border p-3 transition-all ${
                              isWriter ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-[#1e1e32] bg-[#0a0a14]/60'
                            }`}>
                            {isWriter && (
                              <div className="flex justify-end mb-1">
                                <button onClick={() => onDeleteNote(note.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-slate-200">{note.fromStudentName}</span>
                              <span className="text-[9px] text-slate-500">{formatDate(note.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/20 pl-2">
                              &ldquo;{note.content}&rdquo;
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 border border-dashed border-[#1e1e32] rounded-xl bg-[#0a0a14]">
                        <BookOpen className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Henüz mektup yok. İlk sen yaz!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Write Form */}
                <div className="w-full md:w-72 shrink-0 p-4 border-t md:border-t-0 md:border-l border-[#1e1e32] flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <PenTool className="h-4 w-4 text-indigo-400" />
                      Mektup Yaz
                    </h4>

                    {user ? (
                      currentUserStudent?.isTeacher && !currentUserStudent?.isApproved ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs text-amber-300">Hesabınız onay bekliyor.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                          <textarea
                            placeholder={`${selectedStudent.name} için bir şeyler yaz...`}
                            value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
                            maxLength={1000} rows={5} required
                            className="w-full rounded-xl border border-[#1e1e32] bg-[#0a0a14] p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none resize-none" />
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span className="font-semibold text-indigo-400">
                              {currentUserStudent ? currentUserStudent.name : user.displayName}
                            </span>
                            <span>{noteContent.length}/1000</span>
                          </div>
                          <button type="submit" disabled={isSubmitting || !noteContent.trim()}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-xs font-bold text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                            <Sparkles className="h-4 w-4" />
                            {isSubmitting ? 'Gönderiliyor...' : 'Mektubu Gönder'}
                          </button>
                        </form>
                      )
                    ) : (
                      <div className="border border-dashed border-[#1e1e32] p-4 rounded-xl text-center space-y-2">
                        <p className="text-xs text-slate-400">Mektup yazmak için giriş yap.</p>
                        <button onClick={() => { setSelectedStudent(null); onLogin(); }}
                          className="bg-indigo-500 hover:bg-indigo-400 text-white py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer">
                          Giriş Yap
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-600 text-center mt-3 pt-3 border-t border-[#1e1e32]">
                    Her girdi hesabınızla ilişkilendirilir.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
