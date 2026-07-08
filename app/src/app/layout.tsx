import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndexFlow - URL Indexing Acceleration Platform',
  description:
    "Accelerate Google crawl discovery for your URLs with IndexFlow's multi-channel indexing engine. Submit, track and optimise URL indexing at scale.",
  keywords: 'url indexing, seo tool, crawl discovery, sitemap, google indexing, link indexer',
  openGraph: {
    title: 'IndexFlow - URL Indexing Acceleration Platform',
    description: "Submit, track and optimise URL indexing at scale with IndexFlow's multi-channel engine.",
    type: 'website',
    siteName: 'IndexFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IndexFlow - URL Indexing Acceleration Platform',
    description: 'Accelerate Google crawl discovery for your URLs.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
