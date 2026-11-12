import React, { useState, useEffect } from 'react';
import { fetchPersonalizedRecommendations } from '../../api/recommendationApi';
import InteractivePoemCard from '../publish/InteractivePoemCard';
import './RecommendedFeed.css';

const RecommendedFeed = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await fetchPersonalizedRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load personalized recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="recommended-feed-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div>
            <div className="section-badge">✨ Tailored For Your Taste</div>
            <h2 className="section-title font-serif">Recommended Verses For You</h2>
          </div>
          <span className="section-subtitle">
            Curated based on your liked emotions, themes, and community interactions.
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rec-loading">Loading personalized recommendations...</div>
        ) : (
          <div className="rec-grid">
            {recommendations.map((poem) => (
              <InteractivePoemCard key={poem.id} poemData={poem} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default RecommendedFeed;
