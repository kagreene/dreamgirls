import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import ReviewForm from '../components/Review/ReviewForm';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/Map/MapView';

interface LocationState {
  location?: {
    lng: number;
    lat: number;
    address: string;
  };
}

const AddReview: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { location: selectedLocation } = (location.state as LocationState) || {};
  const [mapLocation, setMapLocation] = React.useState(selectedLocation);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const handleLocationSelect = (location: {
    lng: number;
    lat: number;
    address: string;
  }) => {
    setMapLocation(location);
  };

  const handleSuccess = () => {
    // Redirect to the profile page after successful submission
    navigate('/profile');
  };

  const handleCancel = () => {
    // Go back to the previous page
    navigate(-1);
  };

  return (
    <div className="page add-review-page">
      <div className="container">
        <h1>Add Safety Review</h1>
        
        {!mapLocation ? (
          <div className="location-selection">
            <p>Please select a location on the map to continue:</p>
            <MapView onLocationSelect={handleLocationSelect} />
          </div>
        ) : (
          <ReviewForm
            location={mapLocation}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default AddReview;