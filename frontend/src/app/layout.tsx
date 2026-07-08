import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndexFlow — Professional Link Indexing SaaS',
  description: 'Submit and track URLs across Google, IndexNow, Bing and more. Monitor indexing health, retry failed submissions, and manage campaigns at scale.',
  keywords: ['link indexing', 'SEO', 'URL submission', 'IndexNow', 'Google indexing'],
  openGraph: {
    title: 'IndexFlow — Professional Link Indexing SaaS',
    description: 'Submit and track URLs across Google, IndexNow, Bing and more.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
