import TopBar from '@/components/TopBar';
import UrlsPage from '@/components/UrlsPage';

export default function Urls() {
  return (
    <>
      <TopBar
        title="URLs"
        subtitle="Track every URL's indexing lifecycle"
      />
      <UrlsPage />
    </>
  );
}
