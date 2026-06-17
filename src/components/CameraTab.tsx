import { Student } from '../types';
import { Camera, Lock, Clock, RefreshCw, Sparkles, Check, AlertTriangle, ShieldCheck, Video, Image, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface CameraTabProps {
  currentUserStudent: Student | null;
  user: any;
  timeMachineDate: string;
  onAddMemory: (base64Data: string, mediaType: 'image' | 'video') => Promise<void>;
  onLogin: () => void;
  setActiveTab: (tab: 'home' | 'notes' | 'camera' | 'gallery') => void;
}

export default function CameraTab({
  currentUserStudent, user, timeMachineDate, onAddMemory, onLogin, setActiveTab,
}: CameraTabProps) {
  const isUnlockedDay = timeMachineDate === '2026-06-19';

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [capturedType, setCapturedType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const startCamera = async () => {
    setCapturedMedia(null);
    setUploadSuccess(false);
    setErrorMessage(null);
    setRecordingDuration(0);

    if (stream) stream.getTracks().forEach(track => track.stop());

    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: mode === 'video',
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Kamera izni verilmedi. Tarayıcı ayarlarından kamerayı aktifleştirin.');
      } else {
        setErrorMessage('Kamera bulunamadı veya meşgul.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (facingMode === 'user') ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Watermark
        ctx.fillStyle = 'rgba(8, 8, 15, 0.6)';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('8C MEZUNİYET 2026', 12, canvas.height - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(new Date().toLocaleDateString('tr-TR'), canvas.width - 100, canvas.height - 10);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedMedia(base64);
        setCapturedType('image');
        stopCamera();
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedMedia(reader.result as string);
          setCapturedType('video');
          stopCamera();
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setErrorMessage('Video kaydı başlatılamadı.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const toggleFacing = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');

  const handleSaveMedia = async () => {
    if (!capturedMedia) return;
    setIsUploading(true);
    try {
      await onAddMemory(capturedMedia, capturedType);
      setUploadSuccess(true);
      setCapturedMedia(null);
    } catch (err) {
      setErrorMessage('Kaydedilemedi.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isUnlockedDay && user && currentUserStudent && !capturedMedia && !uploadSuccess) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) startCamera();
    }
    return () => { stopCamera(); };
  }, [isUnlockedDay, user, currentUserStudent, facingMode, mode]);

  useEffect(() => {
    if (!stream) return;
    if (videoRef.current) videoRef.current.srcObject = stream;
    if (mobileVideoRef.current) mobileVideoRef.current.srcObject = stream;
  }, [stream, cameraActive]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isUnlockedDay) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white">Anı Kamerası Kilitli</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kamera <strong className="text-white">19 Haziran 2026</strong> tarihinde açılacaktır.
          </p>
        </div>
        <div className="bg-[#0f0f1a] border border-[#1e1e32] p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold justify-center">
            <Clock className="h-4 w-4" />
            <span>Zaman Makinesi ile Kilidi Aç</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kamerayı test etmek için üstteki <strong className="text-white">Zaman Makinesi</strong>'ni 19.06.2026 yapın.
          </p>
        </div>
      </div>
    );
  }

  if (!user || !currentUserStudent) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white">Profil Eşleştirmesi Gerekli</h2>
          <p className="text-xs text-slate-400">Kamerayı kullanmak için giriş yapmalı ve profilinizi eşleştirmelisiniz.</p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          {!user ? (
            <button onClick={onLogin}
              className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Google ile Giriş Yap
            </button>
          ) : (
            <p className="text-xs text-slate-400">Profil eşleştirmek için üstteki "Profil Eşleştir" butonunu kullanın.</p>
          )}
        </div>
      </div>
    );
  }

  if (!currentUserStudent.isApproved) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white">Onay Bekliyor</h2>
          <p className="text-xs text-slate-400">
            Profiliniz henüz onaylanmadı. Kamera kullanımı için yöneticinizin profilinizi onaylaması gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:py-6 md:max-w-xl md:mx-auto">
      {/* Desktop Header */}
      <div className="hidden md:block text-center space-y-1 mb-4">
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2.5 py-0.5">
          <ShieldCheck className="h-3 w-3" /> CANLI ÇEKİM
        </div>
        <h2 className="font-serif text-lg md:text-xl font-bold text-white">Anı Çek</h2>
        <p className="text-[11px] text-slate-400">Fotoğraf veya video çek, 8C albümünde yer alsın.</p>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 text-rose-300 text-xs py-2 px-3 rounded-xl border border-rose-500/20 text-center mb-4 md:block hidden">
          {errorMessage}
        </div>
      )}

      {uploadSuccess && (
        <div className="p-6 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl space-y-2 my-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
            <Check className="h-5 w-5" />
          </div>
          <p className="font-serif text-base font-bold">Kaydedildi!</p>
          <p className="text-xs text-slate-400">Galeriye yönlendiriliyorsunuz...</p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {!uploadSuccess && (
        <>
          {/* Mobile Fullscreen Camera */}
          <div className="md:hidden fixed inset-0 z-[60] bg-black flex flex-col">
            {errorMessage && (
              <div className="absolute top-4 left-4 right-4 z-10 bg-rose-500/20 text-rose-300 text-xs py-2 px-3 rounded-xl border border-rose-500/30 text-center">
                {errorMessage}
              </div>
            )}

            <div className="flex-1 relative overflow-hidden">
              {cameraActive && !capturedMedia && (
                <video
                  ref={mobileVideoRef}
                  autoPlay
                  playsInline
                  muted={true}
                  className={`absolute inset-0 h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              )}

              {capturedMedia && capturedType === 'image' && (
                <img src={capturedMedia} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}

              {capturedMedia && capturedType === 'video' && (
                <video src={capturedMedia} controls className="absolute inset-0 h-full w-full object-cover" />
              )}

              {!cameraActive && !capturedMedia && !stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Camera className="h-14 w-14 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">Kamera kapalı</p>
                    <button onClick={startCamera}
                      className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 px-8 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/30">
                      Kamerayı Aç
                    </button>
                  </div>
                </div>
              )}

              {capturedMedia && capturedType === 'image' && (
                <img src={capturedMedia} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}

              {capturedMedia && capturedType === 'video' && (
                <video src={capturedMedia} controls className="absolute inset-0 h-full w-full object-cover" />
              )}

              {!cameraActive && !capturedMedia && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Camera className="h-14 w-14 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">Kamera hazır değil</p>
                    <button onClick={startCamera}
                      className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 px-8 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/30">
                      Kamerayı Aç
                    </button>
                  </div>
                </div>
              )}

              {!stream && !cameraActive && !capturedMedia && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Camera className="h-14 w-14 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">Kamera kapalı</p>
                    <button onClick={startCamera}
                      className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 px-8 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/30">
                      Kamerayı Aç
                    </button>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-sm font-mono">{formatDuration(recordingDuration)}</span>
                </div>
              )}

              {cameraActive && !capturedMedia && !isRecording && mode === 'photo' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 border border-dashed border-white/10 rounded-full" />
                </div>
              )}
            </div>

            {/* Mobile Controls Overlay */}
            <div className="bg-black/80 px-6 pt-4 pb-[80px]">
              {cameraActive && !capturedMedia && !isRecording && (
                <div className="flex items-center justify-center gap-6 mb-4">
                  <button onClick={() => setMode('photo')}
                    className={`cursor-pointer flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === 'photo'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400'
                    }`}>
                    <Image className="h-4 w-4" />
                    Foto
                  </button>
                  <button onClick={() => setMode('video')}
                    className={`cursor-pointer flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === 'video'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-400'
                    }`}>
                    <Video className="h-4 w-4" />
                    Video
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-8">
                {cameraActive && !capturedMedia && (
                  <button onClick={toggleFacing}
                    className="cursor-pointer p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                    title="Kamerayı Döndür">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                )}

                {cameraActive && !capturedMedia && mode === 'photo' && (
                  <button onClick={capturePhoto}
                    className="cursor-pointer flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/10 hover:bg-white/20 transition-transform active:scale-95">
                    <div className="h-7 w-7 rounded-full border-2 border-white" />
                  </button>
                )}

                {cameraActive && !capturedMedia && mode === 'video' && !isRecording && (
                  <button onClick={startRecording}
                    className="cursor-pointer flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-rose-500 hover:bg-rose-400 transition-transform active:scale-95">
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  </button>
                )}

                {isRecording && (
                  <button onClick={stopRecording}
                    className="cursor-pointer flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-slate-800 hover:bg-slate-700 transition-transform active:scale-95">
                    <Square className="h-6 w-6 text-white" />
                  </button>
                )}

                {capturedMedia && (
                  <div className="flex items-center gap-4 w-full">
                    <button onClick={startCamera}
                      className="cursor-pointer flex-1 py-3 text-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                      Yeniden Çek
                    </button>
                    <button onClick={handleSaveMedia} disabled={isUploading}
                      className="cursor-pointer flex-1 py-3 text-sm bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                      {isUploading ? 'Kaydediliyor...' : 'Albüme Ekle'}
                    </button>
                  </div>
                )}

                {cameraActive && !capturedMedia && mode === 'photo' && <div className="w-12" />}
                {cameraActive && !capturedMedia && mode === 'video' && !isRecording && <div className="w-12" />}
              </div>
            </div>
          </div>

          {/* Desktop Camera Card */}
          <div className="hidden md:block bg-[#0f0f1a] border border-[#1e1e32] p-4 rounded-xl space-y-4">
            <div className="relative aspect-[4/3] w-full bg-black rounded-lg overflow-hidden border border-[#1e1e32] flex items-center justify-center">
              {cameraActive && !capturedMedia && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={true}
                  className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              )}

              {capturedMedia && capturedType === 'image' && (
                <img src={capturedMedia} alt="" className="w-full h-full object-cover" />
              )}

              {capturedMedia && capturedType === 'video' && (
                <video src={capturedMedia} controls className="w-full h-full object-cover" />
              )}

              {!cameraActive && !capturedMedia && (
                <div className="text-center p-6 space-y-3">
                  <Camera className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">Kamera hazır değil</p>
                  <button onClick={startCamera}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white py-1.5 px-4 font-bold rounded-lg text-xs transition-colors">
                    Kamerayı Aç
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-mono">{formatDuration(recordingDuration)}</span>
                </div>
              )}

              {cameraActive && !capturedMedia && !isRecording && mode === 'photo' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 border border-dashed border-white/10 rounded-full" />
                </div>
              )}
            </div>

            {cameraActive && !capturedMedia && !isRecording && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setMode('photo')}
                  className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === 'photo'
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-[#0a0a14] text-slate-400 border border-[#1e1e32] hover:border-indigo-500/30'
                  }`}>
                  <Image className="h-4 w-4" />
                  Fotoğraf
                </button>
                <button onClick={() => setMode('video')}
                  className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === 'video'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-[#0a0a14] text-slate-400 border border-[#1e1e32] hover:border-rose-500/30'
                  }`}>
                  <Video className="h-4 w-4" />
                  Video
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              {cameraActive && !capturedMedia && (
                <button onClick={toggleFacing}
                  className="cursor-pointer p-2.5 rounded-xl bg-[#0a0a14] border border-[#1e1e32] text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                  title="Kamerayı Döndür">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}

              {cameraActive && !capturedMedia && mode === 'photo' && (
                <button onClick={capturePhoto}
                  className="cursor-pointer flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-rose-500 hover:bg-rose-400 shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <div className="h-5 w-5 rounded-full border-2 border-white" />
                </button>
              )}

              {cameraActive && !capturedMedia && mode === 'video' && !isRecording && (
                <button onClick={startRecording}
                  className="cursor-pointer flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-rose-500 hover:bg-rose-400 shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Play className="h-5 w-5 text-white ml-0.5" />
                </button>
              )}

              {isRecording && (
                <button onClick={stopRecording}
                  className="cursor-pointer flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-slate-800 hover:bg-slate-700 shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Square className="h-5 w-5 text-white" />
                </button>
              )}

              {capturedMedia && (
                <div className="flex items-center gap-3 w-full">
                  <button onClick={startCamera}
                    className="cursor-pointer flex-1 py-3 text-xs bg-[#0a0a14] border border-[#1e1e32] hover:bg-[#1a1a2e] text-slate-300 rounded-lg transition-all">
                    Yeniden Çek
                  </button>
                  <button onClick={handleSaveMedia} disabled={isUploading}
                    className="cursor-pointer flex-1 py-3 text-xs bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                    {isUploading ? 'Kaydediliyor...' : 'Albüme Ekle'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[8px] text-slate-600 text-center leading-normal">
              * Tamamen tarayıcı içinde işlem yapılır. Hiçbir harici dosya seçilemez.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
