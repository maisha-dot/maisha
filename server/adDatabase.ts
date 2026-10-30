import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Advertiser,
  AdvertisingPackage,
  AdvertisingCampaign,
  AdvertisingCreative,
  AdvertisingPayment,
  PaymentVerification,
  AdvertisementAnalytics,
  AdminActivityLog,
  AdvertisingSystemSettings,
  AdvertiserStats,
} from '../src/types/advertising';

interface DatabaseSchema {
  advertisers: Advertiser[];
  advertising_packages: AdvertisingPackage[];
  advertising_campaigns: AdvertisingCampaign[];
  advertising_creatives: AdvertisingCreative[];
  advertising_payments: AdvertisingPayment[];
  payment_verifications: PaymentVerification[];
  advertisement_analytics: AdvertisementAnalytics[];
  admin_activity_logs: AdminActivityLog[];
  settings: AdvertisingSystemSettings;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'ad_database.json');

const DEFAULT_SETTINGS: AdvertisingSystemSettings = {
  usdToRwfRate: 1420, // 1 USD = 1,420 RWF (configurable by admin)
  momoPayCode: '2031802',
  ussdCode: '*182*8*1*2031802#',
  accountHolder: 'ISMAEL NINYEMBARAGA',
  bottomAdPriceUsd: 5,
  topAdPriceUsd: 10,
  campaignDurationDays: 7,
  allowedImageFormats: ['JPG', 'JPEG', 'PNG', 'WEBP'],
  allowedVideoFormats: ['MP4'],
  maxVideoDurationSeconds: 60,
  maxImageSizeBytes: 5 * 1024 * 1024, // 5MB
  maxVideoSizeBytes: 25 * 1024 * 1024, // 25MB
};

const DEFAULT_PACKAGES: AdvertisingPackage[] = [
  {
    id: 'pkg-bottom-7d',
    key: 'BOTTOM_AD',
    name: 'Bottom Website Advertisement',
    displayTitle: 'BOTTOM ADVERTISEMENT',
    priceUsd: 5,
    durationDays: 7,
    placement: 'bottom',
    videoAllowed: false,
    allowedMedia: ['JPG', 'PNG', 'WEBP'],
    description: 'Placement in the dedicated high-visibility footer advertising zone across all articles and radar screens.',
    isActive: true,
  },
  {
    id: 'pkg-top-7d',
    key: 'TOP_PREMIUM_AD',
    name: 'Top Website Advertisement',
    displayTitle: 'TOP PREMIUM ADVERTISEMENT',
    priceUsd: 10,
    durationDays: 7,
    placement: 'top',
    videoAllowed: true,
    allowedMedia: ['JPG', 'PNG', 'WEBP', 'MP4'],
    description: 'Top homepage billboard showcase. Supports high-resolution images or MP4 video commercials seen by all visitors.',
    isActive: true,
  },
];

class AdDatabaseEngine {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
    this.ensureDefaults();
    this.checkExpiredCampaigns();

    // Routine background check every 60 seconds for campaign expiration
    setInterval(() => {
      this.checkExpiredCampaigns();
    }, 60 * 1000);
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          advertisers: parsed.advertisers || [],
          advertising_packages: parsed.advertising_packages || [],
          advertising_campaigns: parsed.advertising_campaigns || [],
          advertising_creatives: parsed.advertising_creatives || [],
          advertising_payments: parsed.advertising_payments || [],
          payment_verifications: parsed.payment_verifications || [],
          advertisement_analytics: parsed.advertisement_analytics || [],
          admin_activity_logs: parsed.admin_activity_logs || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.error('[AdDB] Error reading ad_database.json, initializing fresh store:', err);
    }

    return {
      advertisers: [],
      advertising_packages: [...DEFAULT_PACKAGES],
      advertising_campaigns: [],
      advertising_creatives: [],
      advertising_payments: [],
      payment_verifications: [],
      advertisement_analytics: [],
      admin_activity_logs: [],
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  private ensureDefaults() {
    let modified = false;

    if (!this.data.advertising_packages || this.data.advertising_packages.length === 0) {
      this.data.advertising_packages = [...DEFAULT_PACKAGES];
      modified = true;
    } else {
      // Ensure prices match settings
      const bottom = this.data.advertising_packages.find((p) => p.key === 'BOTTOM_AD');
      if (bottom && bottom.priceUsd !== this.data.settings.bottomAdPriceUsd) {
        bottom.priceUsd = this.data.settings.bottomAdPriceUsd;
        modified = true;
      }
      const top = this.data.advertising_packages.find((p) => p.key === 'TOP_PREMIUM_AD');
      if (top && top.priceUsd !== this.data.settings.topAdPriceUsd) {
        top.priceUsd = this.data.settings.topAdPriceUsd;
        modified = true;
      }
    }

    if (modified) {
      this.persist();
    }
  }

  private persist() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[AdDB] Error persisting ad_database.json:', err);
      }
    }, 200);
  }

  public checkExpiredCampaigns(): number {
    const now = new Date().toISOString();
    let expiredCount = 0;

    for (const campaign of this.data.advertising_campaigns) {
      if (campaign.status === 'ACTIVE' && campaign.expiresAt && campaign.expiresAt <= now) {
        campaign.status = 'EXPIRED';
        expiredCount++;

        this.data.admin_activity_logs.unshift({
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          adminEmail: 'SYSTEM_AUTOPILOT',
          action: 'CAMPAIGN_AUTO_EXPIRED',
          targetId: campaign.id,
          details: `Campaign "${campaign.headline}" reached 7-day expiry deadline (${campaign.expiresAt}). Display stopped.`,
          timestamp: now,
        });
      }
    }

    if (expiredCount > 0) {
      this.persist();
    }
    return expiredCount;
  }

  // --- SETTINGS & PACKAGES ---

  public getSettings(): AdvertisingSystemSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<AdvertisingSystemSettings>, adminEmail = 'admin@impamopress.com'): AdvertisingSystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };

    // Sync package prices if modified
    if (updates.bottomAdPriceUsd !== undefined) {
      const bottom = this.data.advertising_packages.find((p) => p.key === 'BOTTOM_AD');
      if (bottom) bottom.priceUsd = updates.bottomAdPriceUsd;
    }
    if (updates.topAdPriceUsd !== undefined) {
      const top = this.data.advertising_packages.find((p) => p.key === 'TOP_PREMIUM_AD');
      if (top) top.priceUsd = updates.topAdPriceUsd;
    }
    if (updates.campaignDurationDays !== undefined) {
      for (const pkg of this.data.advertising_packages) {
        pkg.durationDays = updates.campaignDurationDays;
      }
    }

    this.data.admin_activity_logs.unshift({
      id: 'log-' + Date.now(),
      adminEmail,
      action: 'SETTINGS_UPDATED',
      targetId: 'settings',
      details: `Updated settings: Exchange rate=${this.data.settings.usdToRwfRate} RWF/USD, Top=$${this.data.settings.topAdPriceUsd}, Bottom=$${this.data.settings.bottomAdPriceUsd}`,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return { ...this.data.settings };
  }

  public getPackages(): AdvertisingPackage[] {
    return [...this.data.advertising_packages];
  }

  public updatePackage(id: string, updates: Partial<AdvertisingPackage>, adminEmail = 'admin@impamopress.com'): AdvertisingPackage | null {
    const pkg = this.data.advertising_packages.find((p) => p.id === id);
    if (!pkg) return null;

    Object.assign(pkg, updates);

    this.data.admin_activity_logs.unshift({
      id: 'log-' + Date.now(),
      adminEmail,
      action: 'PACKAGE_UPDATED',
      targetId: id,
      details: `Updated package ${pkg.name}: Price=$${pkg.priceUsd}, Active=${pkg.isActive}`,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return { ...pkg };
  }

  // --- ADVERTISER AUTHENTICATION & PROFILES ---

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + '_IMPAMO_SALT_2026').digest('hex');
  }

  public registerAdvertiser(data: { name: string; email: string; phone: string; businessName: string; password?: string }): { advertiser: Advertiser; token: string } {
    const emailNorm = data.email.trim().toLowerCase();
    const existing = this.data.advertisers.find((a) => a.email.toLowerCase() === emailNorm);
    if (existing) {
      throw new Error('An advertiser with this email address already exists. Please log in.');
    }

    const advertiser: Advertiser = {
      id: 'adv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: data.name.trim(),
      email: emailNorm,
      phone: data.phone.trim(),
      businessName: data.businessName.trim(),
      passwordHash: this.hashPassword(data.password || 'advertiser123'),
      createdAt: new Date().toISOString(),
    };

    this.data.advertisers.push(advertiser);
    this.persist();

    const token = Buffer.from(JSON.stringify({ id: advertiser.id, email: advertiser.email })).toString('base64');
    const { passwordHash: _, ...safeAdv } = advertiser;
    return { advertiser: safeAdv as Advertiser, token };
  }

  public loginAdvertiser(email: string, password?: string): { advertiser: Advertiser; token: string } {
    const emailNorm = email.trim().toLowerCase();
    const advertiser = this.data.advertisers.find((a) => a.email.toLowerCase() === emailNorm);
    if (!advertiser) {
      throw new Error('No advertiser account found with this email. Please register first.');
    }

    if (password && advertiser.passwordHash) {
      const hash = this.hashPassword(password);
      if (hash !== advertiser.passwordHash) {
        throw new Error('Invalid account password.');
      }
    }

    const token = Buffer.from(JSON.stringify({ id: advertiser.id, email: advertiser.email })).toString('base64');
    const { passwordHash: _, ...safeAdv } = advertiser;
    return { advertiser: safeAdv as Advertiser, token };
  }

  public getAdvertiserById(id: string): Advertiser | null {
    const adv = this.data.advertisers.find((a) => a.id === id);
    if (!adv) return null;
    const { passwordHash: _, ...safeAdv } = adv;
    return safeAdv as Advertiser;
  }

  // --- CAMPAIGN CREATION & MANAGEMENT ---

  public createCampaign(data: {
    advertiserId: string;
    packageId: string;
    headline: string;
    description: string;
    businessName: string;
    phone: string;
    targetUrl: string;
    creative: {
      mediaType: 'image' | 'video';
      mediaUrl: string;
      originalFilename?: string;
      fileSize?: number;
      mimeType?: string;
      durationSeconds?: number;
    };
  }): AdvertisingCampaign {
    const pkg = this.data.advertising_packages.find((p) => p.id === data.packageId);
    if (!pkg) {
      throw new Error('Invalid advertising package selected.');
    }

    if (!pkg.isActive) {
      throw new Error('This advertising package is currently paused by administration.');
    }

    // Video validation rule
    if (data.creative.mediaType === 'video' && !pkg.videoAllowed) {
      throw new Error('Video is strictly not permitted for Package A (Bottom Website Advertisement). Image only (JPG, PNG, WebP).');
    }

    if (data.creative.mediaType === 'video') {
      if (data.creative.durationSeconds && data.creative.durationSeconds > this.data.settings.maxVideoDurationSeconds) {
        throw new Error(`Video exceeds maximum allowed duration of ${this.data.settings.maxVideoDurationSeconds} seconds.`);
      }
      if (data.creative.fileSize && data.creative.fileSize > this.data.settings.maxVideoSizeBytes) {
        throw new Error('Video file size exceeds maximum limit of 25MB.');
      }
    } else {
      if (data.creative.fileSize && data.creative.fileSize > this.data.settings.maxImageSizeBytes) {
        throw new Error('Image file size exceeds maximum limit of 5MB.');
      }
    }

    const campaignId = 'cmp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const creative: AdvertisingCreative = {
      id: 'crt-' + Date.now(),
      campaignId,
      mediaType: data.creative.mediaType,
      mediaUrl: data.creative.mediaUrl,
      originalFilename: data.creative.originalFilename,
      fileSize: data.creative.fileSize,
      mimeType: data.creative.mimeType,
      durationSeconds: data.creative.durationSeconds,
      createdAt: new Date().toISOString(),
    };

    const campaign: AdvertisingCampaign = {
      id: campaignId,
      advertiserId: data.advertiserId,
      packageId: data.packageId,
      headline: data.headline.trim(),
      description: data.description.trim(),
      businessName: data.businessName.trim(),
      phone: data.phone.trim(),
      targetUrl: data.targetUrl.trim(),
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
      views: 0,
      clicks: 0,
    };

    this.data.advertising_creatives.push(creative);
    this.data.advertising_campaigns.unshift(campaign);
    this.persist();

    return this.enrichCampaign(campaign);
  }

  // --- MTN MOMO PAYMENT WORKFLOW ---

  public submitPayment(data: {
    campaignId: string;
    advertiserId: string;
    amountPaidRwf: number;
    momoReference: string;
    senderPhone?: string;
  }): AdvertisingPayment {
    const campaign = this.data.advertising_campaigns.find((c) => c.id === data.campaignId);
    if (!campaign) {
      throw new Error('Campaign not found.');
    }

    const pkg = this.data.advertising_packages.find((p) => p.id === campaign.packageId);
    if (!pkg) {
      throw new Error('Campaign package not found.');
    }

    const cleanRef = data.momoReference.trim().toUpperCase();
    if (!cleanRef) {
      throw new Error('MTN MoMo transaction reference is required.');
    }

    // Requirement: "Prevent duplicate transaction references."
    const duplicate = this.data.advertising_payments.find(
      (p) => p.momoReference.trim().toUpperCase() === cleanRef
    );
    if (duplicate) {
      throw new Error(`Duplicate Transaction Reference: Reference "${cleanRef}" has already been submitted on ${new Date(duplicate.submittedAt).toLocaleString()}. Each MTN MoMo payment must have a unique reference.`);
    }

    const exchangeRate = this.data.settings.usdToRwfRate;
    const expectedRwf = Math.round(pkg.priceUsd * exchangeRate);

    const payment: AdvertisingPayment = {
      id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      campaignId: campaign.id,
      advertiserId: data.advertiserId,
      amountUsd: pkg.priceUsd,
      amountRwf: data.amountPaidRwf || expectedRwf,
      exchangeRate,
      paymentMethod: 'MTN_MOMO',
      momoPayCode: this.data.settings.momoPayCode,
      ussdCode: this.data.settings.ussdCode,
      accountHolder: this.data.settings.accountHolder,
      momoReference: cleanRef,
      senderPhone: data.senderPhone?.trim(),
      status: 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString(),
    };

    this.data.advertising_payments.unshift(payment);

    // Update campaign status
    campaign.status = 'PENDING_VERIFICATION';

    this.persist();

    return this.enrichPayment(payment);
  }

  // --- ADMIN PAYMENT VERIFICATION ---

  public verifyPayment(paymentId: string, adminEmail: string, approved: boolean, notesOrReason?: string): AdvertisingPayment {
    const payment = this.data.advertising_payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment record not found.');
    }

    const campaign = this.data.advertising_campaigns.find((c) => c.id === payment.campaignId);
    if (!campaign) {
      throw new Error('Associated campaign not found.');
    }

    const oldStatus = payment.status;
    const now = new Date().toISOString();

    if (approved) {
      payment.status = 'APPROVED';
      payment.verifiedAt = now;
      payment.verifiedBy = adminEmail;
      payment.rejectionReason = undefined;

      // Requirement 7: "After payment verification: Advertisement status becomes PAID — PENDING CONTENT APPROVAL."
      campaign.status = 'PAID_PENDING_APPROVAL';
      campaign.rejectionReason = undefined;
    } else {
      payment.status = 'REJECTED';
      payment.verifiedAt = now;
      payment.verifiedBy = adminEmail;
      payment.rejectionReason = notesOrReason || 'Payment could not be verified in MTN MoMo statements.';

      campaign.status = 'REJECTED';
      campaign.rejectionReason = `Payment Rejected: ${notesOrReason || 'Invalid MoMo reference or amount mismatch.'}`;
    }

    // Log verification in payment_verifications
    this.data.payment_verifications.unshift({
      id: 'ver-' + Date.now(),
      paymentId: payment.id,
      campaignId: campaign.id,
      verifiedBy: adminEmail,
      oldStatus,
      newStatus: payment.status,
      notes: notesOrReason,
      timestamp: now,
    });

    // Log admin activity
    this.data.admin_activity_logs.unshift({
      id: 'log-' + Date.now(),
      adminEmail,
      action: approved ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
      targetId: payment.id,
      details: `${approved ? 'Approved' : 'Rejected'} payment ref ${payment.momoReference} for campaign "${campaign.headline}". Amount: ${payment.amountRwf} RWF ($${payment.amountUsd}). Notes: ${notesOrReason || 'None'}`,
      timestamp: now,
    });

    this.persist();
    return this.enrichPayment(payment);
  }

  // --- ADMIN CONTENT MODERATION ---

  public moderateCampaign(campaignId: string, adminEmail: string, approved: boolean, rejectionReason?: string): AdvertisingCampaign {
    const campaign = this.data.advertising_campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found.');
    }

    const payment = this.data.advertising_payments.find((p) => p.campaignId === campaignId && p.status === 'APPROVED');
    if (approved && !payment) {
      throw new Error('Cannot activate campaign: Payment has not been approved yet.');
    }

    const now = new Date();
    const pkg = this.data.advertising_packages.find((p) => p.id === campaign.packageId) || DEFAULT_PACKAGES[0];
    const durationDays = pkg.durationDays || this.data.settings.campaignDurationDays || 7;

    if (approved) {
      // Requirement 8: "When payment and advertisement are both approved:
      // Automatically activate the advertisement. Start the seven-day campaign period.
      // Record the exact activation date and expiry date."
      campaign.status = 'ACTIVE';
      campaign.activatedAt = now.toISOString();

      const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      campaign.expiresAt = expiry.toISOString();
      campaign.rejectionReason = undefined;

      this.data.admin_activity_logs.unshift({
        id: 'log-' + Date.now(),
        adminEmail,
        action: 'CAMPAIGN_ACTIVATED',
        targetId: campaign.id,
        details: `Approved creative for "${campaign.headline}". Active for ${durationDays} days until ${expiry.toISOString()}.`,
        timestamp: now.toISOString(),
      });
    } else {
      campaign.status = 'REJECTED';
      campaign.rejectionReason = rejectionReason || 'Content does not meet editorial guidelines.';

      this.data.admin_activity_logs.unshift({
        id: 'log-' + Date.now(),
        adminEmail,
        action: 'CAMPAIGN_CONTENT_REJECTED',
        targetId: campaign.id,
        details: `Rejected creative for "${campaign.headline}". Reason: ${rejectionReason || 'Violates ad policy.'}`,
        timestamp: now.toISOString(),
      });
    }

    this.persist();
    return this.enrichCampaign(campaign);
  }

  // --- ADVERTISER DASHBOARD METRICS ---

  public getAdvertiserCampaigns(advertiserId: string): AdvertisingCampaign[] {
    return this.data.advertising_campaigns
      .filter((c) => c.advertiserId === advertiserId)
      .map((c) => this.enrichCampaign(c));
  }

  public getAdvertiserPayments(advertiserId: string): AdvertisingPayment[] {
    return this.data.advertising_payments
      .filter((p) => p.advertiserId === advertiserId)
      .map((p) => this.enrichPayment(p));
  }

  public getAdvertiserStats(advertiserId: string): AdvertiserStats {
    const campaigns = this.data.advertising_campaigns.filter((c) => c.advertiserId === advertiserId);
    const payments = this.data.advertising_payments.filter((p) => p.advertiserId === advertiserId && p.status === 'APPROVED');

    let totalViews = 0;
    let totalClicks = 0;
    let totalSpendingUsd = 0;
    let totalSpendingRwf = 0;

    for (const c of campaigns) {
      totalViews += c.views || 0;
      totalClicks += c.clicks || 0;
    }

    for (const p of payments) {
      totalSpendingUsd += p.amountUsd;
      totalSpendingRwf += p.amountRwf;
    }

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
      pendingPayment: campaigns.filter((c) => c.status === 'PENDING_PAYMENT').length,
      pendingApproval: campaigns.filter((c) => c.status === 'PENDING_VERIFICATION' || c.status === 'PAID_PENDING_APPROVAL').length,
      expiredCampaigns: campaigns.filter((c) => c.status === 'EXPIRED').length,
      totalSpendingUsd,
      totalSpendingRwf,
      totalViews,
      totalClicks,
    };
  }

  // --- PUBLIC AD DISPLAY & REAL-TIME ANALYTICS ---

  public getActiveAds(): { top: AdvertisingCampaign[]; bottom: AdvertisingCampaign[] } {
    this.checkExpiredCampaigns();
    const now = new Date().toISOString();

    const activeList = this.data.advertising_campaigns
      .filter((c) => c.status === 'ACTIVE' && c.expiresAt && c.expiresAt > now)
      .map((c) => this.enrichCampaign(c));

    const top: AdvertisingCampaign[] = [];
    const bottom: AdvertisingCampaign[] = [];

    for (const c of activeList) {
      if (c.package?.placement === 'top') {
        top.push(c);
      } else {
        bottom.push(c);
      }
    }

    return { top, bottom };
  }

  public trackImpression(campaignId: string, userAgent?: string): boolean {
    const campaign = this.data.advertising_campaigns.find((c) => c.id === campaignId);
    if (!campaign) return false;

    campaign.views = (campaign.views || 0) + 1;

    this.data.advertisement_analytics.push({
      id: 'anl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      campaignId,
      eventType: 'impression',
      timestamp: new Date().toISOString(),
      userAgent: userAgent?.substring(0, 150),
    });

    // Prune raw analytics logs if greater than 10,000 to conserve storage
    if (this.data.advertisement_analytics.length > 10000) {
      this.data.advertisement_analytics = this.data.advertisement_analytics.slice(-5000);
    }

    this.persist();
    return true;
  }

  public trackClick(campaignId: string, userAgent?: string): boolean {
    const campaign = this.data.advertising_campaigns.find((c) => c.id === campaignId);
    if (!campaign) return false;

    campaign.clicks = (campaign.clicks || 0) + 1;

    this.data.advertisement_analytics.push({
      id: 'clk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      campaignId,
      eventType: 'click',
      timestamp: new Date().toISOString(),
      userAgent: userAgent?.substring(0, 150),
    });

    this.persist();
    return true;
  }

  // --- ADMIN FULL ACCESS ---

  public getAllCampaigns(): AdvertisingCampaign[] {
    this.checkExpiredCampaigns();
    return this.data.advertising_campaigns.map((c) => this.enrichCampaign(c));
  }

  public getAllPayments(): AdvertisingPayment[] {
    return this.data.advertising_payments.map((p) => this.enrichPayment(p));
  }

  public getAllAdvertisers(): Advertiser[] {
    return this.data.advertisers.map((a) => {
      const { passwordHash: _, ...safe } = a;
      return safe as Advertiser;
    });
  }

  public getAdminLogs(): AdminActivityLog[] {
    return [...this.data.admin_activity_logs];
  }

  // --- ENRICHMENT HELPERS ---

  private enrichCampaign(campaign: AdvertisingCampaign): AdvertisingCampaign {
    const pkg = this.data.advertising_packages.find((p) => p.id === campaign.packageId);
    const creative = this.data.advertising_creatives.find((c) => c.campaignId === campaign.id);
    const advertiser = this.data.advertisers.find((a) => a.id === campaign.advertiserId);

    return {
      ...campaign,
      package: pkg,
      creative,
      advertiser: advertiser
        ? {
            id: advertiser.id,
            name: advertiser.name,
            email: advertiser.email,
            phone: advertiser.phone,
            businessName: advertiser.businessName,
          }
        : undefined,
    };
  }

  private enrichPayment(payment: AdvertisingPayment): AdvertisingPayment {
    const campaign = this.data.advertising_campaigns.find((c) => c.id === payment.campaignId);
    const advertiser = this.data.advertisers.find((a) => a.id === payment.advertiserId);

    return {
      ...payment,
      campaign: campaign
        ? {
            id: campaign.id,
            headline: campaign.headline,
            businessName: campaign.businessName,
            packageId: campaign.packageId,
          }
        : undefined,
      advertiser: advertiser
        ? {
            id: advertiser.id,
            name: advertiser.name,
            email: advertiser.email,
            phone: advertiser.phone,
            businessName: advertiser.businessName,
          }
        : undefined,
    };
  }
}

export const adDatabase = new AdDatabaseEngine();
