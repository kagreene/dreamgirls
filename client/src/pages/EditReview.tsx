import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_REVIEW } from '../api/reviewQueries';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/Review/ReviewForm';

const EditReview: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  
  const { loading, error, data } = useQuery(GET_REVIEW, {
    variables: { reviewId },
    fetchPolicy: 'cache-and-network',
  });

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (loading) return <div className="loading">Loading review...</div>;
  if (error) return <div className="error">Error loading review: {error.message}</div>;
  if (!data || !data.review) return <div className="not-found">Review not found</div>;

  const { review } = data;
  
  // Check if the current user is the author of the review
  if (user && review.author && user._id !== review.author._id) {
    return <Navigate to={`/review/${reviewId}`} />;
  }

  const handleSuccess = () => {
    // Redirect to the review detail page after successful update
    navigate(`/review/${reviewId}`);
  };

  const handleCancel = () => {
    // Go back to the previous page
    navigate(-1);
  };

  // Format the location data for the form
  const locationData = {
    lng: review.location.coordinates[0],
    lat: review.location.coordinates[1],
    address: review.location.address,
  };

  return (
    <div className="page edit-review-page">
      <div className="container">
        <h1>Edit Safety Review</h1>
        <ReviewForm
          location={locationData}
          review={review}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditReview;