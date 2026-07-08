import { IndexingAdapter, AdapterResult, SubmissionContext } from './adapter.interface';
import { PingAdapter } from './ping.adapter';
import { IndexNowAdapter } from './indexnow.adapter';
import { GoogleAdapter } from './google.adapter';
import { DryRunAdapter } from './dry-run.adapter';

export class AdapterRegistry {
  private adapters: IndexingAdapter[] = [];

  constructor() {
    this.registerBuiltInAdapters();
  }

  private registerBuiltInAdapters() {
    const builtIn = [
      new PingAdapter(),
      new IndexNowAdapter(),
      new GoogleAdapter(),
    ];

    for (const adapter of builtIn) {
      if (adapter.isConfigured()) {
        this.adapters.push(adapter);
      }
    }

    // Fallback to DryRun if no other adapters are configured and we are not explicitly disabling dry run
    if (this.adapters.length === 0) {
      const dryRun = new DryRunAdapter();
      if (dryRun.isConfigured()) {
        this.adapters.push(dryRun);
      }
    }
  }

  registerAdapter(adapter: IndexingAdapter) {
    if (adapter.isConfigured() && !this.adapters.some(a => a.name === adapter.name)) {
      this.adapters.push(adapter);
    }
  }

  getEnabledAdapters(): string[] {
    return this.adapters.map(a => a.name);
  }

  hasEnabledAdapters(): boolean {
    return this.adapters.length > 0;
  }

  isUsingDryRun(): boolean {
    return this.adapters.some(a => a.name === 'Dry Run');
  }

  async submitUrl(url: string, context?: SubmissionContext): Promise<AdapterResult[]> {
    if (!this.hasEnabledAdapters()) {
      throw new Error('No indexing providers configured');
    }

    const results = await Promise.allSettled(this.adapters.map(adapter => adapter.submit(url, context)));
    
    const successes = results
      .filter((r): r is PromiseFulfilledResult<AdapterResult> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successes.length > 0) {
      return successes;
    }

    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => (r.reason instanceof Error ? r.reason.message : 'Unknown provider error'));

    throw new Error(failures.join('; ') || 'All indexing providers failed');
  }
}

// Export a singleton instance for backward-compatible usage and global registry
export const adapterRegistry = new AdapterRegistry();
