import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/Map/MapView';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from '../api/reviewQueries';
import './Home.css';



const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { data, loading } = useQuery(GET_REVIEWS, {
    fetchPolicy: 'cache-and-network',
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    lng: number;
    lat: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    lng: number;
    lat: number;
    address: string;
  }) => {
    setSelectedLocation(location);
  };

  return (
    <div className="page home-page">
      <div className="hero">
        <div className="container">
          <h1>Navigate with Confidence</h1>
          <p className="lead">
            Safe Spotter helps you stay informed about safety concerns in your area
            and contribute to keeping your community safe.
          </p>
          {!isLoggedIn && (
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary me-2">
                Sign Up Now  
              </Link>
              <Link to="/login" className="btn btn-secondary">
                    Log In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container main-content">
        <div className="map-section">
          <h2>Explore Safety Reviews</h2>
          <p>
            Click on the map to see safety reviews or search for a specific
            location.
          </p>
          <MapView onLocationSelect={handleLocationSelect} />
          
          {selectedLocation && (
            <div className="selected-location-actions">
              <p>Selected: {selectedLocation.address}</p>
              {isLoggedIn ? (
                <Link
                  to="/add-review"
                  state={{ location: selectedLocation }}
                  className="btn btn-primary"
                >
                  Add Review for this Location
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary">
                  Log in to Add a Review
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="recent-reviews">
          <h2>Recent Safety Reviews</h2>
          {loading ? (
            <p>Loading recent reviews...</p>
          ) : data && data.reviews && data.reviews.length > 0 ? (
            <div className="reviews-list">
              {data.reviews.slice(0, 5).map((review: any) => (
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
                  <Link to={`/review/${review._id}`} className="btn btn-text">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews have been posted yet. Be the first to add a safety review!</p>
          )}
          <Link to="/map" className="btn btn-secondary view-all-btn">
            View All Reviews
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;