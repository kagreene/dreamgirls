import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from '../../api/reviewQueries.js';
import './MapView.css';

// Add your Mapbox access token here
mapboxgl.accessToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) || '';

interface MapViewProps {
  onLocationSelect?: (coords: { lng: number; lat: number; address: string }) => void;
}

const MapView: React.FC<MapViewProps> = ({ onLocationSelect }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-97.7431); // Default to US center
  const [lat, setLat] = useState(30.2672); // Default to US center
  const [zoom] = useState(12);
  const [selectedLocation, setSelectedLocation] = useState<{
    lng: number;
    lat: number;
    address: string;
  } | null>(null);

  // Load review data
  const { data } = useQuery(GET_REVIEWS);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return;

    // Try to get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLng(position.coords.longitude);
        setLat(position.coords.latitude);
      },
      () => {
        console.log('Unable to retrieve your location');
      }
    );

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Add geocoder for searching addresses
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken as string,
      mapboxgl: mapboxgl as any, // Force TypeScript to accept this
      marker: false,
      placeholder: 'Search for a location',
    });
    
    map.current.addControl(geocoder);

    // Handle geocoder result
    geocoder.on('result', (e) => {
      const { result } = e;
      const coordinates = result.center;
      const address = result.place_name;

      // Set selected location
      setSelectedLocation({
        lng: coordinates[0],
        lat: coordinates[1],
        address,
      });

      // Add marker at selected location
      new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map.current!);

      // Pass location to parent if callback exists
      if (onLocationSelect) {
        onLocationSelect({
          lng: coordinates[0],
          lat: coordinates[1],
          address,
        });
      }
    });

    // Map click event for selecting a location
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;

      try {
        // Reverse geocode to get address
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const address = data.features[0]?.place_name || 'Unknown location';

        // Set selected location
        setSelectedLocation({
          lng,
          lat,
          address,
        });

        // Clear previous markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        Array.from(markers).forEach((marker) => {
          marker.remove();
        });

        // Add new marker
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Pass location to parent if callback exists
        if (onLocationSelect) {
          onLocationSelect({
            lng,
            lat,
            address,
          });
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    });

    // Cleanup function
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // Empty dependency array ensures this runs once

  // Add review markers when data is loaded
  useEffect(() => {
    if (!map.current || !data) return;

    // Add markers for all reviews
    data.reviews.forEach((review: any) => {
      const { coordinates } = review.location;
      const [lng, lat] = coordinates;

      // Create popup with review info
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${review.title}</h3>
        <p>Type: ${review.reviewType}</p>
        <p>Safety Rating: ${review.severity}/5</p>
        <a href="/review/${review._id}">View Details</a>
      `);

      // Create marker element
      const el = document.createElement('div');
      el.className = `marker marker-${review.severity}`;

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [data, map.current]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      {selectedLocation && (
        <div className="selected-location">
          <p>Selected: {selectedLocation.address}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;