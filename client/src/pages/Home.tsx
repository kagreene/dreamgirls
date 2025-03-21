//TODO: review/replace/revise page component below that uses MapView
import React, { useState } from 'react';
import MapView from '../components/Map/MapView';
// TODO: Add routes for each of the linked pages in the App.tsx file and complete page files
// routes to: "/login", "/map" `/review/${review._id}'
//pages to add: Map, ReviewDetails
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import AuthService from '../utils/auth';
//import { gql } from 'graphql-tag';
import { QUERY_REVIEWS } from '../utils/queries.js'
import ReviewForm from '../components/Review/ReviewForm.js'

const Home: React.FC = () => {
  const { loading, error, data } = useQuery(QUERY_REVIEWS);
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
  const isLoggedIn = AuthService.loggedIn();

  return (
    // <div className="home-container">
    //   <header className="app-header">
    //     <h1>Community Safety Map</h1>
    //     <p>Search for a location or explore the map to view safety reviews</p>
    //   </header>

    //   <div className="map-section">
    //     <MapView
    //       onLocationSelect={handleLocationSelect}
    //       incidents={data?.reviews || []}
    //     />
    //   </div>

    //   {loading && <div className="loading">Loading safety reviews...</div>}
    //   {error && (
    //     <div className="error-message">
    //       Error loading reviews: {error.message}
    //     </div>
    //   )}

    //   <div className="info-section">
    //     <h2>About This App</h2>
    //     <p>
    //       Our community safety app allows users to review and view safety
    //       concerns in their area. Search for a location, submit reviews, and help make our communities safer together.
    //     </p>
    //     <h3>How to Use</h3>
    //     <ol>
    //       <li>Search for a location using the search bar</li>
    //       <li>Click "Submit Review" to add a new safety review</li>
    //       <li>View existing reviews on the map marked with colored pins</li>
    //       <li>Click on pins to view details about reviewed locations</li>
    //     </ol>
    //   </div>
    // </div>
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
            <Link to="/login" className="btn btn-secondary">
              Log In or Sign Up 
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
              <ReviewForm location={selectedLocation} />
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
        ) : error ? (
          <div className="error-message">
            Error loading reviews: {error.message}
          </div>
        ): data && data.reviews && data.reviews.length > 0 ? (
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
                {/* <Link to={`/review/${review._id}`} className="btn btn-text">
                  View Details
                </Link> */}
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