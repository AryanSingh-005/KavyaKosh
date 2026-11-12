import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import InteractivePoemCard from '../../components/publish/InteractivePoemCard';
import { getPoemDetail } from '../../api/publishApi';
import './PoemDetailPage.css';

const PoemDetailPage = () => {
  const { id } = useParams();
  const [poemDetail, setPoemDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoem();
  }, [id]);

  const fetchPoem = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPoemDetail(id);
      setPoemDetail(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Poem not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poem-detail-page">
      <div className="poem-detail-container">
        
        <div className="detail-top-nav">
          <Link to="/explore" className="back-link">
            ← Back to Explore Feed
          </Link>
        </div>

        {loading ? (
          <div className="detail-loading">
            <div className="loading-spinner">🕯️</div>
            <p>Loading poem details...</p>
          </div>
        ) : error ? (
          <div className="detail-error">
            <h2>Poem Not Found</h2>
            <p>{error}</p>
            <Link to="/explore" className="btn-explore-back">Explore Poetry</Link>
          </div>
        ) : (
          poemDetail && (
            <InteractivePoemCard
              poemData={poemDetail.poem}
              initialLiked={poemDetail.isLiked}
              initialSaved={poemDetail.isSaved}
              initialComments={poemDetail.comments || []}
              onPoemUpdated={() => fetchPoem()}
            />
          )
        )}

      </div>
    </div>
  );
};

export default PoemDetailPage;
