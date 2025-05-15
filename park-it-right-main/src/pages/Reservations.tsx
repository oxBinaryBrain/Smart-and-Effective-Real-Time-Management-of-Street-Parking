
import React from "react";
import Navbar from "@/components/Navbar";
import { useParking } from "@/contexts/ParkingContext";
import { useAuth } from "@/contexts/AuthContext";
import ReservationCard from "@/components/ReservationCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, CircleX } from "lucide-react";

const Reservations = () => {
  const { reservations } = useParking();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter reservations for current user
  const userReservations = user 
    ? reservations.filter(res => res.userId === user.id)
    : [];
  
  // Group reservations by active and expired
  const now = new Date().getTime();
  const activeReservations = userReservations.filter(
    res => new Date(res.endTime).getTime() > now
  );
  const expiredReservations = userReservations.filter(
    res => new Date(res.endTime).getTime() <= now
  );

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <CircleX className="h-16 w-16 text-muted mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Not Signed In</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Please sign in to view your parking reservations
          </p>
          <Button onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (userReservations.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto w-full p-4 py-8">
          <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
          
          <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border border-dashed">
            <Car className="h-16 w-16 text-muted mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Reservations Yet</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              You haven't reserved any parking spots yet. Find and book a parking spot to see your reservations here.
            </p>
            <Button onClick={() => navigate("/")}>
              Find Parking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full p-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
        
        {activeReservations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Active Reservations
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </div>
        )}
        
        {expiredReservations.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              Past Reservations
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {expiredReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
