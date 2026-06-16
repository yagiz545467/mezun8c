import { useState } from 'react';
import { Student, GraduationNote, MemoryMedia } from '../types';
import {
  ShieldCheck, UserCheck, Trash2, RefreshCw, Check, AlertTriangle,
  Users, Mail, Camera, X, Sparkles, Lock, BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getInitials, getAvatarColor, formatDate, formatDateTime } from '../lib/utils';

interface AdminPanelTabProps {
  students: Student[];
  notes: GraduationNote[];
  memories: MemoryMedia[];
  user: any;
  onApproveTeacher: (studentId: string, approve: boolean) => Promise<void>;
  onClearClaim: (studentId: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onDeleteMemory: (memoryId: string) => Promise<void>;
  isNotebookPublic: boolean;
  onToggleNotebookPublic: (isPublic: boolean) => Promise<void>;
}

export default function AdminPanelTab({
  students, notes, memories, user, onApproveTeacher, onClearClaim,
  onDeleteNote, onDeleteMemory, isNotebookPublic, onToggleNotebookPublic,
}: AdminPanelTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'students' | 'notes' | 'memories'>('teachers');

  const pendingTeachers = students.filter(s => s.isTeacher && s.claimedByUid && !s.isApproved);
  const approvedTeachers = students.filter(s => s.isTeacher && s.claimedByUid && s.isApproved);
  const unclaimedTeachers = students.filter(s => s.isTeacher && !s.claimedByUid);
  const pendingStudents = students.filter(s => !s.isTeacher && s.claimedByUid && !s.isApproved);
  const approvedStudents = students.filter(s => !s.isTeacher && s.claimedByUid && s.isApproved);

  return (
    <div className="space-y-4 md:space-y-6 py-2 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#1e1e32]">
        <div>
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400 uppercase">
            Yönetim Paneli
          </span>
          <h2 className="font-serif text-xl font-bold text-white mt-1">8C Denetim Masası</h2>
          <p className="text-xs text-slate-400 mt-0.5">Öğretmen onayları, içerik denetimi ve ayarlar.</p>
        </div>
      </div>

      {/* Notebook Toggle */}
      <div className={`p-5 rounded-xl border transition-all ${
        isNotebookPublic
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-indigo-500/5 border-indigo-500/20'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${
              isNotebookPublic
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              {isNotebookPublic ? 'DEFTER AÇIK' : 'DEFTER KİLİTLİ'}
            </span>
            <p className="text-xs text-slate-400 mt-2">
              {isNotebookPublic
                ? 'Herkes birbirinin mektuplarını görebilir.'
                : 'Herkes sadece kendi yazdıklarını görebilir.'}
            </p>
          </div>
          <button onClick={() => {
            const msg = isNotebookPublic
              ? 'Defteri gizli moda almak istiyor musunuz?'
              : 'Defteri herkese açmak istiyor musunuz?';
            if (window.confirm(msg)) onToggleNotebookPublic(!isNotebookPublic);
          }}
            className={`cursor-pointer px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
              isNotebookPublic
                ? 'bg-rose-500 hover:bg-rose-400 text-white'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
            }`}>
            {isNotebookPublic ? <><Lock className="h-4 w-4" /> Defteri Gizle</> : <><Sparkles className="h-4 w-4" /> Defteri Aç</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1e1e32] pb-2">
        {[
          { key: 'teachers' as const, icon: ShieldCheck, label: 'Öğretmen Onayları', count: pendingTeachers.length },
          { key: 'students' as const, icon: Users, label: 'Öğrenci Onayları', count: pendingStudents.length },
          { key: 'notes' as const, icon: Mail, label: 'Mektuplar', count: notes.length },
          { key: 'memories' as const, icon: Camera, label: 'Fotoğraflar', count: memories.length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button key={key} onClick={() => setActiveSubTab(key)}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === key
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[#0f0f1a] text-slate-400 hover:text-white border border-[#1e1e32]'
            }`}>
            <Icon className="h-3.5 w-3.5" />
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Teachers */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-[#0f0f1a] p-5 rounded-xl border border-[#1e1e32] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-400" />
              Onay Bekleyen Öğretmenler
            </h3>
            {pendingTeachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingTeachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex items-center justify-center font-bold text-xs rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/20">
                        {getInitials(t.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="font-mono text-[8px] text-slate-500">UID: {t.claimedByUid?.substring(0, 10)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onApproveTeacher(t.id, true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => onApproveTeacher(t.id, false)}
                        className="bg-[#0a0a14] border border-[#1e1e32] hover:border-rose-500/30 text-rose-400 p-2 rounded-lg transition-all cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Onay bekleyen öğretmen yok.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f0f1a] p-4 rounded-xl border border-[#1e1e32] space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> Onaylanmış ({approvedTeachers.length})
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {approvedTeachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs bg-[#0a0a14] p-2 rounded-lg border border-[#1e1e32]">
                    <span className="text-slate-300">{t.name}</span>
                    <button onClick={() => onClearClaim(t.id)}
                      className="text-rose-400 hover:bg-rose-500/10 px-2 py-0.5 rounded text-[9px] border border-rose-500/20 cursor-pointer">
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0f0f1a] p-4 rounded-xl border border-[#1e1e32] space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Henüz Eşleşmemiş ({unclaimedTeachers.length})</h4>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {unclaimedTeachers.map(t => (
                  <span key={t.id} className="text-[9px] bg-[#0a0a14] text-slate-400 border border-[#1e1e32] px-2 py-1 rounded">{t.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-[#0f0f1a] p-5 rounded-xl border border-[#1e1e32] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-400" />
              Onay Bekleyen Öğrenciler ({pendingStudents.length})
            </h3>
            {pendingStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingStudents.map(s => {
                  const colors = getAvatarColor(s.name);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 flex items-center justify-center font-bold text-xs rounded-lg border ${colors.bg} ${colors.text}`}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{s.name}</p>
                          <p className="font-mono text-[8px] text-slate-500">UID: {s.claimedByUid?.substring(0, 10)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onApproveTeacher(s.id, true)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => onApproveTeacher(s.id, false)}
                          className="bg-[#0a0a14] border border-[#1e1e32] hover:border-rose-500/30 text-rose-400 p-2 rounded-lg transition-all cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Onay bekleyen öğrenci yok.</p>
            )}
          </div>

          <div className="bg-[#0f0f1a] p-5 rounded-xl border border-[#1e1e32] space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" /> Onaylanmış Öğrenciler ({approvedStudents.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="text-slate-500 font-mono text-[9px] uppercase border-b border-[#1e1e32]">
                    <th className="p-2 font-medium">ID</th>
                    <th className="p-2 font-medium">İsim</th>
                    <th className="p-2 font-medium">Cinsiyet</th>
                    <th className="p-2 font-medium">UID</th>
                    <th className="p-2 font-medium text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e32]">
                  {approvedStudents.length > 0 ? (
                    approvedStudents.map(st => (
                      <tr key={st.id} className="hover:bg-[#0a0a14]/50">
                        <td className="p-2 font-mono text-[10px]">{st.id}</td>
                        <td className="p-2 font-semibold text-white">{st.name}</td>
                        <td className="p-2">{st.gender === 'F' ? 'Kız' : 'Erkek'}</td>
                        <td className="p-2 font-mono text-[9px] text-slate-500">{st.claimedByUid?.substring(0, 14)}...</td>
                        <td className="p-2 text-right">
                          <button onClick={() => onClearClaim(st.id)}
                            className="text-[9px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded cursor-pointer">
                            Kaldır
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-500">Henüz onaylanmış öğrenci yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notes Moderation */}
      {activeSubTab === 'notes' && (
        <div className="bg-[#0f0f1a] p-5 rounded-xl border border-[#1e1e32] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" />
            Mektup Denetimi
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {notes.map(note => {
              const toStudent = students.find(s => s.id === note.toStudentId);
              return (
                <div key={note.id} className="p-3 rounded-xl border border-[#1e1e32] bg-[#0a0a14]/60 flex justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-indigo-400 font-semibold">Kime: {toStudent?.name || note.toStudentId}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-violet-400">Yazan: {note.fromStudentName}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-500">{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">&ldquo;{note.content}&rdquo;</p>
                  </div>
                  <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) onDeleteNote(note.id); }}
                    className="text-slate-500 hover:text-rose-400 p-1 hover:bg-[#1a1a2e] rounded transition-all shrink-0 self-center cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {notes.length === 0 && <p className="text-center py-8 text-slate-500 text-xs">Henüz mektup yok.</p>}
          </div>
        </div>
      )}

      {/* Memories Moderation */}
      {activeSubTab === 'memories' && (
        <div className="bg-[#0f0f1a] p-5 rounded-xl border border-[#1e1e32] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-400" />
            Fotoğraf Denetimi
          </h3>
          {memories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {memories.map(mem => (
                <div key={mem.id} className="group relative rounded-lg overflow-hidden border border-[#1e1e32] aspect-square bg-[#0a0a14]">
                  {mem.mediaType === 'image' ? (
                    <img src={mem.mediaUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="relative w-full h-full">
                      <img src={mem.mediaUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#0a0a14]/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-semibold text-indigo-400 truncate">{mem.studentName}</p>
                      <p className="text-[8px] text-slate-500">{formatDate(mem.createdAt)}</p>
                    </div>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) onDeleteMemory(mem.id); }}
                      className="w-full py-1 text-center bg-rose-600 hover:bg-rose-500 rounded text-[9px] text-white font-bold cursor-pointer">
                      <Trash2 className="h-3 w-3 inline mr-1" /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500 text-xs">Henüz fotoğraf yok.</p>
          )}
        </div>
      )}
    </div>
  );
}
