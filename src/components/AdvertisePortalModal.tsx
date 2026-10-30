import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  Copy,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  MousePointerClick,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Smartphone,
  Calendar,
  LogOut,
  User,
  PlusCircle,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AdvertisingPackage,
  AdvertisingCampaign,
  AdvertisingPayment,
  AdvertiserStats,
  AdvertisingSystemSettings,
  Advertiser,
} from '../types/advertising';

interface AdvertisePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignActivated?: () => void;
}

type PortalTab = 'create' | 'dashboard' | 'history' | 'auth';

export const AdvertisePortalModal: React.FC<AdvertisePortalModalProps> = ({
  isOpen,
  onClose,
  onCampaignActivated,
}) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<PortalTab>('create');

  // Auth state
  const [currentUser, setCurrentUser] = useState<Advertiser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authBusiness, setAuthBusiness] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Settings & Packages
  const [packages, setPackages] = useState<AdvertisingPackage[]>([]);
  const [settings, setSettings] = useState<AdvertisingSystemSettings | null>(null);

  // Wizard state: 1: Package -> 2: Details & Media -> 3: Preview -> 4: MTN MoMo Payment & Reference
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-top-7d');

  // Campaign Form
  const [businessName, setBusinessName] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaFileSize, setMediaFileSize] = useState<number>(0);
  const [formError, setFormError] = useState('');
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);

  // Active / Created campaign for payment step
  const [createdCampaign, setCreatedCampaign] = useState<AdvertisingCampaign | null>(null);

  // MTN MoMo payment step form
  const [momoReference, setMomoReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [momoSubmitting, setMomoSubmitting] = useState(false);
  const [momoError, setMomoError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);

  // Dashboard & History data
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>([]);
  const [payments, setPayments] = useState<AdvertisingPayment[]>([]);
  const [stats, setStats] = useState<AdvertiserStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize data and load session
  useEffect(() => {
    if (isOpen) {
      loadSettingsAndPackages();
      restoreSavedUser();
    }
  }, [isOpen]);

  // Load user data whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
      if (!businessName) setBusinessName(currentUser.businessName || '');
      if (!phone) setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const restoreSavedUser = () => {
    try {
      const saved = localStorage.getItem('impamo_adv_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      }
    } catch {
      // ignore
    }
  };

  const loadSettingsAndPackages = async () => {
    try {
      const [pkgsRes, setsRes] = await Promise.all([
        fetch('/api/ads/packages'),
        fetch('/api/ads/settings'),
      ]);
      if (pkgsRes.ok) {
        const pkgs = await pkgsRes.json();
        setPackages(pkgs);
        if (pkgs.length > 0 && !selectedPackageId) {
          setSelectedPackageId(pkgs[0].id);
        }
      }
      if (setsRes.ok) {
        const sets = await setsRes.json();
        setSettings(sets);
      }
    } catch (err) {
      console.error('Failed to load settings or packages:', err);
    }
  };

  const loadUserData = async (advId: string) => {
    setLoadingData(true);
    try {
      const [cRes, pRes, sRes] = await Promise.all([
        fetch(`/api/ads/advertiser/${advId}/campaigns`),
        fetch(`/api/ads/advertiser/${advId}/payments`),
        fetch(`/api/ads/advertiser/${advId}/stats`),
      ]);
      if (cRes.ok) setCampaigns(await cRes.json());
      if (pRes.ok) setPayments(await pRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) {
      console.error('Failed to load user ad data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        const res = await fetch('/api/ads/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            phone: authPhone,
            businessName: authBusiness,
            password: authPassword || 'advertiser123',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setCurrentUser(data.advertiser);
        localStorage.setItem('impamo_adv_user', JSON.stringify(data.advertiser));
        setActiveTab('create');
      } else {
        const res = await fetch('/api/ads/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        setCurrentUser(data.advertiser);
        localStorage.setItem('impamo_adv_user', JSON.stringify(data.advertiser));
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('impamo_adv_user');
    setActiveTab('auth');
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const exchangeRate = settings?.usdToRwfRate || 1420;
  const priceRwf = selectedPkg ? Math.round(selectedPkg.priceUsd * exchangeRate) : 0;

  // Handle file uploads (converts file to Data URL for standalone reliable rendering)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFileName(file.name);
    setMediaFileSize(file.size);

    if (file.type.startsWith('video/')) {
      if (!selectedPkg?.videoAllowed) {
        setFormError('Video files are not allowed for Package A (Bottom Ad). Please upload an image.');
        return;
      }
      setMediaType('video');
    } else {
      setMediaType('image');
    }

    setFormError('');
    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNextToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      setActiveTab('auth');
      return;
    }

    if (!businessName.trim() || !headline.trim() || !description.trim() || !phone.trim() || !targetUrl.trim()) {
      setFormError('Please fill in all required campaign fields.');
      return;
    }

    if (!mediaUrl.trim()) {
      setFormError('Please upload an image/video or provide a media URL.');
      return;
    }

    if (mediaType === 'video' && !selectedPkg?.videoAllowed) {
      setFormError('Video is not allowed for Package A. Please upload an image.');
      return;
    }

    setWizardStep(3); // Go to Preview
  };

  const handleCreateCampaignAndGoToPayment = async () => {
    if (!currentUser || !selectedPkg) return;
    setIsSubmittingCampaign(true);
    setFormError('');

    try {
      const res = await fetch('/api/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId: currentUser.id,
          packageId: selectedPkg.id,
          headline,
          description,
          businessName,
          phone,
          targetUrl,
          creative: {
            mediaType,
            mediaUrl,
            originalFilename: mediaFileName || 'creative',
            fileSize: mediaFileSize,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');

      setCreatedCampaign(data);
      setSenderPhone(currentUser.phone || phone);
      setWizardStep(4); // Go to MTN MoMo Payment
      loadUserData(currentUser.id);
    } catch (err: any) {
      setFormError(err.message || 'Error creating campaign');
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  const handleCopyUssd = () => {
    const code = settings?.ussdCode || '*182*8*1*2031802#';
    navigator.clipboard.writeText(code);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2500);
  };

  const handlePayNowDialer = () => {
    // Open tel dialer on mobile devices with encoded #
    const code = settings?.ussdCode || '*182*8*1*2031802#';
    const telUrl = `tel:${code.replace(/#/g, '%23')}`;
    window.location.href = telUrl;
  };

  const handleSubmitMoMoVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCampaign || !currentUser) return;
    setMomoError('');
    setMomoSubmitting(true);

    try {
      const res = await fetch('/api/ads/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: createdCampaign.id,
          advertiserId: currentUser.id,
          amountPaidRwf: priceRwf,
          momoReference,
          senderPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment details');

      setPaymentSuccess(true);
      loadUserData(currentUser.id);
      if (onCampaignActivated) onCampaignActivated();
    } catch (err: any) {
      setMomoError(err.message || 'Payment submission failed');
    } finally {
      setMomoSubmitting(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setHeadline('');
    setDescription('');
    setTargetUrl('');
    setMediaUrl('');
    setMediaFileName('');
    setCreatedCampaign(null);
    setMomoReference('');
    setPaymentSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-black border-2 border-[#E60026] text-white rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-black border-b border-neutral-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#E60026] flex items-center justify-center font-radar font-black text-white text-sm">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-radar tracking-wider text-white">
                  IMPAMOPRESS ADVERTISING PORTAL
                </h2>
                <span className="bg-[#E60026] text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-radar tracking-widest uppercase">
                  MTN MOMO
                </span>
              </div>
              <p className="text-[11px] font-mono-radar text-neutral-400">
                Self-Service Campaign Desk &bull; 7-Day Advertising Cycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono-radar text-neutral-300 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                <User className="w-3.5 h-3.5 text-[#E60026]" />
                <span className="font-semibold text-white truncate max-w-[120px]">
                  {currentUser.businessName || currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="hover:text-[#E60026] ml-1 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portal Nav Tabs */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto font-radar text-xs tracking-wider uppercase">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-[#E60026] text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#E60026]" />
            <span>Create Campaign</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) setActiveTab('auth');
              else setActiveTab('dashboard');
            }}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-[#E60026] text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-[#E60026]" />
            <span>My Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) setActiveTab('auth');
              else setActiveTab('history');
            }}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#E60026] text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#E60026]" />
            <span>Payments History</span>
          </button>

          {!currentUser ? (
            <button
              onClick={() => setActiveTab('auth')}
              className={`py-3 px-3.5 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors ml-auto whitespace-nowrap ${
                activeTab === 'auth'
                  ? 'border-[#E60026] text-white'
                  : 'border-transparent text-[#E60026] hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="py-3 px-3 flex items-center gap-1.5 border-b-2 border-transparent text-neutral-400 hover:text-white ml-auto text-[11px] font-mono-radar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          )}
        </div>

        {/* Portal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black">
          {/* ======================================================== */}
          {/* TAB: AUTH (LOGIN / REGISTER) */}
          {/* ======================================================== */}
          {activeTab === 'auth' && (
            <div className="max-w-md mx-auto py-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#E60026] text-white rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-[#E60026]/30">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-radar text-white uppercase tracking-wider">
                  {authMode === 'register' ? 'Register Advertiser Account' : 'Advertiser Login'}
                </h3>
                <p className="text-xs font-mono-radar text-neutral-400">
                  Create and manage your self-service billboard campaigns and MTN MoMo payments.
                </p>
              </div>

              {authError && (
                <div className="bg-red-950/80 border border-[#E60026] text-white p-3 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#E60026] shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g., Jean Bosco"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                        Business / Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authBusiness}
                        onChange={(e) => setAuthBusiness(e.target.value)}
                        placeholder="e.g., Kigali Tech Hub"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                        Phone Number (MTN MoMo Contact) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="e.g., +250 788 123 456"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g., contact@business.rw"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase py-2.5 rounded text-sm tracking-wider transition-all cursor-pointer shadow-md"
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'register'
                    ? 'Create Advertiser Account & Continue'
                    : 'Log In to Advertiser Portal'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register');
                    setAuthError('');
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer underline"
                >
                  {authMode === 'register'
                    ? 'Already have an advertiser account? Log In'
                    : "Don't have an account yet? Register Here"}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: CREATE CAMPAIGN WIZARD */}
          {/* ======================================================== */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* Wizard Steps Breadcrumbs */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-xs font-radar uppercase tracking-wider">
                <div
                  className={`flex items-center gap-1.5 ${
                    wizardStep >= 1 ? 'text-[#E60026] font-bold' : 'text-neutral-500'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Select Package</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                <div
                  className={`flex items-center gap-1.5 ${
                    wizardStep >= 2 ? 'text-[#E60026] font-bold' : 'text-neutral-500'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Creative Details</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                <div
                  className={`flex items-center gap-1.5 ${
                    wizardStep >= 3 ? 'text-[#E60026] font-bold' : 'text-neutral-500'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>Live Preview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                <div
                  className={`flex items-center gap-1.5 ${
                    wizardStep >= 4 ? 'text-[#E60026] font-bold' : 'text-neutral-500'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px]">
                    4
                  </span>
                  <span>MTN MoMo Pay</span>
                </div>
              </div>

              {/* STEP 1: SELECT PACKAGE */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold font-radar text-white uppercase tracking-wider">
                      Step 1: Choose Your Advertising Package
                    </h3>
                    <p className="text-xs font-mono-radar text-neutral-400">
                      Guaranteed 7-day display cycle across IMPAMOPRESS RADAR HOT NEWS.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const pkgRwf = Math.round(pkg.priceUsd * exchangeRate);
                      const isTop = pkg.key === 'TOP_PREMIUM_AD';

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative cursor-pointer rounded-lg p-5 border-2 transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#E60026] bg-neutral-950 shadow-xl shadow-[#E60026]/20'
                              : 'border-neutral-800 bg-black hover:border-neutral-700'
                          }`}
                        >
                          {isTop && (
                            <span className="absolute -top-3 right-4 bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar uppercase tracking-wider">
                              MOST POPULAR &bull; VIDEO SUPPORT
                            </span>
                          )}

                          <div className="space-y-3">
                            <div>
                              <span className="text-[11px] font-mono-radar text-[#E60026] font-bold uppercase tracking-wider">
                                {isTop ? 'TOP SECTION PLACEMENT' : 'BOTTOM SECTION PLACEMENT'}
                              </span>
                              <h4 className="text-lg font-bold font-radar text-white tracking-wide mt-0.5">
                                {pkg.displayTitle}
                              </h4>
                            </div>

                            <div className="flex items-baseline gap-2 py-2 border-y border-neutral-800">
                              <span className="text-3xl font-black font-radar text-white">
                                ${pkg.priceUsd}
                              </span>
                              <span className="text-xs font-mono-radar text-neutral-400">
                                USD / WEEK (7 DAYS)
                              </span>
                              <span className="ml-auto text-xs font-mono-radar text-[#E60026] font-bold">
                                {pkgRwf.toLocaleString()} RWF
                              </span>
                            </div>

                            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                              {pkg.description}
                            </p>

                            <div className="space-y-1.5 pt-2 text-xs font-mono-radar text-neutral-300">
                              <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-[#E60026]" />
                                <span>Duration: 7 Days (1 Week active)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-[#E60026]" />
                                <span>
                                  Video Commercial:{' '}
                                  <strong className={pkg.videoAllowed ? 'text-white' : 'text-neutral-500'}>
                                    {pkg.videoAllowed ? 'ALLOWED (MP4 up to 25MB)' : 'NOT ALLOWED'}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-[#E60026]" />
                                <span>Media: {pkg.allowedMedia.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-[#E60026]" />
                                <span>Includes Clickable Link + Phone Call</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-neutral-900">
                            <button
                              type="button"
                              className={`w-full py-2 rounded text-xs font-bold font-radar uppercase tracking-wider transition-colors ${
                                isSelected
                                  ? 'bg-[#E60026] text-white'
                                  : 'bg-neutral-900 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {isSelected ? 'PACKAGE SELECTED' : 'SELECT THIS PACKAGE'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="flex items-center gap-2 bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-6 py-2.5 rounded text-xs tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <span>Continue to Creative Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CREATIVE DETAILS & MEDIA UPLOAD */}
              {wizardStep === 2 && (
                <form onSubmit={handleNextToPreview} className="space-y-5">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold font-radar text-white uppercase tracking-wider">
                      Step 2: Enter Advertisement Information
                    </h3>
                    <p className="text-xs font-mono-radar text-neutral-400">
                      Selected: <strong className="text-white">{selectedPkg?.displayTitle}</strong> — $
                      {selectedPkg?.priceUsd} USD ({priceRwf.toLocaleString()} RWF)
                    </p>
                  </div>

                  {formError && (
                    <div className="bg-red-950/80 border border-[#E60026] text-white p-3 rounded text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#E60026] shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                        Business / Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., Kigali Modern Motors"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                        Business Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., +250 788 123 456"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                      Advertisement Headline * (Catchy headline for news readers)
                    </label>
                    <input
                      type="text"
                      required
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g., Discover Premier Business Logistics Across East Africa"
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                      Advertisement Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide key selling points, product highlights, and a call-to-action for readers..."
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                      Website URL or Social Media Link *
                    </label>
                    <input
                      type="text"
                      required
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="e.g., https://yourcompany.rw or https://instagram.com/yourbusiness"
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  {/* Media Upload Section */}
                  <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono-radar font-bold text-white flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#E60026]" />
                        <span>Upload Creative Media *</span>
                      </label>
                      <span className="text-[10px] font-mono-radar text-neutral-400">
                        {selectedPkg?.videoAllowed
                          ? 'Permitted: JPG, PNG, WebP (≤5MB) or MP4 Video (≤25MB)'
                          : 'Permitted: JPG, PNG, WebP (≤5MB) &bull; Video NOT allowed'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="flex-1 w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-700 hover:border-[#E60026] rounded-lg p-4 cursor-pointer bg-neutral-900/50 transition-colors">
                        <input
                          type="file"
                          accept={
                            selectedPkg?.videoAllowed
                              ? 'image/jpeg,image/png,image/webp,video/mp4'
                              : 'image/jpeg,image/png,image/webp'
                          }
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {mediaType === 'video' ? (
                          <Video className="w-5 h-5 text-[#E60026]" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#E60026]" />
                        )}
                        <span className="text-xs font-mono-radar text-neutral-300">
                          {mediaFileName ? `Selected: ${mediaFileName}` : 'Choose Image or Video File'}
                        </span>
                      </label>

                      <span className="text-xs text-neutral-500 font-mono-radar">OR</span>

                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                          onChange={(e) => {
                            setMediaUrl(e.target.value);
                            setMediaType(e.target.value.endsWith('.mp4') ? 'video' : 'image');
                          }}
                          placeholder="Paste public Image or Video URL (e.g., https://...)"
                          className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-xs outline-none"
                        />
                      </div>
                    </div>

                    {mediaUrl && (
                      <div className="text-[11px] font-mono-radar text-white flex items-center gap-1.5 pt-1">
                        <Check className="w-3.5 h-3.5 text-[#E60026]" />
                        <span>Media ready for preview ({mediaType.toUpperCase()})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-mono-radar cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Packages</span>
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-6 py-2.5 rounded text-xs tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <span>Preview Advertisement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: LIVE PREVIEW MOCKUP */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold font-radar text-white uppercase tracking-wider">
                      Step 3: Preview Your Live Advertisement
                    </h3>
                    <p className="text-xs font-mono-radar text-neutral-400">
                      This is exactly how your advertisement will appear to visitors on IMPAMOPRESS RADAR HOT NEWS.
                    </p>
                  </div>

                  {/* Render Mockup Container */}
                  <div className="bg-neutral-950 p-4 sm:p-5 rounded-lg border-2 border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar tracking-widest uppercase">
                          ADVERTISEMENT
                        </span>
                        <span className="text-white text-xs font-bold font-radar uppercase">
                          {businessName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-radar text-neutral-400 uppercase">
                        {selectedPkg?.displayTitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-black p-3.5 rounded border border-neutral-800">
                      <div className="md:col-span-4 rounded overflow-hidden aspect-video bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        {mediaType === 'video' ? (
                          <video
                            src={mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt="Ad Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="md:col-span-8 space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#E60026] font-radar uppercase tracking-wider">
                            OFFICIAL SPONSOR
                          </span>
                          <h4 className="text-base font-bold font-radar text-white leading-snug">
                            {headline}
                          </h4>
                          <p className="text-xs text-neutral-300 font-sans mt-1 line-clamp-3">
                            {description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-radar">
                          <span className="text-white">Phone: {phone}</span>
                          <span className="bg-[#E60026] text-white px-3 py-1 rounded text-[11px] font-bold font-radar uppercase">
                            VISIT OFFICIAL PAGE &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Summary Box */}
                  <div className="bg-black border border-[#E60026] p-4 rounded-lg space-y-2">
                    <h4 className="text-xs font-bold font-radar text-white uppercase tracking-wider">
                      Order Summary Before Payment
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-radar pt-1">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">PACKAGE</span>
                        <strong className="text-white">{selectedPkg?.name}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">PLACEMENT</span>
                        <strong className="text-white">
                          {selectedPkg?.placement === 'top' ? 'Top Billboard' : 'Bottom Showcase'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">DURATION</span>
                        <strong className="text-white">7 Days (1 Week)</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">AMOUNT DUE</span>
                        <strong className="text-[#E60026] text-sm">
                          ${selectedPkg?.priceUsd} USD ({priceRwf.toLocaleString()} RWF)
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-mono-radar cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Edit Information</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingCampaign}
                      onClick={handleCreateCampaignAndGoToPayment}
                      className="flex items-center gap-2 bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-6 py-2.5 rounded text-xs tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <span>
                        {isSubmittingCampaign ? 'Submitting Campaign...' : 'Proceed to MTN MoMo Payment'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MTN MOMO PAYMENT & CONFIRMATION */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold font-radar text-white uppercase tracking-wider">
                      Step 4: Complete Payment via MTN Mobile Money
                    </h3>
                    <p className="text-xs font-mono-radar text-neutral-400">
                      Campaign Created: <strong className="text-white">{headline}</strong> &bull; Total Due:{' '}
                      <strong className="text-[#E60026]">{priceRwf.toLocaleString()} RWF (${selectedPkg?.priceUsd} USD)</strong>
                    </p>
                  </div>

                  {paymentSuccess ? (
                    <div className="bg-neutral-950 border-2 border-[#E60026] p-6 rounded-lg text-center space-y-4">
                      <div className="w-12 h-12 bg-[#E60026] text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#E60026]/40">
                        <Check className="w-7 h-7" />
                      </div>
                      <h4 className="text-lg font-bold font-radar text-white uppercase tracking-wider">
                        PAYMENT SUBMITTED — PENDING VERIFICATION
                      </h4>
                      <p className="text-xs font-mono-radar text-neutral-300 max-w-lg mx-auto leading-relaxed">
                        Your payment reference <strong className="text-white">{momoReference}</strong> for{' '}
                        <strong className="text-white">{priceRwf.toLocaleString()} RWF</strong> has been received by our editorial desk.
                        Our finance administrator will verify the funds with MTN MoMo statement records.
                      </p>
                      <div className="bg-black p-3 rounded text-xs font-mono-radar text-neutral-400 max-w-md mx-auto border border-neutral-800">
                        Status: <strong className="text-[#E60026]">PENDING VERIFICATION</strong> &rarr; Once verified, your ad moves to{' '}
                        <strong className="text-white">PAID — PENDING CONTENT APPROVAL</strong>, then activates automatically for 7 days.
                      </div>
                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            resetWizard();
                            setActiveTab('dashboard');
                          }}
                          className="bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-6 py-2 rounded text-xs tracking-wider transition-colors cursor-pointer"
                        >
                          View in My Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* MoMo Payment Details Card */}
                      <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                          <div>
                            <span className="text-[11px] font-mono-radar text-[#E60026] font-bold uppercase tracking-wider">
                              OFFICIAL PAYMENT GATEWAY
                            </span>
                            <h4 className="text-base font-bold font-radar text-white tracking-wide">
                              MTN Mobile Money (MoMo Pay)
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono-radar text-neutral-400 block">
                              EXACT AMOUNT PAYABLE
                            </span>
                            <span className="text-xl font-black font-radar text-white">
                              {priceRwf.toLocaleString()} RWF
                            </span>
                          </div>
                        </div>

                        {/* MTN Account Holder & Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black p-3.5 rounded border border-neutral-850 text-xs font-mono-radar">
                          <div>
                            <span className="text-neutral-500 block text-[10px]">MOMO PAY CODE</span>
                            <strong className="text-white text-base font-radar tracking-wider">
                              {settings?.momoPayCode || '2031802'}
                            </strong>
                          </div>

                          <div>
                            <span className="text-neutral-500 block text-[10px]">USSD DIAL CODE</span>
                            <strong className="text-white text-sm font-mono-radar">
                              {settings?.ussdCode || '*182*8*1*2031802#'}
                            </strong>
                          </div>

                          <div>
                            <span className="text-neutral-500 block text-[10px]">ACCOUNT HOLDER</span>
                            <strong className="text-[#E60026] text-xs font-radar tracking-wider uppercase">
                              {settings?.accountHolder || 'ISMAEL NINYEMBARAGA'}
                            </strong>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          {/* Prominent Red PAY NOW Button */}
                          <button
                            onClick={handlePayNowDialer}
                            className="w-full sm:flex-1 bg-[#E60026] hover:bg-red-700 text-white font-black font-radar uppercase py-3 rounded text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#E60026]/30"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>PAY NOW VIA MTN MOMO</span>
                          </button>

                          <button
                            onClick={handleCopyUssd}
                            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-4 py-3 rounded text-xs font-mono-radar flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            {copiedUssd ? <Check className="w-4 h-4 text-[#E60026]" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedUssd ? 'USSD COPIED!' : 'COPY USSD CODE'}</span>
                          </button>
                        </div>

                        {/* Instructions */}
                        <div className="bg-black/80 p-3.5 rounded border border-neutral-800 text-xs font-mono-radar space-y-1.5 text-neutral-300">
                          <p className="font-bold text-white uppercase text-[11px] font-radar">
                            Payment Steps:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-neutral-300">
                            <li>Dial <strong className="text-white">{settings?.ussdCode || '*182*8*1*2031802#'}</strong> on your phone.</li>
                            <li>Confirm account holder name: <strong className="text-[#E60026]">{settings?.accountHolder || 'ISMAEL NINYEMBARAGA'}</strong>.</li>
                            <li>Enter exact amount: <strong className="text-white">{priceRwf.toLocaleString()} RWF</strong>.</li>
                            <li>Authorize payment by entering your MTN MoMo PIN.</li>
                            <li>Receive MTN SMS with your unique <strong className="text-white">Transaction ID (Reference)</strong>.</li>
                          </ol>
                          <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-900 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#E60026] shrink-0 mt-0.5" />
                            <span>
                              Notice: Clicking &ldquo;PAY NOW&rdquo; opens your phone dialer. Payment is never marked as complete until you enter the genuine MTN transaction reference below.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Submission Form */}
                      <form onSubmit={handleSubmitMoMoVerification} className="bg-black border border-[#E60026] p-5 rounded-lg space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold font-radar text-white uppercase tracking-wider">
                            Submit MTN MoMo Transaction Reference
                          </h4>
                          <p className="text-xs font-mono-radar text-neutral-400">
                            Enter the reference number from your MTN confirmation SMS to verify payment.
                          </p>
                        </div>

                        {momoError && (
                          <div className="bg-red-950/80 border border-[#E60026] text-white p-3 rounded text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#E60026] shrink-0" />
                            <span>{momoError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                              MTN MoMo Transaction Reference (TxID) *
                            </label>
                            <input
                              type="text"
                              required
                              value={momoReference}
                              onChange={(e) => setMomoReference(e.target.value)}
                              placeholder="e.g., 29481938501 or MP2610..."
                              className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                              Sender Phone Number
                            </label>
                            <input
                              type="tel"
                              value={senderPhone}
                              onChange={(e) => setSenderPhone(e.target.value)}
                              placeholder="e.g., +250 788 123 456"
                              className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono-radar text-neutral-300 mb-1">
                            Amount Paid in RWF *
                          </label>
                          <input
                            type="number"
                            required
                            value={priceRwf}
                            readOnly
                            className="w-full bg-neutral-950 border border-neutral-800 text-white rounded px-3 py-2 text-sm outline-none font-mono cursor-not-allowed"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={momoSubmitting}
                          className="w-full bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase py-2.5 rounded text-xs tracking-wider transition-colors cursor-pointer shadow-md"
                        >
                          {momoSubmitting ? 'Verifying & Submitting...' : 'SUBMIT PAYMENT DETAILS FOR VERIFICATION'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ADVERTISER DASHBOARD */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold font-radar text-white uppercase tracking-wider">
                    Advertiser Campaign Performance Desk
                  </h3>
                  <p className="text-xs font-mono-radar text-neutral-400">
                    Live overview of active displays, genuine clicks, and campaign lifecycles.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetWizard();
                    setActiveTab('create');
                  }}
                  className="bg-[#E60026] hover:bg-red-700 text-white text-xs font-bold font-radar uppercase px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book New Campaign</span>
                </button>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-radar">
                  <div className="bg-neutral-950 p-3.5 rounded border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">TOTAL CAMPAIGNS</span>
                    <strong className="text-2xl font-black font-radar text-white">
                      {stats.totalCampaigns}
                    </strong>
                  </div>

                  <div className="bg-neutral-950 p-3.5 rounded border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">ACTIVE LIVE</span>
                    <strong className="text-2xl font-black font-radar text-[#E60026]">
                      {stats.activeCampaigns}
                    </strong>
                  </div>

                  <div className="bg-neutral-950 p-3.5 rounded border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">TOTAL VIEWS</span>
                    <strong className="text-2xl font-black font-radar text-white">
                      {stats.totalViews.toLocaleString()}
                    </strong>
                  </div>

                  <div className="bg-neutral-950 p-3.5 rounded border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">GENUINE CLICKS</span>
                    <strong className="text-2xl font-black font-radar text-white">
                      {stats.totalClicks.toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}

              {/* Campaign Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-radar text-white uppercase tracking-wider">
                  Registered Advertising Campaigns
                </h4>

                {campaigns.length === 0 ? (
                  <div className="bg-neutral-950 p-8 rounded border border-neutral-800 text-center space-y-3">
                    <p className="text-xs font-mono-radar text-neutral-400">
                      You have no registered advertising campaigns yet.
                    </p>
                    <button
                      onClick={() => {
                        resetWizard();
                        setActiveTab('create');
                      }}
                      className="bg-[#E60026] hover:bg-red-700 text-white text-xs font-bold font-radar uppercase px-4 py-2 rounded transition-colors"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((camp) => {
                      const isTop = camp.package?.placement === 'top';
                      let statusBadge = (
                        <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                          {camp.status}
                        </span>
                      );

                      if (camp.status === 'ACTIVE') {
                        statusBadge = (
                          <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar animate-pulse">
                            ACTIVE LIVE (7-DAY DISPLAY)
                          </span>
                        );
                      } else if (camp.status === 'PAID_PENDING_APPROVAL') {
                        statusBadge = (
                          <span className="border border-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                            PAID — PENDING CONTENT APPROVAL
                          </span>
                        );
                      } else if (camp.status === 'PENDING_VERIFICATION') {
                        statusBadge = (
                          <span className="border border-neutral-700 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                            PAYMENT PENDING VERIFICATION
                          </span>
                        );
                      } else if (camp.status === 'EXPIRED') {
                        statusBadge = (
                          <span className="bg-neutral-900 text-neutral-500 text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                            EXPIRED (COMPLETED)
                          </span>
                        );
                      } else if (camp.status === 'REJECTED') {
                        statusBadge = (
                          <span className="bg-neutral-950 border border-neutral-700 text-neutral-400 text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                            REJECTED
                          </span>
                        );
                      }

                      return (
                        <div
                          key={camp.id}
                          className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {statusBadge}
                              <span className="text-[10px] font-mono-radar text-neutral-400 uppercase">
                                {isTop ? 'Top Billboard' : 'Bottom Banner'} &bull; ${camp.package?.priceUsd || 5} USD
                              </span>
                            </div>
                            <h5 className="text-sm font-bold font-radar text-white">
                              {camp.headline}
                            </h5>
                            <p className="text-xs text-neutral-400 line-clamp-1">
                              {camp.description}
                            </p>
                            {camp.rejectionReason && (
                              <p className="text-xs text-[#E60026] font-mono-radar">
                                Reason: {camp.rejectionReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono-radar shrink-0">
                            <div className="text-right">
                              <span className="text-neutral-500 block text-[10px]">VIEWS / CLICKS</span>
                              <strong className="text-white">
                                {camp.views || 0} / {camp.clicks || 0}
                              </strong>
                            </div>

                            {camp.status === 'PENDING_PAYMENT' && (
                              <button
                                onClick={() => {
                                  setCreatedCampaign(camp);
                                  setSelectedPackageId(camp.packageId);
                                  setWizardStep(4);
                                  setActiveTab('create');
                                }}
                                className="bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-3 py-1.5 rounded text-[11px] transition-colors"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: PAYMENTS HISTORY */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-lg font-bold font-radar text-white uppercase tracking-wider">
                  MTN Mobile Money Payment Records
                </h3>
                <p className="text-xs font-mono-radar text-neutral-400">
                  Comprehensive audit trail of all transactions and editorial verifications.
                </p>
              </div>

              {payments.length === 0 ? (
                <div className="bg-neutral-950 p-8 rounded border border-neutral-800 text-center text-xs font-mono-radar text-neutral-400">
                  No payment records found for this account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono-radar border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-radar uppercase text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Reference (TxID)</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Campaign</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-950">
                          <td className="py-3 px-3 text-neutral-300">
                            {new Date(p.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white">
                            {p.momoReference}
                          </td>
                          <td className="py-3 px-3 text-white">
                            {p.amountRwf.toLocaleString()} RWF (${p.amountUsd})
                          </td>
                          <td className="py-3 px-3 text-neutral-300 max-w-[150px] truncate">
                            {p.campaign?.headline || p.campaignId}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded font-radar uppercase ${
                                p.status === 'APPROVED'
                                  ? 'bg-[#E60026] text-white'
                                  : p.status === 'REJECTED'
                                  ? 'bg-neutral-900 text-neutral-400'
                                  : 'border border-neutral-700 text-neutral-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
