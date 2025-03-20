//TODO: review basic map configuration below and modify/replace as needed

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

// Get Mapbox token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Incident type options
const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'theft', label: 'Theft' },
  { value: 'assault', label: 'Assault' },
  { value: 'unsafe_environment', label: 'Unsafe Environment' },
  { value: 'other', label: 'Other' },
];

// Safety rating options
const SAFETY_RATINGS = [
  { value: 5, label: 'Very Safe', icon: '👍' },
  { value: 4, label: 'Safe', icon: '😊' },
  { value: 3, label: 'Neutral', icon: '😐' },
  { value: 2, label: 'Unsafe', icon: '😟' },
  { value: 1, label: 'Very Unsafe', icon: '👎' },
];

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: { lng: number; lat: number; address: string }) => void;
  incidents?: any[]; // Replace with your incident interface
}

const MapView: React.FC<MapViewProps> = ({ 
  center = [-98.5795, 39.8283], // Default to center of US
  zoom = 4,
  onLocationSelect,
  incidents = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lng: number;
    lat: number;
    address: string;
  } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    incidentType: INCIDENT_TYPES[0].value,
    safetyRating: 3, // Default to neutral
  });
  const geocoderMarker = useRef<mapboxgl.Marker | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });
    
    map.current.on('load', () => {
      setLoaded(true);
    });
    
    return () => {
      map.current?.remove();
    };
  }, []);

  // Add markers for incidents
  useEffect(() => {
    if (!map.current || !loaded || incidents.length === 0) return;

    // Remove existing markers (if implementing an update)
    // ... (code to remove existing markers if needed)

    // Add markers for each incident
    incidents.forEach(incident => {
      const el = document.createElement('div');
      el.className = `marker severity-${incident.severity}`;
      
      new mapboxgl.Marker(el)
        .setLngLat([incident.location.coordinates[0], incident.location.coordinates[1]])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3>${incident.title}</h3>
              <p>${incident.description}</p>
              <p>Type: ${incident.reportType}</p>
              <p>Reported: ${new Date(incident.createdAt).toLocaleDateString()}</p>
            `)
        )
        .addTo(map.current!);
    });
  }, [incidents, loaded]);

  // Search for locations using Mapbox Geocoding API
  const searchLocations = async () => {
    if (!searchInput.trim()) return;

    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchInput
      )}.json?access_token=${MAPBOX_TOKEN}&limit=5`;

      const response = await fetch(endpoint);
      const data = await response.json();
      
      setSearchResults(data.features);
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  // Select a location from search results
  const handleSelectLocation = (result: any) => {
    if (!map.current) return;

    const [lng, lat] = result.center;
    const locationInfo = {
      lng,
      lat,
      address: result.place_name,
    };

    // Update the map view
    map.current.flyTo({
      center: [lng, lat],
      zoom: 14,
    });

    // Clear any existing marker
    if (geocoderMarker.current) {
      geocoderMarker.current.remove();
    }

    // Add a marker at the selected location
    geocoderMarker.current = new mapboxgl.Marker({ color: '#4668F2' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Update state with selected location
    setSelectedLocation(locationInfo);
    
    // Clear search results
    setSearchResults([]);

    // If a callback was provided, call it with the selected location
    if (onLocationSelect) {
      onLocationSelect(locationInfo);
    }
  };

  // Handle input changes for report form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportData({
      ...reportData,
      [name]: name === 'safetyRating' ? parseInt(value, 10) : value,
    });
  };

  // Handle form submission
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your API
    console.log('Report Data:', {
      ...reportData,
      location: selectedLocation,
    });

    // Reset form and hide it
    setReportData({
      title: '',
      description: '',
      incidentType: INCIDENT_TYPES[0].value,
      safetyRating: 3,
    });
    setShowReportForm(false);
  };

  return (
    <div className="map-container">
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for a location..."
          className="search-input"
        />
        <button onClick={searchLocations} className="search-button">
          Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="search-result-item"
              onClick={() => handleSelectLocation(result)}
            >
              {result.place_name}
            </div>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="map-view" />

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="location-info">
          <h3>Selected Location</h3>
          <p>{selectedLocation.address}</p>
          <div className="location-actions">
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="report-button"
            >
              {showReportForm ? 'Cancel Report' : 'Report Incident'}
            </button>
          </div>
        </div>
      )}

      {/* Report Form */}
      {showReportForm && selectedLocation && (
        <div className="report-form-container">
          <form onSubmit={handleReportSubmit} className="report-form">
            <h3>Report an Incident</h3>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={reportData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief title of the incident"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={reportData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="incidentType">Incident Type</label>
              <select
                id="incidentType"
                name="incidentType"
                value={reportData.incidentType}
                onChange={handleInputChange}
                required
              >
                {INCIDENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Safety Rating</label>
              <div className="safety-rating">
                {SAFETY_RATINGS.map((rating) => (
                  <label key={rating.value} className="rating-option">
                    <input
                      type="radio"
                      name="safetyRating"
                      value={rating.value}
                      checked={reportData.safetyRating === rating.value}
                      onChange={handleInputChange}
                    />
                    <span className="rating-icon">{rating.icon}</span>
                    <span className="rating-label">{rating.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {!MAPBOX_TOKEN && (
        <div className="token-warning">
          Warning: Mapbox token is missing. Add VITE_MAPBOX_TOKEN to your .env file.
        </div>
      )}
    </div>
  );
};

export default MapView;