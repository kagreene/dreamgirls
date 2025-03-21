import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import './ReviewList.css';

// GraphQL query to get all reviews
const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      _id
      title
      description
      reviewType
      severity
      location {
        address
      }
      reviewedBy {
        username
      }
      createdAt
    }
  }
`;

const ReviewList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_REVIEWS);

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error">Error loading reviews: {error.message}</div>;

  return (
    <div className="review-list">
      <h2>Recent Safety Reviews</h2>
      {data?.reviews?.length ? (
        <div className="reviews-container">
          {data.reviews.map((review: any) => (
            <div key={review._id} className="review-card">
              <h3>{review.title}</h3>
              <p className="review-location">{review.location.address}</p>
              <p className="review-description">{review.description}</p>
              <div className="review-meta">
                <span className={`severity severity-${review.severity}`}>
                  Safety Rating: {review.severity}
                </span>
                <span className="review-type">{review.reviewType}</span>
                <span className="review-author">By: {review.reviewedBy.username}</span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-reviews">No reviews found. Be the first to submit a review!</p>
      )}
    </div>
  );
};

export default ReviewList;