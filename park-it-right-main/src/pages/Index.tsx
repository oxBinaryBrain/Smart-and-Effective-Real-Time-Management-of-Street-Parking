
import React, { useEffect, useState } from "react";
import ParkingMap from "@/components/ParkingMap";
import ParkingLotDetails from "@/components/ParkingLotDetails";
import NearbyParkingList from "@/components/NearbyParkingList";
import Navbar from "@/components/Navbar";
import { useParking } from "@/contexts/ParkingContext";
import { Loader2, Info, ShieldCheck, Clock, IndianRupee, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Create new component for parking information
const ParkingInformation = () => {
  return (
    <div className="py-6 px-4 bg-background">
      <h2 className="text-2xl font-bold text-center mb-6">Smart Parking Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">How It Works</h3>
            <p className="text-sm text-muted-foreground">
              Select a parking lot, choose an available spot, and make your reservation. Our smart system will hold your spot until you arrive.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Rules & Regulations</h3>
            <p className="text-sm text-muted-foreground">
              Arrive within 15 minutes of your reservation time. Follow all posted parking guidelines. No overnight parking without extended reservation.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold mb-2">Parking Tips</h3>
            <p className="text-sm text-muted-foreground">
              Book in advance during peak hours. Use the map to find spots closest to your destination. Check operating hours before booking.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-semibold mb-2">Cancellation Policy</h3>
            <p className="text-sm text-muted-foreground">
              Free cancellation up to 1 hour before reservation time. 50% refund for earlier cancellations. No refunds for no-shows.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Index = () => {
  const { selectedLot } = useParking();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Make toast available in the ReservationCard component
  useEffect(() => {
    window.showToast = toast;
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <h2 className="text-xl font-medium">Loading Smart Parking Data...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {/* Map and Sidebar Section */}
        <div className="flex flex-col lg:flex-row relative h-[60vh]">
          <div className="w-full lg:w-7/12 h-full">
            <ParkingMap />
          </div>
          
          <div className="w-full lg:w-5/12 p-4 overflow-y-auto bg-background z-10">
            {selectedLot ? (
              <ParkingLotDetails lot={selectedLot} />
            ) : (
              <NearbyParkingList />
            )}
          </div>
        </div>
        
        {/* Parking Information Section */}
        <ParkingInformation />
      </div>
    </div>
  );
};

export default Index;
