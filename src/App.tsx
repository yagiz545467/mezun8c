import { useState, useEffect } from 'react';
import { Student, GraduationNote, MemoryMedia } from './types';
import {
  getStudents, upsertStudent, getNotes, createNote, deleteNote,
  getMemories, createMemory, deleteMemory, getSetting, setSetting, seedIfEmpty,
} from './lib/api';
import { AppUser, saveUser, loadUser, clearUser } from './lib/auth';
import AuthBar from './components/AuthBar';
import HomeTab from './components/HomeTab';
import NotesTab from './components/NotesTab';
import CameraTab from './components/CameraTab';
import GalleryTab from './components/GalleryTab';
import AdminPanelTab from './components/AdminPanelTab';
import { GraduationCap, Sparkles } from 'lucide-react';

const ADMIN_EMAIL = 'unluleyla52@gmail.com';

const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-1', name: 'MİRAÇ HALİM TANRIKULU', gender: 'M' },
  { id: 'std-2', name: 'MUSTAFA ADİL CİHAN', gender: 'M' },
  { id: 'std-3', name: 'AZAD YILMAZ', gender: 'M' },
  { id: 'std-4', name: 'AYŞE NEVAL ÇETİN', gender: 'F' },
  { id: 'std-5', name: 'SEYYİD EREN BÜYÜKDEMİR', gender: 'M' },
  { id: 'std-6', name: 'MERYEM YALÇINLAR', gender: 'F' },
  { id: 'std-7', name: 'BERDAN YILDIRIM', gender: 'M' },
  { id: 'std-8', name: 'ENES ÇATAL', gender: 'M' },
  { id: 'std-9', name: 'ZEYNEP NEVA SELÇUK', gender: 'F' },
  { id: 'std-10', name: 'ÜMMÜ GÜLSÜM MUTLU', gender: 'F' },
  { id: 'std-11', name: 'MERT KARAN', gender: 'M' },
  { id: 'std-12', name: 'LİN HANNAVİ', gender: 'F' },
  { id: 'std-13', name: 'ELİF EBRAR BÜLBÜL', gender: 'F' },
  { id: 'std-14', name: 'BEYZANUR ABLAK', gender: 'F' },
  { id: 'std-15', name: 'ECENUR BEKTAŞ', gender: 'F' },
  { id: 'std-16', name: 'ELİF SARE KAYA', gender: 'F' },
  { id: 'std-17', name: 'KUZEY KARADENİZ', gender: 'M' },
  { id: 'std-18', name: 'CEYLİN BAŞKAN', gender: 'F' },
  { id: 'std-19', name: 'ÖMER ASAF OCAKLI', gender: 'M' },
  { id: 'std-20', name: 'EREN HALİL BEYHAN', gender: 'M' },
  { id: 'std-21', name: 'ŞURANUR ŞEKER', gender: 'F' },
  { id: 'std-22', name: 'YAĞIZ SİRAÇ ÜNLÜ', gender: 'M' },
  { id: 'std-23', name: 'YUNUS EMRE BOZ', gender: 'M' },
  { id: 'std-24', name: 'YUNUS EMRE CİBA', gender: 'M' },
  { id: 'std-25', name: 'ZEYNEP GENÇYILMAZ', gender: 'F' },
  { id: 'std-26', name: 'ZEYNEP ZEHRA KESİKBAŞ', gender: 'F' },
  { id: 'std-27', name: 'HASAN ALİ ŞAHİN', gender: 'M' },
  { id: 'std-28', name: 'NUR HATİCE AKSOY', gender: 'F' },
  { id: 'std-29', name: 'RUVEYDA ERVA YILDIZ', gender: 'F' },
  { id: 'tcr-1', name: 'ŞÖHRET HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-2', name: 'ASLI HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-3', name: 'BÜNYAMİN HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-4', name: 'MERAL HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-5', name: 'MUSTAFA HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-6', name: 'CANER HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-7', name: 'DUYGU HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-8', name: 'ERKAN HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-9', name: 'MEHIBE HOCA', gender: 'F', isTeacher: true },
];
const STORAGE_PREFIX = '8c_';

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentUserStudent, setCurrentUserStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<GraduationNote[]>([]);
  const [memories, setMemories] = useState<MemoryMedia[]>([]);
  const [isNotebookPublic, setIsNotebookPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'notes' | 'camera' | 'gallery' | 'admin'>('home');
  const [timeMachineDate, setTimeMachineDate] = useState('2026-06-16');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const loadData = async () => {
    try {
      await seedIfEmpty();
      const [s, n, m, settingsVal] = await Promise.all([
        getStudents(), getNotes(), getMemories(),
        getSetting('isNotebookPublic'),
      ]);
      setStudents(s);
      setNotes(n.sort((a, b) => b.createdAt - a.createdAt));
      setMemories(m.sort((a, b) => b.createdAt - a.createdAt));
      setIsNotebookPublic(settingsVal === 'true');
      setIsOnline(true);
    } catch (err) {
      console.debug('Local mode: using localStorage fallback');
      setIsOnline(false);
      const s = getLocalData<Student[]>('students', DEFAULT_STUDENTS);
      const n = getLocalData<GraduationNote[]>('notes', []);
      const m = getLocalData<MemoryMedia[]>('memories', []);
      const p = getLocalData<boolean>('isNotebookPublic', false);
      setStudents(s);
      setNotes(n);
      setMemories(m);
      setIsNotebookPublic(p);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(res => res.json())
          .then(info => {
            const appUser: AppUser = {
              uid: info.sub,
              displayName: info.name || '',
              email: info.email || '',
              photoURL: info.picture || null,
            };
            setUser(appUser);
            saveUser(appUser);
          })
          .catch(console.error);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      const saved = loadUser();
      if (saved) setUser(saved);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      const mapped = students.find(s => s.claimedByUid === user.uid);
      setCurrentUserStudent(mapped || null);
    } else {
      setCurrentUserStudent(null);
    }
  }, [user, students]);

  const syncStudent = async (updated: Student) => {
    try {
      if (isOnline) await upsertStudent({
        id: updated.id, name: updated.name, email: updated.email,
        photoUrl: updated.photoUrl, gender: updated.gender,
        claimedByUid: updated.claimedByUid, isTeacher: updated.isTeacher,
        isApproved: updated.isApproved,
      });
    } catch { /* fallback */ }
  };

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = 'openid profile email';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&include_granted_scopes=true`;
    window.location.href = url;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUserStudent(null);
    clearUser();
  };

  const handleClaimStudent = async (studentId: string) => {
    if (!user) return;
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const updated: Student = {
      ...target,
      claimedByUid: user.uid,
      isApproved: false,
    };

    const updatedList = students.map(s => s.id === studentId ? updated : s);
    setStudents(updatedList);
    setLocalData('students', updatedList);
    setCurrentUserStudent(updated);
    await syncStudent(updated);
  };

  const handleUnclaimStudent = async () => {
    if (!user || !currentUserStudent) return;
    const updated: Student = { ...currentUserStudent, claimedByUid: null, isApproved: false };
    const updatedList = students.map(s => s.id === currentUserStudent.id ? updated : s);
    setStudents(updatedList);
    setLocalData('students', updatedList);
    setCurrentUserStudent(null);
    await syncStudent(updated);
  };

  const handleApproveTeacher = async (studentId: string, approve: boolean) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated: Student = {
      ...target,
      isApproved: approve,
      claimedByUid: approve ? target.claimedByUid : null,
    };
    const updatedList = students.map(s => s.id === studentId ? updated : s);
    setStudents(updatedList);
    setLocalData('students', updatedList);
    await syncStudent(updated);
  };

  const handleClearClaim = async (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated: Student = { ...target, claimedByUid: null, isApproved: false };
    const updatedList = students.map(s => s.id === studentId ? updated : s);
    setStudents(updatedList);
    setLocalData('students', updatedList);
    await syncStudent(updated);
  };

  const handleToggleNotebookPublic = async (isPublic: boolean) => {
    setIsNotebookPublic(isPublic);
    setLocalData('isNotebookPublic', isPublic);
    try {
      if (isOnline) await setSetting('isNotebookPublic', String(isPublic));
    } catch { /* fallback */ }
  };

  const handleAddNote = async (toStudentId: string, content: string) => {
    if (!user) return;
    const fromStudentId = currentUserStudent ? currentUserStudent.id : 'guest';
    const fromStudentName = currentUserStudent ? currentUserStudent.name : user.displayName || 'Gizemli Arkadaş';
    const newNote: GraduationNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      toStudentId, fromStudentId, fromStudentName,
      fromUserUid: user.uid, content, createdAt: Date.now(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setLocalData('notes', updatedNotes);

    try {
      if (isOnline) await createNote(newNote);
    } catch { /* fallback */ }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    setLocalData('notes', updatedNotes);
    try {
      if (isOnline) await deleteNote(noteId);
    } catch { /* fallback */ }
  };

  const handleAddMemory = async (base64Data: string, mediaType: 'image' | 'video' = 'image') => {
    if (!user || !currentUserStudent) return;
    const newMemory: MemoryMedia = {
      id: 'memory_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      studentId: currentUserStudent.id,
      studentName: currentUserStudent.name,
      userUid: user.uid,
      mediaUrl: base64Data,
      mediaType,
      createdAt: Date.now(),
    };

    const updatedMemories = [newMemory, ...memories];
    setMemories(updatedMemories);
    setLocalData('memories', updatedMemories);

    try {
      if (isOnline) await createMemory(newMemory);
    } catch { /* fallback */ }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!user) return;
    const updatedMemories = memories.filter(m => m.id !== memoryId);
    setMemories(updatedMemories);
    setLocalData('memories', updatedMemories);
    try {
      if (isOnline) await deleteMemory(memoryId);
    } catch { /* fallback */ }
  };

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const stats = {
    totalStudents: students.filter(s => !s.isTeacher).length,
    totalNotes: notes.length,
    totalMemories: memories.length,
  };

  return (
    <div className="min-h-screen bg-[#08080f] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">

      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-violet-500/[0.03]" />

      <AuthBar
        user={user}
        currentUserStudent={currentUserStudent}
        students={students}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onClaimStudent={handleClaimStudent}
        onUnclaimStudent={handleUnclaimStudent}
        timeMachineDate={timeMachineDate}
        setTimeMachineDate={setTimeMachineDate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 pt-12 pb-28 md:px-6 md:py-6 md:pb-6 relative z-10">
        {isLoading ? (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <GraduationCap className="h-5 w-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Mezuniyet Portalı Yükleniyor...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'home' && (
              <HomeTab stats={stats} timeMachineDate={timeMachineDate} setActiveTab={setActiveTab} user={user} onLogin={handleLogin} />
            )}
            {activeTab === 'notes' && (
              <NotesTab
                students={students} notes={notes} currentUserStudent={currentUserStudent}
                user={user} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote}
                onLogin={handleLogin} timeMachineDate={timeMachineDate} isNotebookPublic={isNotebookPublic}
              />
            )}
            {activeTab === 'camera' && (
              <CameraTab
                currentUserStudent={currentUserStudent} user={user}
                timeMachineDate={timeMachineDate} onAddMemory={handleAddMemory}
                onLogin={handleLogin} setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'gallery' && (
              <GalleryTab
                memories={memories} currentUserStudent={currentUserStudent}
                user={user} timeMachineDate={timeMachineDate}
                onDeleteMemory={handleDeleteMemory} setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'admin' && isAdmin && (
              <AdminPanelTab
                students={students} notes={notes} memories={memories}
                user={user} onApproveTeacher={handleApproveTeacher}
                onClearClaim={handleClearClaim} onDeleteNote={handleDeleteNote}
                onDeleteMemory={handleDeleteMemory} isNotebookPublic={isNotebookPublic}
                onToggleNotebookPublic={handleToggleNotebookPublic}
              />
            )}
          </div>
        )}
      </main>

      <footer className="hidden md:block border-t border-[#1e1e32] bg-[#0a0a14]/80 py-4 text-center text-xs text-slate-600 font-mono relative z-10 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p>2026 8C Sınıfı Mezuniyet Etkinliği</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Okula Veda, Hayata Merhaba!</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
