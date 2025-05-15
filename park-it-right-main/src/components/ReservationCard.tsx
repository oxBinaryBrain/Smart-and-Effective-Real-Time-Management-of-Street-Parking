import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reservation } from "@/contexts/ParkingContext";
import { Calendar, Clock, IndianRupee, Navigation, Car, MapPin, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReservationCardProps {
  reservation: Reservation;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const [isNavigationDialogOpen, setIsNavigationDialogOpen] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [directionsSteps, setDirectionsSteps] = useState<string[]>([]);
  const [distance, setDistance] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Format dates for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      day: '2-digit',
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const calculateDuration = () => {
    const startTime = new Date(reservation.startTime).getTime();
    const endTime = new Date(reservation.endTime).getTime();
    const durationMs = endTime - startTime;
    const hours = Math.round(durationMs / (1000 * 60 * 60));
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const getStatusColor = () => {
    const now = new Date().getTime();
    const endTime = new Date(reservation.endTime).getTime();
    
    if (now > endTime) {
      return "text-gray-500"; // Expired
    }
    return "text-green-600"; // Active
  };

  const getStatusText = () => {
    const now = new Date().getTime();
    const endTime = new Date(reservation.endTime).getTime();
    
    if (now > endTime) {
      return "Expired";
    }
    return "Active";
  };

  const showInAppDirections = () => {
    setIsLoading(true);
    
    // Generate more realistic distance and time
    const distance = ((Math.random() * 5) + 1).toFixed(1);
    const timeMinutes = Math.floor(Math.random() * 20) + 5;
    
    // Generate step-by-step directions (simulated)
    const directions = [
      `Head north on your current road for 300m`,
      `Turn right onto Main Street and continue for 1.2km`,
      `At the traffic signal, turn left onto ${reservation.parkingLotName.split(' ')[0]} Road`,
      `Continue straight for 800m`,
      `The parking lot will be on your right side`,
      `Proceed to spot #${reservation.spotNumber} as indicated on-site`
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setDistance(distance);
      setTime(timeMinutes.toString());
      setDirectionsSteps(directions);
      setIsLoading(false);
    }, 1000);
    
    // Keep the dialog open - will show directions
  };

  const useCurrentLocation = () => {
    setOriginAddress("Using your current location");
    showInAppDirections();
  };

  const closeDialog = () => {
    setIsNavigationDialogOpen(false);
    setDirectionsSteps([]);
    setDistance("");
    setTime("");
    setOriginAddress("");
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{reservation.parkingLotName}</CardTitle>
            <CardDescription className="text-xs">Spot #{reservation.spotNumber}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} bg-muted`}>
            {getStatusText()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">Reservation Period</div>
              <div className="text-muted-foreground text-xs">
                {formatDate(reservation.startTime)} - {formatDate(reservation.endTime)}
              </div>
              <div className="text-xs text-muted-foreground">Duration: {calculateDuration()}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <span className="font-medium">Payment</span>: ₹{reservation.price} via {reservation.paymentMethod.toUpperCase()}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center space-x-1"
          onClick={() => setIsNavigationDialogOpen(true)}
        >
          <Navigation className="h-3 w-3" />
          <span>Get Directions</span>
        </Button>
      </CardFooter>

      {/* Enhanced Navigation Dialog */}
      <Dialog open={isNavigationDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg z-[1000]">
          <DialogHeader>
            <DialogTitle>Navigate to {reservation.parkingLotName}</DialogTitle>
            <DialogDescription>
              {directionsSteps.length === 0 
                ? "Enter your starting point or use your current location" 
                : `Directions to Spot #${reservation.spotNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          {directionsSteps.length === 0 ? (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">From:</Label>
                  <div className="flex items-center bg-muted rounded-md p-2">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      placeholder="Your current location"
                      value={originAddress}
                      onChange={(e) => setOriginAddress(e.target.value)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          showInAppDirections();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 flex items-center justify-center"
                    onClick={useCurrentLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Use my current location
                  </Button>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">To:</Label>
                  <div className="flex items-center bg-muted rounded-md p-2">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-sm">{reservation.parkingLotName}, Spot #{reservation.spotNumber}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2 space-y-4">
              {/* Direction summary */}
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Best route</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {distance} km · {time} min
                </div>
              </div>
              
              {/* Step by step directions */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {directionsSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{step}</p>
                      {index < directionsSteps.length - 1 && (
                        <div className="ml-3 my-1 border-l-2 border-primary/20 h-6"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Destination indicator */}
              <div className="flex items-center bg-muted/50 p-3 rounded-md">
                <div className="bg-primary rounded-full w-3 h-3 mr-3"></div>
                <div>
                  <p className="font-medium text-sm">{reservation.parkingLotName}</p>
                  <p className="text-xs text-muted-foreground">Spot #{reservation.spotNumber}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {directionsSteps.length === 0 ? (
              <>
                <Button
                  variant="outline"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={showInAppDirections} 
                  disabled={isLoading}
                >
                  {isLoading ? "Getting directions..." : "Get Directions"}
                </Button>
              </>
            ) : (
              <Button onClick={closeDialog} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ReservationCard;
