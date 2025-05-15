import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { parkingData } from "@/data/parkingData";
import { toast } from "sonner";

export interface ParkingSpot {
  id: string;
  spotNumber: number;
  available: boolean;
  reserved?: boolean;
  reservedById?: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  pricePerHour: number;
  address: string;
  spots: ParkingSpot[];
}

export interface VehicleDetails {
  type: "2-wheeler" | "4-wheeler" | "other";
  number: string;
}

export interface Reservation {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  spotId: string;
  spotNumber: number;
  userId: string;
  startTime: Date;
  endTime: Date;
  price: number;
  paymentMethod: string;
  timestamp: Date;
  vehicleDetails?: VehicleDetails;
}

interface ParkingContextType {
  parkingLots: ParkingLot[];
  selectedLot: ParkingLot | null;
  selectedSpot: ParkingSpot | null;
  reservations: Reservation[];
  nearbyLots: ParkingLot[];
  setSelectedLot: (lot: ParkingLot | null) => void;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  makeParkingReservation: (
    userId: string,
    paymentMethod: string,
    hours: number,
    startTime?: Date,
    vehicleDetails?: VehicleDetails
  ) => Promise<boolean>;
  getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>;
  findNearbyLots: (position: { lat: number; lng: number }) => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error("useParking must be used within a ParkingProvider");
  }
  return context;
};

interface ParkingProviderProps {
  children: ReactNode;
}

export const ParkingProvider = ({ children }: ParkingProviderProps) => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(parkingData);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [nearbyLots, setNearbyLots] = useState<ParkingLot[]>([]);

  // Load reservations from localStorage
  useEffect(() => {
    const storedReservations = localStorage.getItem("parkingReservations");
    if (storedReservations) {
      try {
        const parsed = JSON.parse(storedReservations);
        // Convert string dates back to Date objects
        const reservationsWithDates = parsed.map((res: any) => ({
          ...res,
          startTime: new Date(res.startTime),
          endTime: new Date(res.endTime),
          timestamp: new Date(res.timestamp)
        }));
        setReservations(reservationsWithDates);
      } catch (error) {
        console.error("Error parsing stored reservations:", error);
        localStorage.removeItem("parkingReservations");
      }
    }
  }, []);

  // Update reservations in localStorage when they change
  useEffect(() => {
    if (reservations.length > 0) {
      localStorage.setItem("parkingReservations", JSON.stringify(reservations));
    }
  }, [reservations]);

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.error("Unable to retrieve your location");
          // Fallback to Bengaluru center
          resolve({
            lat: 12.9716,
            lng: 77.5946
          });
        }
      );
    });
  };

  const findNearbyLots = (position: { lat: number; lng: number }) => {
    // Calculate distance between two points using Haversine formula
    const calculateDistance = (
      lat1: number, 
      lon1: number, 
      lat2: number, 
      lon2: number
    ): number => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const d = R * c; // Distance in km
      return d;
    };
    
    const deg2rad = (deg: number): number => {
      return deg * (Math.PI/180);
    };

    // Sort lots by distance
    const lotsWithDistance = parkingLots.map(lot => ({
      ...lot,
      distance: calculateDistance(
        position.lat, 
        position.lng, 
        lot.latitude, 
        lot.longitude
      )
    }));
    
    // Sort by distance and take top 5
    const sorted = lotsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    setNearbyLots(sorted);
  };

  const makeParkingReservation = async (
    userId: string,
    paymentMethod: string,
    hours: number,
    startTime?: Date,
    vehicleDetails?: VehicleDetails
  ): Promise<boolean> => {
    if (!selectedLot || !selectedSpot) {
      toast.error("Please select a parking spot");
      return false;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create reservation
      const reservationStartTime = startTime || new Date();
      const endTime = new Date(reservationStartTime);
      endTime.setHours(endTime.getHours() + hours);

      const newReservation: Reservation = {
        id: `res_${Math.random().toString(36).substring(2, 9)}`,
        parkingLotId: selectedLot.id,
        parkingLotName: selectedLot.name,
        spotId: selectedSpot.id,
        spotNumber: selectedSpot.spotNumber,
        userId,
        startTime: reservationStartTime,
        endTime,
        price: selectedLot.pricePerHour * hours,
        paymentMethod,
        timestamp: new Date(),
        vehicleDetails
      };

      // Update the parking lot spots data
      setParkingLots(prevLots => {
        return prevLots.map(lot => {
          if (lot.id === selectedLot.id) {
            return {
              ...lot,
              spots: lot.spots.map(spot => {
                if (spot.id === selectedSpot.id) {
                  return {
                    ...spot,
                    available: false,
                    reserved: true,
                    reservedById: userId
                  };
                }
                return spot;
              })
            };
          }
          return lot;
        });
      });

      // Add to reservations
      setReservations(prev => [...prev, newReservation]);
      
      toast.success("Parking spot reserved successfully!");
      return true;
    } catch (error) {
      console.error("Reservation error:", error);
      toast.error("Failed to reserve parking spot. Please try again.");
      return false;
    }
  };

  return (
    <ParkingContext.Provider
      value={{
        parkingLots,
        selectedLot,
        selectedSpot,
        reservations,
        nearbyLots,
        setSelectedLot,
        setSelectedSpot,
        makeParkingReservation,
        getCurrentLocation,
        findNearbyLots
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};
