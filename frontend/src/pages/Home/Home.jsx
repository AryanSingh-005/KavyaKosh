import { useState, useEffect } from 'react';
import HeroSection from '../../components/home/HeroSection';
import TrendingPoems from '../../components/home/TrendingPoems';
import RecommendedFeed from '../../components/home/RecommendedFeed';
import FeaturedWriters from '../../components/home/FeaturedWriters';
import ActiveChallenges from '../../components/home/ActiveChallenges';
import MarketplacePreview from '../../components/home/MarketplacePreview';
import {
  fetchTrendingPoems,
  fetchFeaturedWriters,
  fetchActiveChallenges,
  fetchMarketplacePreviews,
} from '../../api/homeApi';

export default function Home() {
  const [poems, setPoems] = useState([]);
  const [writers, setWriters] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loadingPoems, setLoadingPoems] = useState(true);
  const [loadingWriters, setLoadingWriters] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);

  useEffect(() => {
    // Fetch all four data sources concurrently
    fetchTrendingPoems(8)
      .then(setPoems)
      .catch(err => console.error('Trending poems error:', err))
      .finally(() => setLoadingPoems(false));

    fetchFeaturedWriters(6)
      .then(setWriters)
      .catch(err => console.error('Featured writers error:', err))
      .finally(() => setLoadingWriters(false));

    fetchActiveChallenges()
      .then(setChallenges)
      .catch(err => console.error('Active challenges error:', err))
      .finally(() => setLoadingChallenges(false));

    fetchMarketplacePreviews(4)
      .then(setMarketplaceItems)
      .catch(err => console.error('Marketplace error:', err))
      .finally(() => setLoadingMarketplace(false));
  }, []);

  return (
    <>
      <HeroSection />
      <div className="divider" />
      <TrendingPoems poems={poems} loading={loadingPoems} />
      <div className="divider" />
      <RecommendedFeed />
      <div className="divider" />
      <FeaturedWriters writers={writers} loading={loadingWriters} />
      <div className="divider" />
      <ActiveChallenges challenges={challenges} loading={loadingChallenges} />
      <div className="divider" />
      <MarketplacePreview items={marketplaceItems} loading={loadingMarketplace} />
    </>
  );
}
