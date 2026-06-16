import { Student } from '../types';
import {
  LogIn, LogOut, Sparkles, Shield, Clock, HelpCircle,
  Home, BookOpen, Camera, Images, ChevronRight, User, X, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { getInitials, getAvatarColor } from '../lib/utils';

interface AuthBarProps {
  user: any;
  currentUserStudent: Student | null;
  students: Student[];
  onLogin: () => void;
  onLogout: () => void;
  onClaimStudent: (studentId: string) => void;
  onUnclaimStudent: () => void;
  timeMachineDate: string;
  setTimeMachineDate: (date: string) => void;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'notes' | 'camera' | 'gallery' | 'admin') => void;
  isAdmin: boolean;
}

const tabs = [
  { key: 'home' as const, label: 'Anasayfa', icon: Home },
  { key: 'notes' as const, label: 'Defter', icon: BookOpen },
  { key: 'camera' as const, label: 'Anı Çek', icon: Camera },
  { key: 'gallery' as const, label: 'Galeri', icon: Images },
];

export default function AuthBar({
  user, currentUserStudent, students, onLogin, onLogout,
  onClaimStudent, onUnclaimStudent, timeMachineDate, setTimeMachineDate,
  activeTab, setActiveTab, isAdmin,
}: AuthBarProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showTimeHelp, setShowTimeHelp] = useState(false);

  const unclaimedStudents = students.filter(s => !s.claimedByUid && !s.isTeacher);
  const unclaimedTeachers = students.filter(s => !s.claimedByUid && s.isTeacher);
  const pendingApprovalsCount = students.filter(s => s.claimedByUid && !s.isApproved).length;

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 w-full border-b border-[#1e1e32] bg-[#0a0a14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold tracking-tight text-white">
                8C <span className="text-indigo-400">Mezuniyet 2026</span>
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Hatıra & Mezuniyet Defteri</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-xl bg-[#0f0f1a] border border-[#1e1e32] p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-rose-400 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Yönetici
                {pendingApprovalsCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
              {isAdmin && (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#1e1e32] bg-[#0f0f1a] px-2.5 py-1">
                <Clock className="h-3 w-3 text-indigo-400" />
                <select
                  value={timeMachineDate}
                  onChange={(e) => setTimeMachineDate(e.target.value)}
                  className="bg-transparent font-mono text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="2026-06-16" className="bg-[#0f0f1a] text-slate-300">16.06.2026 (Öncesi)</option>
                  <option value="2026-06-19" className="bg-[#0f0f1a] text-slate-300">19.06.2026 07:00 (Kamera Açık)</option>
                  <option value="2026-06-20" className="bg-[#0f0f1a] text-slate-300">19.06.2026 10:00 (Galeri Açık)</option>
                </select>
                <button onClick={() => setShowTimeHelp(!showTimeHelp)} className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer">
                  <HelpCircle className="h-3 w-3" />
                </button>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {currentUserStudent ? currentUserStudent.name : user.displayName || 'Misafir'}
                  </p>
                  {currentUserStudent ? (
                    <p className="text-[10px] text-indigo-400 font-medium">
                      {currentUserStudent.isTeacher
                        ? (currentUserStudent.isApproved ? 'Hoca' : 'Onay Bekliyor')
                        : (currentUserStudent.isApproved ? 'Öğrenci' : 'Onay Bekliyor')}
                    </p>
                  ) : (
                    <button onClick={() => setShowClaimModal(true)} className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer underline">
                      Profil Eşleştir
                    </button>
                  )}
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full border border-[#1e1e32]" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 uppercase">
                    {getInitials(user.displayName || 'U')}
                  </div>
                )}
                <button onClick={onLogout} className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-[#1a1a2e] hover:text-rose-400 transition-all">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className="cursor-pointer flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 shadow-lg shadow-indigo-500/20">
                <LogIn className="h-4 w-4" />
                Google ile Giriş Yap
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showTimeHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-500/5 border-t border-b border-indigo-500/10 text-indigo-300 text-[11px] py-2 px-6 text-center"
            >
            <Clock className="h-3 w-3 inline-block mr-1" />
            <strong className="text-white">Zaman Makinesi:</strong> Kamera <strong>07:00-10:00</strong> arası açık, galeri <strong>10:00</strong>'da açılır. Test için saati değiştirebilirsiniz.
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-[#1e1e32] bg-[#0a0a14]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-serif text-sm font-bold text-white">8C Mezuniyet</span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {currentUserStudent ? (
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-white leading-tight truncate max-w-[100px]">
                      {currentUserStudent.name}
                    </p>
                    <p className="text-[8px] text-indigo-400 font-medium">
                      {currentUserStudent.isTeacher
                        ? (currentUserStudent.isApproved ? 'Hoca' : 'Onay Bekliyor')
                        : (currentUserStudent.isApproved ? 'Öğrenci' : 'Onay Bekliyor')}
                    </p>
                  </div>
                ) : (
                  <button onClick={() => setShowClaimModal(true)} className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer underline">
                    Profil Eşleştir
                  </button>
                )}
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full border border-[#1e1e32]" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 uppercase">
                    {getInitials(user.displayName || 'U')}
                  </div>
                )}
                <button onClick={onLogout} className="cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-[#1a1a2e] hover:text-rose-400 transition-all">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button onClick={onLogin} className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-3 py-1 text-[10px] font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
                <LogIn className="h-3 w-3" />
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a14]/95 backdrop-blur-xl border-t border-[#1e1e32] px-2 pb-1 pt-1">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
                  activeTab === tab.key ? 'text-indigo-400' : 'text-slate-500'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${
                  activeTab === tab.key ? 'bg-indigo-500/10' : ''
                }`}>
                  <Icon className={`h-5 w-5 ${activeTab === tab.key ? 'text-indigo-400' : ''}`} />
                </div>
                <span className={`text-[9px] font-medium mt-0.5 ${
                  activeTab === tab.key ? 'text-indigo-400' : 'text-slate-500'
                }`}>{tab.label}</span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-1 flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
                activeTab === 'admin' ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                activeTab === 'admin' ? 'bg-rose-500/10' : ''
              }`}>
                <Shield className={`h-5 w-5 ${activeTab === 'admin' ? 'text-rose-400' : ''}`} />
              </div>
              <span className={`text-[9px] font-medium mt-0.5 ${
                activeTab === 'admin' ? 'text-rose-400' : 'text-slate-500'
              }`}>Yönetici</span>
              {pendingApprovalsCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Claim Profile Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-[#1e1e32] bg-[#0f0f1a] p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Profil Eşleştir</h3>
                  <p className="text-xs text-slate-400 mt-1">İsmini seçerek Google hesabınla eşleştir.</p>
                </div>
                <button onClick={() => setShowClaimModal(false)} className="cursor-pointer p-2 rounded-lg hover:bg-[#1a1a2e] text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono px-1">Öğrenciler</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-[#0a0a14] p-2 rounded-xl border border-[#1e1e32]">
                    {unclaimedStudents.length > 0 ? (
                      unclaimedStudents.map(student => {
                        const colors = getAvatarColor(student.name);
                        return (
                          <button
                            key={student.id}
                            onClick={() => { onClaimStudent(student.id); setShowClaimModal(false); }}
                            className={`cursor-pointer text-left rounded-lg p-2.5 text-xs text-slate-300 hover:bg-indigo-500 hover:text-white transition-all font-medium flex items-center justify-between ${colors.bg}`}
                          >
                            <span className="truncate">{student.name}</span>
                            <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                          </button>
                        );
                      })
                    ) : (
                      <p className="col-span-2 text-center py-4 text-slate-500 text-[11px]">Tüm öğrenciler eşleşmiş.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-violet-400 uppercase tracking-wider font-mono px-1">Öğretmenler</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-[#0a0a14] p-2 rounded-xl border border-[#1e1e32]">
                    {unclaimedTeachers.length > 0 ? (
                      unclaimedTeachers.map(teacher => (
                        <button
                          key={teacher.id}
                          onClick={() => { onClaimStudent(teacher.id); setShowClaimModal(false); }}
                          className="cursor-pointer text-left rounded-lg p-2.5 text-xs text-slate-300 hover:bg-violet-500 hover:text-white transition-all font-medium flex items-center justify-between"
                        >
                          <span className="truncate">{teacher.name}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                      ))
                    ) : (
                      <p className="col-span-2 text-center py-4 text-slate-500 text-[11px]">Tüm öğretmenler eşleşmiş.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#1e1e32]">
                {currentUserStudent && (
                  <button onClick={() => { onUnclaimStudent(); setShowClaimModal(false); }}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer">
                    Eşleştirmeyi Kaldır
                  </button>
                )}
                <button onClick={() => setShowClaimModal(false)}
                  className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a2a3e] cursor-pointer">
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
