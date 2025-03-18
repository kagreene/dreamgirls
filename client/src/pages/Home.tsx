//TODO: review/replace/revise page component below that uses MapView
import React, { useState } from 'react';
import MapView from '../components/Map/MapView';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';

// GraphQL query to get all reviews
const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      _id
      title
      description
      reviewType
      location {
        type
        coordinates
        address
      }
      severity
      verified
      reviewedBy {
        username
      }
      createdAt
    }
  }
`;

const Home: React.FC = () => {
  const { loading, error, data } = useQuery(GET_REVIEWS);
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
    <div className="home-container">
      <header className="app-header">
        <h1>Community Safety Map</h1>
        <p>Search for a location or explore the map to view safety reviews</p>
      </header>

      <div className="map-section">
        <MapView
          onLocationSelect={handleLocationSelect}
          incidents={data?.reviews || []}
        />
      </div>

      {loading && <div className="loading">Loading safety reviews...</div>}
      {error && (
        <div className="error-message">
          Error loading reviews: {error.message}
        </div>
      )}

      <div className="info-section">
        <h2>About This App</h2>
        <p>
          Our community safety app allows users to review and view safety
          concerns in their area. Search for a location, submit reviews, and help make our communities safer together.
        </p>
        <h3>How to Use</h3>
        <ol>
          <li>Search for a location using the search bar</li>
          <li>Click "Submit Review" to add a new safety review</li>
          <li>View existing reviews on the map marked with colored pins</li>
          <li>Click on pins to view details about reviewed locations</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;