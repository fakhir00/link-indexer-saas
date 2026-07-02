import { urlRepository } from '../repositories';

export const sitemapService = {
  async generateSitemapXml() {
    const urls = await urlRepository.findCompletedForSitemap(10000);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
      const loc = url.link
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      if (url.discoveredAt) {
        xml += `    <lastmod>${url.discoveredAt.toISOString()}</lastmod>\n`;
      }
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  },
};
