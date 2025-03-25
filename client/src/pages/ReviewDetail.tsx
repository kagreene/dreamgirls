import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_REVIEW } from '../api/reviewQueries';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/Map/MapView';

const ReviewDetail: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_REVIEW, {
    variables: { reviewId },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <div className="loading">Loading review...</div>;
  if (error) return <div className="error">Error loading review: {error.message}</div>;
  if (!data || !data.review) return <div className="not-found">Review not found</div>;

  const { review } = data;
  const isAuthor = user && review.author && user._id === review.author._id;
  
  // Format date
  const formattedDate = new Date(parseInt(review.createdAt)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page review-detail-page">
      <div className="container">
        <div className="review-header">
          <h1>{review.title}</h1>
          <div className="review-meta">
            <span className={`review-type type-${review.reviewType}`}>
              {review.reviewType.replace('_', ' ')}
            </span>
            <span className="review-severity">
              Safety Rating: {review.severity}/5
            </span>
            <span className="review-date">Posted on {formattedDate}</span>
            {review.author && (
              <span className="review-author">by {review.author.username}</span>
            )}
          </div>
        </div>

        <div className="review-content">
          <div className="review-location">
            <h2>Location</h2>
            <p>{review.location.address}</p>
            <div className="review-map">
              <MapView />
            </div>
          </div>

          <div className="review-description">
            <h2>Description</h2>
            <p>{review.description}</p>
          </div>

          {isAuthor && (
            <div className="review-actions">
              <Link to={`/edit-review/${review._id}`} className="btn btn-secondary">
                Edit Review
              </Link>
            </div>
          )}
        </div>

        <div className="review-navigation">
          <Link to="/map" className="btn btn-text">
            &larr; Back to Map
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;