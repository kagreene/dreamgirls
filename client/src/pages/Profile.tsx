import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../api/reviewQueries';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { loading, data, error } = useQuery(GET_ME);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error loading profile: {error.message}</div>;
  }

  const { me } = data || {};

  return (
    <div className="page profile-page">
      <div className="container">
        <h1>My Profile</h1>
        
        <div className="profile-info">
          <h2>{me.username}</h2>
          <p className="user-email">{me.email}</p>
        </div>
        
        <div className="user-reviews">
          <h2>My Safety Reviews</h2>
          {me.reviews && me.reviews.length > 0 ? (
            <div className="reviews-list">
              {me.reviews.map((review: any) => (
                <div key={review._id} className="review-card">
                  <h3>{review.title}</h3>
                  <p className="review-address">{review.location.address}</p>
                  <div className="review-meta">
                    <span className={`review-type type-${review.reviewType}`}>
                      {review.reviewType.replace('_', ' ')}
                    </span>
                    <span className="review-severity">
                      Safety Rating: {review.severity}/5
                    </span>
                  </div>
                  <p className="review-excerpt">
                    {review.description.slice(0, 100)}
                    {review.description.length > 100 ? '...' : ''}
                  </p>
                  <div className="review-actions">
                    <Link to={`/review/${review._id}`} className="btn btn-text">
                      View
                    </Link>
                    <Link 
                      to={`/edit-review/${review._id}`} 
                      className="btn btn-secondary"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't posted any safety reviews yet.</p>
          )}
          <Link to="/map" className="btn btn-primary">
            Add a New Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;