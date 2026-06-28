/* eslint-disable no-console */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { ToastContainer } from '@/components/ui/primitives';
import { api } from '@/lib/api';

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    address: '123 Main St, New York',
    ward: 'Downtown',
    lat: 40.7128,
    lng: -74.006,
    category: 'other',
    severity: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = (msg: string, type: any = 'info') => {
    setToasts((t) => [...t, { id: Math.random().toString(), message: msg, type }]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setImage(localUrl);
      setStep(2);

      try {
        setIsScanning(true);

        // 1. Upload
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        const uploadRes = await api.post('/api/issues/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadData = uploadRes.data.data;
        setMediaData(uploadData);

        // 2. Analyze
        const analyzeRes = await api.get(
          `/api/issues/analyze?url=${encodeURIComponent(uploadData.url)}`
        );
        const analysis = analyzeRes.data.data;

        setAiData(analysis);
        setFormData((prev) => ({
          ...prev,
          category: analysis.category || prev.category,
          severity: analysis.severity || prev.severity,
          title: analysis.description ? analysis.description.substring(0, 50) + '...' : prev.title,
        }));

        setIsScanning(false);
        setTimeout(() => setStep(3), 2500); // Auto-advance after showing results
      } catch (err) {
        console.error('Failed processing image', err);
        setIsScanning(false);
        addToast('Failed to analyze image. Please fill details manually.', 'error');
        setTimeout(() => setStep(3), 2000);
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Current Location',
            ward: 'Current Ward',
          }));
          addToast('Location updated', 'success');
        },
        () => addToast('Failed to get location', 'error')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return addToast('Title is required', 'error');
    if (!formData.desc) return addToast('Description is required', 'error');
    if (!mediaData) return addToast('Image is required', 'error');

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.desc,
        category: formData.category,
        severity: formData.severity,
        address: formData.address,
        ward: formData.ward,
        lat: formData.lat,
        lng: formData.lng,
        mediaUrl: mediaData.url,
        mediaPublicId: mediaData.public_id,
        mediaOriginalUrl: mediaData.originalUrl,
        mediaOptimizedUrl: mediaData.optimizedUrl,
        mediaThumbnailUrl: mediaData.thumbnailUrl,
        ai_analysis: aiData, // Pass the raw analysis directly to the backend
      };

      await api.post('/api/issues', payload);
      setIsSubmitting(false);
      setStep(4);
      setTimeout(() => {
        router.push('/dashboard');
      }, 4000);
    } catch (err) {
      console.error('Failed to submit issue', err);
      setIsSubmitting(false);
      addToast('Failed to submit report', 'error');
    }
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6 flex flex-col min-h-[calc(100vh-8rem)] font-body">
      <ToastContainer
        toasts={toasts}
        removeToast={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      {/* V5.1 Header & Progress */}
      <div className="mb-16 text-center relative z-20">
        <h1 className="font-display text-5xl font-bold mb-10 tracking-tight text-white drop-shadow-lg">
          Report Infrastructure Issue
        </h1>

        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          {['Capture', 'AI Analysis', 'Details', 'Complete'].map((label, i) => {
            const stepNum = i + 1;
            const isPast = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={stepNum} className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-lg transition-all duration-700 border-2 relative overflow-hidden ${
                    isCurrent
                      ? 'bg-layer2 border-citizen text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110'
                      : isPast
                        ? 'bg-citizen border-citizen text-white'
                        : 'bg-layer1 text-text-muted border-border'
                  }`}
                >
                  {isCurrent && <div className="absolute inset-0 bg-citizen/20 animate-pulse" />}
                  {isPast ? (
                    <span className="material-symbols-outlined text-[24px]">check</span>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-sm mt-4 font-bold transition-colors duration-500 uppercase tracking-widest ${
                    isCurrent ? 'text-white' : isPast ? 'text-citizen' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
                {stepNum < 4 && (
                  <div className="absolute top-7 left-[50%] w-full h-1 -translate-y-1/2 bg-layer1 -z-10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-citizen shadow-glow-blue"
                      initial={{ width: 0 }}
                      animate={{ width: step > stepNum ? '100%' : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full min-h-[400px]"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <div
                className="w-full max-w-2xl aspect-[16/10] rounded-[40px] border border-border bg-layer1 hover:bg-layer2 hover:border-citizen/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-8 group relative overflow-hidden shadow-2xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-citizen/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-28 h-28 rounded-[28px] bg-layer2 border border-border flex items-center justify-center shadow-xl group-hover:border-citizen/50 group-hover:shadow-glow-blue transition-all relative z-10"
                >
                  <span className="material-symbols-outlined text-[56px] text-text-muted group-hover:text-citizen transition-colors">
                    add_a_photo
                  </span>
                </motion.div>

                <div className="text-center z-10 space-y-2">
                  <h3 className="text-3xl font-display font-bold text-white">
                    Capture Infrastructure
                  </h3>
                  <p className="text-lg text-text-secondary font-light">
                    Drag & drop an image or click to browse
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AI Scan */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center h-full min-h-[500px]"
            >
              <div className="w-full max-w-2xl relative rounded-[40px] overflow-hidden border border-border shadow-2xl bg-layer1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {image && (
                  <img
                    src={image}
                    alt="Upload"
                    className="w-full aspect-video object-cover brightness-[0.25] contrast-125 saturate-0 transition-all duration-1000"
                    style={{
                      filter: isScanning
                        ? 'brightness(0.25) saturate(0) contrast(1.2)'
                        : 'brightness(0.6) saturate(1)',
                    }}
                  />
                )}

                {isScanning && (
                  <>
                    <motion.div
                      animate={{ y: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-b-2 border-ai/80 bg-gradient-to-b from-transparent via-ai/10 to-ai/30 shadow-[0_10px_40px_rgba(139,92,246,0.5)] z-10 pointer-events-none"
                    />
                    {/* Reticle UI */}
                    <div className="absolute inset-0 border-[1px] border-white/10 m-12 rounded-3xl pointer-events-none" />
                    <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-ai rounded-tl-xl pointer-events-none" />
                    <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-ai rounded-tr-xl pointer-events-none" />
                    <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-ai rounded-bl-xl pointer-events-none" />
                    <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-ai rounded-br-xl pointer-events-none" />
                  </>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-6 p-10 bg-layer1/80 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-ai/10 to-transparent pointer-events-none" />
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl border border-ai/30 flex items-center justify-center relative bg-layer2 z-10 overflow-hidden">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-[-50%] bg-[conic-gradient(from_90deg,transparent_0%,transparent_70%,rgba(139,92,246,0.8)_100%)]"
                          />
                          <div className="absolute inset-[2px] bg-layer1 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-[40px] text-ai animate-pulse">
                              view_in_ar
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center z-10">
                        <div className="text-white font-bold text-xl tracking-wide font-display mb-2">
                          Analyzing Geometry
                        </div>
                        <div className="text-xs text-ai uppercase font-mono font-bold tracking-widest">
                          Vision Model Active
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className="flex flex-col items-center gap-6 p-10 bg-layer1/90 backdrop-blur-2xl rounded-[32px] border border-border shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-resolved/10 border border-resolved/30 flex items-center justify-center text-resolved shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <span className="material-symbols-outlined text-[48px]">verified</span>
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="font-display font-bold text-3xl text-white">
                          Analysis Complete
                        </h3>
                        {aiData && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="flex justify-between items-center bg-layer2 border border-border rounded-xl px-4 py-3 min-w-[240px]">
                              <span className="text-xs text-text-tertiary uppercase font-bold tracking-wider">
                                Classification
                              </span>
                              <span className="text-white font-bold capitalize">
                                {aiData.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-layer2 border border-border rounded-xl px-4 py-3">
                              <span className="text-xs text-text-tertiary uppercase font-bold tracking-wider">
                                Confidence
                              </span>
                              <span className="text-resolved font-mono font-bold">
                                {Math.round(aiData.confidence * 100)}%
                              </span>
                            </div>
                            {aiData.hazardous && (
                              <div className="mt-2 text-xs text-rose-500 font-bold uppercase tracking-widest bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                                Critical Hazard Detected
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Form */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row gap-10"
            >
              <div className="flex-1 space-y-10">
                {aiData && (
                  <div className="bg-layer1 p-6 border border-ai/30 rounded-3xl relative overflow-hidden shadow-lg group">
                    <div className="absolute inset-0 bg-gradient-to-br from-ai/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-5 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-ai/20 flex items-center justify-center shrink-0 border border-ai/40 shadow-glow-violet">
                        <span className="material-symbols-outlined text-ai text-[28px]">
                          auto_awesome
                        </span>
                      </div>
                      <div className="pt-1">
                        <h4 className="text-base font-bold text-white mb-2 flex items-center gap-3 font-display tracking-wide">
                          AI Telemetry Data
                          <span
                            className="text-[10px] font-mono font-bold uppercase tracking-widest bg-ai/20 text-ai px-2.5 py-1 rounded-md border border-ai/30"
                            aria-label={`Confidence level: ${Math.round(aiData.confidence * 100)} percent`}
                          >
                            Confidence: {Math.round(aiData.confidence * 100)}%
                          </span>
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          Vision models have automatically extracted metadata and assessed severity.
                          Please verify the generated details below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-3">
                    <label
                      htmlFor="report-title"
                      className="block text-sm font-bold text-text-secondary uppercase tracking-widest ml-1"
                    >
                      Report Title{' '}
                      <span className="text-rose-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="report-title"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!formData.title && isSubmitting ? 'true' : 'false'}
                      className={`w-full bg-layer1 border ${!formData.title && isSubmitting ? 'border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-citizen focus:ring-citizen/50'} rounded-2xl py-4 px-5 text-base focus:outline-none focus:ring-1 transition-all text-white placeholder:text-text-tertiary shadow-sm`}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Deep pothole on main road"
                    />
                    {!formData.title && isSubmitting && (
                      <p className="text-rose-500 text-xs font-bold px-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> Title
                        is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="report-desc"
                      className="block text-sm font-bold text-text-secondary uppercase tracking-widest ml-1"
                    >
                      Technical Description{' '}
                      <span className="text-rose-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <textarea
                      id="report-desc"
                      required
                      aria-required="true"
                      aria-invalid={!formData.desc && isSubmitting ? 'true' : 'false'}
                      className={`w-full bg-layer1 border ${!formData.desc && isSubmitting ? 'border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-citizen focus:ring-citizen/50'} rounded-2xl py-4 px-5 text-base focus:outline-none focus:ring-1 transition-all text-white placeholder:text-text-tertiary shadow-sm min-h-[160px] resize-none`}
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="Provide spatial context and hazard specifics..."
                    />
                    {!formData.desc && isSubmitting && (
                      <p className="text-rose-500 text-xs font-bold px-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>{' '}
                        Description is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="report-location"
                      className="block text-sm font-bold text-text-secondary uppercase tracking-widest ml-1"
                    >
                      Coordinates / Address
                    </label>
                    <div className="relative group">
                      <span
                        className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary text-[24px] group-focus-within:text-citizen transition-colors"
                        aria-hidden="true"
                      >
                        location_on
                      </span>
                      <input
                        id="report-location"
                        type="text"
                        className="w-full bg-layer1 border border-border rounded-2xl py-4 pl-14 pr-32 text-base focus:outline-none focus:border-citizen focus:ring-1 focus:ring-citizen/50 transition-all text-white placeholder:text-text-tertiary shadow-sm"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Detecting location..."
                      />
                      <button
                        type="button"
                        onClick={handleLocateMe}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-layer2 hover:bg-layer3 text-xs font-bold text-white transition-colors border border-border flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-citizen"
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                          my_location
                        </span>
                        Locate
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-5 pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isSubmitting}
                      className="w-1/3 py-4 rounded-2xl font-bold bg-layer1 hover:bg-layer2 text-white transition-colors border border-border disabled:opacity-50 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.title || !formData.desc}
                      className="flex-1 py-4 rounded-2xl font-bold bg-white hover:bg-gray-100 text-bg transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                    >
                      {isSubmitting ? (
                        <span
                          className="w-6 h-6 border-2 border-bg/30 border-t-bg rounded-full animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="material-symbols-outlined" aria-hidden="true">
                          send
                        </span>
                      )}
                      {isSubmitting ? 'Transmitting Data...' : 'Deploy Report'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Metadata */}
              <div className="w-full lg:w-80 shrink-0 space-y-8">
                <div className="rounded-[32px] overflow-hidden border border-border shadow-xl relative group bg-layer1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {image && (
                    <img
                      src={image}
                      alt="Evidence of issue"
                      className="w-full aspect-square lg:aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest mb-1">
                      Attached Media
                    </div>
                    <div
                      className="text-sm font-bold text-white truncate"
                      aria-label={`Media file: ${mediaData?.original_filename || 'evidence.jpg'}`}
                    >
                      {mediaData?.original_filename || 'evidence.jpg'}
                    </div>
                  </div>
                </div>

                <div className="bg-layer1 p-6 rounded-[32px] border border-border space-y-8 shadow-lg">
                  <div className="space-y-3">
                    <label
                      htmlFor="report-category"
                      className="block text-xs text-text-tertiary uppercase tracking-widest font-bold"
                    >
                      Category Assignment
                    </label>
                    <div className="relative">
                      <select
                        id="report-category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-layer2 border border-border rounded-xl py-3 px-4 text-base text-white focus:outline-none focus:border-citizen focus:ring-1 focus:ring-citizen/50 capitalize appearance-none font-medium shadow-inner"
                      >
                        {[
                          'pothole',
                          'water_leak',
                          'streetlight',
                          'garbage',
                          'encroachment',
                          'sewage',
                          'other',
                        ].map((c) => (
                          <option key={c} value={c} className="bg-bg text-white">
                            {c.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <span
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="report-severity"
                        className="block text-xs text-text-tertiary uppercase tracking-widest font-bold"
                      >
                        Severity Rating
                      </label>
                      <div
                        className={`text-lg font-mono font-bold ${formData.severity >= 4 ? 'text-rose-500' : formData.severity >= 3 ? 'text-amber-500' : 'text-resolved'}`}
                        aria-live="polite"
                      >
                        Lvl {formData.severity}
                      </div>
                    </div>

                    <input
                      id="report-severity"
                      type="range"
                      min="1"
                      max="5"
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({ ...formData, severity: parseInt(e.target.value) })
                      }
                      className="w-full accent-citizen h-2 bg-layer2 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-citizen focus:ring-offset-2 focus:ring-offset-bg"
                      aria-valuemin={1}
                      aria-valuemax={5}
                      aria-valuenow={formData.severity}
                      style={{
                        background: `linear-gradient(to right, ${
                          formData.severity >= 4
                            ? '#f43f5e'
                            : formData.severity >= 3
                              ? '#f59e0b'
                              : '#10b981'
                        } ${(formData.severity - 1) * 25}%, #1C2535 ${(formData.severity - 1) * 25}%)`,
                      }}
                    />
                    <div
                      className="flex justify-between text-xs text-text-muted font-bold uppercase tracking-wider"
                      aria-hidden="true"
                    >
                      <span>Low</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center h-full min-h-[600px] text-center"
              role="alert"
              aria-live="assertive"
            >
              <div className="relative mb-12">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.2 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute inset-0 bg-resolved blur-[60px] rounded-full"
                />
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.1 }}
                  className="w-40 h-40 rounded-full bg-layer1 border border-border flex items-center justify-center text-resolved shadow-[0_0_80px_rgba(16,185,129,0.2)] relative z-10"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-resolved/20 to-transparent pointer-events-none" />
                  <span className="material-symbols-outlined text-[80px]" aria-hidden="true">
                    task_alt
                  </span>
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-5xl md:text-6xl font-bold mb-6 text-white tracking-tight"
              >
                Data Deployed
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-text-secondary max-w-lg mx-auto mb-12 text-xl font-light leading-relaxed"
              >
                Your report has been securely transmitted to the civic network.
                <br className="hidden md:block" />
                You earned{' '}
                <span
                  className="text-amber-500 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 mx-2 shadow-sm"
                  aria-label="50 experience points"
                >
                  +50 XP
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-4 text-text-tertiary bg-layer1 px-6 py-3 rounded-2xl border border-border shadow-inner"
              >
                <div
                  className="w-5 h-5 border-2 border-border border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Routing back to command center...
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
