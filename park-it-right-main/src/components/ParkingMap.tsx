import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Button } from "@/components/ui/button";
import { ParkingLot, useParking } from "@/contexts/ParkingContext";
import { Car, Navigation, Maximize, Minimize, RefreshCw } from "lucide-react";

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create a custom icon for parking markers with a simple P symbol
const parkingIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='32' height='32'%3E%3Ccircle cx='12' cy='12' r='10' fill='%230056B3' stroke='white' stroke-width='2'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-family='Arial' font-size='12' font-weight='bold'%3EP%3C/text%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapCenterProps {
  position: [number, number];
  zoom: number;
}

// Component to handle map center changes
const SetMapCenter = ({ position, zoom }: MapCenterProps) => {
  const map = useMap();
  map.setView(position, zoom);
  return null;
};

interface LocationMarkerProps {
  onLocationFound: (lat: number, lng: number) => void;
  refreshLocation: boolean;
}

// Component to show current location on map
const LocationMarker = ({ onLocationFound, refreshLocation }: LocationMarkerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();
  const hasFoundLocation = useRef(false);

  useEffect(() => {
    if (refreshLocation || !hasFoundLocation.current) {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 14);
        onLocationFound(e.latlng.lat, e.latlng.lng);
        hasFoundLocation.current = true;
      });
    }
  }, [map, onLocationFound, refreshLocation]);

  return position === null ? null : (
    <Marker 
      position={position}
      icon={new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1365/1365700.png",
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -25],
      })}
    >
      <Popup>You are here</Popup>
    </Marker>
  );
};

interface RouteDisplayProps {
  from: [number, number];
  to: [number, number];
}

// Enhanced component to show road routing between two points
const RouteDisplay = ({ from, to }: RouteDisplayProps) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map || !from || !to) return;

    // Remove previous routing if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      altLineOptions: {
        styles: [
          { color: '#4169E1', opacity: 0.15, weight: 9 },
          { color: '#4169E1', opacity: 0.8, weight: 6 },
          { color: '#1E90FF', opacity: 0.5, weight: 2 }
        ]
      },
      lineOptions: {
        styles: [
          { color: '#4169E1', opacity: 0.15, weight: 9 },
          { color: '#4169E1', opacity: 0.8, weight: 6 },
          { color: '#1E90FF', opacity: 0.5, weight: 2 }
        ]
      },
      createMarker: function() {
        // Return null to not add default markers
        return null; 
      },
      fitSelectedRoutes: true,
      addWaypoints: false,
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    // Hide the itinerary steps for cleaner UI
    const container = routingControl.getContainer();
    if (container) {
      container.style.display = "none";
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, from, to]);

  return null;
};

const ParkingMap = () => {
  const { 
    parkingLots, 
    setSelectedLot, 
    findNearbyLots,
    getCurrentLocation,
    selectedLot 
  } = useParking();
  // Center on Bengaluru by default
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [zoom, setZoom] = useState(11); // Slightly zoomed out to show more parking lots
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [refreshLocation, setRefreshLocation] = useState(false);

  const handleLotClick = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setCenter([lot.latitude, lot.longitude]);
    setZoom(17);
    // If we have user location, show route
    if (userLocation) {
      setShowRoute(true);
    }
  };

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    findNearbyLots({ lat, lng });
  };

  const findMyLocation = async () => {
    // Trigger a refresh of the location
    setRefreshLocation(prev => !prev);
    
    const location = await getCurrentLocation();
    if (location) {
      setCenter([location.lat, location.lng]);
      setZoom(15);
      setUserLocation(location);
      findNearbyLots(location);
      // If we have a selected lot, show route
      if (selectedLot) {
        setShowRoute(true);
      }
    }
  };

  const refreshMap = () => {
    // Reset to default view of Bengaluru
    setCenter([12.9716, 77.5946]);
    setZoom(11);
    // Keep user location but hide route
    setShowRoute(false);
  };

  // Calculate available spots per lot
  const getAvailableSpotsCount = (lot: ParkingLot) => {
    return lot.spots.filter(spot => spot.available).length;
  };

  const toggleMapSize = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  // Share the route display with parent components
  useEffect(() => {
    // We expose this function to the parent via a global method
    window.showRouteToLot = (showIt: boolean) => {
      setShowRoute(showIt);
    };
  }, []);

  return (
    <div className={`relative rounded-lg border shadow-lg overflow-hidden transition-all duration-300 ${isMapExpanded ? 'fixed inset-0 z-50' : 'h-full w-full'}`}>
      <div className="absolute top-4 right-4 z-20 space-y-2 flex flex-col">
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center space-x-2 shadow-lg bg-white text-primary hover:bg-primary hover:text-white"
          onClick={findMyLocation}
        >
          <Navigation size={16} />
          <span className="hidden sm:inline">Find My Location</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center space-x-2 shadow-lg bg-white text-primary hover:bg-primary hover:text-white"
          onClick={refreshMap}
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Refresh Map</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center space-x-2 shadow-lg bg-white text-primary hover:bg-primary hover:text-white"
          onClick={toggleMapSize}
        >
          {isMapExpanded ? (
            <>
              <Minimize size={16} />
              <span className="hidden sm:inline">Minimize Map</span>
            </>
          ) : (
            <>
              <Maximize size={16} />
              <span className="hidden sm:inline">Maximize Map</span>
            </>
          )}
        </Button>
      </div>
      
      {isMapExpanded && (
        <div 
          className="absolute bottom-4 right-4 z-20"
          onClick={() => setIsMapExpanded(false)}
        >
          <Button
            variant="default"
            size="sm"
            className="flex items-center space-x-2 shadow-lg bg-white text-primary hover:bg-primary hover:text-white"
          >
            <Minimize size={16} />
            <span>Close Map</span>
          </Button>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SetMapCenter position={center} zoom={zoom} />
        
        <LocationMarker onLocationFound={handleLocationFound} refreshLocation={refreshLocation} />
        
        {parkingLots.map((lot) => (
          <Marker
            key={lot.id}
            position={[lot.latitude, lot.longitude]}
            icon={parkingIcon}
            eventHandlers={{
              click: () => handleLotClick(lot),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-1">{lot.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{lot.address}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">
                    <span className="font-medium">Price:</span> ₹{lot.pricePerHour}/hr
                  </span>
                  <span className="text-sm">
                    <span className="font-medium">Available:</span>{" "}
                    <span className={`${getAvailableSpotsCount(lot) > 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                      {getAvailableSpotsCount(lot)}/{lot.totalSpots}
                    </span>
                  </span>
                </div>
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLotClick(lot);
                  }}
                >
                  <Car size={16} />
                  <span>Select This Lot</span>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {userLocation && selectedLot && showRoute && (
          <RouteDisplay
            from={[userLocation.lat, userLocation.lng]}
            to={[selectedLot.latitude, selectedLot.longitude]}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;
