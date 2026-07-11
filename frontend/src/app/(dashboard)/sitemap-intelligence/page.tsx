export default function SitemapIntelligencePage() {
  const dashboardUrl = process.env.NEXT_PUBLIC_SITEMAP_DASHBOARD_URL || 'http://localhost:5173';

  return (
    <div className="flex-1 w-full h-full -m-6" style={{ height: 'calc(100vh - 4rem)' }}>
      <iframe 
        src={dashboardUrl}
        className="w-full h-full border-0"
        title="Sitemap Analysis Tool"
      />
    </div>
  );
}
