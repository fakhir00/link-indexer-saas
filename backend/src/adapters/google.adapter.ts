import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { IndexingAdapter, AdapterType, AdapterTier, AdapterResult, SubmissionContext } from './adapter.interface';

export class GoogleAdapter implements IndexingAdapter {
  readonly name = 'Google Indexing API';
  readonly type: AdapterType = 'api';
  readonly tier: AdapterTier = 'primary';
  
  private jwtClient: any;
  private indexing: any;
  private configured: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    const credentialsPath = path.join(__dirname, '..', '..', 'google-credentials.json');
    if (fs.existsSync(credentialsPath)) {
      try {
        const serviceAccountJsonStr = fs.readFileSync(credentialsPath, 'utf8');
        const credentials = JSON.parse(serviceAccountJsonStr);
        this.jwtClient = new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        this.indexing = google.indexing({
          version: 'v3',
          auth: this.jwtClient,
        });
        this.configured = true;
        console.log(`[GoogleAdapter] Configured with service account: ${credentials.client_email}`);
      } catch (err) {
        console.error('[GoogleAdapter] Failed to load Google Indexing API credentials:', err);
      }
    } else {
      console.log('[GoogleAdapter] No google-credentials.json found — adapter disabled');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      throw new Error('GoogleAdapter is not configured. Missing valid google-credentials.json');
    }

    try {
      const response = await this.indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      return {
        adapter: this.name,
        success: true,
        tier: this.tier,
        detail: `Submitted to Google (Status: ${response.status})`,
      };
    } catch (error: any) {
      const status = error?.code || error?.response?.status;
      const message = error.message || error.toString();
      // Provide actionable error messages
      if (status === 403) {
        throw new Error(
          `Google Indexing API 403: Service account lacks permission. ` +
          `Ensure the service account is added as an Owner in Google Search Console for the target site. ` +
          `Note: This API only works for JobPosting and BroadcastEvent pages. Original: ${message}`
        );
      }
      throw new Error(`Google Indexing API failed (${status || 'unknown'}): ${message}`);
    }
  }
}

