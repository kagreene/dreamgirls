import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/Map/MapView';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from '../api/reviewQueries';

const Map: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { data, loading, error } = useQuery(GET_REVIEWS);
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
    <div className="page map-page">
      <div className="container">
        <div className="map-page-header">
          <h1>Safety Map</h1>
          <p className="map-instructions">
            Explore safety reviews in your area. Click on markers to view details or select a location to add your own review.
          </p>
        </div>

        <div className="map-container">
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

        <div className="map-sidebar">
          <h2>Recent Reviews</h2>
          {loading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <p className="error">Error loading reviews: {error.message}</p>
          ) : data && data.reviews && data.reviews.length > 0 ? (
            <div className="reviews-list">
              {data.reviews.slice(0, 10).map((review: any) => (
                <div key={review._id} className="review-mini-card">
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
                  <Link to={`/review/${review._id}`} className="btn btn-text">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews have been posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;