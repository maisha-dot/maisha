/**
 * IMPAMOPRESS RADAR HOT NEWS
 * Self-Service Advertising & MTN MoMo Payment System Types
 * Design Doctrine: WHITE (#FFFFFF) & RED (#E60026) ONLY
 */

export type AdPlacement = 'top' | 'bottom';
export type AdMediaType = 'image' | 'video';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PENDING_VERIFICATION'
  | 'PAID_PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';

export interface Advertiser {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  passwordHash?: string;
  createdAt: string;
}

export interface AdvertisingPackage {
  id: string;
  key: 'BOTTOM_AD' | 'TOP_PREMIUM_AD';
  name: string;
  displayTitle: string;
  priceUsd: number;
  durationDays: number;
  placement: AdPlacement;
  videoAllowed: boolean;
  allowedMedia: string[];
  description: string;
  isActive: boolean;
}

export interface AdvertisingCreative {
  id: string;
  campaignId: string;
  mediaType: AdMediaType;
  mediaUrl: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface AdvertisingCampaign {
  id: string;
  advertiserId: string;
  packageId: string;
  headline: string;
  description: string;
  businessName: string;
  phone: string;
  targetUrl: string;
  status: CampaignStatus;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  views: number;
  clicks: number;
  rejectionReason?: string;
  package?: AdvertisingPackage;
  creative?: AdvertisingCreative;
  advertiser?: Pick<Advertiser, 'id' | 'name' | 'email' | 'businessName' | 'phone'>;
}

export interface AdvertisingPayment {
  id: string;
  campaignId: string;
  advertiserId: string;
  amountUsd: number;
  amountRwf: number;
  exchangeRate: number;
  paymentMethod: 'MTN_MOMO';
  momoPayCode: string;
  ussdCode: string;
  accountHolder: string;
  momoReference: string;
  senderPhone?: string;
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  campaign?: Pick<AdvertisingCampaign, 'id' | 'headline' | 'businessName' | 'packageId'>;
  advertiser?: Pick<Advertiser, 'id' | 'name' | 'email' | 'phone' | 'businessName'>;
}

export interface PaymentVerification {
  id: string;
  paymentId: string;
  campaignId: string;
  verifiedBy: string;
  oldStatus: PaymentStatus;
  newStatus: PaymentStatus;
  notes?: string;
  timestamp: string;
}

export interface AdvertisementAnalytics {
  id: string;
  campaignId: string;
  eventType: 'impression' | 'click';
  timestamp: string;
  userAgent?: string;
  referrer?: string;
}

export interface AdminActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AdvertisingSystemSettings {
  usdToRwfRate: number;
  momoPayCode: string;
  ussdCode: string;
  accountHolder: string;
  bottomAdPriceUsd: number;
  topAdPriceUsd: number;
  campaignDurationDays: number;
  allowedImageFormats: string[];
  allowedVideoFormats: string[];
  maxVideoDurationSeconds: number;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
}

export interface AdvertiserStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingPayment: number;
  pendingApproval: number;
  expiredCampaigns: number;
  totalSpendingUsd: number;
  totalSpendingRwf: number;
  totalViews: number;
  totalClicks: number;
}
