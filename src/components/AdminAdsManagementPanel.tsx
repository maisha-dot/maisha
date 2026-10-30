import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Calendar,
  ExternalLink,
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  AdvertisingCampaign,
  AdvertisingPayment,
  AdvertisingPackage,
  AdvertisingSystemSettings,
  Advertiser,
  AdminActivityLog,
} from '../types/advertising';

interface AdminAdsManagementPanelProps {
  onRefreshParent?: () => void;
}

type AdminAdSubTab = 'payments' | 'moderation' | 'active' | 'settings' | 'logs';

export const AdminAdsManagementPanel: React.FC<AdminAdsManagementPanelProps> = ({
  onRefreshParent,
}) => {
  const [subTab, setSubTab] = useState<AdminAdSubTab>('payments');

  const [payments, setPayments] = useState<AdvertisingPayment[]>([]);
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>([]);
  const [packages, setPackages] = useState<AdvertisingPackage[]>([]);
  const [settings, setSettings] = useState<AdvertisingSystemSettings | null>(null);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectTargetType, setRejectTargetType] = useState<'payment' | 'campaign'>('payment');
  const [rejectTargetId, setRejectTargetId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Settings form state
  const [editRate, setEditRate] = useState<number>(1420);
  const [editTopPrice, setEditTopPrice] = useState<number>(10);
  const [editBottomPrice, setEditBottomPrice] = useState<number>(5);
  const [editDuration, setEditDuration] = useState<number>(7);
  const [editMomoCode, setEditMomoCode] = useState<string>('2031802');
  const [editAccountHolder, setEditAccountHolder] = useState<string>('ISMAEL NINYEMBARAGA');
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  useEffect(() => {
    fetchAllAdminAdData();
  }, []);

  const fetchAllAdminAdData = async () => {
    setLoading(true);
    try {
      const [payRes, campRes, pkgRes, setRes, advRes, logRes] = await Promise.all([
        fetch('/api/ads/admin/payments'),
        fetch('/api/ads/admin/all-campaigns'),
        fetch('/api/ads/packages'),
        fetch('/api/ads/settings'),
        fetch('/api/ads/admin/advertisers'),
        fetch('/api/ads/admin/logs'),
      ]);

      if (payRes.ok) setPayments(await payRes.json());
      if (campRes.ok) setCampaigns(await campRes.json());
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (advRes.ok) setAdvertisers(await advRes.json());
      if (logRes.ok) setLogs(await logRes.json());

      if (setRes.ok) {
        const s: AdvertisingSystemSettings = await setRes.json();
        setSettings(s);
        setEditRate(s.usdToRwfRate);
        setEditTopPrice(s.topAdPriceUsd);
        setEditBottomPrice(s.bottomAdPriceUsd);
        setEditDuration(s.campaignDurationDays);
        setEditMomoCode(s.momoPayCode);
        setEditAccountHolder(s.accountHolder);
      }
    } catch (err) {
      console.error('Failed to load admin ad data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, approve: boolean, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ads/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: approve,
          notesOrReason: reason || (approve ? 'Confirmed in MTN MoMo statements' : 'Payment rejected'),
          adminEmail: 'desk.editor@impamopress.com',
        }),
      });

      if (res.ok) {
        await fetchAllAdminAdData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      console.error('Payment verification error:', err);
    } finally {
      setActionLoading(false);
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const handleModerateCampaign = async (campaignId: string, approve: boolean, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/ads/admin/campaigns/${campaignId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: approve,
          rejectionReason: reason || (approve ? undefined : 'Creative violates newsroom standards'),
          adminEmail: 'desk.editor@impamopress.com',
        }),
      });

      if (res.ok) {
        await fetchAllAdminAdData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      console.error('Campaign moderation error:', err);
    } finally {
      setActionLoading(false);
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/ads/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdToRwfRate: Number(editRate),
          topAdPriceUsd: Number(editTopPrice),
          bottomAdPriceUsd: Number(editBottomPrice),
          campaignDurationDays: Number(editDuration),
          momoPayCode: editMomoCode.trim(),
          accountHolder: editAccountHolder.trim(),
          adminEmail: 'desk.editor@impamopress.com',
        }),
      });

      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        await fetchAllAdminAdData();
      }
    } catch (err) {
      console.error('Failed to update ad settings:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'PENDING_VERIFICATION');
  const pendingModeration = campaigns.filter((c) => c.status === 'PAID_PENDING_APPROVAL');
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');

  return (
    <div className="space-y-6 text-white font-mono-radar">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E60026] animate-ping"></span>
            <h3 className="text-base sm:text-lg font-black font-radar text-white uppercase tracking-wider">
              SELF-SERVICE ADVERTISING & PAYMENT DESK
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            MTN MoMo verification, content moderation, 7-day auto-expiry, and dynamic exchange rates.
          </p>
        </div>

        <button
          onClick={fetchAllAdminAdData}
          disabled={loading}
          className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E60026] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-850 pb-2 text-xs font-radar uppercase tracking-wider">
        <button
          onClick={() => setSubTab('payments')}
          className={`py-2 px-3 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            subTab === 'payments'
              ? 'bg-[#E60026] text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Queue</span>
          {pendingPayments.length > 0 && (
            <span className="bg-white text-black text-[10px] font-black px-1.5 rounded-full">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('moderation')}
          className={`py-2 px-3 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            subTab === 'moderation'
              ? 'bg-[#E60026] text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Content Moderation</span>
          {pendingModeration.length > 0 && (
            <span className="bg-white text-black text-[10px] font-black px-1.5 rounded-full">
              {pendingModeration.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('active')}
          className={`py-2 px-3 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            subTab === 'active'
              ? 'bg-[#E60026] text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Live Displays ({activeCampaigns.length})</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`py-2 px-3 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            subTab === 'settings'
              ? 'bg-[#E60026] text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Rates & Pricing</span>
        </button>

        <button
          onClick={() => setSubTab('logs')}
          className={`py-2 px-3 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            subTab === 'logs'
              ? 'bg-[#E60026] text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <span>Activity Audit</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. PAYMENT VERIFICATION QUEUE */}
      {/* ========================================================= */}
      {subTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Pending MTN Mobile Money Payments Requiring Statement Verification:
            </span>
            <span className="text-xs text-[#E60026] font-bold">
              {pendingPayments.length} PENDING
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="bg-neutral-950 p-6 rounded border border-neutral-800 text-center text-xs text-neutral-500">
              No payment transactions submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const isPending = p.status === 'PENDING_VERIFICATION';

                return (
                  <div
                    key={p.id}
                    className={`bg-neutral-950 border p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPending ? 'border-[#E60026]' : 'border-neutral-850 opacity-80'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-radar uppercase ${
                            p.status === 'APPROVED'
                              ? 'bg-[#E60026] text-white'
                              : p.status === 'REJECTED'
                              ? 'bg-neutral-900 text-neutral-400'
                              : 'border border-[#E60026] text-white animate-pulse'
                          }`}
                        >
                          {p.status}
                        </span>

                        <span className="text-xs font-mono font-bold text-white">
                          MTN TxID: <strong className="text-white bg-black px-1.5 py-0.5 rounded border border-neutral-800">{p.momoReference}</strong>
                        </span>

                        <span className="text-[11px] text-neutral-500">
                          {new Date(p.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300">
                        Customer:{' '}
                        <strong className="text-white">{p.advertiser?.name || 'Advertiser'}</strong> (
                        {p.advertiser?.businessName}) &bull; Phone:{' '}
                        <strong className="text-white">{p.senderPhone || p.advertiser?.phone || 'N/A'}</strong>
                      </div>

                      <div className="text-xs text-neutral-300">
                        Campaign:{' '}
                        <strong className="text-white">{p.campaign?.headline || p.campaignId}</strong> &bull; Amount:{' '}
                        <strong className="text-[#E60026] font-bold">
                          {p.amountRwf.toLocaleString()} RWF (${p.amountUsd} USD)
                        </strong>
                      </div>

                      {p.rejectionReason && (
                        <p className="text-xs text-[#E60026]">
                          Rejection Reason: {p.rejectionReason}
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleVerifyPayment(p.id, true)}
                          className="bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Funds</span>
                        </button>

                        <button
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectTargetType('payment');
                            setRejectTargetId(p.id);
                            setRejectModalOpen(true);
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-750 px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADVERTISEMENT CONTENT MODERATION QUEUE */}
      {/* ========================================================= */}
      {subTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Paid Campaigns Awaiting Editorial & Creative Content Approval:
            </span>
            <span className="text-xs text-[#E60026] font-bold">
              {pendingModeration.length} PENDING REVIEW
            </span>
          </div>

          {pendingModeration.length === 0 ? (
            <div className="bg-neutral-950 p-6 rounded border border-neutral-800 text-center text-xs text-neutral-500">
              No paid advertisements awaiting content moderation.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingModeration.map((c) => {
                const isVideo = c.creative?.mediaType === 'video';

                return (
                  <div
                    key={c.id}
                    className="bg-neutral-950 border-2 border-[#E60026] p-5 rounded-lg space-y-4 shadow-xl shadow-black"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-850 pb-2.5">
                      <div>
                        <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar uppercase mr-2">
                          PAID — PENDING CONTENT APPROVAL
                        </span>
                        <span className="text-xs text-white font-bold font-radar uppercase">
                          {c.businessName}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {c.package?.displayTitle} &bull; 7-Day Cycle
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4 rounded overflow-hidden aspect-video bg-black border border-neutral-800 flex items-center justify-center">
                        {isVideo ? (
                          <video
                            src={c.creative?.mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={c.creative?.mediaUrl}
                            alt={c.headline}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="md:col-span-8 space-y-2">
                        <h4 className="text-base font-bold font-radar text-white">
                          {c.headline}
                        </h4>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                          {c.description}
                        </p>
                        <div className="text-xs text-neutral-400 flex flex-wrap gap-4 pt-1">
                          <span>Target URL: <strong className="text-white underline">{c.targetUrl}</strong></span>
                          <span>Phone: <strong className="text-white">{c.phone}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-900 flex items-center justify-end gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => {
                          setRejectTargetType('campaign');
                          setRejectTargetId(c.id);
                          setRejectModalOpen(true);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-radar uppercase px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                      >
                        Reject Creative
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleModerateCampaign(c.id, true)}
                        className="bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-5 py-2 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Activate 7-Day Campaign</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ACTIVE LIVE CAMPAIGNS & LIFECYCLE */}
      {/* ========================================================= */}
      {subTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Live Approved Advertisements Currently Displayed on Platform:
            </span>
            <span className="text-xs text-[#E60026] font-bold">
              {activeCampaigns.length} ACTIVE
            </span>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="bg-neutral-950 p-6 rounded border border-neutral-800 text-center text-xs text-neutral-500">
              No live active advertisements running right now. Default sponsor invitations are active.
            </div>
          ) : (
            <div className="space-y-3">
              {activeCampaigns.map((c) => {
                const expires = c.expiresAt ? new Date(c.expiresAt) : null;
                const hoursRemaining = expires
                  ? Math.max(0, Math.round((expires.getTime() - Date.now()) / (1000 * 60 * 60)))
                  : 0;

                return (
                  <div
                    key={c.id}
                    className="bg-neutral-950 border border-[#E60026] p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar uppercase">
                          ACTIVE LIVE
                        </span>
                        <span className="text-xs text-white font-bold font-radar uppercase">
                          {c.businessName}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          ({c.package?.placement === 'top' ? 'Top Billboard' : 'Bottom Showcase'})
                        </span>
                      </div>

                      <h5 className="text-sm font-bold font-radar text-white">
                        {c.headline}
                      </h5>

                      <div className="text-xs text-neutral-400 flex flex-wrap gap-4">
                        <span>Activated: <strong className="text-white">{c.activatedAt ? new Date(c.activatedAt).toLocaleDateString() : 'N/A'}</strong></span>
                        <span>Expires: <strong className="text-[#E60026]">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : 'N/A'}</strong></span>
                        <span>Countdown: <strong className="text-white">{hoursRemaining} hours left ({Math.ceil(hoursRemaining / 24)} days)</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="text-right">
                        <span className="text-neutral-500 block text-[10px]">IMPRESSIONS</span>
                        <strong className="text-base text-white font-bold">{c.views || 0}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500 block text-[10px]">CLICKS</span>
                        <strong className="text-base text-[#E60026] font-bold">{c.clicks || 0}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SETTINGS & EXCHANGE RATES */}
      {/* ========================================================= */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-5">
          <div className="border-b border-neutral-850 pb-3">
            <h4 className="text-sm font-bold font-radar text-white uppercase tracking-wider">
              Advertising System Settings & MTN MoMo Configuration
            </h4>
            <p className="text-xs text-neutral-400">
              Configure real-time USD to RWF exchange rate, package pricing, and MTN MoMo account details.
            </p>
          </div>

          {settingsSaved && (
            <div className="bg-[#E60026] text-white p-3 rounded text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully across platform and database.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                USD to RWF Exchange Rate (1 USD in RWF) *
              </label>
              <input
                type="number"
                required
                value={editRate}
                onChange={(e) => setEditRate(Number(e.target.value))}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                $5 USD = {(5 * editRate).toLocaleString()} RWF &bull; $10 USD = {(10 * editRate).toLocaleString()} RWF
              </span>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                Campaign Duration (Days) *
              </label>
              <input
                type="number"
                required
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Standard duration is 7 days.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                Top Premium Advertisement Price (USD) *
              </label>
              <input
                type="number"
                required
                value={editTopPrice}
                onChange={(e) => setEditTopPrice(Number(e.target.value))}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                Bottom Advertisement Price (USD) *
              </label>
              <input
                type="number"
                required
                value={editBottomPrice}
                onChange={(e) => setEditBottomPrice(Number(e.target.value))}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                MTN MoMo Pay Merchant Code *
              </label>
              <input
                type="text"
                required
                value={editMomoCode}
                onChange={(e) => setEditMomoCode(e.target.value)}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">
                Official Account Holder Name *
              </label>
              <input
                type="text"
                required
                value={editAccountHolder}
                onChange={(e) => setEditAccountHolder(e.target.value)}
                className="w-full bg-black border border-neutral-700 focus:border-[#E60026] text-white rounded px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-[#E60026] hover:bg-red-700 text-white font-bold font-radar uppercase px-6 py-2.5 rounded text-xs tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 5. AUDIT & ACTIVITY LOGS */}
      {/* ========================================================= */}
      {subTab === 'logs' && (
        <div className="space-y-3">
          <span className="text-xs text-neutral-400">
            Internal Activity & Auto-Expiry Logs:
          </span>

          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 max-h-96 overflow-y-auto space-y-2 text-xs">
            {logs.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No activity logged yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-b border-neutral-900 pb-2">
                  <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                    <span className="text-white font-bold uppercase">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-neutral-300 mt-0.5">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-[#E60026] p-5 rounded-lg max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold font-radar text-white uppercase tracking-wider">
              Reject {rejectTargetType === 'payment' ? 'Payment Record' : 'Advertising Creative'}
            </h4>
            <p className="text-xs text-neutral-400">
              Please enter the clear reason for rejection to inform the advertiser:
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., MTN MoMo reference not found in bank statement, or resolution below minimum standards..."
              className="w-full bg-black border border-neutral-700 text-white rounded p-2.5 text-xs outline-none resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="bg-neutral-900 text-neutral-400 hover:text-white px-3 py-1.5 rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectTargetType === 'payment') {
                    handleVerifyPayment(rejectTargetId, false, rejectionReason);
                  } else {
                    handleModerateCampaign(rejectTargetId, false, rejectionReason);
                  }
                }}
                className="bg-[#E60026] text-white font-bold font-radar uppercase px-4 py-1.5 rounded text-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
