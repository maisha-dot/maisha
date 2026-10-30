import { XMLParser } from 'fast-xml-parser';

export interface RawParsedArticle {
  title: string;
  description: string;
  link: string;
  pubDate?: string;
  author?: string;
  imageUrl?: string;
  category?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  parseTagValue: false,
});

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImageFromItem(item: Record<string, unknown>, rawXmlDesc: string): string | undefined {
  // 1. media:content
  if (item['media:content']) {
    const mc = item['media:content'];
    if (Array.isArray(mc) && mc.length > 0 && mc[0]?.['@_url']) {
      return mc[0]['@_url'];
    }
    if (typeof mc === 'object' && mc !== null && (mc as Record<string, unknown>)['@_url']) {
      return (mc as Record<string, unknown>)['@_url'] as string;
    }
  }

  // 2. media:thumbnail
  if (item['media:thumbnail']) {
    const mt = item['media:thumbnail'];
    if (typeof mt === 'object' && mt !== null && (mt as Record<string, unknown>)['@_url']) {
      return (mt as Record<string, unknown>)['@_url'] as string;
    }
  }

  // 3. enclosure (type="image/...")
  if (item['enclosure']) {
    const enc = item['enclosure'];
    if (typeof enc === 'object' && enc !== null && (enc as Record<string, unknown>)['@_url']) {
      return (enc as Record<string, unknown>)['@_url'] as string;
    }
  }

  // 4. regex check inside description / content:encoded
  const rawHtml = String(item['content:encoded'] || item['content'] || rawXmlDesc || '');
  const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"'>]+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
}

export async function fetchAndParseFeed(feedUrl: string, timeoutMs = 8000): Promise<RawParsedArticle[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImpamoPressRadar/1.0; +https://impamopress.radar)',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const jsonObj = parser.parse(xmlText);

    const articles: RawParsedArticle[] = [];

    // RSS 2.0: jsonObj.rss.channel.item
    if (jsonObj?.rss?.channel?.item) {
      const items = Array.isArray(jsonObj.rss.channel.item)
        ? jsonObj.rss.channel.item
        : [jsonObj.rss.channel.item];

      for (const item of items) {
        const rawTitle = item.title ? (typeof item.title === 'string' ? item.title : item.title['#text'] || '') : '';
        const title = stripHtml(rawTitle);
        if (!title) continue;

        let link = '';
        if (typeof item.link === 'string') {
          link = item.link;
        } else if (item.link?.['#text']) {
          link = item.link['#text'];
        } else if (item.guid && typeof item.guid === 'string' && item.guid.startsWith('http')) {
          link = item.guid;
        } else if (item.guid?.['#text'] && item.guid['#text'].startsWith('http')) {
          link = item.guid['#text'];
        }

        const rawDesc = String(item.description || item['content:encoded'] || '');
        const description = stripHtml(rawDesc).slice(0, 360);
        const imageUrl = extractImageFromItem(item, rawDesc);
        const pubDate = item.pubDate || item['dc:date'] || new Date().toISOString();
        const author = item['dc:creator'] || item.author || undefined;

        articles.push({
          title,
          description: description || title,
          link,
          pubDate,
          author: typeof author === 'string' ? stripHtml(author) : undefined,
          imageUrl,
          category: typeof item.category === 'string' ? stripHtml(item.category) : undefined,
        });
      }
    } else if (jsonObj?.feed?.entry) {
      // Atom feed: jsonObj.feed.entry
      const entries = Array.isArray(jsonObj.feed.entry)
        ? jsonObj.feed.entry
        : [jsonObj.feed.entry];

      for (const entry of entries) {
        const rawTitle = entry.title ? (typeof entry.title === 'string' ? entry.title : entry.title['#text'] || '') : '';
        const title = stripHtml(rawTitle);
        if (!title) continue;

        let link = '';
        if (entry.link) {
          if (Array.isArray(entry.link)) {
            const altLink = entry.link.find((l: Record<string, unknown>) => l['@_rel'] === 'alternate') || entry.link[0];
            link = altLink?.['@_href'] || '';
          } else if (entry.link['@_href']) {
            link = entry.link['@_href'];
          }
        }

        const rawContent = String(entry.summary || entry.content || '');
        const description = stripHtml(rawContent).slice(0, 360);
        const imageUrl = extractImageFromItem(entry, rawContent);
        const pubDate = entry.published || entry.updated || new Date().toISOString();
        const author = entry.author?.name || undefined;

        articles.push({
          title,
          description: description || title,
          link,
          pubDate,
          author: typeof author === 'string' ? stripHtml(author) : undefined,
          imageUrl,
        });
      }
    }

    return articles;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}
