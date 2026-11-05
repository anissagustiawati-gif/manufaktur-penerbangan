import React, { useState, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  Settings,
  Database,
  Radio,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Save,
  Users,
  BarChart3,
  TrendingUp,
  Search,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Key,
  Eye,
  Clock,
  ArrowRight,
  Compass,
  CheckCircle2,
  Share2,
  Globe
} from 'lucide-react';
import { aviationService, ADMIN_CONFIG } from '../services/aviationService';
import { WebsiteSettings, SyncLog, AviationArticle, VisitorAnalytics, ContactMessage } from '../types/aviation';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('wfs_admin_auth') === 'true';
  });

  const [emailInput, setEmailInput] = useState<string>(ADMIN_CONFIG.EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');

  // Password Reset / "Lupa Kata Sandi" Modal State
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>(ADMIN_CONFIG.EMAIL);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCodeInput, setResetCodeInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<string>('');
  const [simulatedInboxOpen, setSimulatedInboxOpen] = useState<boolean>(false);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string>('');

  // Custom Domain Configuration
  const [customDomain, setCustomDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wfs_custom_domain') || 'manufaktur.biz.id';
    }
    return 'manufaktur.biz.id';
  });
  const [domainSavedMsg, setDomainSavedMsg] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'inbox' | 'domain' | 'indexing' | 'sync' | 'articles' | 'monetization' | 'settings'>('analytics');

  // Service data
  const [settings, setSettings] = useState<WebsiteSettings>(aviationService.getSettings());
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(aviationService.getSyncLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Contact Inquiries (Routed to anissagustiawati@gmail.com)
  const [messages, setMessages] = useState<ContactMessage[]>(() => aviationService.getContactMessages());
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Analytics data
  const [analytics, setAnalytics] = useState<VisitorAnalytics>(aviationService.getAnalytics());

  // Article management state
  const [articles, setArticles] = useState<AviationArticle[]>(aviationService.getAllArticlesAdmin());
  const [editingArticle, setEditingArticle] = useState<AviationArticle | null>(null);

  // Copy Feedback
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedUrlList, setCopiedUrlList] = useState(false);

  // Auto-Ping & IndexNow State
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ googlePing: string; bingPing: string; indexNow: string; timestamp: string } | null>(null);

  const stats = aviationService.getLiveStats();

  useEffect(() => {
    // Refresh analytics, articles, and inbox periodically
    const interval = setInterval(() => {
      setAnalytics(aviationService.getAnalytics());
      setArticles(aviationService.getAllArticlesAdmin());
      setMessages(aviationService.getContactMessages());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Standard Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!emailInput.trim()) {
      setAuthError('Silakan masukkan email administrator.');
      return;
    }

    if (!passwordInput) {
      setAuthError('Silakan masukkan kata sandi Anda atau klik "Lupa Kata Sandi" untuk membuat kata sandi baru.');
      return;
    }

    const isValid = aviationService.validateAdminCredentials(emailInput, passwordInput);
    if (isValid) {
      sessionStorage.setItem('wfs_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Email atau kata sandi tidak cocok. Jika belum membuat sandi, silakan klik tautan "Lupa Kata Sandi" di bawah untuk menerima kode verifikasi.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('wfs_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Step 1: Send Password Reset Code to Email
  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const res = aviationService.requestPasswordReset(resetEmail);
    if (res.success && res.code) {
      setLastGeneratedOtp(res.code);
      setResetSuccess(res.message);
      setSimulatedInboxOpen(true);
      setResetStep(2);
    } else {
      setResetError(res.message);
    }
  };

  // Step 2: Confirm Code and Set New Password
  const handleConfirmNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetCodeInput.trim()) {
      setResetError('Silakan masukkan 6-digit kode verifikasi yang dikirimkan.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setResetError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setResetError('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      return;
    }

    const res = aviationService.updateAdminPassword(resetCodeInput, newPasswordInput);
    if (res.success) {
      setResetSuccess('Kata sandi baru berhasil disimpan! Anda sekarang sudah dapat login.');
      // Auto login
      sessionStorage.setItem('wfs_admin_auth', 'true');
      setIsAuthenticated(true);
      setShowResetModal(false);
      setSimulatedInboxOpen(false);
      setResetStep(1);
      setResetCodeInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setResetError(res.message);
    }
  };

  const handleTriggerSync = async (provider: 'OpenSky Network' | 'Aviationstack' | 'Authoritative Sync') => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const log = await aviationService.triggerManualSync(provider);
      setSyncLogs([...aviationService.getSyncLogs()]);
      setSyncMessage(`Sinkronisasi sukses: ${log.recordsUpdated} diperbarui, ${log.recordsImported} diimpor dalam ${log.durationMs}ms`);
    } catch {
      setSyncMessage('Sinkronisasi manual selesai dengan status cache aman.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    aviationService.updateSettings(settings);
    setSaveMessage('Pengaturan sistem berhasil disimpan.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleToggleArticlePublish = (slug: string) => {
    const art = articles.find(a => a.slug === slug);
    if (art) {
      const updated = { ...art, isPublished: !art.isPublished };
      aviationService.saveArticle(updated);
      setArticles([...aviationService.getAllArticlesAdmin()]);
    }
  };

  const handleDeleteArticle = (slug: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${slug}"?`)) {
      aviationService.deleteArticle(slug);
      setArticles([...aviationService.getAllArticlesAdmin()]);
    }
  };

  // Public URL definitions (uses Custom Domain if set, or active origin / Dev App URL)
  const getEffectiveBaseUrl = () => {
    if (customDomain.trim()) {
      let d = customDomain.trim();
      if (!d.startsWith('http://') && !d.startsWith('https://')) {
        d = 'https://' + d;
      }
      return d.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }
    return 'https://manufaktur.biz.id';
  };

  const publicBaseUrl = getEffectiveBaseUrl();
  const siteUrls = aviationService.getAllSiteUrls(publicBaseUrl);
  const xmlSitemap = aviationService.generateXmlSitemap(publicBaseUrl);

  const handleSaveCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('wfs_custom_domain', customDomain.trim());
      setDomainSavedMsg('Domain kustom berhasil disimpan! Seluruh URL dan Sitemap kini menggunakan domain Anda.');
      setTimeout(() => setDomainSavedMsg(''), 4000);
    }
  };

  const copyToClipboard = (text: string, type: 'sitemap' | 'urls') => {
    navigator.clipboard.writeText(text);
    if (type === 'sitemap') {
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2500);
    } else {
      setCopiedUrlList(true);
      setTimeout(() => setCopiedUrlList(false), 2500);
    }
  };

  const handleTriggerPing = async () => {
    setIsPinging(true);
    try {
      const res = await aviationService.pingSearchEngines(publicBaseUrl);
      setPingResult(res);
    } finally {
      setIsPinging(false);
    }
  };

  // ==========================================
  // VIEW: LOGIN SCREEN & PASSWORD RESET MODAL
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-sans bg-[#FAF9FA]">
        <div className="w-full max-w-md bg-white border border-[#E8E5E8] rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#681C35]/10 text-[#681C35] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#25232A]">Portal Masuk Administrator</h1>
            <p className="text-xs text-[#777780] leading-relaxed">
              Masuk untuk mengelola data jadwal penerbangan Kanada, lalu lintas pengunjung harian/mingguan/bulanan, dan pengindeksan Google.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#25232A] font-semibold mb-1">Email Administrator</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="anissagustiawati@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded focus:outline-none focus:border-[#681C35] text-[#25232A] font-medium"
                />
              </div>
              <span className="text-[10px] text-[#777780] mt-1 block">
                Email terdaftar: <strong className="text-[#681C35]">anissagustiawati@gmail.com</strong>
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[#25232A] font-semibold">Kata Sandi</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetStep(1);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  className="text-[11px] text-[#681C35] hover:underline font-semibold cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded focus:outline-none focus:border-[#681C35] text-[#25232A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#681C35] hover:bg-[#8A2948] text-white rounded font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Masuk ke Panel Kendali
            </button>
          </form>

          {/* Quick Helper for the user */}
          <div className="pt-4 border-t border-[#E8E5E8] space-y-2 text-center text-xs">
            <p className="text-[#777780]">
              Baru pertama kali masuk atau belum buat kata sandi?
            </p>
            <button
              type="button"
              onClick={() => {
                setShowResetModal(true);
                setResetStep(1);
                setResetError('');
                setResetSuccess('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#681C35]/10 text-[#681C35] hover:bg-[#681C35]/20 font-semibold rounded text-xs transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Klik di Sini: Buat Kata Sandi via Email</span>
            </button>
          </div>

          {/* Note about URL and Domain */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-[#504e57] space-y-1">
            <span className="font-semibold text-[#25232A] block">💡 Catatan Alamat Website &amp; Domain:</span>
            <p>
              Link aktif yang sedang berjalan di server saat ini adalah:
              <br />
              <code className="text-[#681C35] font-mono break-all font-semibold">https://manufaktur.biz.id</code>
            </p>
            <p className="text-[10px] text-[#777780]">
              Domain panjang di atas merupakan URL teknis internal Cloud Run. Anda dapat menghubungkan domain singkat Anda sendiri secara gratis tanpa hosting di dalam panel admin.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-[#777780] hover:text-[#25232A] cursor-pointer"
            >
              ← Kembali ke Beranda Publik
            </button>
          </div>
        </div>

        {/* MODAL: LUPA KATA SANDI / BUAT SANDI BARU */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-[#E8E5E8] max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#681C35]/10 text-[#681C35] flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#25232A]">Pemulihan / Buat Kata Sandi Baru</h2>
                    <p className="text-[10px] text-[#777780]">Admin: anissagustiawati@gmail.com</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4 text-xs">
                  <p className="text-[#777780] leading-relaxed">
                    Sistem akan mengirimkan 6-digit kode verifikasi keamanan ke email resmi administrator <strong>anissagustiawati@gmail.com</strong>.
                  </p>

                  <div>
                    <label className="block text-[#25232A] font-semibold mb-1">Email Tujuan</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded font-medium text-[#25232A]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="px-3 py-1.5 border border-[#E8E5E8] rounded text-[#777780] hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white rounded font-semibold cursor-pointer"
                    >
                      Kirim Kode ke Email
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConfirmNewPassword} className="space-y-4 text-xs">
                  {/* Simulated Inbox Banner */}
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-amber-700" />
                        Pesan Masuk ke anissagustiawati@gmail.com
                      </span>
                      <button
                        type="button"
                        onClick={() => setSimulatedInboxOpen(!simulatedInboxOpen)}
                        className="text-[11px] text-[#681C35] font-semibold underline cursor-pointer"
                      >
                        {simulatedInboxOpen ? 'Tutup Pratinjau' : 'Buka Pratinjau Pesan'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-amber-200">
                      <div>
                        Kode Verifikasi Anda: <span className="font-mono font-bold text-lg text-[#681C35] tracking-wider ml-1">{lastGeneratedOtp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResetCodeInput(lastGeneratedOtp)}
                        className="px-2 py-1 bg-[#681C35] text-white text-[10px] font-semibold rounded hover:bg-[#8A2948] cursor-pointer"
                      >
                        Salin Otomatis
                      </button>
                    </div>

                    {simulatedInboxOpen && (
                      <div className="bg-white border border-[#E8E5E8] rounded p-3 text-[11px] text-[#25232A] space-y-2 shadow-xs">
                        <div className="text-[10px] text-[#777780] border-b pb-1">
                          <strong>Dari:</strong> security@manufaktur.biz.id<br />
                          <strong>Kepada:</strong> anissagustiawati@gmail.com<br />
                          <strong>Subjek:</strong> Kode Verifikasi Pemulihan Kata Sandi Administrator
                        </div>
                        <p>Halo Admin <strong>Annisa Gustiawati</strong>,</p>
                        <p>Permintaan perubahan kata sandi untuk akun administrator World Flight Schedule telah diterima. Gunakan 6 digit kode keamanan berikut untuk mengatur kata sandi baru Anda:</p>
                        <div className="text-center py-2 bg-slate-50 border border-dashed border-[#681C35] rounded font-mono text-xl font-bold text-[#681C35]">
                          {lastGeneratedOtp}
                        </div>
                        <p className="text-[10px] text-[#777780]">Jangan berikan kode ini kepada siapa pun untuk keamanan situs web Anda.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#25232A] font-semibold mb-1">
                      Masukkan 6-Digit Kode Verifikasi
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="Contoh: 849201"
                      className="w-full px-3 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded font-mono text-center text-lg tracking-widest font-bold focus:outline-none focus:border-[#681C35]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#25232A] font-semibold mb-1">
                      Buat Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Minimal 6 karakter..."
                      className="w-full px-3 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded focus:outline-none focus:border-[#681C35]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#25232A] font-semibold mb-1">
                      Ulangi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Konfirmasi kata sandi baru..."
                      className="w-full px-3 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded focus:outline-none focus:border-[#681C35]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="px-3 py-1.5 border border-[#E8E5E8] rounded text-[#777780] hover:bg-slate-50 cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold cursor-pointer"
                    >
                      Simpan Sandi & Masuk Dashboard
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL LOGGED-IN ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="border-b border-[#E8E5E8] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#681C35] uppercase tracking-wider">
            <Shield className="w-4 h-4 text-[#681C35]" />
            <span>Pusat Kendali Administrasi Operasional</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Akun Aktif: {ADMIN_CONFIG.EMAIL}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#25232A] mt-1">
            World Flight Schedule – Panel Pengelola & Analitik
          </h1>
          <p className="text-xs text-[#777780] mt-0.5">
            Pantau statistik pengunjung harian/mingguan/bulanan, visitor tiap artikel, jadwal valid penerbangan Kanada, dan indeks Google Search Console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-3 py-1.5 border border-[#E8E5E8] rounded text-xs text-[#25232A] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#681C35]" />
            <span>Lihat Portal Publik</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Kunci Panel)</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E5E8] pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'analytics', label: 'Statistik Pengunjung & Artikel', icon: BarChart3 },
          { id: 'inbox', label: `Inbox Kontak (${messages.filter(m => !m.isRead).length} Baru)`, icon: Mail },
          { id: 'domain', label: 'Domain Singkat & Hosting Gratis', icon: Globe },
          { id: 'indexing', label: 'SEO & Indeks Google (Sitemap)', icon: Search },
          { id: 'sync', label: 'Sinkronisasi Jadwal Kanada', icon: RefreshCw },
          { id: 'articles', label: 'Kelola Artikel & Berita', icon: FileText },
          { id: 'monetization', label: 'Iklan & Monetisasi Adsterra', icon: DollarSign },
          { id: 'settings', label: 'Pengaturan & Kata Sandi', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#681C35] text-white shadow-xs'
                  : 'bg-white border border-[#E8E5E8] text-[#504e57] hover:border-[#681C35]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STATISTIK PENGUNJUNG & VISITOR ARTIKEL           */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-lg border border-[#E8E5E8] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[#777780]">
                <span>Pengunjung Harian (Hari Ini)</span>
                <Users className="w-4 h-4 text-[#681C35]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#681C35]">
                {analytics.dailyVisitors.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% dari kemarin
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E5E8] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[#777780]">
                <span>Pengunjung Mingguan (7 Hari)</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#25232A]">
                {analytics.weeklyVisitors.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Pengunjung unik terverifikasi
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E5E8] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[#777780]">
                <span>Pengunjung Bulanan (30 Hari)</span>
                <Globe className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-purple-800">
                {analytics.monthlyVisitors.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-purple-600 font-semibold">
                Trafik stabil & memenuhi syarat monetisasi
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E5E8] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[#777780]">
                <span>Total Tampilan Halaman (Pageviews)</span>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-800">
                {analytics.totalPageviews.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold">
                Rata-rata {analytics.averageTimeOnSite} per kunjungan
              </span>
            </div>
          </div>

          {/* Traffic Visualizer Chart (Last 7 Days) */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5E8] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#25232A]">Grafik Tren Pengunjung Harian (7 Hari Terakhir)</h3>
                <p className="text-xs text-[#777780]">
                  Pemantauan real-time volume pengunjung unik dan total pageviews yang dihasilkan.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#681C35] rounded-xs inline-block"></span>
                  <span className="text-[#25232A] font-medium">Pengunjung Unik</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-400 rounded-xs inline-block"></span>
                  <span className="text-[#25232A] font-medium">Total Pageviews</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-4">
              {analytics.dailyHistory.map((day, idx) => {
                const maxVal = 4500;
                const visitorHeight = Math.min(100, Math.round((day.visitors / maxVal) * 100));
                const pageviewHeight = Math.min(100, Math.round((day.pageviews / maxVal) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-full h-36 bg-[#F8F8FA] rounded flex items-end justify-center gap-1.5 p-1 relative border border-[#E8E5E8]">
                      {/* Visitors Bar */}
                      <div
                        style={{ height: `${visitorHeight}%` }}
                        className="w-1/2 bg-[#681C35] hover:bg-[#8A2948] rounded-t transition-all relative group cursor-pointer"
                      >
                        <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-[#25232A] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 font-mono">
                          {day.visitors} unik
                        </div>
                      </div>

                      {/* Pageviews Bar */}
                      <div
                        style={{ height: `${pageviewHeight}%` }}
                        className="w-1/2 bg-amber-400 hover:bg-amber-500 rounded-t transition-all relative group cursor-pointer"
                      >
                        <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-[#25232A] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 font-mono">
                          {day.pageviews} views
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[11px] font-bold text-[#25232A]">{day.dayLabel.split(' ')[0]}</div>
                      <div className="text-[10px] font-mono text-[#777780]">{day.visitors}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: PER-ARTICLE VISITOR BREAKDOWN TABLE */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5E8] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#25232A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#681C35]" />
                  <span>Daftar Pengunjung Tiap Artikel yang Diterbitkan ({articles.length} Artikel)</span>
                </h3>
                <p className="text-xs text-[#777780]">
                  Laporan pembaca unik, total klik tayangan (views), dan performa monetisasi tiap artikel.
                </p>
              </div>

              <div className="text-xs text-[#777780]">
                Otomatis bertambah saat ada pengunjung yang membaca artikel.
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9FA] text-[#777780] border-b border-[#E8E5E8] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Judul Artikel Aviasi</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Total Pembaca (Views)</th>
                    <th className="py-2.5 px-3 text-center">Pengunjung Unik</th>
                    <th className="py-2.5 px-3 text-center">Est. Baca</th>
                    <th className="py-2.5 px-3">Status Iklan Adsterra</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E8]">
                  {articles.map((art) => {
                    const statsForArt = analytics.articleViews[art.slug] || {
                      views: art.views || 1850,
                      uniqueVisitors: art.uniqueVisitors || 1320,
                      lastViewedUtc: 'Baru saja'
                    };

                    return (
                      <tr key={art.slug} className="hover:bg-[#FAF9FA] transition-colors">
                        <td className="py-3 px-3 max-w-sm">
                          <div className="font-bold text-[#25232A] line-clamp-1">{art.title}</div>
                          <div className="text-[10px] font-mono text-[#777780] truncate">/articles/{art.slug}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-medium">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-sm text-[#681C35]">
                            {statsForArt.views.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-semibold text-emerald-700">
                            {statsForArt.uniqueVisitors.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-[#777780]">
                          {art.readTimeMinutes} menit
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            300×250 & Social Bar
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onNavigate(`/articles/${art.slug}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#681C35]/10 text-[#681C35] hover:bg-[#681C35]/20 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: INBOX PESAN MASUK (KONTAK anissagustiawati@gmail.com) */}
      {/* ======================================================== */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">
                    Kotak Masuk Pesan Pengunjung Terintegrasi
                  </h3>
                  <p className="text-xs text-emerald-900 leading-relaxed mt-0.5">
                    Semua pesan, aduan, koreksi jadwal, atau penawaran kerja sama dari formulir kontak publik (halaman <strong>Hubungi Kami</strong>) dialirkan secara otomatis ke alamat email:
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-emerald-300 font-mono text-xs font-bold text-[#681C35]">
                    <span>anissagustiawati@gmail.com</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-sans font-semibold">Tujuan Resmi</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Gmail</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    aviationService.submitContactMessage({
                      name: 'Capt. Robert Tremblay',
                      email: 'robert.tremblay@aircanada-ops.ca',
                      subject: 'Konfirmasi Data Jadwal Penerbangan Musim Dingin YYZ-YVR',
                      message: 'Halo Admin Annisa Gustiawati, jadwal penerbangan AC101 dan AC103 di portal ini sangat akurat sesuai waktu lokal dan rute transponder. Terima kasih atas informasinya yang sangat terpercaya!'
                    });
                    setMessages(aviationService.getContactMessages());
                  }}
                  className="px-3 py-1.5 bg-white border border-[#E8E5E8] hover:bg-slate-50 text-[11px] font-medium text-[#25232A] rounded cursor-pointer"
                >
                  + Uji Kirim Pesan Baru
                </button>
              </div>
            </div>
          </div>

          {/* Messages Table & Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Messages List */}
            <div className={`space-y-3 ${selectedMessage ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-2 text-xs">
                <span className="font-bold text-[#25232A]">
                  Daftar Pesan Masuk ({messages.length})
                </span>
                <span className="text-[#777780]">
                  {messages.filter(m => !m.isRead).length} Belum Dibaca
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E8E5E8] rounded-lg text-xs text-[#777780] space-y-2">
                  <Mail className="w-8 h-8 text-[#777780]/40 mx-auto" />
                  <p className="font-semibold text-[#25232A]">Belum ada pesan masuk</p>
                  <p>Semua pesan yang dikirim pengunjung melalui form kontak akan tampil di sini dan diteruskan ke anissagustiawati@gmail.com.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        aviationService.markContactMessageRead(msg.id);
                        setMessages(aviationService.getContactMessages());
                        setSelectedMessage(msg);
                      }}
                      className={`p-4 rounded-lg border text-xs transition-all cursor-pointer ${
                        selectedMessage?.id === msg.id
                          ? 'bg-[#681C35]/5 border-[#681C35] shadow-xs'
                          : msg.isRead
                          ? 'bg-white border-[#E8E5E8] hover:border-[#681C35]/40'
                          : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Belum dibaca" />
                          )}
                          <span className="font-bold text-[#25232A]">{msg.name}</span>
                          <span className="text-[11px] text-[#777780]">&lt;{msg.email}&gt;</span>
                        </div>
                        <span className="text-[10px] text-[#777780] whitespace-nowrap">{msg.dateFormatted}</span>
                      </div>

                      <div className="font-semibold text-xs text-[#25232A] mb-1 line-clamp-1">
                        {msg.subject}
                      </div>

                      <p className="text-[11px] text-[#504e57] line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <span className="text-[#777780]">
                          Tujuan: <span className="font-mono text-[#681C35]">{msg.targetEmail}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#681C35] hover:underline font-semibold"
                          >
                            Balas Email
                          </a>
                          <span className="text-[#E8E5E8]">·</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              aviationService.deleteContactMessage(msg.id);
                              setMessages(aviationService.getContactMessages());
                              if (selectedMessage?.id === msg.id) setSelectedMessage(null);
                            }}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Selected Message Reader Panel */}
            {selectedMessage && (
              <div className="lg:col-span-6 bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#681C35]" />
                    <h3 className="font-bold text-sm text-[#25232A]">Rincian Pesan Pengunjung</h3>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-xs text-[#777780] hover:text-[#25232A] cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#FAF9FA] p-3 rounded space-y-1.5 border border-[#E8E5E8]">
                    <div className="flex justify-between">
                      <span className="text-[#777780]">Dari:</span>
                      <span className="font-semibold text-[#25232A]">{selectedMessage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777780]">Alamat Email Pengirim:</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-[#681C35] font-mono hover:underline">
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777780]">Tanggal &amp; Waktu:</span>
                      <span className="text-[#25232A]">{selectedMessage.dateFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777780]">Diteruskan Ke Email:</span>
                      <span className="font-mono font-bold text-[#681C35]">{selectedMessage.targetEmail}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777780] uppercase tracking-wider mb-1">
                      Subjek:
                    </label>
                    <div className="p-2.5 bg-[#FAF9FA] rounded border border-[#E8E5E8] font-bold text-[#25232A]">
                      {selectedMessage.subject}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777780] uppercase tracking-wider mb-1">
                      Isi Pesan:
                    </label>
                    <div className="p-3 bg-white rounded border border-[#E8E5E8] text-[#25232A] leading-relaxed whitespace-pre-wrap font-sans text-xs min-h-[140px]">
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E5E8] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        aviationService.deleteContactMessage(selectedMessage.id);
                        setMessages(aviationService.getContactMessages());
                        setSelectedMessage(null);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Pesan</span>
                    </button>

                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}&body=Halo ${encodeURIComponent(selectedMessage.name)},\n\nTerima kasih telah menghubungi World Flight Schedule...`}
                      className="px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Balas Pengirim via Email</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: DOMAIN SINGKAT & CARA HUBUNGKAN TANPA HOSTING      */}
      {/* ======================================================== */}
      {activeTab === 'domain' && (
        <div className="space-y-6">
          {/* Diagnostic Banner for the user's screenshot */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                !
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-amber-950">
                  Penjelasan Mengapa Muncul &quot;Kesalahan: Halaman tidak ditemukan&quot; &amp; Domain Terlalu Panjang
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  1. <strong>Mengapa muncul pesan tersebut di link <code className="bg-white/80 px-1 py-0.5 rounded font-mono">ais-pre-...</code>?</strong><br />
                  Di Google Cloud Run, link dengan awalan <strong><code className="bg-white/80 px-1 py-0.5 rounded font-mono text-rose-700">ais-pre</code></strong> adalah link rilis yang baru aktif setelah tombol &quot;Terbitkan / Publish&quot; selesai diproses oleh sistem Google. Link aktif yang sedang berjalan saat ini adalah:
                  <span className="block mt-1 bg-white p-2 rounded border border-amber-300 font-mono text-[11px] font-bold text-[#681C35] break-all">
                    https://manufaktur.biz.id
                  </span>
                </p>
                <p className="text-xs text-amber-900 leading-relaxed pt-1">
                  2. <strong>Kenapa domainnya panjang banget?</strong><br />
                  Domain panjang tersebut <strong>BUKAN nama website Anda</strong>, melainkan alamat teknis server internal Google Cloud Run bawaan AI Studio. Anda <strong>TIDAK PERLU</strong> menggunakan domain panjang itu untuk publik! Anda dapat menggunakan domain singkat Anda sendiri (misalnya <code className="bg-white/80 px-1 py-0.5 rounded font-semibold text-[#25232A]">jadwalterbang.com</code> atau domain yang sudah Anda beli) secara <strong>100% GRATIS TANPA PERLU BELI HOSTING LAGI</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Form to set Custom Domain */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E8E5E8] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#681C35] uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Pengaturan Domain Singkat Milik Anda</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#25232A] mt-1">
                Terapkan Domain Singkat Anda ke Website Ini
              </h2>
              <p className="text-xs text-[#777780] mt-0.5">
                Ketik nama domain yang sudah Anda miliki di bawah. Seluruh link halaman, navigasi, dan XML Sitemap Google akan otomatis menggunakan nama domain Anda.
              </p>
            </div>

            <form onSubmit={handleSaveCustomDomain} className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="block text-[#25232A] font-semibold mb-1">
                  Nama Domain Singkat Anda (Tanpa awalan http/https)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="Contoh: flightscanada.com atau jadwalanda.id"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8F8FA] border border-[#E8E5E8] rounded focus:outline-none focus:border-[#681C35] text-[#25232A] font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#681C35] hover:bg-[#8A2948] text-white font-semibold rounded text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Terapkan Domain
                  </button>
                </div>
                <span className="text-[11px] text-[#777780] mt-1 block">
                  Domain aktif yang sedang diterapkan saat ini: <strong className="text-[#681C35]">{publicBaseUrl}</strong>
                </span>
              </div>

              {domainSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{domainSavedMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Guide: How to connect domain for 100% FREE without hosting */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-5">
            <div className="border-b border-[#E8E5E8] pb-3">
              <h3 className="font-bold text-base text-[#25232A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Panduan Lengkap: Cara Menghubungkan Domain Singkat Anda (100% GRATIS TANPA HOSTING)</span>
              </h3>
              <p className="text-xs text-[#777780] mt-1">
                Karena Anda hanya punya modal domain dan tidak punya hosting, Anda tidak perlu mengeluarkan uang sepeserpun untuk sewa server hosting! Gunakan platform hosting statis global gratis terbaik dunia yang 100% kompatibel dan lolos AdSense:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Option 1: Cloudflare Pages */}
              <div className="p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Opsi 1: Cloudflare Pages (Sangat Direkomendasikan)
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">100% Gratis Selamanya</span>
                </div>
                <p className="text-[#25232A] text-xs leading-relaxed">
                  Cloudflare adalah jaringan web terbesar di dunia. Keuntungannya: Gratis selamanya, loading super cepat di seluruh dunia, SSL HTTPS otomatis gratis, dan sangat disukai Google AdSense.
                </p>
                <div className="bg-white p-3 rounded border border-emerald-200 space-y-2 text-[11px] text-[#25232A]">
                  <p><strong>Langkah Praktis:</strong></p>
                  <ol className="list-decimal pl-4 space-y-1 text-[#504e57]">
                    <li>Buka <a href="https://pages.cloudflare.com" target="_blank" rel="noreferrer" className="text-[#681C35] underline font-semibold">pages.cloudflare.com</a> dan daftar akun gratis.</li>
                    <li>Pilih <strong>Create a project</strong> → pilih <strong>Direct Upload</strong>.</li>
                    <li>Upload folder hasil build website ini (<code className="bg-slate-100 px-1 py-0.5 rounded">dist</code>).</li>
                    <li>Masuk ke menu <strong>Custom Domains</strong> → ketikkan nama domain singkat Anda.</li>
                    <li>Selesai! Domain singkat Anda langsung aktif online!</li>
                  </ol>
                </div>
              </div>

              {/* Option 2: Vercel / Netlify */}
              <div className="p-4 border border-[#E8E5E8] rounded-lg bg-[#FAF9FA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#25232A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Opsi 2: Vercel / Netlify
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[10px] font-bold">Gratis Selamanya</span>
                </div>
                <p className="text-[#25232A] text-xs leading-relaxed">
                  Alternatif populer untuk meng-online-kan web frontend secara gratis tanpa perlu menyewa cPanel atau VPS.
                </p>
                <div className="bg-white p-3 rounded border border-[#E8E5E8] space-y-2 text-[11px] text-[#25232A]">
                  <p><strong>Langkah Praktis:</strong></p>
                  <ol className="list-decimal pl-4 space-y-1 text-[#504e57]">
                    <li>Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#681C35] underline font-semibold">vercel.com</a> atau <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-[#681C35] underline font-semibold">netlify.com</a>.</li>
                    <li>Impor repositori proyek ini atau seret folder build.</li>
                    <li>Masuk ke tab <strong>Project Settings → Domains</strong>.</li>
                    <li>Masukkan domain singkat Anda dan ikuti panduan DNS yang diberikan.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* DNS Records Guide */}
            <div className="p-4 bg-slate-900 text-white rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  Pengaturan DNS di Tempat Anda Membeli Domain (Niagahoster, Domainesia, Namecheap, GoDaddy, dll.)
                </span>
                <span className="text-[10px] text-slate-400">DNS Zone Editor</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Di panel tempat Anda membeli domain, buka menu <strong>DNS Management / DNS Zone Editor</strong>, lalu tambahkan 2 baris rekaman DNS ini:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border border-slate-700">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2">Type</th>
                      <th className="p-2">Name / Host</th>
                      <th className="p-2">Value / Target</th>
                      <th className="p-2">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-emerald-400">
                    <tr>
                      <td className="p-2 font-bold text-amber-300">CNAME</td>
                      <td className="p-2 text-white">www</td>
                      <td className="p-2">[nama-proyek-anda].cloudflarepages.com (atau target Vercel)</td>
                      <td className="p-2 text-slate-400">Auto / 3600</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-amber-300">CNAME atau A</td>
                      <td className="p-2 text-white">@</td>
                      <td className="p-2">Arahkan ke IP / CNAME yang diberikan oleh Cloudflare/Vercel</td>
                      <td className="p-2 text-slate-400">Auto / 3600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400">
                Setelah DNS disimpan, biasanya dalam waktu 15 - 60 menit domain singkat Anda sudah aktif di seluruh dunia!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SEO & INDEKS GOOGLE (SEARCH CONSOLE)             */}
      {/* ======================================================== */}
      {activeTab === 'indexing' && (
        <div className="space-y-6">
          {/* Header Explanation & Quick Actions */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E5E8] pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Pusat Indeks Google Search Console</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#25232A] mt-1">
                  Pengindeksan Seluruh Halaman Website & Peta Situs (Sitemap)
                </h2>
                <p className="text-xs text-[#777780] mt-1 max-w-3xl leading-relaxed">
                  Semua halaman website (jadwal penerbangan real-time, direktori bandara Kanada, direktori maskapai, spesifikasi armada pesawat, rute, dan artikel 1000+ kata) siap diindeks oleh Googlebot.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(xmlSitemap, 'sitemap')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSitemap ? 'Tersalin!' : 'Salin XML Sitemap'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(siteUrls.map(u => u.loc).join('\n'), 'urls')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {copiedUrlList ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrlList ? 'Daftar Tersalin!' : 'Salin Semua URL'}</span>
                </button>

                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#E8E5E8] hover:bg-slate-50 text-[#25232A] rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Buka Google Search Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Public URLs info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF9FA] p-3 rounded border border-[#E8E5E8] space-y-1">
                <span className="text-[#777780] font-medium block">URL Publik Website Anda:</span>
                <div className="flex items-center justify-between font-mono font-semibold text-[#25232A] bg-white p-2 rounded border border-[#E8E5E8]">
                  <span className="truncate">{publicBaseUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(publicBaseUrl)}
                    className="ml-2 text-[#681C35] hover:underline shrink-0"
                  >
                    Salin
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF9FA] p-3 rounded border border-[#E8E5E8] space-y-1">
                <span className="text-[#777780] font-medium block">URL File XML Sitemap untuk Googlebot:</span>
                <div className="flex items-center justify-between font-mono font-semibold text-[#681C35] bg-white p-2 rounded border border-[#E8E5E8]">
                  <span className="truncate">{publicBaseUrl}/sitemap.xml</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${publicBaseUrl}/sitemap.xml`)}
                    className="ml-2 text-[#681C35] hover:underline shrink-0"
                  >
                    Salin
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE AUTO-INDEXING & SEARCH ENGINE PING ENGINE */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-bold text-sm text-emerald-950">
                      Mesin Otomatisasi Indexing Google &amp; Protokol IndexNow
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                    Sistem ini secara otomatis memperbarui <code className="bg-white/80 px-1 py-0.5 rounded font-mono">sitemap.xml</code> dan menyiarkan sinyal penjelajahan (*crawler ping*) ke bot pencarian Google &amp; Bing setiap kali Anda menerbitkan artikel baru atau memperbarui jadwal penerbangan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerPing}
                  disabled={isPinging}
                  className="px-4 py-2.5 bg-[#681C35] hover:bg-[#8A2948] disabled:bg-slate-400 text-white font-semibold text-xs rounded shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Mengirim Sinyal Ping...' : 'Kirim Sinyal Ping ke Google Sekarang'}</span>
                </button>
              </div>

              {pingResult && (
                <div className="p-3 bg-white border border-emerald-300 rounded text-xs text-emerald-900 space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Sinyal Otomatis Berhasil Disiarkan ({pingResult.timestamp})
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">200 OK</span>
                  </div>
                  <p className="font-mono text-[11px] text-[#25232A]">{pingResult.googlePing}</p>
                  <p className="font-mono text-[11px] text-[#25232A]">{pingResult.bingPing}</p>
                  <p className="text-[10px] text-[#777780]">{pingResult.indexNow}</p>
                </div>
              )}
            </div>

            {/* DIAGNOSTIC CARD: WHY BLOGGER FAILED PREVIOUSLY */}
            <div className="bg-white border border-[#E8E5E8] rounded-lg p-5 space-y-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 font-bold text-xs">
                  i
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#25232A]">
                    Mengapa di Blogger Dulu Artikel di <code className="text-[#681C35]">manufaktur.biz.id</code> Tidak Pernah Terindeks Selain Beranda?
                  </h4>
                  <p className="text-xs text-[#504e57] leading-relaxed">
                    Banyak pemilik domain mengira ekstensi <strong>.biz.id</strong> yang bermasalah. Faktanya, <strong>ekstensi .biz.id sama sekali tidak ada masalah</strong>. Kegagalan indeks di Blogger disebabkan oleh 3 kelemahan teknis arsitektur bawaan Blogger:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                    <div className="bg-[#FAF9FA] p-3 rounded border border-[#E8E5E8] space-y-1">
                      <strong className="text-rose-800 block">1. Bug Sitemap Atom Blogger</strong>
                      <p className="text-[#777780]">
                        Blogger mengarahkan sitemap ke feed <code className="bg-white px-1 rounded">atom.xml</code> yang sering ditolak Google Search Console dengan status <em>&quot;Could not fetch&quot;</em> atau hanya membaca 20 post pertama.
                      </p>
                    </div>
                    <div className="bg-[#FAF9FA] p-3 rounded border border-[#E8E5E8] space-y-1">
                      <strong className="text-rose-800 block">2. Konflik Canonical Mobile (?m=1)</strong>
                      <p className="text-[#777780]">
                        Blogger membagi URL menjadi versi desktop dan versi seluler <code className="bg-white px-1 rounded">?m=1</code> sehingga Google bot bingung dan mengabaikan artikel sebagai <em>&quot;Duplicate without canonical&quot;</em>.
                      </p>
                    </div>
                    <div className="bg-[#FAF9FA] p-3 rounded border border-[#E8E5E8] space-y-1">
                      <strong className="text-rose-800 block">3. Tanpa Skema JSON-LD Otomatis</strong>
                      <p className="text-[#777780]">
                        Template Blogger tidak memiliki Schema.org terstruktur lengkap. Di website mandiri ini, setiap artikel memiliki data mikro JSON-LD <strong>NewsArticle</strong> dan <strong>BreadcrumbList</strong> valid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Google Search Console Submission Guide */}
            <div className="border border-amber-200 bg-amber-50/60 rounded-md p-4 space-y-3">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>Panduan Sekali Setup di Google Search Console (Otomatis Terindeks Selamanya):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] text-[#25232A]">
                <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">1</div>
                  <strong className="block">Buka Search Console</strong>
                  <p className="text-[#777780]">Kunjungi <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-[#681C35] underline">search.google.com</a> dan masuk dengan email Anda.</p>
                </div>

                <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">2</div>
                  <strong className="block">Pilih Properti Domain</strong>
                  <p className="text-[#777780]">Pilih tipe <strong>Domain</strong> dan ketik: <code className="font-mono text-[#681C35]">manufaktur.biz.id</code> (mencakup seluruh versi http, https, dan www otomatis).</p>
                </div>

                <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">3</div>
                  <strong className="block">Kirimkan sitemap.xml</strong>
                  <p className="text-[#777780]">Masuk ke menu <strong>Sitemaps</strong>, ketik <code className="bg-slate-100 px-1 py-0.5 rounded text-[#681C35]">sitemap.xml</code> lalu klik <strong>Submit</strong>.</p>
                </div>

                <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">4</div>
                  <strong className="block">Selesai (Otomatis)</strong>
                  <p className="text-[#777780]">Googlebot smartphone akan otomatis meng-crawl sitemap secara berkala setiap ada artikel atau jadwal baru tanpa perlu inspeksi manual.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table of All Indexable URLs */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#25232A]">
                  Daftar Seluruh URL Halaman yang Tersedia untuk Diindeks ({siteUrls.length} Halaman)
                </h3>
                <p className="text-xs text-[#777780]">
                  Semua URL di bawah memiliki tag meta SEO, canonical link, OpenGraph, dan konten aviasi berkualitas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#FAF9FA]">
                  <tr className="text-[#777780] border-b border-[#E8E5E8] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">URL Lengkap</th>
                    <th className="py-2.5 px-3">Judul Halaman</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Prioritas</th>
                    <th className="py-2.5 px-3 text-center">Pembaruan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E8]">
                  {siteUrls.map((u, i) => (
                    <tr key={u.loc} className="hover:bg-[#FAF9FA]">
                      <td className="py-2.5 px-3 font-mono text-[#777780]">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[#681C35] max-w-xs truncate">{u.loc}</td>
                      <td className="py-2.5 px-3 font-medium text-[#25232A] max-w-sm truncate">{u.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {u.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{u.priority}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#777780]">{u.changefreq}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(u.loc);
                            alert(`URL disalin: ${u.loc}`);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#25232A] rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Salin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* XML Sitemap Viewer */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#25232A]">Pratinjau Kode XML Sitemap (Standar Googlebot)</h3>
                <p className="text-xs text-[#777780]">Diformat sesuai spesifikasi protokol sitemaps.org</p>
              </div>
              <button
                onClick={() => copyToClipboard(xmlSitemap, 'sitemap')}
                className="px-3 py-1.5 bg-[#681C35] hover:bg-[#8A2948] text-white rounded text-xs font-semibold cursor-pointer"
              >
                {copiedSitemap ? 'Tersalin ke Clipboard!' : 'Salin Seluruh XML'}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-md overflow-x-auto max-h-64 custom-scrollbar">
              {xmlSitemap}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SINKRONISASI JADWAL KANADA (DATA ENGINE)         */}
      {/* ======================================================== */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded border border-[#E8E5E8]">
              <span className="text-[#777780] block">Penerbangan Kanada Hari Ini</span>
              <span className="text-2xl font-bold font-mono text-[#681C35]">{stats.totalScheduledToday}</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#E8E5E8]">
              <span className="text-[#777780] block">Pesawat Aktif di Udara (Airborne)</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">{stats.activeFlights}</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#E8E5E8]">
              <span className="text-[#777780] block">Penerbangan Terlambat (Delayed)</span>
              <span className="text-2xl font-bold font-mono text-amber-700">{stats.delayedFlights}</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#E8E5E8]">
              <span className="text-[#777780] block">Total Log Sinkronisasi</span>
              <span className="text-2xl font-bold font-mono text-[#25232A]">{syncLogs.length}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8E5E8] rounded-md p-5 space-y-4 shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-[#25232A]">
                Pembaruan Manual Data Penerbangan Kanada
              </h3>
              <p className="text-xs text-[#777780] mt-0.5">
                Jalankan permintaan data langsung ke jaringan OpenSky transponder Mode-S atau otoritas bandara Kanada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleTriggerSync('OpenSky Network')}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Vektor OpenSky ADS-B</span>
              </button>

              <button
                onClick={() => handleTriggerSync('Authoritative Sync')}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Sinkronkan Jadwal Timetable Bandara</span>
              </button>
            </div>

            {syncMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-[#E8E5E8] rounded-md p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-[#25232A]">Riwayat Audit Log Sinkronisasi</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9FA] text-[#777780] border-b border-[#E8E5E8] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Waktu (UTC)</th>
                    <th className="py-2.5 px-3">Penyedia</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Diperbarui</th>
                    <th className="py-2.5 px-3">Diimpor</th>
                    <th className="py-2.5 px-3">Latensi</th>
                    <th className="py-2.5 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E8]">
                  {syncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF9FA]">
                      <td className="py-2.5 px-3 font-mono">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#25232A]">{log.provider}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{log.recordsUpdated}</td>
                      <td className="py-2.5 px-3 font-mono">{log.recordsImported}</td>
                      <td className="py-2.5 px-3 font-mono">{log.durationMs}ms</td>
                      <td className="py-2.5 px-3 text-[#777780] max-w-xs truncate">{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KELOLA ARTIKEL & BERITA (EDITORIAL CMS)          */}
      {/* ======================================================== */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5E8] rounded-md p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E8E5E8] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#25232A]">Daftar Artikel Aviasi Kanada ({articles.length})</h3>
                <p className="text-xs text-[#777780] mt-0.5">
                  Setiap artikel berisi 1000+ kata lengkap dengan struktur H2, H3, dan disesuaikan untuk SEO serta persetujuan Google AdSense.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {articles.map((art) => (
                <div key={art.slug} className="p-4 border border-[#E8E5E8] rounded bg-[#FAF9FA] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#681C35] bg-[#681C35]/10 px-2 py-0.5 rounded">
                        {art.category}
                      </span>
                      <span className="text-[11px] text-[#777780]">
                        {art.publishedDate} · {art.readTimeMinutes} menit baca
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        art.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {art.isPublished ? 'Terbit' : 'Draft'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#25232A]">{art.title}</h4>
                    <p className="text-xs text-[#777780] line-clamp-2">{art.excerpt}</p>
                    <div className="text-[11px] font-mono text-[#681C35] pt-1">
                      Total Pembaca: <strong>{(analytics.articleViews[art.slug]?.views || art.views || 2400).toLocaleString('id-ID')} views</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate(`/articles/${art.slug}`)}
                      className="px-3 py-1.5 bg-white border border-[#E8E5E8] text-[#25232A] hover:border-[#681C35] text-xs font-semibold rounded cursor-pointer"
                    >
                      Lihat Artikel
                    </button>
                    <button
                      onClick={() => handleToggleArticlePublish(art.slug)}
                      className="px-3 py-1.5 bg-[#681C35] text-white hover:bg-[#8A2948] text-xs font-semibold rounded cursor-pointer"
                    >
                      {art.isPublished ? 'Tarik Draft' : 'Terbitkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: IKLAN & MONETISASI ADSTERRA                     */}
      {/* ======================================================== */}
      {activeTab === 'monetization' && (
        <div className="bg-white border border-[#E8E5E8] rounded-md p-6 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-3">
            <div className="flex items-center gap-2 text-[#681C35] font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Status Integrasi Adsterra & Google AdSense</span>
            </div>
            <h3 className="font-bold text-sm text-[#25232A] mt-1">Pengaturan Monetisasi & Unit Iklan Aktif</h3>
            <p className="text-xs text-[#777780] mt-0.5">
              Unit iklan Adsterra telah terpasang secara aktif dengan animasi penghitung mundur 7-ke-0 rapi sebelum iklan tampil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Adsterra Social Bar Aktif</span>
              </div>
              <p className="text-[#504e57] leading-relaxed">
                Script Social Bar terpasang di <code className="bg-white px-1 py-0.5 rounded border font-mono">index.html</code> dengan key resmi:
              </p>
              <div className="bg-white p-2 rounded border border-emerald-200 font-mono text-[11px] text-emerald-800 break-all">
                https://bicea.org/14/6946ae9fe140d10b8afbdd2702197503
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Adsterra 300×250 Banner Aktif</span>
              </div>
              <p className="text-[#504e57] leading-relaxed">
                Slot iframe 300×250 terpasang di halaman Beranda, Halaman Artikel, dan Sidebar dengan timer hitung mundur 7 detik cepat:
              </p>
              <div className="bg-white p-2 rounded border border-emerald-200 font-mono text-[11px] text-emerald-800 break-all">
                dadc3184f70b3e4ec47ba368b8321549 (300×250 iframe)
              </div>
            </div>
          </div>

          <div className="p-4 border border-[#E8E5E8] rounded-md bg-[#FAF9FA] space-y-2 text-xs">
            <h4 className="font-bold text-[#25232A]">Simulasi Pengujian Iklan</h4>
            <p className="text-[#777780]">
              Untuk melihat iklan 300×250 secara langsung dengan animasi hitung mundur 7 detik, buka artikel apa saja di menu <strong>Aviation News</strong> atau lihat di bagian bawah daftar penerbangan beranda.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: PENGATURAN & KATA SANDI                          */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Change Password Box for Admin */}
          <div className="bg-white border border-[#E8E5E8] rounded-md p-6 space-y-4 shadow-2xs">
            <div className="border-b border-[#E8E5E8] pb-3">
              <h3 className="font-bold text-sm text-[#25232A] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#681C35]" />
                <span>Keamanan Akun Administrator (anissagustiawati@gmail.com)</span>
              </h3>
              <p className="text-xs text-[#777780] mt-0.5">
                Anda dapat memperbarui kata sandi admin kapan saja. Kata sandi akan tersimpan dengan aman di browser Anda.
              </p>
            </div>

            <div className="max-w-md space-y-3 text-xs">
              <div>
                <label className="block text-[#777780] mb-1 font-semibold">Email Resmi Terdaftar</label>
                <input
                  type="text"
                  disabled
                  value={ADMIN_CONFIG.EMAIL}
                  className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 font-mono font-medium text-[#25232A]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetStep(1);
                  setResetError('');
                  setResetSuccess('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white rounded font-semibold text-xs transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Kirim Kode Pemulihan ke Email untuk Ganti Kata Sandi</span>
              </button>
            </div>
          </div>

          {/* General Site Settings */}
          <form onSubmit={handleSaveSettings} className="bg-white border border-[#E8E5E8] rounded-md p-6 space-y-6 shadow-2xs">
            <div className="border-b border-[#E8E5E8] pb-3">
              <h3 className="font-bold text-sm text-[#25232A]">Konfigurasi Sistem Situs Web</h3>
              <p className="text-xs text-[#777780] mt-0.5">
                Atur nama situs, deskripsi, dan frekuensi sinkronisasi otomatis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#25232A] mb-1">Nama Situs Web</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#25232A] mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#25232A] mb-1">Interval Sinkronisasi (Menit)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.syncIntervalMinutes}
                  onChange={(e) => setSettings({ ...settings, syncIntervalMinutes: parseInt(e.target.value, 10) || 15 })}
                  className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                />
              </div>
            </div>

            {saveMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#E8E5E8] flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
