import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { newsEngine } from './server/newsEngine';
import { rwandaEngine } from './server/rwandaEngine';
import { analyzeArticleWithAI, analyzeRwandaArticleWithAI } from './server/aiService';
import { adDatabase } from './server/adDatabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Get articles with filters
app.get('/api/news', (req: Request, res: Response) => {
  const { category, country, query, breakingOnly, sourceId, limit, offset } = req.query;
  const result = newsEngine.getArticles({
    category: category as string,
    country: country as string,
    query: query as string,
    breakingOnly: breakingOnly === 'true',
    sourceId: sourceId as string,
    limit: limit ? parseInt(limit as string, 10) : 30,
    offset: offset ? parseInt(offset as string, 10) : 0,
  });
  res.json(result);
});

// 2. Get single article
app.get('/api/news/:id', (req: Request, res: Response) => {
  const article = newsEngine.getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

// 3. Breaking ticker
app.get('/api/ticker', (_req: Request, res: Response) => {
  res.json(newsEngine.getTicker());
});

// 4. System & Admin Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  res.json(newsEngine.getStats());
});

// 5. Monitored Sources
app.get('/api/sources', (_req: Request, res: Response) => {
  res.json(newsEngine.getSources());
});

app.patch('/api/sources/:id/toggle', (req: Request, res: Response) => {
  const updated = newsEngine.toggleSource(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Source not found' });
  }
  res.json(updated);
});

app.post('/api/sources', (req: Request, res: Response) => {
  const { name, feedUrl, url, category, country, language } = req.body;
  if (!name || !feedUrl) {
    return res.status(400).json({ error: 'Source name and feedUrl are required.' });
  }
  const created = newsEngine.addSource({
    name,
    feedUrl,
    url: url || feedUrl,
    category: category || 'World News',
    country: country || 'International',
    language: language || 'en',
    isActive: true,
  });
  res.status(201).json(created);
});

// 6. Force immediate radar sweep
app.post('/api/monitor/sweep', async (_req: Request, res: Response) => {
  try {
    const sweepResult = await newsEngine.sweepAllFeeds();
    res.json({ success: true, ...sweepResult, stats: newsEngine.getStats() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete radar sweep', details: String(error) });
  }
});

// 7. Geo Radar Hotspots
app.get('/api/geo-radar', (_req: Request, res: Response) => {
  res.json(newsEngine.getGeoRadar());
});

// 7b. 7-Day Trending Topics & Source Volume Analytics
app.get('/api/analytics/trends', (_req: Request, res: Response) => {
  res.json(newsEngine.get7DayTrends());
});

// 8. AI News Intelligence (Gemini 3.8 Flash)
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { articleId, articleData } = req.body;
    let target = articleData;
    if (articleId) {
      const found = newsEngine.getArticleById(articleId);
      if (found) target = found;
    }

    if (!target) {
      return res.status(400).json({ error: 'Missing article to analyze' });
    }

    // Check if already analyzed to save latency
    if (target.aiAnalysis && articleId) {
      return res.json(target.aiAnalysis);
    }

    const analysis = await analyzeArticleWithAI(target);

    // Save back to article cache if present
    if (articleId) {
      newsEngine.updateArticle(articleId, { aiAnalysis: analysis });
    }

    res.json(analysis);
  } catch (error) {
    console.error('API AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed', details: String(error) });
  }
});

// 9. Breaking Alerts & Notifications
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json(newsEngine.getAlerts());
});

app.post('/api/notifications/broadcast', (req: Request, res: Response) => {
  const { title, summary, category, source } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required for breaking bulletin' });
  }
  const alert = newsEngine.createManualAlert(title, summary || title, category || 'World News', source || 'IMPAMOPRESS DESK');
  res.status(201).json(alert);
});

// 10. Bookmarks
app.post('/api/bookmarks/toggle', (req: Request, res: Response) => {
  const { articleId } = req.body;
  if (!articleId) return res.status(400).json({ error: 'articleId required' });
  const isBookmarked = newsEngine.toggleBookmark(articleId);
  res.json({ articleId, isBookmarked });
});

app.get('/api/bookmarks', (_req: Request, res: Response) => {
  res.json(newsEngine.getBookmarkedArticles());
});

// 11. Monitoring Audit Logs
app.get('/api/logs', (_req: Request, res: Response) => {
  res.json(newsEngine.getLogs());
});

// ==========================================
// 🇷🇼 RWANDA NEWS RADAR API MODULE
// ==========================================

// 1. Get Rwanda articles with filters
app.get('/api/rwanda/news', (req: Request, res: Response) => {
  const { category, province, publisher, importance, dateRange, keyword, limit, offset } = req.query;
  const result = rwandaEngine.getRwandaArticles({
    category: category as string,
    province: province as string,
    publisher: publisher as string,
    importance: importance as string,
    dateRange: dateRange as string,
    keyword: keyword as string,
    limit: limit ? parseInt(limit as string, 10) : 30,
    offset: offset ? parseInt(offset as string, 10) : 0,
  });
  res.json(result);
});

// 2. Get single Rwanda story
app.get('/api/rwanda/news/:id', (req: Request, res: Response) => {
  const article = rwandaEngine.getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Rwanda article not found' });
  res.json(article);
});

// 3. Official Government Announcements
app.get('/api/rwanda/announcements', (_req: Request, res: Response) => {
  res.json(rwandaEngine.getGovernmentAnnouncements());
});

// 4. Rwanda Radar Statistics (Actual coverage, never fake 100%)
app.get('/api/rwanda/stats', (_req: Request, res: Response) => {
  res.json(rwandaEngine.getStats());
});

// 5. Rwanda Source Control Center
app.get('/api/rwanda/sources', (_req: Request, res: Response) => {
  res.json(rwandaEngine.getSources());
});

app.patch('/api/rwanda/sources/:id/toggle', (req: Request, res: Response) => {
  const updated = rwandaEngine.toggleSource(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Source not found' });
  res.json(updated);
});

app.post('/api/rwanda/sources/:id/retry', async (req: Request, res: Response) => {
  const updated = await rwandaEngine.retrySource(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Source not found' });
  res.json(updated);
});

// 6. Manual force sweep of all Rwandan feeds
app.post('/api/rwanda/sweep', async (_req: Request, res: Response) => {
  try {
    const sweepResult = await rwandaEngine.sweepRwandaFeeds();
    res.json({ success: true, ...sweepResult, stats: rwandaEngine.getStats() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sweep Rwanda feeds', details: String(error) });
  }
});

// 7. Rwanda AI News Intelligence (English, Kinyarwanda, French, Fact vs Allegation)
app.post('/api/rwanda/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { articleId, articleData } = req.body;
    let target = articleData;
    if (articleId) {
      const found = rwandaEngine.getArticleById(articleId);
      if (found) target = found;
    }
    if (!target) return res.status(400).json({ error: 'Missing article to analyze' });

    if (target.aiAnalysis && articleId) {
      return res.json(target.aiAnalysis);
    }

    const analysis = await analyzeRwandaArticleWithAI({
      title: target.title,
      description: target.description,
      publisher: target.publisher,
      category: target.category,
      province: target.province,
      url: target.url,
    });

    if (articleId) {
      rwandaEngine.updateArticle(articleId, { aiAnalysis: analysis });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Rwanda AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed', details: String(error) });
  }
});

// ==========================================
// 📢 SELF-SERVICE ADVERTISING & MTN MOMO API
// ==========================================

// 1. Get packages & public settings
app.get('/api/ads/packages', (_req: Request, res: Response) => {
  res.json(adDatabase.getPackages());
});

app.get('/api/ads/settings', (_req: Request, res: Response) => {
  res.json(adDatabase.getSettings());
});

// 2. Active approved ads for public top and bottom placements
app.get('/api/ads/public/active', (_req: Request, res: Response) => {
  res.json(adDatabase.getActiveAds());
});

// 3. Analytics tracking (impressions & clicks)
app.post('/api/ads/track/impression/:id', (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] as string;
  const ok = adDatabase.trackImpression(req.params.id, userAgent);
  res.json({ success: ok });
});

app.post('/api/ads/track/click/:id', (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] as string;
  const ok = adDatabase.trackClick(req.params.id, userAgent);
  res.json({ success: ok });
});

// 4. Advertiser Registration & Login
app.post('/api/ads/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, businessName, password } = req.body;
    if (!name || !email || !phone || !businessName) {
      return res.status(400).json({ error: 'Name, email, phone number, and business name are required.' });
    }
    const result = adDatabase.registerAdvertiser({ name, email, phone, businessName, password });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/ads/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const result = adDatabase.loginAdvertiser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Login failed' });
  }
});

// 5. Advertiser Dashboard: Campaigns & Metrics
app.get('/api/ads/advertiser/:id/campaigns', (req: Request, res: Response) => {
  const campaigns = adDatabase.getAdvertiserCampaigns(req.params.id);
  res.json(campaigns);
});

app.get('/api/ads/advertiser/:id/payments', (req: Request, res: Response) => {
  const payments = adDatabase.getAdvertiserPayments(req.params.id);
  res.json(payments);
});

app.get('/api/ads/advertiser/:id/stats', (req: Request, res: Response) => {
  const stats = adDatabase.getAdvertiserStats(req.params.id);
  res.json(stats);
});

// 6. Create Campaign
app.post('/api/ads/campaigns', (req: Request, res: Response) => {
  try {
    const { advertiserId, packageId, headline, description, businessName, phone, targetUrl, creative } = req.body;
    if (!advertiserId || !packageId || !headline || !description || !businessName || !phone || !targetUrl || !creative?.mediaUrl) {
      return res.status(400).json({ error: 'All fields including media upload/URL are required to create a campaign.' });
    }

    const campaign = adDatabase.createCampaign({
      advertiserId,
      packageId,
      headline,
      description,
      businessName,
      phone,
      targetUrl,
      creative,
    });

    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create advertising campaign' });
  }
});

// 7. Submit MTN MoMo Payment
app.post('/api/ads/payments/submit', (req: Request, res: Response) => {
  try {
    const { campaignId, advertiserId, amountPaidRwf, momoReference, senderPhone } = req.body;
    if (!campaignId || !advertiserId || !momoReference) {
      return res.status(400).json({ error: 'Campaign ID, Advertiser ID, and MTN MoMo Transaction Reference are required.' });
    }

    const payment = adDatabase.submitPayment({
      campaignId,
      advertiserId,
      amountPaidRwf: Number(amountPaidRwf),
      momoReference,
      senderPhone,
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully with status PENDING VERIFICATION.',
      payment,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment submission failed' });
  }
});

// 8. Admin Ads & Payment Management
app.get('/api/ads/admin/all-campaigns', (_req: Request, res: Response) => {
  res.json(adDatabase.getAllCampaigns());
});

app.get('/api/ads/admin/payments', (_req: Request, res: Response) => {
  res.json(adDatabase.getAllPayments());
});

app.get('/api/ads/admin/advertisers', (_req: Request, res: Response) => {
  res.json(adDatabase.getAllAdvertisers());
});

app.get('/api/ads/admin/logs', (_req: Request, res: Response) => {
  res.json(adDatabase.getAdminLogs());
});

app.post('/api/ads/admin/payments/:id/verify', (req: Request, res: Response) => {
  try {
    const { approved, notesOrReason, adminEmail } = req.body;
    const payment = adDatabase.verifyPayment(
      req.params.id,
      adminEmail || 'admin@impamopress.com',
      Boolean(approved),
      notesOrReason
    );
    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment verification failed' });
  }
});

app.post('/api/ads/admin/campaigns/:id/moderate', (req: Request, res: Response) => {
  try {
    const { approved, rejectionReason, adminEmail } = req.body;
    const campaign = adDatabase.moderateCampaign(
      req.params.id,
      adminEmail || 'admin@impamopress.com',
      Boolean(approved),
      rejectionReason
    );
    res.json({ success: true, campaign });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Campaign moderation failed' });
  }
});

app.patch('/api/ads/admin/settings', (req: Request, res: Response) => {
  try {
    const { adminEmail, ...updates } = req.body;
    const settings = adDatabase.updateSettings(updates, adminEmail);
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Settings update failed' });
  }
});

app.patch('/api/ads/admin/packages/:id', (req: Request, res: Response) => {
  try {
    const { adminEmail, ...updates } = req.body;
    const pkg = adDatabase.updatePackage(req.params.id, updates, adminEmail);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Package update failed' });
  }
});

// Vite middleware / Static file serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IMPAMOPRESS RADAR] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
