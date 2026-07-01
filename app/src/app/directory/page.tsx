// Tell Next.js to revalidate this page every 60 seconds so Googlebot gets fresh links
export const revalidate = 60;

interface DirectoryUrl {
  id: string;
  link: string;
}

async function getLinks(): Promise<DirectoryUrl[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_URL}/urls?status=completed&limit=1000`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return Array.isArray(data.urls) ? data.urls : [];
  } catch (error) {
    console.error('Failed to fetch directory links', error);
    return [];
  }
}

export default async function DirectoryPage() {
  const urls = await getLinks();

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Public Link Directory</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Recently discovered pages and resources across the web.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {urls.map((url) => (
          <li key={url.id}>
            <a
              href={url.link}
              style={{ color: '#0066cc', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {url.link}
            </a>
          </li>
        ))}
      </ul>
      {urls.length === 0 && <p>No recent links found.</p>}
    </div>
  );
}
