import axios from 'axios';
import { env } from '../config/env';

export async function checkIndexStatus(url: string): Promise<boolean> {
  const targetUrl = new URL(url);
  const domain = targetUrl.hostname;
  // We'll search for 'site:domain/path'
  const query = `site:${domain}${targetUrl.pathname}${targetUrl.search}`;

  const serperApiKey = process.env.SERPER_API_KEY || 'e11d107b3ded4011fb8a76e2cbb6da1d880ce1c0';

  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      { q: query },
      {
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10s
      }
    );

    const data = response.data;
    
    // Serper returns organic results in `data.organic`
    if (data.organic && data.organic.length > 0) {
      // Check if any organic result matches the domain
      const isMatch = data.organic.some((result: any) => result.link.includes(domain));
      if (isMatch) {
        return true;
      }
    }

    return false;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error(`[VerificationService] Serper.dev API key is invalid or quota exceeded.`);
      throw new Error('Serper.dev API Error: Forbidden');
    }
    console.error(`[VerificationService] Failed to check index status for ${url}:`, error.message);
    throw error;
  }
}
