import { Users, Camera, BookOpen, Clock, GraduationCap, LogIn } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface HomeTabProps {
  stats: { totalStudents: number; totalNotes: number; totalMemories: number };
  setActiveTab: (tab: 'home' | 'notes' | 'camera' | 'gallery') => void;
  user: any;
  onLogin: () => void;
}

function fmt(ms: number) {
  if (ms <= 0) return '';
  const g = Math.floor(ms / 86400000);
  const s = Math.floor((ms % 86400000) / 3600000);
  const d = Math.floor((ms % 3600000) / 60000);
  const sn = Math.floor((ms % 60000) / 1000);
  const sl = ms % 1000;
  let r = '';
  if (g > 0) r += `${g} Gün `;
  if (s > 0) r += `${s} Saat `;
  if (d > 0) r += `${d} Dakika `;
  r += `${sn}.${sl.toString().padStart(3, '0')} Saniye`;
  return r.trim();
}

function Countdown({ target, label }: { target: Date; label: string }) {
  const [text, setText] = useState('');
  const raf = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      setText(diff <= 0 ? label : fmt(diff));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, label]);

  return <span>{text}</span>;
}

const cameraOpen = new Date(2026, 5, 19, 7, 0, 0);
const galleryOpen = new Date(2026, 5, 19, 10, 0, 0);

export default function HomeTab({ stats, setActiveTab, user, onLogin }: HomeTabProps) {

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1e1e32] bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] p-6 md:p-10 md:pl-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-violet-500/[0.04] blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1">
              <GraduationCap className="h-3 w-3 text-indigo-400" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-300">Mezuniyet 2026</span>
            </div>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Yolumuz Açık Olsun,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
                8C Sevgili Sınıfı!
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed max-w-xl">
              Ortaokulun unutulmaz 4 senesini geride bırakırken, birbirimize yazacağımız tatlı hatıralar ve çekeceğimiz eşsiz fotoğraflar burada hayat buluyor.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
              <button onClick={() => setActiveTab('notes')}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5">
                <BookOpen className="h-4 w-4" />
                Defteri Yaz
              </button>
              <button onClick={() => setActiveTab('camera')}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#1e1e32] bg-[#0f0f1a] px-5 py-2.5 text-xs text-slate-300 hover:bg-[#1a1a2e] transition-all hover:-translate-y-0.5">
                <Camera className="h-4 w-4 text-indigo-400" />
                Anı Kamerası
              </button>
            </div>
          </div>
          <div className="hidden lg:flex w-52 h-52 shrink-0 items-center justify-center rounded-full border border-[#1e1e32] bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04]">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-indigo-400/60 mx-auto mb-2" />
              <span className="block font-serif text-3xl text-white font-bold">8-C</span>
              <span className="font-mono text-[10px] text-slate-500">2026 Mezunları</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'TOPLAM ÖĞRENCİ', value: stats.totalStudents, suffix: 'Mektepli', color: 'indigo' },
          { icon: BookOpen, label: 'YAZILAN NOTLAR', value: stats.totalNotes, suffix: 'Mektup', color: 'violet' },
          { icon: Camera, label: 'CANLI ANILAR', value: stats.totalMemories, suffix: 'Fotoğraf', color: 'emerald' },
        ].map((item, i) => {
          const colorMap: Record<string, string> = {
            indigo: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300',
            violet: 'border-violet-500/20 bg-violet-500/5 text-violet-300',
            emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
          };
          return (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-[#1e1e32] bg-[#0f0f1a] p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[item.color]}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase text-slate-500 tracking-wider">{item.label}</p>
                <p className="font-mono text-xl font-bold text-white">{item.value} {item.suffix}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Program */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1e1e32] bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] p-5 relative overflow-hidden">
          <Camera className="absolute top-3 right-3 h-20 w-20 text-indigo-500/5" />
          <div className="space-y-2 relative">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-indigo-300 border border-indigo-500/20">
              07:00 - 10:00
            </span>
            <h3 className="font-serif text-base font-bold text-white">Anı Kamerası</h3>
            <p className="text-xs text-slate-400">Tören boyunca fotoğraf ve video çekebileceksin.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e1e32]">
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Açılışa Kalan:
            </p>
            <p className="font-mono text-sm tracking-wide text-indigo-300 font-bold bg-[#0a0a14] p-2 text-center rounded-lg border border-indigo-500/10">
              <Countdown target={cameraOpen} label="Kamera Açık!" />
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#1e1e32] bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] p-5 relative overflow-hidden">
          <BookOpen className="absolute top-3 right-3 h-20 w-20 text-violet-500/5" />
          <div className="space-y-2 relative">
            <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-violet-300 border border-violet-500/20">
              10:00 İtibarıyla
            </span>
            <h3 className="font-serif text-base font-bold text-white">Anı Galerisi</h3>
            <p className="text-xs text-slate-400">Tören biter bitmez tüm anılar galeride yayına girecek.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e1e32]">
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Galeri Açılış:
            </p>
            <p className="font-mono text-sm tracking-wide text-violet-300 font-bold bg-[#0a0a14] p-2 text-center rounded-lg border border-violet-500/10">
              <Countdown target={galleryOpen} label="Galeri Açık!" />
            </p>
          </div>
        </div>
      </section>

      {!user && (
        <div className="border border-indigo-500/10 bg-indigo-500/5 text-slate-300 text-xs text-center py-4 px-6 rounded-xl space-y-2">
          <p className="font-semibold text-white">Sana Özel Şeyleri Paylaşmaya Başla!</p>
          <p className="text-[11px] text-slate-400">Arkadaşlarına notlar yazmak ve etkinlik günü fotoğraf çekmek için giriş yap.</p>
          <button onClick={onLogin} className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white py-1.5 px-4 font-semibold text-[11px] rounded-lg transition-all shadow-lg shadow-indigo-500/20">
            <LogIn className="h-3 w-3 inline mr-1" /> Giriş Yap
          </button>
        </div>
      )}
    </div>
  );
}
