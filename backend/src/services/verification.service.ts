import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

export async function checkIndexStatus(url: string): Promise<boolean> {
  const targetUrl = new URL(url);
  const domain = targetUrl.hostname;
  // We'll search for 'site:domain/path'
  const query = `site:${domain}${targetUrl.pathname}${targetUrl.search}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;

  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000, // 10s
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // If Google says "did not match any documents", it's not indexed.
    // Different variants:
    // "did not match any documents."
    const bodyText = $('body').text();
    if (bodyText.includes('did not match any documents')) {
      return false;
    }

    // Look for actual search results. The #search div or standard link elements.
    // If there is at least one valid search result block, we assume it's indexed.
    // A standard result block usually has a cite element containing the domain.
    const citeCount = $('cite').filter((_, el) => $(el).text().includes(domain)).length;
    
    if (citeCount > 0) {
      return true;
    }
    
    // If we didn't find 'did not match any documents' but also no cite, we might be hitting a captcha.
    if (bodyText.includes('detected unusual traffic')) {
      console.warn(`[VerificationService] Google CAPTCHA detected for ${url}`);
      throw new Error('Google CAPTCHA encountered');
    }

    return false;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn(`[VerificationService] Google Rate Limit (429) for ${url}`);
      throw new Error('Google rate limit hit');
    }
    console.error(`[VerificationService] Failed to check index status for ${url}:`, error.message);
    throw error;
  }
}
