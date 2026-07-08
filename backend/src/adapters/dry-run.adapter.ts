import { IndexingAdapter, AdapterType, AdapterResult, SubmissionContext } from './adapter.interface';

export class DryRunAdapter implements IndexingAdapter {
  readonly name = 'Dry Run';
  readonly type: AdapterType = 'api';

  isConfigured(): boolean {
    return process.env.INDEXING_DRY_RUN !== 'false';
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      throw new Error('DryRunAdapter is not configured (INDEXING_DRY_RUN is false).');
    }

    return {
      adapter: this.name,
      success: true,
      detail: `Validated ${new URL(url).hostname}; no live indexing provider configured`,
    };
  }
}
