import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { IndexingAdapter, AdapterType, AdapterResult, SubmissionContext } from './adapter.interface';

export class GoogleAdapter implements IndexingAdapter {
  readonly name = 'Google Indexing API';
  readonly type: AdapterType = 'api';
  
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
      } catch (err) {
        console.error('Failed to load Google Indexing API credentials:', err);
      }
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
        detail: `Submitted to Google (Status: ${response.status})`,
      };
    } catch (error: any) {
      throw new Error(`Google Indexing API failed: ${error.message || error.toString()}`);
    }
  }
}
