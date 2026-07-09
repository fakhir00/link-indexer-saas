import assert from 'node:assert/strict';
import test from 'node:test';
import { sitemapIntelligenceService } from '../src/services/sitemap-intelligence.service';

const originalFetch = globalThis.fetch;

function response(body: string, status = 200) {
  return new Response(body, { status, statusText: status === 200 ? 'OK' : 'Not Found' });
}

test('sitemap intelligence discovers nested sitemap URLs and topic gaps', async (t) => {
  const fixtures: Record<string, Response> = {
    'https://own.test/robots.txt': response('Sitemap: https://own.test/sitemap_index.xml'),
    'https://own.test/sitemap_index.xml': response(`
      <sitemapindex>
        <sitemap><loc>https://own.test/blog-sitemap.xml</loc></sitemap>
      </sitemapindex>
    `),
    'https://own.test/blog-sitemap.xml': response(`
      <urlset>
        <url><loc>https://own.test/blog/portable-stage-platforms/</loc></url>
        <url><loc>https://own.test/pricing/</loc></url>
      </urlset>
    `),
    'https://competitor.test/robots.txt': response(''),
    'https://competitor.test/sitemap.xml': response(`
      <urlset>
        <url><loc>https://competitor.test/blog/modular-platform-for-stage/</loc></url>
        <url><loc>https://competitor.test/blog/portable-deck-platforms/</loc></url>
      </urlset>
    `),
  };

  globalThis.fetch = (async (url: RequestInfo | URL) => {
    const key = String(url);
    return fixtures[key] ?? response('', 404);
  }) as typeof fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await sitemapIntelligenceService.analyze({
    ownDomain: 'own.test',
    competitorDomains: ['competitor.test'],
    maxUrls: 50,
    contentOnly: false,
  });

  assert.deepEqual(result.own.indexableUrls, [
    'https://own.test/blog/portable-stage-platforms/',
    'https://own.test/pricing/',
  ]);
  assert.equal(result.competitors[0].contentUrls.length, 2);
  assert.ok(result.gaps.some((gap) => gap.topic === 'portable deck platforms'));
});
