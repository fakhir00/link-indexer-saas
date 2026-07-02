import { google } from 'googleapis';
import { HttpError, uniqueNormalizedUrls } from '../utils';

export const toolsService = {
  async googleIndex(serviceAccountJson: string, urls: string[]) {
    const uniqueUrls = uniqueNormalizedUrls(urls);

    try {
      const credentials = JSON.parse(serviceAccountJson);
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/indexing'],
      });

      const indexing = google.indexing({
        version: 'v3',
        auth: jwtClient,
      });

      const results: Array<{ url: string; status?: number; success: boolean; error?: string }> = [];
      for (const url of uniqueUrls) {
        try {
          const response = await indexing.urlNotifications.publish({
            requestBody: { url, type: 'URL_UPDATED' },
          });
          results.push({ url, status: response.status, success: true });
        } catch (err: any) {
          results.push({ url, error: err.message || err.toString(), success: false });
        }
      }

      return results;
    } catch (error: any) {
      throw new HttpError(400, 'Invalid Service Account JSON or API error', error.message);
    }
  },
};
