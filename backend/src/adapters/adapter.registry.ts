import { IndexingAdapter, AdapterResult, SubmissionContext } from './adapter.interface';
import { PingAdapter } from './ping.adapter';
import { IndexNowAdapter } from './indexnow.adapter';
import { GoogleAdapter } from './google.adapter';
import { DryRunAdapter } from './dry-run.adapter';
import { SitemapAdapter } from './sitemap.adapter';
import { ShortenerAdapter } from './shortener.adapter';

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
      new SitemapAdapter(),
      new ShortenerAdapter(),
    ];

    for (const adapter of builtIn) {
      if (adapter.isConfigured()) {
        this.adapters.push(adapter);
      }
    }

    // Fallback to DryRun if no PRIMARY adapters are configured
    const hasPrimary = this.adapters.some(a => a.tier === 'primary');
    if (!hasPrimary) {
      const dryRun = new DryRunAdapter();
      if (dryRun.isConfigured()) {
        this.adapters.push(dryRun);
      }
    }

    // Log registered adapters at startup
    const primary = this.adapters.filter(a => a.tier === 'primary').map(a => a.name);
    const supplementary = this.adapters.filter(a => a.tier === 'supplementary').map(a => a.name);
    console.log(`[AdapterRegistry] Primary adapters: ${primary.length > 0 ? primary.join(', ') : '(none)'}`);
    console.log(`[AdapterRegistry] Supplementary adapters: ${supplementary.length > 0 ? supplementary.join(', ') : '(none)'}`);
  }

  registerAdapter(adapter: IndexingAdapter) {
    if (adapter.isConfigured() && !this.adapters.some(a => a.name === adapter.name)) {
      this.adapters.push(adapter);
    }
  }

  getEnabledAdapters(): string[] {
    return this.adapters.map(a => a.name);
  }

  getPrimaryAdapters(): string[] {
    return this.adapters.filter(a => a.tier === 'primary').map(a => a.name);
  }

  getSupplementaryAdapters(): string[] {
    return this.adapters.filter(a => a.tier === 'supplementary').map(a => a.name);
  }

  hasEnabledAdapters(): boolean {
    return this.adapters.length > 0;
  }

  /** True only if at least one primary (non-dry-run) adapter is configured */
  hasPrimaryAdapters(): boolean {
    return this.adapters.some(a => a.tier === 'primary' && a.name !== 'Dry Run');
  }

  isUsingDryRun(): boolean {
    return this.adapters.some(a => a.name === 'Dry Run');
  }

  /**
   * Submit a URL to all configured adapters.
   *
   * Success requires at least one **primary** adapter to succeed. Supplementary
   * adapter results are always returned but never determine overall success.
   */
  async submitUrl(url: string, context?: SubmissionContext): Promise<AdapterResult[]> {
    if (!this.hasEnabledAdapters()) {
      throw new Error('No indexing providers configured');
    }

    const results = await Promise.allSettled(this.adapters.map(adapter => adapter.submit(url, context)));

    const successes: AdapterResult[] = [];
    const failures: string[] = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        successes.push(r.value);
      } else {
        const adapterName = this.adapters[i].name;
        const tier = this.adapters[i].tier;
        const msg = r.reason instanceof Error ? r.reason.message : 'Unknown provider error';
        failures.push(`[${tier}] ${adapterName}: ${msg}`);
        console.error(`[AdapterRegistry] ${tier} adapter "${adapterName}" failed for ${url}: ${msg}`);
      }
    });

    // Check if at least one PRIMARY adapter succeeded
    const primarySuccesses = successes.filter(r => r.tier === 'primary');

    if (primarySuccesses.length > 0) {
      // Return all successes (primary + supplementary)
      return successes;
    }

    // No primary adapter succeeded — this is a failure even if supplementary adapters worked
    const supplementarySuccesses = successes.filter(r => r.tier === 'supplementary');
    if (supplementarySuccesses.length > 0) {
      console.warn(
        `[AdapterRegistry] Only supplementary adapters succeeded for ${url} (${supplementarySuccesses.map(r => r.adapter).join(', ')}). ` +
        `This does NOT count as indexed. Primary adapter failures: ${failures.filter(f => f.startsWith('[primary]')).join('; ') || '(no primary adapters configured)'}`
      );
    }

    // Build error message from primary failures (or all failures if no primary adapters exist)
    const primaryFailures = failures.filter(f => f.startsWith('[primary]'));
    const errorMsg = primaryFailures.length > 0
      ? primaryFailures.join('; ')
      : failures.join('; ') || 'No primary indexing adapters configured or all failed';

    throw new Error(errorMsg);
  }
}

// Export a singleton instance for backward-compatible usage and global registry
export const adapterRegistry = new AdapterRegistry();

